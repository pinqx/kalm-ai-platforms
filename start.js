#!/usr/bin/env node

// Simple startup script for Railway deployment
// This avoids shell command issues with 'cd'

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting KALM AI Platform server...');

// Set working directory to server
process.chdir(path.join(__dirname, 'server'));

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🔚 Server exited with code ${code}`);
  process.exit(code);
}); 