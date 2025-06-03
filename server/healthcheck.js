#!/usr/bin/env node

const http = require('http');

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

let attempt = 0;

// Try multiple hosts - Railway might need 0.0.0.0 instead of localhost
const HOSTS_TO_TRY = ['0.0.0.0', 'localhost', '127.0.0.1'];
let currentHostIndex = 0;

function performHealthCheck() {
  attempt++;
  const HOST = HOSTS_TO_TRY[currentHostIndex];
  
  console.log(`Health check attempt ${attempt}/${MAX_RETRIES} on ${HOST}:${PORT}/health`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);

  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET',
    timeout: 10000, // Increased to 10 seconds
    headers: {
      'User-Agent': 'Railway-Health-Check/2.0',
      'Accept': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Health check response: ${res.statusCode} - ${data}`);
      
      if (res.statusCode === 200) {
        console.log('🎉 Health check PASSED');
        process.exit(0);
      } else {
        console.log(`❌ Health check failed with status ${res.statusCode}`);
        handleRetry();
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Health check request failed on ${HOST}: ${error.message}`);
    handleRetry();
  });

  req.on('timeout', () => {
    console.log(`❌ Health check timed out on ${HOST}`);
    req.destroy();
    handleRetry();
  });

  req.end();
}

function handleRetry() {
  // Try next host if available
  if (currentHostIndex < HOSTS_TO_TRY.length - 1) {
    currentHostIndex++;
    console.log(`🔄 Trying next host: ${HOSTS_TO_TRY[currentHostIndex]}`);
    setTimeout(performHealthCheck, 1000);
    return;
  }

  // Reset host index and try again if we have retries left
  if (attempt >= MAX_RETRIES) {
    console.log(`❌ Health check failed after ${MAX_RETRIES} attempts on all hosts`);
    console.log(`💡 Tried hosts: ${HOSTS_TO_TRY.join(', ')}`);
    process.exit(1);
  } else {
    currentHostIndex = 0; // Reset to first host
    console.log(`⏳ Retrying health check in ${RETRY_DELAY}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
    setTimeout(performHealthCheck, RETRY_DELAY);
  }
}

// Start the health check
console.log('🏥 Starting enhanced health check...');
console.log(`🎯 Port: ${PORT}`);
console.log(`🌐 Hosts to try: ${HOSTS_TO_TRY.join(', ')}`);
performHealthCheck(); 