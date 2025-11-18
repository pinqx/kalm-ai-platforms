const winston = require('winston');
const { createLogger, format, transports } = winston;

// Enhanced logging configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { 
    service: 'ai-sales-platform',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ]
});

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTimes: [],
      activeConnections: 0,
      memoryUsage: [],
      cpuUsage: []
    };
    
    this.startTime = Date.now();
    this.startMonitoring();
  }

  startMonitoring() {
    // Monitor memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      });

      // Keep only last 100 measurements
      if (this.metrics.memoryUsage.length > 100) {
        this.metrics.memoryUsage.shift();
      }
    }, 30000); // Every 30 seconds

    // Monitor CPU usage
    setInterval(() => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        this.metrics.cpuUsage.push({
          timestamp: Date.now(),
          user: endUsage.user,
          system: endUsage.system
        });

        // Keep only last 100 measurements
        if (this.metrics.cpuUsage.length > 100) {
          this.metrics.cpuUsage.shift();
        }
      }, 100);
    }, 60000); // Every minute
  }

  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.responseTimes.push(duration);
    
    // Keep only last 1000 response times
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  recordError(error) {
    this.metrics.errors++;
    logger.error('Application Error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTimes.length > 0 
      ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length 
      : 0;

    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;

    const uptime = Date.now() - this.startTime;

    return {
      uptime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: errorRate.toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
      activeConnections: this.metrics.activeConnections,
      memoryUsage: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || null,
      cpuUsage: this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1] || null
    };
  }
}

// Error tracking
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  trackError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      type: error.constructor.name
    };

    this.errors.push(errorInfo);
    
    // Keep only last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to external service if configured
    if (process.env.SENTRY_DSN) {
      // Sentry integration would go here
      console.error('Sentry Error:', errorInfo);
    }

    logger.error('Tracked Error', errorInfo);
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Security monitoring
class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = [];
    this.blockedIPs = new Set();
    this.maxSuspiciousActivities = 50;
  }

  trackSuspiciousActivity(ip, activity, details = {}) {
    const activityInfo = {
      ip,
      activity,
      details,
      timestamp: new Date().toISOString()
    };

    this.suspiciousActivities.push(activityInfo);
    
    // Keep only last maxSuspiciousActivities
    if (this.suspiciousActivities.length > this.maxSuspiciousActivities) {
      this.suspiciousActivities.shift();
    }

    // Check if IP should be blocked
    const recentActivities = this.suspiciousActivities.filter(
      a => a.ip === ip && 
      Date.now() - new Date(a.timestamp).getTime() < 15 * 60 * 1000 // 15 minutes
    );

    if (recentActivities.length >= 10) {
      this.blockedIPs.add(ip);
      logger.warn('IP Blocked', { ip, reason: 'Too many suspicious activities' });
    }

    logger.warn('Suspicious Activity Detected', activityInfo);
  }

  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  getSuspiciousActivities() {
    return this.suspiciousActivities;
  }

  unblockIP(ip) {
    this.blockedIPs.delete(ip);
  }
}

// Initialize monitoring instances
const performanceMonitor = new PerformanceMonitor();
const errorTracker = new ErrorTracker();
const securityMonitor = new SecurityMonitor();

// Middleware for request monitoring
const requestMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Track request
  performanceMonitor.recordRequest(0); // Will be updated after response

  // Monitor response
  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceMonitor.recordRequest(duration);
    
    // Log slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow Request', {
        method: req.method,
        url: req.url,
        duration: duration + 'ms',
        ip: req.ip
      });
    }
  });

  next();
};

// Global error handler
const globalErrorHandler = (error, req, res, next) => {
  errorTracker.trackError(error, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  performanceMonitor.recordError(error);

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      error: 'Internal server error',
      requestId: req.id || 'unknown'
    });
  } else {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      requestId: req.id || 'unknown'
    });
  }
};

module.exports = {
  logger,
  performanceMonitor,
  errorTracker,
  securityMonitor,
  requestMonitor,
  globalErrorHandler
}; 