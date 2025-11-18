const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Enhanced rate limiting with different rules for different endpoints
const createRateLimiter = (windowMs, max, message, keyGenerator = null) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: keyGenerator || ((req) => {
      // Use IP address as default key, but prefer X-Forwarded-For for proxy support
      return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    }),
    // Store in MongoDB if available, fallback to memory
    store: process.env.MONGODB_URI ? new MongoStore({
      uri: process.env.MONGODB_URI,
      collectionName: 'rateLimitHits',
      expireTimeMs: windowMs,
      errorHandler: (err) => {
        console.error('Rate limit store error:', err);
      }
    }) : undefined,
    // Prevent double counting
    skip: (req) => {
      // Skip health checks and static files
      return req.path === '/health' || req.path === '/healthz' || req.path === '/ping' || 
             req.path.startsWith('/static/') || req.path.startsWith('/uploads/');
    }
  });
};

// Different rate limits for different endpoints
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'production' ? 100 : 1000, // Much higher limit in dev
  'Too many API requests, please try again later'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'production' ? 10 : 50, // Stricter auth limits
  'Too many authentication attempts, please try again later',
  (req) => {
    // Use email + IP for auth rate limiting
    const email = req.body?.email || req.query?.email || 'unknown';
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    return `${email}-${ip}`;
  }
);

const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  process.env.NODE_ENV === 'production' ? 5 : 20, // Stricter upload limits
  'Too many file uploads, please try again later'
);

const aiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  process.env.NODE_ENV === 'production' ? 10 : 50, // Stricter AI limits
  'Too many AI requests, please try again later'
);

const paymentLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'production' ? 20 : 50, // Stricter payment limits
  'Too many payment requests, please try again later'
);

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove server header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;");
  
  // HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }
  
  next();
};

// IP whitelist for admin endpoints (if needed)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }
    
    const clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied from this IP address' });
    }
  };
};

// File upload security
const fileUploadSecurity = (req, res, next) => {
  if (req.file) {
    // Check file size
    const maxSize = process.env.NODE_ENV === 'production' ? 10 * 1024 * 1024 : 25 * 1024 * 1024; // 10MB prod, 25MB dev
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File too large' });
    }
    
    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/webm',
      'audio/ogg',
      'audio/flac'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Check filename for security
    const filename = req.file.originalname;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || 
        filename.includes(';') || filename.includes('&') || filename.includes('|')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
  }
  
  next();
};

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
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  aiLimiter,
  paymentLimiter,
  securityHeaders,
  sanitizeInput,
  ipWhitelist,
  fileUploadSecurity,
  corsOptions
}; 