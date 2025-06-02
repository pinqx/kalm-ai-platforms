# 🚀 AI Sales Platform - Production Deployment Guide

## Prerequisites for Production

### 1. OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and add payment method
3. Generate API key
4. Recommended: Start with pay-as-you-go ($0.002 per transcript analysis)

### 2. Database Setup Options

#### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/ai-sales-platform`

#### Option B: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community
brew services start mongodb-community
```

### 3. Environment Variables (.env)
Create `.env` file in `/server` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sales-platform

# OpenAI
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Security
JWT_SECRET=generate-a-secure-random-string-here

# Server
PORT=3007
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# File Upload
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Options

### Option 1: Vercel + Railway (Easiest)

#### Frontend (Vercel):
1. Push code to GitHub
2. Connect to Vercel
3. Deploy automatically

#### Backend (Railway):
1. Connect GitHub repo to Railway
2. Add environment variables
3. Deploy backend service

### Option 2: AWS/DigitalOcean (Professional)

#### Frontend:
- Deploy to AWS S3 + CloudFront
- Or use Netlify/Vercel

#### Backend:
- Deploy to AWS EC2 or DigitalOcean Droplet
- Use PM2 for process management
- Set up nginx reverse proxy

### Option 3: Docker (Advanced)

```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3007
CMD ["node", "server.js"]
```

## Pre-Launch Checklist

### Security ✅
- [ ] Strong JWT secret
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] CORS properly configured
- [ ] Environment variables secured

### Performance ✅
- [ ] Database indexes
- [ ] File upload limits
- [ ] CDN for static assets
- [ ] Image optimization

### User Experience ✅
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive
- [ ] Accessibility

### Business ✅
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Pricing page
- [ ] Contact information
- [ ] Analytics tracking (Google Analytics)

## Production Optimizations

### 1. Frontend Build Optimization
```bash
cd client
npm run build
# Optimize for production
```

### 2. Backend Performance
```javascript
// Add to server.js
const compression = require('compression');
app.use(compression());

// Add request logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

### 3. Database Indexes
```javascript
// Add to MongoDB
db.transcripts.createIndex({ userId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

## Monitoring & Maintenance

### 1. Error Tracking
- Add Sentry for error monitoring
- Set up uptime monitoring (UptimeRobot)

### 2. Analytics
- Google Analytics for user behavior
- Custom analytics for business metrics

### 3. Backup Strategy
- Regular database backups
- File storage backups

## Cost Estimates

### Monthly Costs (100 users, 50 transcripts/month):
- **OpenAI**: ~$5-15/month
- **Database**: Free (MongoDB Atlas) - $9/month (paid)
- **Hosting**: $5-20/month (Railway/Vercel)
- **Domain**: $12/year
- **Total**: ~$15-50/month

## Launch Strategy

### Phase 1: Beta Launch
1. Deploy to staging environment
2. Invite 10-20 beta users
3. Collect feedback
4. Fix critical issues

### Phase 2: Public Launch
1. Deploy to production
2. Set up monitoring
3. Create marketing materials
4. Launch on social media/Product Hunt

### Phase 3: Growth
1. Collect user feedback
2. Add new features
3. Optimize for scale
4. Consider premium features

## Need Help?

Common deployment issues and solutions:
1. **CORS errors**: Check FRONTEND_URL in .env
2. **Database connection**: Verify MongoDB URI
3. **OpenAI quota**: Upgrade OpenAI plan
4. **File uploads**: Check server storage limits

Ready to deploy? Start with MongoDB Atlas + OpenAI setup! 