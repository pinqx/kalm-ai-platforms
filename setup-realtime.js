const fs = require('fs');
const path = require('path');

// Setup script for real-time features
console.log('🚀 Setting up AI Sales Platform for Real-time Features...\n');

// Create .env file for server
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvContent = `# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ai-sales-platfrom.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom

# OpenAI Configuration (Mock Mode for Demo)
OPENAI_API_KEY=sk-your-openai-api-key-here
USE_OPENAI=false

# Server Configuration  
PORT=3007
NODE_ENV=development
JWT_SECRET=ai-sales-platform-jwt-secret-key-for-development-2024

# File Upload Configuration
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL
FRONTEND_URL=http://localhost:5173
`;

try {
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Server .env file configured');
} catch (error) {
  console.error('❌ Error creating server .env file:', error.message);
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'server', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  } else {
    console.log('✅ Uploads directory exists');
  }
} catch (error) {
  console.error('❌ Error creating uploads directory:', error.message);
}

console.log('\n🎯 Configuration Complete!');
console.log('\n📋 Next steps:');
console.log('1. Start the server: cd server && PORT=3007 node server.js');
console.log('2. Start the client: cd client && npm run dev');
console.log('3. Visit http://localhost:5173 and click the "Live" tab');
console.log('4. Upload a transcript to see real-time analysis');
console.log('\n💡 Features enabled:');
console.log('• Real-time analysis progress tracking');
console.log('• Live user activity feeds');
console.log('• Team chat and collaboration');
console.log('• Multi-user analysis sharing');
console.log('• MongoDB Atlas database connection');
console.log('• Mock OpenAI mode (preserves credits)'); 