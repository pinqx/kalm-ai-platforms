#!/usr/bin/env node

// Enhanced startup script for Railway deployment with better error handling
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting KALM AI Platform server...');
console.log(`📂 Current directory: ${__dirname}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${process.env.PORT || 3000}`);

// Check if server directory exists
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found:', serverDir);
  process.exit(1);
}

// Check if server.js exists
const serverFile = path.join(serverDir, 'server.js');
if (!fs.existsSync(serverFile)) {
  console.error('❌ Server file not found:', serverFile);
  process.exit(1);
}

console.log('✅ Server files found, starting application...');

// Set working directory to server
process.chdir(serverDir);
console.log(`📁 Changed to directory: ${process.cwd()}`);

// Add a small delay to ensure all file systems are ready
console.log('⏳ Initializing server environment...');
setTimeout(() => {
  console.log('🚀 Launching server process...');
  
  // Start the server with enhanced options
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || 3000
    }
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    console.error('💡 Check if Node.js is installed and server.js is valid');
    process.exit(1);
  });

  server.on('exit', (code, signal) => {
    console.log(`🔚 Server exited with code ${code} and signal ${signal}`);
    
    if (code === 0) {
      console.log('✅ Server shut down gracefully');
    } else {
      console.error('❌ Server crashed or was terminated');
      console.error('💡 Check Railway logs for more details');
    }
    
    process.exit(code || 0);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
  });

  console.log(`🎯 Server process started with PID: ${server.pid}`);
  
}, 2000); // 2 second delay 