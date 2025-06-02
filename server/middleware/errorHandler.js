const mongoose = require('mongoose');

// Global error handler middleware
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Default error
  let err = { ...error };
  err.message = error.message;

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    const message = 'Resource not found';
    err = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const message = 'Duplicate field value entered';
    err = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(val => val.message);
    err = { statusCode: 400, message };
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err = { statusCode: 401, message };
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Token expired';
    err = { statusCode: 401, message };
  }

  // OpenAI API errors
  if (error.response && error.response.data) {
    const message = error.response.data.error?.message || 'AI service error';
    err = { statusCode: 503, message };
  }

  // File upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 10MB';
    err = { statusCode: 400, message };
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, asyncHandler, notFound }; 