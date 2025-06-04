const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Enhanced rate limiting with different rules for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Store in MongoDB if available, fallback to memory
    store: process.env.MONGODB_URI ? new MongoStore({
      uri: process.env.MONGODB_URI,
      collectionName: 'rateLimitHits',
      expireTimeMs: windowMs
    }) : undefined
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
  process.env.NODE_ENV === 'production' ? 20 : 100, // Increased from 5 to 20 for testing
  'Too many authentication attempts, please try again later'
);

const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  process.env.NODE_ENV === 'production' ? 10 : 100, // Much higher limit in dev
  'Too many file uploads, please try again later'
);

const aiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  process.env.NODE_ENV === 'production' ? 20 : 200, // Much higher limit in dev
  'Too many AI requests, please try again later'
);

const paymentLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'production' ? 50 : 200, // Higher limit for payments
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
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
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
        req.query[key] = req.query[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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
    
    const clientIP = req.ip || req.connection.remoteAddress;
    
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
    if (req.file.size > 10 * 1024 * 1024) { // 10MB
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
      'audio/mp4'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Check filename for security
    const filename = req.file.originalname;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
  }
  
  next();
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
  fileUploadSecurity
}; 