#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up AI Sales Platform environment...');

const envContent = `# Database Configuration
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ai-sales-platfrom.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom

# OpenAI Configuration  
OPENAI_API_KEY=sk-your-openai-api-key-here

# Mock Mode Configuration (set to false to use real OpenAI and consume credits)
USE_OPENAI=false

# Security Configuration
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789012345678901234567890abcdef12345678901234567890abcdef12

# Server Configuration
PORT=3007
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📊 MongoDB Atlas: Configured');
  console.log('🤖 OpenAI: Configured (MOCK MODE ENABLED)');
  console.log('🔐 JWT Secret: Generated');
  console.log('');
  console.log('🎯 Mock Mode is ENABLED - this saves your OpenAI credits!');
  console.log('📝 To use real OpenAI analysis, change USE_OPENAI=true in .env');
  console.log('');
  console.log('🚀 Ready to start server with: node server.js');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
} 