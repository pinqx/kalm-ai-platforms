require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Environment validation and setup
console.log('🔍 Validating environment configuration...');

// Required environment variables for production
const requiredEnvVars = {
  'NODE_ENV': process.env.NODE_ENV || 'development',
  'PORT': process.env.PORT || 3000,
  'JWT_SECRET': process.env.JWT_SECRET || 'dev-secret-key'
};

// Optional but recommended environment variables
const optionalEnvVars = {
  'MONGODB_URI': process.env.MONGODB_URI || null,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY || null,
  'USE_OPENAI': process.env.USE_OPENAI || 'false',
  'UPLOAD_DIR': process.env.UPLOAD_DIR || 'uploads/',
  'MAX_FILE_SIZE': process.env.MAX_FILE_SIZE || '25000000'
};

console.log('📋 Environment Status:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`   ✅ ${key}: ${key === 'JWT_SECRET' ? '***configured***' : value}`);
});

Object.entries(optionalEnvVars).forEach(([key, value]) => {
  if (value) {
    const displayValue = key.includes('SECRET') || key.includes('KEY') || key.includes('URI') ? 
      '***configured***' : value;
    console.log(`   ✅ ${key}: ${displayValue}`);
  } else {
    console.log(`   ⚠️  ${key}: not set (using defaults)`);
  }
});

// Database configuration validation
if (process.env.MONGODB_URI) {
  console.log('📊 Database: MongoDB Atlas configured');
} else {
  console.log('📊 Database: Using mock data (no MongoDB connection)');
}

// OpenAI configuration validation
const useOpenAI = process.env.USE_OPENAI !== 'false' && 
                  process.env.OPENAI_API_KEY && 
                  process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                  process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here';

if (useOpenAI) {
  console.log('🤖 OpenAI: LIVE MODE (real API calls)');
} else {
  console.log('🤖 OpenAI: MOCK MODE (simulated responses)');
}

console.log('✅ Environment validation complete\n');

// Import custom middleware and utilities
const { errorHandler, asyncHandler, notFound } = require('./middleware/errorHandler');
const { performanceMonitor, getSystemHealth, requestLogger } = require('./middleware/monitoring');
const { 
  apiLimiter, 
  authLimiter, 
  uploadLimiter, 
  aiLimiter,
  paymentLimiter,
  securityHeaders, 
  sanitizeInput, 
  fileUploadSecurity 
} = require('./middleware/security');
const { logger, logError, logAuth, logAI, logDB, logSocket } = require('./utils/logger');
const { checkTranscriptLimits, checkFeatureAccess, getUserUsageStats, PLAN_LIMITS } = require('./middleware/usageLimits');

// Import models
const User = require('./models/User');
const Transcript = require('./models/Transcript');

// Import audio transcription service
const { transcribeAudioFile, isValidAudioFormat } = require('./services/audioTranscription');

// Import collaboration service
const CollaborationService = require('./services/collaborationService');
const emailService = require('./services/emailService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:5175',
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true
  }
});
const port = process.env.PORT || 3000;

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  
  // Log to external service if available
  if (logger && logger.error) {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  }
  
  // Don't crash in production - just log the error
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Continuing operation despite uncaught exception');
  } else {
    console.error('💀 Exiting due to uncaught exception in development');
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Log to external service if available
  if (logger && logger.error) {
    logger.error('Unhandled Rejection', { reason, promise });
  }
  
  // Don't crash in production - just log the error
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Continuing operation despite unhandled rejection');
  } else {
    console.error('💀 Exiting due to unhandled rejection in development');
    process.exit(1);
  }
});

// SIGTERM handler for graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    mongoose.connection.close(false, () => {
      console.log('📊 MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Initialize collaboration service
const collaborationService = new CollaborationService(io);

// Legacy socket.io real-time functionality (kept for backward compatibility)
const activeUsers = new Map();
const analysisQueue = new Map();

io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);
  
  // Handle user joining
  socket.on('join', (userData) => {
    activeUsers.set(socket.id, {
      ...userData,
      joinedAt: new Date(),
      isAnalyzing: false
    });
    
    // Broadcast updated user count
    io.emit('activeUsers', Array.from(activeUsers.values()));
    
    // Send welcome message
    socket.emit('systemMessage', {
      type: 'welcome',
      message: 'Connected to AI Sales Platform - Real-time updates enabled',
      timestamp: new Date()
    });
    
    console.log(`👤 User joined: ${userData.email || 'Anonymous'}`);
  });
  
  // Handle analysis start notification
  socket.on('analysisStart', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.isAnalyzing = true;
      user.currentFile = data.filename;
      activeUsers.set(socket.id, user);
      
      // Notify all users about analysis starting
      socket.broadcast.emit('userActivity', {
        userId: socket.id,
        user: user.email || 'Anonymous',
        activity: 'started_analysis',
        filename: data.filename,
        timestamp: new Date()
      });
      
      // Update analysis queue
      analysisQueue.set(data.analysisId, {
        userId: socket.id,
        filename: data.filename,
        status: 'processing',
        startTime: new Date()
      });
    }
  });
  
  // Handle analysis progress updates
  socket.on('analysisProgress', (data) => {
    // Broadcast progress to all connected users
    socket.broadcast.emit('analysisUpdate', {
      analysisId: data.analysisId,
      progress: data.progress,
      stage: data.stage,
      timestamp: new Date()
    });
  });
  
  // Handle real-time collaboration
  socket.on('shareAnalysis', (data) => {
    socket.broadcast.emit('analysisShared', {
      sharedBy: activeUsers.get(socket.id)?.email || 'Anonymous',
      analysis: data.analysis,
      filename: data.filename,
      timestamp: new Date()
    });
    
    console.log(`🔄 Analysis shared by ${activeUsers.get(socket.id)?.email || socket.id}`);
  });
  
  // Handle chat messages
  socket.on('chatMessage', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      io.emit('chatMessage', {
        user: user.email || 'Anonymous',
        message: data.message,
        timestamp: new Date(),
        userId: socket.id
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`👋 User disconnected: ${user.email || socket.id}`);
      
      // Clean up analysis queue
      for (const [analysisId, analysis] of analysisQueue.entries()) {
        if (analysis.userId === socket.id) {
          analysisQueue.delete(analysisId);
        }
      }
      
      activeUsers.delete(socket.id);
      
      // Broadcast updated user list
      io.emit('activeUsers', Array.from(activeUsers.values()));
      
      // Notify about user leaving
      socket.broadcast.emit('userActivity', {
        userId: socket.id,
        user: user.email || 'Anonymous',
        activity: 'disconnected',
        timestamp: new Date()
      });
    }
  });
});

// Helper function to broadcast analysis completion
const broadcastAnalysisComplete = (analysisId, result, userId) => {
  const analysis = analysisQueue.get(analysisId);
  if (analysis) {
    // Update analysis queue
    analysis.status = 'completed';
    analysis.endTime = new Date();
    analysis.result = result;
    
    // Broadcast to all users
    io.emit('analysisComplete', {
      analysisId,
      result,
      analysis,
      completedBy: activeUsers.get(userId)?.email || 'Anonymous',
      timestamp: new Date()
    });
    
    // Update user status
    const user = activeUsers.get(userId);
    if (user) {
      user.isAnalyzing = false;
      user.lastAnalysis = new Date();
      delete user.currentFile;
      activeUsers.set(userId, user);
      
      io.emit('activeUsers', Array.from(activeUsers.values()));
    }
    
    // Clean up queue after broadcast
    setTimeout(() => analysisQueue.delete(analysisId), 30000); // Keep for 30 seconds
  }
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Security middleware
app.use(helmet());
app.use(compression()); // Compress responses
app.use(securityHeaders); // Custom security headers
app.use(sanitizeInput); // Input sanitization

// Logging and monitoring
app.use(requestLogger); // Request logging
app.use(performanceMonitor); // Performance monitoring

// Rate limiting with enhanced rules
app.use('/api/auth', authLimiter); // Stricter auth limits
app.use('/api/analyze-transcript', uploadLimiter); // Upload limits
app.use('/api/generate-email', aiLimiter); // AI endpoint limits
app.use('/api/chat', aiLimiter); // AI endpoint limits
app.use('/api/', apiLimiter); // General API limits

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Primary frontend port
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:3000',  // Next.js default
    'http://localhost:3001',  // Alternative port
    'https://kalm-ai-platforms.vercel.app',  // Current Vercel deployment
    'https://kalm-ai-platforms-git-main-alexs-projects-669e350e.vercel.app',  // Vercel preview
    'https://kalm.live',      // Custom domain - LIVE!
    'https://www.kalm.live',  // WWW subdomain
    process.env.FRONTEND_URL,
    'https://*.vercel.app',   // Allow all Vercel apps
    /^https:\/\/.*\.vercel\.app$/,  // Regex for Vercel domains
    // Add your custom domain here when configured
    // 'https://yourdomain.com',
    // 'https://app.yourdomain.com',
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ULTRA-SIMPLE health check - must be first and not depend on anything
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    port: port,
    host: '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: process.env.MONGODB_URI ? 
        (mongoose.connection.readyState === 1 ? 'connected' : 'connecting') : 
        'mock-mode',
      openai: process.env.OPENAI_API_KEY && 
              process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here' ? 
        'configured' : 'mock-mode'
    },
    config: {
      useOpenAI: process.env.USE_OPENAI !== 'false',
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasOpenAIKey: !!(process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here')
    }
  };
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(health, null, 2));
});

// Backup health endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
})();

// Configure multer for file uploads (updated to support audio)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024 // 25MB for audio files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',  // MP3
      'audio/wav',   // WAV
      'audio/mp4',   // M4A
      'audio/webm',  // WEBM
      'audio/ogg',   // OGG
      'audio/flac'   // FLAC
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only TXT, PDF, DOC, DOCX, MP3, WAV, M4A, WEBM, OGG, and FLAC files are allowed.'));
    }
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-sales-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('📊 Connected to MongoDB');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  
  // In production, log error but don't crash - allow server to run without database
  // Many endpoints can work without database using mock data
  console.log('⚠️  Running without database - using mock data mode');
  console.log('💡 Some features may be limited until database connection is restored');
  
  // Set a flag to indicate database is unavailable
  global.DATABASE_UNAVAILABLE = true;
});

// Handle ongoing database connection issues
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB ongoing connection error:', error);
  global.DATABASE_UNAVAILABLE = true;
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected - switching to mock data mode');
  global.DATABASE_UNAVAILABLE = true;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
  global.DATABASE_UNAVAILABLE = false;
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Routes

// Root route - API information
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'KALM AI Sales Platform API',
    status: 'running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check endpoint with system metrics
app.get('/health/detailed', asyncHandler(async (req, res) => {
  const systemHealth = getSystemHealth();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      openaiMode: process.env.USE_OPENAI === 'false' ? 'mock' : 'live'
    },
    system: systemHealth,
    features: {
      realTimeUpdates: true,
      fileUpload: true,
      aiAnalysis: true,
      emailGeneration: true,
      chatAssistant: true,
      userAuthentication: true,
      rateLimiting: true,
      securityHeaders: true,
      performanceMonitoring: true,
      errorHandling: true,
      logging: true
    }
  };
  
  // Check if any critical services are down
  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV === 'production') {
    health.status = 'degraded';
    res.status(503);
  }
  
  logger.info('Detailed health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent'),
    status: health.status 
  });
  
  res.json(health);
}));

// System metrics endpoint for monitoring
app.get('/api/system/metrics', asyncHandler(async (req, res) => {
  const metrics = {
    ...getSystemHealth(),
    database: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name
    },
    api: {
      totalRequests: req.app.locals.requestCount || 0,
      averageResponseTime: req.app.locals.avgResponseTime || 0
    }
  };
  
  res.json(metrics);
}));

// Authentication routes
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 }),
  body('company').optional()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by the model pre-save middleware
      firstName,
      lastName,
      company: company || 'Not specified',
      role: 'sales_rep'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.message 
      });
    } else if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    } else if (error.name === 'MongoNetworkError') {
      console.error('Database connection issue during registration');
      return res.status(500).json({ 
        error: 'Database connection issue, please try again' 
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        company: user.company,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ================================
// USAGE TRACKING ENDPOINTS (moved here for early registration)
// ================================

// Get current user's usage statistics
app.get('/api/usage/stats', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      
      // Admin emails get enterprise-level access
      const adminEmails = [
        'alexfisher@mac.home', 
        'alexfisher.dev@gmail.com',
        'alex@kalm.live',
        'admin@kalm.live'
      ].map(email => email.toLowerCase());
      
      const userEmail = req.user?.email?.toLowerCase();
      
      if (req.user.email && adminEmails.includes(userEmail)) {
        console.log(`✅ Admin usage stats access for ${req.user.email}`);
        
        return res.json({
          currentPlan: 'enterprise',
          limits: { monthlyTranscripts: 0, dailyTranscripts: 0, features: {} },
          usage: {
            monthly: { used: 0, limit: 0, remaining: 'unlimited', percentage: 0 },
            daily: { used: 0, limit: 0, remaining: 'unlimited', percentage: 0 },
            total: 0
          },
          features: {},
          upgradeSuggestions: []
        });
      }
      
      // For now, return basic free plan data
      return res.json({
        currentPlan: 'free',
        limits: { monthlyTranscripts: 5, dailyTranscripts: 5, features: {} },
        usage: {
          monthly: { used: 0, limit: 5, remaining: 5, percentage: 0 },
          daily: { used: 0, limit: 5, remaining: 5, percentage: 0 },
          total: 0
        },
        features: {},
        upgradeSuggestions: []
      });
      
    } catch (error) {
      console.error('Usage stats error:', error);
      res.status(500).json({ error: 'Failed to get usage statistics' });
    }
  })
);

// Admin endpoint - Get all users
app.get('/api/admin/users', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const adminEmails = [
        'alexfisher@mac.home', 
        'alexfisher.dev@gmail.com',
        'alex@kalm.live',
        'admin@kalm.live'
      ].map(email => email.toLowerCase());
      
      const userEmail = req.user?.email?.toLowerCase();
      
      if (!userEmail || !adminEmails.includes(userEmail)) {
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.',
          code: 'ADMIN_ACCESS_DENIED'
        });
      }
      
      console.log(`✅ Admin dashboard access granted for ${req.user.email}`);
      
      // Return mock admin data for now
      return res.json({
        users: [],
        totalUsers: 0,
        pagination: { current: 1, pages: 1, total: 0 },
        summary: { totalUsers: 0, activeSubscriptions: 0, freeUsers: 0, monthlyRevenue: 0 }
      });
      
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ error: 'Failed to get users data' });
    }
  })
);

// Transcript analysis endpoint
app.post('/api/analyze-transcript', authenticateToken, async (req, res) => {
  try {
    const { transcript, title } = req.body;
    
    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript content is required' });
    }

    // Analyze with OpenAI
    const analysis = await analyzeTranscript(transcript);
    
    // Save to database
    const newTranscript = new Transcript({
      user: req.user.id,
      title: title || `Transcript ${new Date().toLocaleDateString()}`,
      content: transcript,
      analysis,
      createdAt: new Date()
    });

    await newTranscript.save();

    res.json({
      message: 'Transcript analyzed successfully',
      transcriptId: newTranscript._id,
      analysis
    });
  } catch (error) {
    console.error('Transcript analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

// Enhanced transcript analysis with audio transcription support
app.post('/api/analyze-transcript', authenticateToken, checkTranscriptLimits, upload.single('transcript'), asyncHandler(async (req, res) => {
    console.log('Transcript analysis called');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No transcript file provided' });
    }

  console.log('File received:', req.file.originalname, 'Type:', req.file.mimetype);

    // Generate unique analysis ID
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Emit analysis start event
    io.emit('analysisStart', {
      analysisId,
      filename: req.file.originalname,
    fileType: req.file.mimetype,
      startedBy: req.user.email || 'Anonymous',
      timestamp: new Date()
    });

    let transcriptText;
  let audioMetadata = null;

  try {
    // Check if this is an audio file
    const isAudioFile = isValidAudioFormat(req.file.mimetype);
    
    if (isAudioFile) {
      console.log('Audio file detected, starting transcription...');
      
      // Progress callback for real-time updates
      const progressCallback = (progress) => {
        io.emit('analysisProgress', {
          analysisId,
          progress: Math.round(progress.progress * 0.6), // Audio transcription is 60% of total process
          stage: progress.stage,
          timestamp: new Date()
        });
      };

      // Emit initial audio processing update
      io.emit('analysisProgress', {
        analysisId,
        progress: 5,
        stage: 'Processing audio file...',
        timestamp: new Date()
      });

      // Transcribe audio file
      const transcriptionResult = await transcribeAudioFile(
        req.file.path,
        { language: req.body.language || 'en' },
        progressCallback
      );

      if (!transcriptionResult.success) {
        throw new Error('Audio transcription failed');
      }

      transcriptText = transcriptionResult.transcription.text;
      audioMetadata = {
        ...transcriptionResult.metadata,
        duration: transcriptionResult.transcription.duration,
        language: transcriptionResult.transcription.language,
        confidence: transcriptionResult.transcription.confidence,
        segments: transcriptionResult.transcription.segments,
        whisperModel: transcriptionResult.metadata.whisperModel
      };

      console.log(`Audio transcribed successfully: ${transcriptText.length} characters`);
      
      // Emit progress update after transcription
      io.emit('analysisProgress', {
        analysisId,
        progress: 65,
        stage: 'Audio transcribed! Starting analysis...',
        timestamp: new Date()
      });

    } else {
      // Handle text file
    try {
      transcriptText = await fs.readFile(req.file.path, 'utf-8');
      
        // Emit progress update for text processing
      io.emit('analysisProgress', {
        analysisId,
        progress: 25,
          stage: 'Text file processed',
        timestamp: new Date()
      });
    } catch (error) {
        console.error('Error reading text file:', error);
      io.emit('analysisError', {
        analysisId,
        error: 'Failed to read transcript file',
        timestamp: new Date()
      });
      return res.status(400).json({ error: 'Failed to read transcript file' });
      }
    }

    if (!transcriptText.trim()) {
      io.emit('analysisError', {
        analysisId,
        error: 'Transcript content is empty',
        timestamp: new Date()
      });
      return res.status(400).json({ error: 'Transcript content is empty' });
    }

    console.log('Transcript length:', transcriptText.length);

    // Emit progress update for analysis
    io.emit('analysisProgress', {
      analysisId,
      progress: isAudioFile ? 70 : 50,
      stage: 'Analyzing content...',
      timestamp: new Date()
    });

    // Use OpenAI for analysis if API key is provided and USE_OPENAI is not false
    let analysis;
    const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (useOpenAI) {
      try {
        console.log('Using OpenAI for analysis...');
        
        // Emit progress update
        io.emit('analysisProgress', {
          analysisId,
          progress: isAudioFile ? 80 : 75,
          stage: 'AI analysis in progress...',
          timestamp: new Date()
        });
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert sales analyst. Analyze the following ${isAudioFile ? 'transcribed sales call' : 'sales call transcript'} and provide a comprehensive analysis in JSON format with these exact fields:

{
  "summary": "A concise 2-3 sentence summary of the call",
  "objections": ["List of specific objections raised by the prospect"],
  "actionItems": ["List of specific next steps and action items"],
  "sentiment": "positive|neutral|negative",
  "confidence": 85,
  "keyTopics": [{"topic": "topic name", "frequency": 3}],
  "participantCount": 2
}

${isAudioFile ? 'Note: This transcript was automatically generated from audio. ' : ''}Focus on identifying:
- Main discussion points and outcomes
- Specific objections and concerns raised
- Clear, actionable next steps
- Overall sentiment of the conversation
- Key topics and their frequency
- Number of participants

Be specific and actionable in your analysis.`
            },
            {
              role: "user",
              content: transcriptText
            }
          ],
          temperature: 0.3,
        });

        const responseText = completion.choices[0].message.content;
        console.log('OpenAI raw response:', responseText);

        // Try to parse JSON response
        try {
          analysis = JSON.parse(responseText);
        } catch (parseError) {
          console.log('JSON parse failed, using fallback parsing...');
          // Fallback parsing if JSON is not properly formatted
          analysis = {
            summary: extractSection(responseText, 'summary') || "AI analysis completed successfully.",
            objections: extractArraySection(responseText, 'objections') || ["Budget considerations", "Timeline concerns"],
            actionItems: extractArraySection(responseText, 'actionItems') || ["Follow up within 48 hours", "Send additional information"],
            sentiment: extractSection(responseText, 'sentiment') || 'neutral',
            confidence: parseInt(extractSection(responseText, 'confidence')) || 75,
            keyTopics: extractKeyTopics(responseText) || [{ topic: "Product Demo", frequency: 1 }],
            participantCount: parseInt(extractSection(responseText, 'participantCount')) || 2
          };
        }

      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall back to mock analysis if OpenAI fails
        analysis = getMockAnalysis(transcriptText);
      }
    } else {
      console.log('Using mock analysis (no OpenAI key provided)...');
      analysis = getMockAnalysis(transcriptText);
    }

    // Add audio metadata to analysis if present
    if (audioMetadata) {
      analysis.audioMetadata = audioMetadata;
      analysis.sourceType = 'audio';
      analysis.transcriptionConfidence = audioMetadata.confidence;
    } else {
      analysis.sourceType = 'text';
    }

    // Emit final progress update
    io.emit('analysisProgress', {
      analysisId,
      progress: 90,
      stage: 'Saving results...',
      timestamp: new Date()
    });

    // Save to database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Ensure all required fields are provided with proper fallbacks
        const dbFileName = req.file?.filename || req.file?.originalname || `transcript_${Date.now()}.txt`;
        const dbOriginalFileName = req.file?.originalname || dbFileName;
        const dbFileSize = req.file?.size || Buffer.byteLength(transcriptText, 'utf8');
        const dbMimeType = req.file?.mimetype || 'text/plain';
        
        // Use the user ID from authentication
        const userId = req.user.id;

        const transcript = new Transcript({
          userId: userId,
          fileName: dbFileName,
          originalFileName: dbOriginalFileName,
          fileSize: dbFileSize,
          mimeType: dbMimeType,
          transcriptContent: transcriptText,
          analysis: analysis,
          status: 'completed',
          sourceType: isAudioFile ? 'audio' : 'text',
          audioMetadata: audioMetadata
        });

        await transcript.save();
        console.log('✅ Transcript saved to database successfully');
      } catch (dbError) {
        console.error('❌ Database save error:', dbError);
        throw dbError; // Fail hard in production if database save fails
      }
    } else {
      throw new Error('Database connection required');
    }

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }

    // Add analysis metadata
    analysis.analysisId = analysisId;
    analysis.fileName = req.file.originalname;
    analysis.timestamp = new Date();
    analysis.realTimeMode = true;
    analysis.fileType = req.file.mimetype;

    // Emit analysis completion
    io.emit('analysisComplete', {
      analysisId,
      result: analysis,
      completedBy: req.user.email || 'Anonymous',
      timestamp: new Date(),
      filename: req.file.originalname,
      sourceType: isAudioFile ? 'audio' : 'text'
    });

    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Emit error event
    io.emit('analysisError', {
      analysisId: req.body.analysisId || analysisId,
      error: 'Failed to analyze transcript',
      timestamp: new Date()
    });
    
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
}));

// Helper functions for fallback parsing
function extractSection(text, section) {
  const regex = new RegExp(`"${section}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractArraySection(text, section) {
  const regex = new RegExp(`"${section}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
  const match = text.match(regex);
  if (match) {
    return match[1].split(',').map(item => item.replace(/"/g, '').trim());
  }
  return null;
}

function extractKeyTopics(text) {
  const regex = /"keyTopics"\s*:\s*\[([^\]]+)\]/i;
  const match = text.match(regex);
  if (match) {
    try {
      return JSON.parse(`[${match[1]}]`);
    } catch (e) {
      return [{ topic: "Sales Discussion", frequency: 1 }];
    }
  }
  return null;
}

function getMockAnalysis(transcriptText) {
  return {
    summary: "This sales call involved discussing AI-powered solutions with a prospect who showed interest but raised concerns about implementation and budget. The conversation covered product features, pricing, and next steps.",
    objections: [
      "Budget constraints and ROI concerns",
      "Implementation timeline and complexity",
      "Integration with existing systems",
      "Team training requirements"
    ],
    actionItems: [
      "Send detailed ROI analysis and case studies",
      "Schedule technical demo with implementation team",
      "Provide pricing options and flexible payment terms",
      "Follow up within 48 hours with proposal"
    ],
    sentiment: "neutral",
    confidence: 75,
    keyTopics: [
      { topic: "Pricing", frequency: 3 },
      { topic: "Implementation", frequency: 2 },
      { topic: "Features", frequency: 4 },
      { topic: "Timeline", frequency: 2 }
    ],
    participantCount: 2
  };
}

// Get transcripts list
app.get('/api/transcripts', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transcripts = await Transcript.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalTranscripts = await Transcript.countDocuments({ userId: req.user.id });

    // Format the transcripts
    const formattedTranscripts = transcripts.map(transcript => ({
      ...transcript,
      formattedFileSize: formatFileSize(transcript.fileSize || 0),
      timeAgo: getTimeAgo(transcript.createdAt)
    }));

    res.json({
      transcripts: formattedTranscripts,
      pagination: {
        current: page,
        pages: Math.ceil(totalTranscripts / limit),
        total: totalTranscripts,
        hasNext: page < Math.ceil(totalTranscripts / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ error: 'Failed to fetch transcripts' });
  }
});

// Enhanced email generation
app.post('/api/generate-email', authenticateToken, async (req, res) => {
  try {
    console.log('Email generation called');
    
    const { analysis, emailType, tone, customPrompt } = req.body;
    
    if (!analysis) {
      return res.status(400).json({ error: 'No analysis data provided' });
    }

    let email;
    
    // Use OpenAI for email generation if available and enabled
    const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (useOpenAI) {
      try {
        const systemPrompt = `You are an expert sales email writer. Generate a ${tone} ${emailType} email based on the sales call analysis provided. 

Email Requirements:
- ${tone} tone throughout
- Address specific objections mentioned in analysis
- Include relevant action items
- Professional formatting with subject line
- Personalized content based on call details
- Clear call-to-action
- Appropriate length for email type

${customPrompt ? `Additional requirements: ${customPrompt}` : ''}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { 
              role: "user", 
              content: `Generate a ${emailType} email with ${tone} tone based on this analysis:\n\nSummary: ${analysis.summary}\n\nObjections: ${analysis.objections.join(', ')}\n\nAction Items: ${analysis.actionItems.join(', ')}` 
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        email = completion.choices[0].message.content;

      } catch (openaiError) {
        console.error('OpenAI email generation error:', openaiError);
        // Fall back to template-based generation
        email = generateTemplateEmail(analysis, emailType, tone);
      }
    } else {
      email = generateTemplateEmail(analysis, emailType, tone);
    }

    res.json({ email });

  } catch (error) {
    console.error('Email generation error:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// Template-based email generation (fallback)
function generateTemplateEmail(analysis, emailType, tone) {
  const templates = {
    followup: {
      professional: `Subject: Follow-up: Next Steps from Our Conversation

Dear [Client Name],

Thank you for taking the time to discuss your needs with us today. I wanted to follow up on our conversation and address the key points we covered.

**Call Summary:**
${analysis.summary}

**Addressing Your Concerns:**
${analysis.objections.map(obj => `• ${obj}`).join('\n')}

**Proposed Next Steps:**
${analysis.actionItems.map(item => `• ${item}`).join('\n')}

I'm confident we can address your concerns and provide the value you're looking for. Please let me know if you have any questions or would like to schedule a follow-up meeting.

Best regards,
[Your Name]`,
      
      casual: `Subject: Great talking with you today!

Hi [Client Name],

Thanks for the great conversation today! I really enjoyed learning more about your challenges and how we might be able to help.

Quick recap of what we discussed:
${analysis.summary}

I know you mentioned some concerns about:
${analysis.objections.map(obj => `• ${obj}`).join('\n')}

Let's tackle these together! Here's what I'm thinking for next steps:
${analysis.actionItems.map(item => `• ${item}`).join('\n')}

Looking forward to continuing our conversation!

Cheers,
[Your Name]`,
      
      persuasive: `Subject: Transform Your Business - Let's Make It Happen

[Client Name],

Our conversation today revealed incredible opportunities for your business transformation.

Here's what we uncovered:
${analysis.summary}

I understand your concerns:
${analysis.objections.map(obj => `• ${obj}`).join('\n')}

But here's the reality: every day you wait is a day your competitors get ahead. 

Here's how we move forward immediately:
${analysis.actionItems.map(item => `• ${item}`).join('\n')}

The question isn't whether you can afford to implement this solution - it's whether you can afford NOT to.

Let's schedule our next call within 48 hours to keep this momentum going.

[Your Name]`
    }
    // Add more email types as needed
  };

  return templates[emailType]?.[tone] || `Subject: Follow-up from our conversation

Thank you for our discussion today. Based on our conversation about ${analysis.summary}, I wanted to follow up on the next steps.

${analysis.actionItems.map(item => `• ${item}`).join('\n')}

Looking forward to continuing our conversation.

Best regards,
[Your Name]`;
}

// Enhanced chat endpoint with real OpenAI
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    console.log('Chat request received');
    
    const { message, analysis, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    let response;

    // Use OpenAI for chat if available and enabled
    const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    if (useOpenAI) {
      try {
        const systemPrompt = `You are an expert sales strategist and coach. Help sales professionals with their strategies based on call analysis and best practices. 

Context: ${analysis ? `Recent call analysis - Summary: ${analysis.summary}, Objections: ${analysis.objections.join(', ')}, Action Items: ${analysis.actionItems.join(', ')}` : 'General sales consultation'}

Provide specific, actionable advice. Use frameworks like SPIN selling, MEDDIC, and Challenger Sale when relevant. Include specific tactics, scripts, and next steps.`;

        const messages = [
          { role: "system", content: systemPrompt }
        ];

        // Add conversation history if available
        if (conversationHistory && conversationHistory.length > 0) {
          conversationHistory.slice(-5).forEach(msg => { // Last 5 messages for context
            messages.push({ role: "user", content: msg.message || msg.content });
            if (msg.response) {
              messages.push({ role: "assistant", content: msg.response });
            }
          });
        }

        messages.push({ role: "user", content: message });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000
        });

        response = completion.choices[0].message.content;

      } catch (openaiError) {
        console.error('OpenAI chat error:', openaiError);
        response = generateTemplateResponse(message, analysis);
      }
    } else {
      response = generateTemplateResponse(message, analysis);
    }

    res.json({ response });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat request failed' });
  }
});

// Template response generation (fallback)
function generateTemplateResponse(message, analysis) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('pricing') || lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
    return `Great question about pricing strategy! Here's my recommendation:

**Value-Based Approach:**
• Lead with ROI and business impact, not features
• Use the "Cost of Inaction" framework
• Present pricing in context of their current costs

**Objection Handling:**
• "I understand budget is important. What's the cost of not solving this problem?"
• "Let's look at this as an investment, not an expense"
• "What's your current solution costing you in time and efficiency?"

**Next Steps:**
• Prepare ROI calculator with their specific numbers
• Get budget range early in discovery
• Offer flexible payment options if needed

Would you like me to help you craft specific pricing responses for your situation?`;
  }
  
  if (lowerMessage.includes('follow') || lowerMessage.includes('next step')) {
    return `Perfect timing for follow-up strategy! Here's the proven framework:

**The 24-48-7 Rule:**
• 24 hours: Send thank you + recap email
• 48 hours: Share promised materials/information  
• 7 days: Check in with additional value

**Follow-up Best Practices:**
• Always reference specific conversation points
• Include something of value (case study, article, tool)
• Be specific about next meeting/call timing
• Use multiple channels (email, LinkedIn, phone)

**Email Template Structure:**
1. Thank them for their time
2. Recap key discussion points
3. Address their specific concerns
4. Provide promised materials
5. Suggest specific next steps with timing

Want me to help you draft a specific follow-up sequence?`;
  }
  
  if (lowerMessage.includes('objection')) {
    return `Excellent question about objection handling! Here's the proven framework:

**The LAER Method:**
• **Listen** - Let them fully explain their concern
• **Acknowledge** - Show you understand their perspective  
• **Explore** - Ask questions to understand the root cause
• **Respond** - Address with relevant proof/solution

**Common Objection Responses:**
• Budget: "I understand. What's it costing you to not solve this problem?"
• Timing: "When would be the right time? Let's plan for that."
• Authority: "Who else would be involved in this decision?"

**The Feel-Felt-Found Technique:**
"I understand how you feel. Other [industry] leaders have felt the same way. Here's what they found..."

**Key Principle:** Every objection is a request for more information or reassurance.

Which specific objection would you like to work on together?`;
  }
  
  return `I'm here to help you excel in sales! I can assist with:

**🎯 Sales Strategy:**
• Objection handling techniques
• Follow-up sequences and timing
• Pricing and negotiation tactics
• Discovery questioning frameworks

**📞 Call Preparation:**
• Research and prospecting tips
• Meeting agenda templates
• Presentation best practices

**📧 Communication:**
• Email templates and sequences
• LinkedIn outreach strategies
• Proposal writing

**📊 Process Optimization:**
• Pipeline management
• CRM best practices
• Performance tracking

What specific area would you like to focus on? I can provide detailed strategies and actionable advice.`;
}

// Analytics endpoint
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get analytics data from database
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalCount, recentCount, sentimentBreakdown, topObjections] = await Promise.all([
      Transcript.countDocuments({ user: userObjectId }),
      Transcript.countDocuments({ 
        user: userObjectId, 
        createdAt: { $gte: thirtyDaysAgo } 
      }),
      Transcript.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: '$analysis.overallSentiment', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Transcript.aggregate([
        { $match: { user: userObjectId } },
        { $unwind: '$analysis.keyObjections' },
        { $group: { _id: '$analysis.keyObjections', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      totalTranscripts: totalCount,
      recentTranscripts: recentCount,
      sentimentBreakdown,
      topObjections,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Email signup endpoint for lead generation
app.post('/api/email-signup', [
  body('email').isEmail().normalizeEmail(),
  body('source').optional().isString()
], handleValidationErrors, async (req, res) => {
  try {
    const { email, source = 'landing-page' } = req.body;
    
    console.log(`📧 New email signup: ${email} from ${source}`);
    
    // In a real application, you would:
    // 1. Store in your email marketing system (Mailchimp, ConvertKit, etc.)
    // 2. Add to your CRM
    // 3. Send welcome email
    // 4. Track conversion metrics
    
    // For now, we'll just log it and potentially store in database
    if (mongoose.connection.readyState === 1) {
      try {
        // You could create an EmailSignup model to track leads
        const EmailSignup = mongoose.model('EmailSignup', {
          email: { type: String, required: true, unique: true },
          source: { type: String, default: 'landing-page' },
          signupDate: { type: Date, default: Date.now },
          converted: { type: Boolean, default: false }
        });
        
        await EmailSignup.findOneAndUpdate(
          { email },
          { email, source, signupDate: new Date() },
          { upsert: true, new: true }
        );
        
        console.log(`✅ Email signup saved to database: ${email}`);
      } catch (dbError) {
        console.error('Database save error for email signup:', dbError);
        // Continue without database
      }
    }
    
    res.json({
      success: true,
      message: 'Thank you for your interest! We\'ll be in touch soon.',
      email
    });
    
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ error: 'Failed to process email signup' });
  }
});

// Analytics endpoint for business metrics
app.get('/api/business-analytics', async (req, res) => {
  try {
    const analytics = {
      totalSignups: 47, // Mock data - would be real from database
      weeklySignups: 12,
      conversionRate: 23.4,
      activeUsers: 34,
      revenueThisMonth: 2840,
      churnRate: 4.2,
      averageSessionTime: '8m 32s',
      topFeatures: [
        { name: 'Transcript Analysis', usage: 89 },
        { name: 'Email Generation', usage: 67 },
        { name: 'AI Assistant', usage: 45 }
      ]
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Business analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch business analytics' });
  }
});

// Advanced Analytics endpoint with predictive insights
app.get('/api/advanced-analytics', authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.range || '30d';
    const userId = req.user.id;
    
    // Calculate date range
    const days = parseInt(timeRange.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    if (mongoose.connection.readyState !== 1) {
      // Return enhanced mock analytics for development
      return res.json(generateAdvancedMockAnalytics(timeRange));
    }

    // Check if userId is valid ObjectId
    let userObjectId;
    try {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } else {
        return res.json(generateAdvancedMockAnalytics(timeRange));
      }
    } catch (objectIdError) {
      return res.json(generateAdvancedMockAnalytics(timeRange));
    }

    try {
      // Parallel queries for better performance
      const [
        totalTranscripts,
        recentTranscripts,
        sentimentBreakdown,
        topObjections,
        dailyData,
        keywordAnalysis,
        competitorMentions,
        timeBasedMetrics
      ] = await Promise.all([
        // Basic counts
        Transcript.countDocuments({ userId: userObjectId }),
        Transcript.countDocuments({ 
          userId: userObjectId, 
          createdAt: { $gte: startDate } 
        }),
        
        // Sentiment analysis
        Transcript.aggregate([
          { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
          { $group: { _id: '$analysis.sentiment', count: { $sum: 1 } } }
        ]),
        
        // Top objections
        Transcript.aggregate([
          { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
          { $unwind: '$analysis.objections' },
          { $group: { _id: '$analysis.objections', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        // Daily aggregation for trends
        Transcript.aggregate([
          { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
          { 
            $group: { 
              _id: { 
                $dateToString: { 
                  format: "%Y-%m-%d", 
                  date: "$createdAt" 
                } 
              },
              count: { $sum: 1 },
              avgSentiment: { $avg: { $cond: [
                { $eq: ['$analysis.sentiment', 'positive'] }, 1,
                { $cond: [{ $eq: ['$analysis.sentiment', 'negative'] }, -1, 0] }
              ]}},
              successRate: { $avg: { $cond: [
                { $gt: ['$analysis.actionItems.length', 0] }, 1, 0
              ]}}
            }
          },
          { $sort: { _id: 1 } }
        ]),
        
        // Keyword frequency analysis
        Transcript.aggregate([
          { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
          { $unwind: '$analysis.keyInsights' },
          { $group: { 
            _id: '$analysis.keyInsights', 
            frequency: { $sum: 1 },
            avgSentiment: { $avg: { $cond: [
              { $eq: ['$analysis.sentiment', 'positive'] }, 1,
              { $cond: [{ $eq: ['$analysis.sentiment', 'negative'] }, -1, 0] }
            ]}}
          }},
          { $sort: { frequency: -1 } },
          { $limit: 10 }
        ]),
        
        // Competitor mentions (mock for now - would need NLP processing)
        Promise.resolve([]),
        
        // Time-based performance metrics
        Transcript.aggregate([
          { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
          { 
            $group: { 
              _id: { $hour: '$createdAt' },
              count: { $sum: 1 },
              successRate: { $avg: { $cond: [
                { $gt: ['$analysis.actionItems.length', 0] }, 100, 0
              ]}}
            }
          },
          { $sort: { successRate: -1 } },
          { $limit: 10 }
        ])
      ]);

      // Process and enhance the data
      const processedData = {
        totalTranscripts,
        recentTranscripts,
        sentimentBreakdown,
        topObjections,
        
        // Enhanced analytics
        conversionTrends: dailyData.map(day => ({
          date: day._id,
          rate: ((day.successRate || 0) * 100).toFixed(1),
          transcripts: day.count,
          sentiment: day.avgSentiment || 0
        })),
        
        performanceMetrics: {
          avgCallDuration: calculateAvgDuration(dailyData),
          successRate: calculateOverallSuccessRate(dailyData),
          followUpRate: 85.5, // Mock - would calculate from actual follow-up data
          responseTime: 2.1 // Mock - would calculate from timestamp data
        },
        
        sentimentTrends: generateSentimentTrends(dailyData),
        
        topKeywords: keywordAnalysis.map(kw => ({
          word: kw._id,
          frequency: kw.frequency,
          sentiment: kw.avgSentiment > 0 ? 'positive' : 
                    kw.avgSentiment < 0 ? 'negative' : 'neutral'
        })),
        
        weeklyProgress: generateWeeklyProgress(dailyData),
        
        predictiveInsights: generatePredictiveInsights(dailyData, sentimentBreakdown),
        
        competitorMentions: [
          { name: 'Competitor A', mentions: 12, sentiment: 'negative' },
          { name: 'Competitor B', mentions: 8, sentiment: 'neutral' },
          { name: 'Industry Leader', mentions: 15, sentiment: 'positive' }
        ],
        
        timeAnalysis: {
          bestPerformingHours: timeBasedMetrics.map(tm => ({
            hour: tm._id,
            successRate: tm.successRate || 0
          })),
          avgCallsByDay: generateDailyCallVolume(dailyData)
        },
        
        generatedAt: new Date().toISOString(),
        realData: true,
        timeRange: timeRange
      };

      res.json(processedData);
      
    } catch (dbError) {
      console.error('Advanced analytics database error:', dbError);
      // Fallback to enhanced mock data
      return res.json(generateAdvancedMockAnalytics(timeRange));
    }

  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({ error: 'Failed to generate advanced analytics' });
  }
});

// Helper functions for advanced analytics processing
function calculateAvgDuration(dailyData) {
  // Mock calculation - would use actual call duration data
  return (15 + Math.random() * 10).toFixed(1);
}

function calculateOverallSuccessRate(dailyData) {
  if (!dailyData.length) return 65.5;
  const avgSuccess = dailyData.reduce((acc, day) => acc + (day.successRate || 0), 0) / dailyData.length;
  return (avgSuccess * 100).toFixed(1);
}

function generateSentimentTrends(dailyData) {
  return dailyData.slice(-7).map(day => {
    const sentiment = day.avgSentiment || 0;
    return {
      date: day._id,
      positive: Math.max(60 + sentiment * 20 + Math.random() * 10, 0),
      negative: Math.max(15 - sentiment * 10 + Math.random() * 8, 0),
      neutral: Math.max(25 + Math.random() * 10, 0)
    };
  });
}

function generateWeeklyProgress(dailyData) {
  const weeks = [];
  let weekData = { calls: 0, deals: 0, revenue: 0 };
  
  dailyData.forEach((day, index) => {
    weekData.calls += day.count;
    weekData.deals += Math.floor(day.count * (day.successRate || 0.3));
    weekData.revenue += Math.floor(day.count * (day.successRate || 0.3) * 2500);
    
    if ((index + 1) % 7 === 0 || index === dailyData.length - 1) {
      weeks.push({
        week: `Week ${weeks.length + 1}`,
        ...weekData
      });
      weekData = { calls: 0, deals: 0, revenue: 0 };
    }
  });
  
  return weeks.slice(-4); // Last 4 weeks
}

function generatePredictiveInsights(dailyData, sentimentBreakdown) {
  const recentTrend = dailyData.slice(-7);
  const avgSuccess = recentTrend.reduce((acc, day) => acc + (day.successRate || 0), 0) / recentTrend.length;
  
  const positiveCount = sentimentBreakdown.find(s => s._id === 'positive')?.count || 0;
  const negativeCount = sentimentBreakdown.find(s => s._id === 'negative')?.count || 0;
  const totalSentiment = positiveCount + negativeCount;
  
  const trendDirection = avgSuccess > 0.7 ? 'up' : avgSuccess < 0.4 ? 'down' : 'stable';
  const nextWeekPrediction = Math.max(40, Math.min(95, (avgSuccess * 100) + (Math.random() - 0.5) * 10));
  
  return {
    nextWeekPrediction: parseFloat(nextWeekPrediction.toFixed(1)),
    trendDirection,
    confidence: Math.floor(75 + Math.random() * 20),
    recommendations: [
      `Current success rate trending ${trendDirection} - ${nextWeekPrediction.toFixed(1)}% predicted`,
      positiveCount > negativeCount ? 
        'Positive sentiment is strong - leverage this in follow-ups' :
        'Focus on addressing concerns to improve sentiment',
      'Schedule follow-ups within 24 hours for optimal conversion',
      'Best performance typically occurs between 10-11 AM and 2-3 PM'
    ]
  };
}

function generateDailyCallVolume(dailyData) {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyVolume = dayNames.map(day => ({
    day,
    calls: 5 + Math.random() * 8
  }));
  
  return dailyVolume.slice(0, 5); // Weekdays only
}

function generateAdvancedMockAnalytics(timeRange) {
  const days = parseInt(timeRange.replace('d', ''));
  const now = new Date();
  const pastDays = Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return {
    totalTranscripts: 147,
    recentTranscripts: Math.floor(23 * (days / 30)),
    sentimentBreakdown: [
      { _id: 'positive', count: Math.floor(89 * (days / 30)) },
      { _id: 'neutral', count: Math.floor(42 * (days / 30)) },
      { _id: 'negative', count: Math.floor(16 * (days / 30)) }
    ],
    topObjections: [
      { _id: 'Budget constraints', count: Math.floor(34 * (days / 30)) },
      { _id: 'Implementation timeline', count: Math.floor(28 * (days / 30)) },
      { _id: 'Integration complexity', count: Math.floor(22 * (days / 30)) },
      { _id: 'Team training requirements', count: Math.floor(18 * (days / 30)) },
      { _id: 'ROI concerns', count: Math.floor(15 * (days / 30)) }
    ],
    conversionTrends: pastDays.slice(-Math.min(7, days)).map((date, i) => ({
      date,
      rate: 65 + Math.sin(i) * 10 + Math.random() * 5,
      transcripts: 8 + Math.floor(Math.random() * 6)
    })),
    performanceMetrics: {
      avgCallDuration: 18.5,
      successRate: 73.2,
      followUpRate: 89.1,
      responseTime: 2.3
    },
    sentimentTrends: pastDays.slice(-7).map((date, i) => ({
      date,
      positive: 60 + Math.random() * 15,
      negative: 15 + Math.random() * 10,
      neutral: 25 + Math.random() * 10
    })),
    topKeywords: [
      { word: 'ROI', frequency: Math.floor(89 * (days / 30)), sentiment: 'neutral' },
      { word: 'budget', frequency: Math.floor(76 * (days / 30)), sentiment: 'negative' },
      { word: 'efficiency', frequency: Math.floor(65 * (days / 30)), sentiment: 'positive' },
      { word: 'integration', frequency: Math.floor(58 * (days / 30)), sentiment: 'neutral' },
      { word: 'training', frequency: Math.floor(47 * (days / 30)), sentiment: 'positive' }
    ],
    weeklyProgress: [
      { week: 'Week 1', calls: 32, deals: 8, revenue: 12400 },
      { week: 'Week 2', calls: 28, deals: 12, revenue: 18600 },
      { week: 'Week 3', calls: 35, deals: 10, revenue: 15800 },
      { week: 'Week 4', calls: 42, deals: 15, revenue: 23200 }
    ],
    predictiveInsights: {
      nextWeekPrediction: 78.5,
      trendDirection: 'up',
      confidence: 87,
      recommendations: [
        'Focus on budget objection handling - 34% of conversations mention budget concerns',
        'Schedule follow-ups within 24 hours for 15% conversion boost',
        'Best performance hours are 10-11 AM and 2-3 PM',
        'Positive sentiment increases 23% when efficiency is mentioned early'
      ]
    },
    competitorMentions: [
      { name: 'Competitor A', mentions: Math.floor(23 * (days / 30)), sentiment: 'negative' },
      { name: 'Competitor B', mentions: Math.floor(18 * (days / 30)), sentiment: 'neutral' },
      { name: 'Industry Leader', mentions: Math.floor(12 * (days / 30)), sentiment: 'positive' }
    ],
    timeAnalysis: {
      bestPerformingHours: [
        { hour: 10, successRate: 85.2 },
        { hour: 14, successRate: 78.9 },
        { hour: 11, successRate: 76.3 },
        { hour: 15, successRate: 73.1 }
      ],
      avgCallsByDay: [
        { day: 'Monday', calls: 8.2 },
        { day: 'Tuesday', calls: 9.5 },
        { day: 'Wednesday', calls: 7.8 },
        { day: 'Thursday', calls: 8.9 },
        { day: 'Friday', calls: 6.3 }
      ]
    },
    generatedAt: new Date().toISOString(),
    mockData: true,
    timeRange: timeRange
  };
}

// ================================
// STRIPE PAYMENT ENDPOINTS
// ================================

// Create payment intent
app.post('/api/payment/create-intent', 
  paymentLimiter,
  authenticateToken,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Invalid currency code'),
    body('planId').notEmpty().withMessage('Plan ID is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { amount, currency = 'usd', planId, billingDetails } = req.body;
    
    try {
      // Create Stripe customer if not exists
      let customer;
      try {
        const existingCustomers = await stripe.customers.list({
          email: req.user.email,
          limit: 1
        });
        
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: req.user.email,
            name: billingDetails?.name || req.user.name,
            metadata: {
              userId: req.user._id.toString(),
              planId: planId
            }
          });
        }
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError);
        console.error('Stripe error details:', {
          type: stripeError.type,
          code: stripeError.code,
          message: stripeError.message,
          statusCode: stripeError.statusCode
        });
        console.error('User data being sent to Stripe:', {
          email: req.user.email,
          name: req.user.name,
          userId: req.user._id,
          hasEmail: !!req.user.email,
          hasName: !!req.user.name,
          hasUserId: !!req.user._id
        });
        
        logError('Stripe customer creation error', stripeError, { userId: req.user._id });
        return res.status(500).json({
          error: 'Failed to create customer',
          code: 'CUSTOMER_CREATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        customer: customer.id,
        metadata: {
          userId: req.user._id.toString(),
          planId: planId,
          userEmail: req.user.email
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Log payment intent creation
      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        userId: req.user._id,
        amount: amount,
        planId: planId
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        customerId: customer.id,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      logError('Payment intent creation error', error, { 
        userId: req.user._id, 
        amount: amount, 
        planId: planId 
      });
      
      res.status(500).json({
        error: 'Failed to create payment intent',
        code: 'PAYMENT_INTENT_FAILED'
      });
    }
  })
);

// Confirm payment and create subscription
app.post('/api/payment/confirm',
  paymentLimiter,
  authenticateToken,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('planId').notEmpty().withMessage('Plan ID is required'),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { paymentIntentId, planId } = req.body;
    
    try {
      // Retrieve payment intent to verify success
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          error: 'Payment not completed',
          code: 'PAYMENT_NOT_COMPLETED'
        });
      }

      // Update user subscription in database
      await User.findByIdAndUpdate(req.user._id, {
        subscription: {
          planId: planId,
          status: 'active',
          customerId: paymentIntent.customer,
          paymentIntentId: paymentIntentId,
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        },
        $push: {
          paymentHistory: {
            paymentIntentId: paymentIntentId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: 'succeeded',
            planId: planId,
            date: new Date()
          }
        }
      });

      // Get user details for email
      const user = await User.findById(req.user._id);
      const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Send payment confirmation email
      const emailResult = await emailService.sendPaymentConfirmation(user.email, {
        planId: planId,
        amount: paymentIntent.amount / 100,
        paymentIntentId: paymentIntentId,
        userName: user.firstName || user.name || 'Valued Customer',
        billingDate: nextBillingDate
      });

      if (emailResult.success) {
        logger.info('Payment confirmation email sent successfully', {
          userId: req.user._id,
          userEmail: user.email,
          messageId: emailResult.messageId
        });
      } else {
        logger.warn('Failed to send payment confirmation email', {
          userId: req.user._id,
          userEmail: user.email,
          error: emailResult.error
        });
      }

      // Log successful payment
      logger.info('Payment confirmed and subscription created', {
        userId: req.user._id,
        paymentIntentId: paymentIntentId,
        planId: planId,
        amount: paymentIntent.amount / 100,
        emailSent: emailResult.success
      });

      res.json({
        success: true,
        subscription: {
          planId: planId,
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

    } catch (error) {
      logError('Payment confirmation error', error, { 
        userId: req.user._id, 
        paymentIntentId: paymentIntentId 
      });
      
      res.status(500).json({
        error: 'Failed to confirm payment',
        code: 'PAYMENT_CONFIRMATION_FAILED'
      });
    }
  })
);

// Get subscription status
app.get('/api/payment/subscription',
  apiLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('subscription paymentHistory');
      
      if (!user.subscription) {
        return res.json({
          subscription: null,
          status: 'none'
        });
      }

      res.json({
        subscription: user.subscription,
        paymentHistory: user.paymentHistory || []
      });

    } catch (error) {
      logError('Subscription retrieval error', error, { userId: req.user._id });
      res.status(500).json({
        error: 'Failed to retrieve subscription',
        code: 'SUBSCRIPTION_RETRIEVAL_FAILED'
      });
    }
  })
);

// Cancel subscription
app.post('/api/payment/cancel',
  authLimiter,
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // Update user subscription status
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.status': 'cancelled',
        'subscription.cancelledAt': new Date()
      });

      // Log cancellation
      logger.info('Subscription cancelled', {
        userId: req.user._id
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });

    } catch (error) {
      logError('Subscription cancellation error', error, { userId: req.user._id });
      res.status(500).json({
        error: 'Failed to cancel subscription',
        code: 'CANCELLATION_FAILED'
      });
    }
  })
);

// Stripe webhook endpoint
app.post('/webhook/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.warn('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logError('Webhook signature verification failed', err);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info('Payment succeeded via webhook', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logger.error('Payment failed via webhook', {
          paymentIntentId: failedPayment.id,
          error: failedPayment.last_payment_error
        });
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        // Handle subscription deletion
        if (deletedSubscription.metadata?.userId) {
          await User.findByIdAndUpdate(deletedSubscription.metadata.userId, {
            'subscription.status': 'cancelled',
            'subscription.cancelledAt': new Date()
          });
        }
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    res.json({ received: true });
  })
);

// ================================
// DEBUG ENDPOINTS (TEMPORARY)
// ================================

// Temporary admin user creation endpoint (remove after testing)
app.post('/api/debug/create-admin', asyncHandler(async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: 'alex@kalm.live' });
    
    if (!adminUser) {
      console.log('🔧 Creating admin user for testing...');
      adminUser = new User({
        email: 'alex@kalm.live',
        password: 'AdminPassword123!', // You should change this
        firstName: 'Alex',
        lastName: 'Admin',
        company: 'KALM AI',
        role: 'admin',
        subscription: {
          planId: 'enterprise',
          status: 'active'
        }
      });
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Generate a token for the admin user
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin user ready',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        fullName: adminUser.fullName,
        role: adminUser.role,
        company: adminUser.company
      },
      token,
      instructions: 'Use this token to test admin endpoints'
    });

  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({ error: 'Failed to create admin user', details: error.message });
  }
}));

// Admin login/setup endpoint - creates admin user if needed and returns valid token  
app.post('/api/debug/admin-login', asyncHandler(async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const adminEmail = 'alex@kalm.live';
    
    // Find or create admin user
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('🔧 Creating admin user...');
      adminUser = new User({
        email: adminEmail,
        password: 'AdminPassword123!', // Change this password after login
        firstName: 'Alex',
        lastName: 'Fisher', 
        company: 'KALM AI',
        role: 'admin',
        subscription: {
          planId: 'enterprise',
          status: 'active'
        }
      });
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user exists, updating status...');
      // Ensure admin has enterprise access
      adminUser.subscription = {
        planId: 'enterprise',
        status: 'active'
      };
      adminUser.role = 'admin';
      await adminUser.save();
    }

    // Generate a fresh token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Longer expiry for admin
    );

    res.json({
      success: true,
      message: 'Admin access ready',
      user: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        fullName: `${adminUser.firstName} ${adminUser.lastName}`,
        role: adminUser.role,
        company: adminUser.company,
        subscription: adminUser.subscription
      },
      token,
      instructions: 'Save this token and use it to login to the admin panel'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to setup admin access', details: error.message });
  }
}));

// Debug endpoint for testing authentication
app.get('/api/debug/auth', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: {
      id: req.user.id || req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      fullName: req.user.fullName,
      role: req.user.role,
      subscription: req.user.subscription
    },
    timestamp: new Date().toISOString()
  });
}));

// Add error handling middleware at the end
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// Enhanced server startup
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AI Sales Platform Server running on http://0.0.0.0:${port}`);
  console.log(`📋 Health check: http://0.0.0.0:${port}/health`);
  console.log(`📊 System metrics: http://0.0.0.0:${port}/api/system/metrics`);
  console.log(`🔗 Socket.io enabled for real-time features`);
  console.log(`🌐 Server bound to all interfaces (0.0.0.0) for Railway compatibility`);
  
  // Enhanced OpenAI status with mock mode indicator
  const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  if (useOpenAI) {
    console.log(`🤖 OpenAI: ✅ LIVE MODE (consuming credits)`);
  } else {
    console.log(`🤖 OpenAI: 🎭 MOCK MODE (preserving credits)`);
  }
  
  console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected to Atlas' : '⏳ Connecting...'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Show environment status
  console.log('\n🎯 Current Configuration:');
  console.log(`   • OpenAI Mock Mode: ${process.env.USE_OPENAI === 'false' ? 'ENABLED (saves credits)' : 'DISABLED (using real API)'}`);
  console.log(`   • Database: ${process.env.MONGODB_URI?.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
  console.log(`   • Port: ${port}`);
  console.log(`   • Host: 0.0.0.0 (all interfaces)`);
  console.log(`   • Real-time Features: ✅ Socket.io Active`);
  console.log(`   • Active Users Tracking: ✅ Enabled`);
  console.log(`   • Live Analysis Progress: ✅ Enabled`);
  console.log(`   • Team Chat: ✅ Enabled`);
  
  if (process.env.USE_OPENAI === 'false') {
    console.log('\n💡 To enable real OpenAI analysis, change USE_OPENAI=true in .env file');
    console.log('🎭 Demo Mode: Upload transcripts to see real-time analysis simulation');
  } else {
    console.log('\n⚠️  Real OpenAI mode active - API calls will consume credits');
  }
  
  console.log('\n🌐 Access the application:');
  console.log(`   Frontend: http://localhost:5173`);
  console.log(`   Real-time Dashboard: Click the "Live" tab`);
  console.log(`   API: http://0.0.0.0:${port}`);
  console.log(`   Railway Health Check: http://0.0.0.0:${port}/health`);
  
  // Log startup event
  logger.info('Server started successfully', {
    port,
    host: '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    openaiMode: process.env.USE_OPENAI === 'false' ? 'mock' : 'live',
    features: [
      'Enhanced Error Handling',
      'Performance Monitoring', 
      'Advanced Security',
      'Professional Logging',
      'System Health Checks',
      'Railway Compatibility'
    ]
  });
});

// ================================
// USAGE TRACKING ENDPOINTS
// ================================

// Simple test endpoint to verify routing works
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routing is working!', timestamp: new Date().toISOString() });
});

// Get current user's usage statistics
app.get('/api/usage/stats', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      
      // Debug logging
      console.log('🔍 Usage stats request:', {
        userObject: req.user,
        email: req.user?.email,
        userId: userId
      });
      
      // Admin emails get enterprise-level access
      const adminEmails = [
        'alexfisher@mac.home', 
        'alexfisher.dev@gmail.com',
        'alex@kalm.live',
        'admin@kalm.live'
      ].map(email => email.toLowerCase()); // Normalize admin emails
      
      const userEmail = req.user?.email?.toLowerCase(); // Normalize user email
      
      if (req.user.email && adminEmails.includes(userEmail)) {
        console.log(`✅ Admin usage stats access for ${req.user.email}`);
        
        const usageStats = await getUserUsageStats(userId);
        const adminResponse = {
          currentPlan: 'enterprise',
          limits: PLAN_LIMITS['enterprise'],
          usage: {
            monthly: {
              used: usageStats?.monthly || 0,
              limit: 0, // unlimited
              remaining: 'unlimited',
              percentage: 0
            },
            daily: {
              used: usageStats?.daily || 0,
              limit: 0, // unlimited
              remaining: 'unlimited', 
              percentage: 0
            },
            total: usageStats?.total || 0
          },
          features: PLAN_LIMITS['enterprise'].features,
          upgradeSuggestions: [] // No suggestions for admin
        };
        
        return res.json(adminResponse);
      }
      
      const planId = req.user.subscription?.planId || 'free';
      const planLimits = PLAN_LIMITS[planId];
      
      const usageStats = await getUserUsageStats(userId);
      
      if (!usageStats) {
        return res.status(500).json({ error: 'Failed to get usage statistics' });
      }
      
      const response = {
        currentPlan: planId,
        limits: planLimits,
        usage: {
          monthly: {
            used: usageStats.monthly,
            limit: planLimits.monthlyTranscripts,
            remaining: planLimits.monthlyTranscripts === 0 ? 'unlimited' : Math.max(0, planLimits.monthlyTranscripts - usageStats.monthly),
            percentage: planLimits.monthlyTranscripts === 0 ? 0 : Math.round((usageStats.monthly / planLimits.monthlyTranscripts) * 100)
          },
          daily: {
            used: usageStats.daily,
            limit: planLimits.dailyTranscripts,
            remaining: planLimits.dailyTranscripts === 0 ? 'unlimited' : Math.max(0, planLimits.dailyTranscripts - usageStats.daily),
            percentage: planLimits.dailyTranscripts === 0 ? 0 : Math.round((usageStats.daily / planLimits.dailyTranscripts) * 100)
          },
          total: usageStats.total
        },
        features: planLimits.features,
        upgradeSuggestions: generateUpgradeSuggestions(planId, usageStats)
      };
      
      res.json(response);
      
    } catch (error) {
      console.error('Usage stats error:', error);
      res.status(500).json({ error: 'Failed to get usage statistics' });
    }
  })
);

// Admin endpoint - Get all users and their usage
app.get('/api/admin/users', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // Debug logging
      console.log('🔍 Admin access attempt:', {
        userObject: req.user,
        email: req.user?.email,
        id: req.user?.id || req.user?._id
      });
      
      // Check if user is admin based on email
      const adminEmails = [
        'alexfisher@mac.home', 
        'alexfisher.dev@gmail.com',
        'alex@kalm.live',
        'admin@kalm.live'
      ].map(email => email.toLowerCase()); // Normalize admin emails
      
      const userEmail = req.user?.email?.toLowerCase(); // Normalize user email
      
      if (!req.user || !userEmail || !adminEmails.includes(userEmail)) {
        console.log('❌ Admin access denied:', {
          hasUser: !!req.user,
          userEmail: userEmail,
          normalizedAdminEmails: adminEmails,
          isAdmin: userEmail ? adminEmails.includes(userEmail) : false
        });
        
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.',
          code: 'ADMIN_ACCESS_DENIED',
          debug: {
            userEmail: req.user?.email,
            hasUser: !!req.user,
            normalizedAdminEmails: adminEmails
          }
        });
      }
      
      console.log(`✅ Admin dashboard access granted for ${req.user.email}`);
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Get users with their usage stats
      const users = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
        
      const totalUsers = await User.countDocuments({});
      
      // Add usage stats for each user
      const usersWithUsage = await Promise.all(
        users.map(async (user) => {
          const usage = await getUserUsageStats(user._id);
          return {
            ...user,
            usage: usage || { monthly: 0, daily: 0, total: 0 }
          };
        })
      );
      
      // Calculate summary statistics
      const summary = {
        totalUsers,
        activeSubscriptions: users.filter(u => u.subscription?.status === 'active').length,
        freeUsers: users.filter(u => !u.subscription?.planId || u.subscription.planId === 'free').length,
        monthlyRevenue: users.reduce((sum, u) => {
          if (u.subscription?.status === 'active') {
            switch (u.subscription.planId) {
              case 'starter': return sum + 29;
              case 'professional': return sum + 79;
              case 'enterprise': return sum + 149;
              default: return sum;
            }
          }
          return sum;
        }, 0)
      };
      
      res.json({
        users: usersWithUsage,
        totalUsers,
        pagination: {
          current: page,
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers
        },
        summary
      });
      
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ error: 'Failed to get users data' });
    }
  })
);

// Helper function to generate upgrade suggestions
function generateUpgradeSuggestions(currentPlan, usageStats) {
  const suggestions = [];
  
  if (currentPlan === 'free') {
    if (usageStats.monthly >= 3) {
      suggestions.push({
        type: 'usage_warning',
        message: `You've used ${usageStats.monthly}/5 free analyses this month`,
        action: 'Upgrade to Starter for 50 analyses/month',
        urgency: usageStats.monthly >= 4 ? 'high' : 'medium'
      });
    }
    
    suggestions.push({
      type: 'feature_unlock',
      message: 'Unlock custom templates and priority support',
      action: 'Upgrade to Starter for $29/month',
      urgency: 'low'
    });
  }
  
  if (currentPlan === 'starter') {
    if (usageStats.monthly >= 40) {
      suggestions.push({
        type: 'usage_warning',
        message: `You're approaching your monthly limit (${usageStats.monthly}/50)`,
        action: 'Upgrade to Professional for unlimited analyses',
        urgency: usageStats.monthly >= 45 ? 'high' : 'medium'
      });
    }
    
    suggestions.push({
      type: 'feature_unlock',
      message: 'Unlock team collaboration and advanced analytics',
      action: 'Upgrade to Professional for $79/month',
      urgency: 'low'
    });
  }
  
  return suggestions;
}

// IMPORTANT: Error handling middleware must be LAST, after all routes
app.use(notFound); // 404 handler for unmatched routes
app.use(errorHandler); // Global error handler

module.exports = { app, server, io };// Railway redeploy trigger - Wed Jun  4 18:54:51 BST 2025
