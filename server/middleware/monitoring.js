const os = require('os');
const process = require('process');

// System metrics tracking
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;
const startTime = Date.now();

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Track request
  requestCount++;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    totalResponseTime += responseTime;
    
    // Log slow requests (>1000ms)
    if (responseTime > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Track errors
    if (res.statusCode >= 400) {
      errorCount++;
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📝 ${timestamp} | ${method} ${url} | IP: ${ip} | UA: ${userAgent.substring(0, 50)}`);
  
  next();
};

// System health check endpoint data
const getSystemHealth = () => {
  const uptime = Date.now() - startTime;
  const avgResponseTime = requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0;
  const errorRate = requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) : 0;
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      ms: uptime,
      human: formatUptime(uptime)
    },
    system: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      loadAverage: os.loadavg(),
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      memoryUsage: process.memoryUsage(),
      cpuCount: os.cpus().length
    },
    application: {
      environment: process.env.NODE_ENV || 'development',
      version: require('../package.json').version || '1.0.0',
      requests: {
        total: requestCount,
        errors: errorCount,
        errorRate: `${errorRate}%`,
        avgResponseTime: `${avgResponseTime}ms`
      }
    },
    services: {
      database: checkDatabaseHealth(),
      openai: checkOpenAIHealth(),
      stripe: checkStripeHealth()
    }
  };
};

// Service health checks
const checkDatabaseHealth = () => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state] || 'unknown',
      host: mongoose.connection.host || 'not configured'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

const checkOpenAIHealth = () => {
  const hasApiKey = process.env.OPENAI_API_KEY && 
                    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                    process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here';
  
  return {
    status: hasApiKey ? 'configured' : 'not configured',
    mode: process.env.USE_OPENAI !== 'false' && hasApiKey ? 'live' : 'mock'
  };
};

const checkStripeHealth = () => {
  const hasSecretKey = process.env.STRIPE_SECRET_KEY && 
                       process.env.STRIPE_SECRET_KEY !== 'sk_test_your-stripe-secret-key';
  
  return {
    status: hasSecretKey ? 'configured' : 'not configured',
    mode: process.env.NODE_ENV === 'production' ? 'live' : 'test'
  };
};

// Utility functions
const formatUptime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Reset metrics (useful for testing)
const resetMetrics = () => {
  requestCount = 0;
  errorCount = 0;
  totalResponseTime = 0;
  console.log('📊 Metrics reset');
};

module.exports = {
  performanceMonitor,
  requestLogger,
  getSystemHealth,
  resetMetrics
}; 