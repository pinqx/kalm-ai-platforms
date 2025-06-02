# 🚀 Environment Setup Guide

## Create .env file in /server directory with these variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sales-platform

# OpenAI Configuration  
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Security Configuration
JWT_SECRET=your-super-secure-random-string-here-make-it-long-and-complex

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
```

## Quick Setup Steps:

### 1. OpenAI API Key (URGENT - Fixes Current Issues)
1. Go to https://platform.openai.com/
2. Sign up/Login
3. Add payment method (minimum $5)
4. Go to API Keys section
5. Create new secret key
6. Copy key to .env file

### 2. MongoDB Atlas (Free Database)
1. Visit https://www.mongodb.com/atlas/database
2. Create free account
3. Create new cluster (free tier)
4. Create database user
5. Whitelist IP (or use 0.0.0.0/0 for all IPs)
6. Get connection string
7. Replace username/password in connection string
8. Add to .env file

### 3. Generate JWT Secret
Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Cost Breakdown:
- **OpenAI**: $0.002 per transcript analysis (~$1/month for 500 transcripts)
- **MongoDB Atlas**: FREE (up to 512MB)
- **Total**: ~$1-5/month to start

Once you have these set up, your site will work perfectly for production! 