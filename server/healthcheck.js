#!/usr/bin/env node

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

let attempt = 0;

function performHealthCheck() {
  attempt++;
  console.log(`Health check attempt ${attempt}/${MAX_RETRIES} on ${HOST}:${PORT}/health`);

  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET',
    timeout: 5000,
    headers: {
      'User-Agent': 'Railway-Health-Check/1.0'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Health check response: ${res.statusCode} - ${data}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Health check passed');
        process.exit(0);
      } else {
        console.log(`❌ Health check failed with status ${res.statusCode}`);
        handleRetry();
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Health check request failed: ${error.message}`);
    handleRetry();
  });

  req.on('timeout', () => {
    console.log('❌ Health check timed out');
    req.destroy();
    handleRetry();
  });

  req.end();
}

function handleRetry() {
  if (attempt >= MAX_RETRIES) {
    console.log(`❌ Health check failed after ${MAX_RETRIES} attempts`);
    process.exit(1);
  } else {
    console.log(`⏳ Retrying health check in ${RETRY_DELAY}ms...`);
    setTimeout(performHealthCheck, RETRY_DELAY);
  }
}

// Start the health check
performHealthCheck(); 