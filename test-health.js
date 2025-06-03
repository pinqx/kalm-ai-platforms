#!/usr/bin/env node

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

console.log('🔍 Testing health endpoint...');
console.log(`🎯 Target: http://${HOST}:${PORT}/health`);

function testHealthEndpoint() {
  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET',
    timeout: 5000,
    headers: {
      'User-Agent': 'Health-Test-Script/1.0'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response Body:`, data);
      
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ Valid JSON response:`, parsed);
        
        if (res.statusCode === 200 && parsed.status) {
          console.log('🎉 Health check PASSED!');
          process.exit(0);
        } else {
          console.log('❌ Health check FAILED - unexpected response');
          process.exit(1);
        }
      } catch (error) {
        console.log('❌ Health check FAILED - invalid JSON:', error.message);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`❌ Request failed: ${error.message}`);
    console.log('💡 Make sure the server is running on port', PORT);
    process.exit(1);
  });

  req.on('timeout', () => {
    console.log('❌ Request timed out');
    req.destroy();
    process.exit(1);
  });

  req.end();
}

console.log('⏳ Starting health check test...');
testHealthEndpoint(); 