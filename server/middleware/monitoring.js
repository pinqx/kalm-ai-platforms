const os = require('os');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const memUsage = process.memoryUsage();
    
    console.log(`📊 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    
    // Log slow requests
    if (duration > 2000) {
      console.warn(`⚠️  Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

// System health monitoring
const getSystemHealth = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      loadavg: os.loadavg(),
      freemem: Math.round(os.freemem() / 1024 / 1024), // MB
      totalmem: Math.round(os.totalmem() / 1024 / 1024) // MB
    }
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const clientIP = req.ip || req.connection.remoteAddress;
  
  console.log(`🌐 ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${clientIP} | UA: ${userAgent.substring(0, 50)}...`);
  
  next();
};

// Rate limiting info
const rateLimitLogger = (req, res, next) => {
  if (req.rateLimit) {
    res.set({
      'X-RateLimit-Limit': req.rateLimit.limit,
      'X-RateLimit-Remaining': req.rateLimit.remaining,
      'X-RateLimit-Reset': new Date(Date.now() + req.rateLimit.resetTime)
    });
  }
  next();
};

module.exports = {
  performanceMonitor,
  getSystemHealth,
  requestLogger,
  rateLimitLogger
}; 