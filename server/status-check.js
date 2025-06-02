#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 AI Sales Platform Status Check\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file: Found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mockMode = envContent.includes('USE_OPENAI=false');
  console.log(`   🤖 OpenAI Mode: ${mockMode ? 'MOCK (credits preserved)' : 'LIVE (consuming credits)'}`);
  console.log(`   📊 Database: ${envContent.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
} else {
  console.log('❌ .env file: Missing');
  console.log('   Run: node setup-env.js');
}

// Check backend server
console.log('\n🔍 Checking Backend Server...');
checkServer('http://localhost:3007/health', 'Backend')
  .then(() => {
    // Check analytics endpoint
    return checkServer('http://localhost:3007/api/analytics', 'Analytics');
  })
  .then(() => {
    // Check frontend server
    console.log('\n🔍 Checking Frontend Server...');
    return checkServer('http://localhost:5173', 'Frontend');
  })
  .then(() => {
    console.log('\n🎉 All systems operational!');
    console.log('\n📱 Access your application:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:3007');
    console.log('   Health:   http://localhost:3007/health');
    
    console.log('\n🛠️  Quick Commands:');
    console.log('   Toggle Mock Mode: node toggle-mock-mode.js');
    console.log('   Check Status:     node status-check.js');
    console.log('   Setup Environment: node setup-env.js');
  })
  .catch((error) => {
    console.log('\n❌ Some services are not running');
    console.log('\n🚀 To start services:');
    console.log('   Backend:  cd ai-sales-platform/server && PORT=3007 node server.js');
    console.log('   Frontend: cd ai-sales-platform/client && npm run dev');
  });

function checkServer(url, name) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`   ✅ ${name}: Running (${res.statusCode})`);
        resolve();
      } else {
        console.log(`   ⚠️  ${name}: Responding but status ${res.statusCode}`);
        resolve();
      }
    });

    request.on('error', (error) => {
      console.log(`   ❌ ${name}: Not responding`);
      reject(error);
    });

    request.setTimeout(5000, () => {
      console.log(`   ⏰ ${name}: Timeout`);
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
} 