#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Run setup-env.js first.');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Check current state
const currentlyMocked = envContent.includes('USE_OPENAI=false');

if (process.argv.includes('--status')) {
  console.log(`Current mode: ${currentlyMocked ? '🎭 MOCK MODE (credits preserved)' : '🤖 LIVE MODE (consuming credits)'}`);
  process.exit(0);
}

// Toggle the mode
if (currentlyMocked) {
  envContent = envContent.replace('USE_OPENAI=false', 'USE_OPENAI=true');
  console.log('🤖 Switched to LIVE MODE');
  console.log('⚠️  OpenAI API calls will now consume credits');
  console.log('💰 Cost: ~$0.002 per transcript analysis');
} else {
  envContent = envContent.replace('USE_OPENAI=true', 'USE_OPENAI=false');
  console.log('🎭 Switched to MOCK MODE');
  console.log('💰 Credits preserved - using template responses');
  console.log('🎯 Perfect for development and testing');
}

fs.writeFileSync(envPath, envContent);
console.log('');
console.log('🔄 Restart the server to apply changes:');
console.log('   cd ai-sales-platform/server && PORT=3007 node server.js');
console.log('');
console.log('📊 Check current mode anytime: node toggle-mock-mode.js --status'); 