const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define different log levels
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ai-sales-platform' },
  transports: [
    // Error logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Performance logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'performance.log'), 
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

// If not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Specific loggers for different components
const apiLogger = logger.child({ component: 'api' });
const authLogger = logger.child({ component: 'auth' });
const dbLogger = logger.child({ component: 'database' });
const aiLogger = logger.child({ component: 'ai' });
const socketLogger = logger.child({ component: 'socket' });

// Helper functions
const logRequest = (req, res, responseTime) => {
  apiLogger.info('Request processed', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

const logError = (message, error = null, req = null, additionalData = {}) => {
  // Handle different parameter patterns
  let errorMessage = message;
  let errorObj = error;
  let requestObj = req;
  let extraData = additionalData;

  // If first parameter is an error object
  if (typeof message === 'object' && message instanceof Error) {
    errorObj = message;
    errorMessage = message.message;
    requestObj = error; // Second param becomes req
    extraData = req || {}; // Third param becomes additionalData
  }

  const logData = {
    error: errorMessage,
    stack: errorObj?.stack,
    url: requestObj?.originalUrl,
    method: requestObj?.method,
    ip: requestObj?.ip,
    userAgent: requestObj && typeof requestObj.get === 'function' ? requestObj.get('User-Agent') : undefined,
    ...extraData
  };

  logger.error('Application error', logData);
};

const logAuth = (event, userId, email, details = {}) => {
  authLogger.info(`Auth event: ${event}`, {
    userId,
    email,
    ...details
  });
};

const logAI = (event, details = {}) => {
  aiLogger.info(`AI event: ${event}`, details);
};

const logDB = (event, details = {}) => {
  dbLogger.info(`Database event: ${event}`, details);
};

const logSocket = (event, socketId, details = {}) => {
  socketLogger.info(`Socket event: ${event}`, {
    socketId,
    ...details
  });
};

const logPerformance = (event, duration, details = {}) => {
  logger.info(`Performance: ${event}`, {
    duration: `${duration}ms`,
    ...details
  });
};

module.exports = {
  logger,
  apiLogger,
  authLogger,
  dbLogger,
  aiLogger,
  socketLogger,
  logRequest,
  logError,
  logAuth,
  logAI,
  logDB,
  logSocket,
  logPerformance
}; 