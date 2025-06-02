# 🚀 **Deploy KALM AI to kalm.live - Complete Guide**

## ✅ **Current Status**
- ✅ Platform is production-ready
- ✅ All features working (payments, emails, analytics, real-time collaboration)  
- ✅ Code pushed to GitHub: https://github.com/pinqx/kalm-ai-platforms.git
- ✅ Ready to deploy to kalm.live

---

## 🎯 **DEPLOYMENT STRATEGY: "Startup Stack"**

**Frontend**: Vercel (Free tier, perfect for React apps)
**Backend**: Railway ($5-10/month, excellent for Node.js)
**Database**: MongoDB Atlas (Free tier, already configured)
**Domain**: kalm.live (your custom domain)
**DNS**: Cloudflare (Free, for domain management)

**Total Cost**: ~$5-15/month for professional platform

---

## 📋 **STEP 1: Deploy Frontend to Vercel**

### 1.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Import your repository: `pinqx/kalm-ai-platforms`

### 1.2 Configure Vercel Deployment
1. **Root Directory**: Set to `client`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### 1.3 Environment Variables in Vercel
```env
VITE_API_URL=https://kalm-api.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
```

### 1.4 Custom Domain Setup
1. In Vercel dashboard → Settings → Domains
2. Add custom domain: `kalm.live`
3. Follow DNS configuration instructions

---

## 📋 **STEP 2: Deploy Backend to Railway**

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub account
3. Create new project from GitHub repo

### 2.2 Configure Railway Deployment
1. **Root Directory**: `server`
2. **Start Command**: `node server.js`
3. **Port**: Railway auto-detects from `process.env.PORT`

### 2.3 Environment Variables in Railway
```env
NODE_ENV=production
PORT=$PORT
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ac-hk6xang.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom
JWT_SECRET=your-super-secure-jwt-secret-here
OPENAI_API_KEY=sk-your-openai-api-key-here
USE_OPENAI=true
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
EMAIL_FROM="KALM AI Sales Platform <noreply@kalm.live>"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true
ENABLE_SECURITY_HEADERS=true
```

### 2.4 Custom Domain for API
1. In Railway dashboard → Settings → Domains
2. Add custom domain: `api.kalm.live`
3. Update frontend environment to use `https://api.kalm.live`

---

## 📋 **STEP 3: Configure DNS (Cloudflare)**

### 3.1 Add Domain to Cloudflare
1. Go to https://cloudflare.com
2. Add site: `kalm.live`
3. Update nameservers at your domain registrar

### 3.2 DNS Records
```
Type    Name    Content                     Proxy
CNAME   @       cname.vercel-dns.com        ✅ Proxied
CNAME   api     your-railway-domain.up.railway.app  ✅ Proxied
CNAME   www     kalm.live                   ✅ Proxied
```

---

## 📋 **STEP 4: Production Configuration**

### 4.1 Stripe Live Mode
1. Get live Stripe keys from https://dashboard.stripe.com
2. Update environment variables in both Vercel and Railway
3. Test payments with real cards

### 4.2 OpenAI Production
1. Set `USE_OPENAI=true` in Railway environment
2. Monitor API usage and costs
3. Set up billing alerts

### 4.3 Email Configuration
1. Configure Gmail app password
2. Update `EMAIL_FROM` to use `@kalm.live` domain
3. Test email confirmations

---

## 📋 **STEP 5: Security & Monitoring**

### 5.1 Security Headers
- ✅ Already configured in server
- ✅ CORS properly set up
- ✅ Rate limiting enabled

### 5.2 SSL/HTTPS
- ✅ Automatic with Vercel and Railway
- ✅ Cloudflare provides additional security

### 5.3 Monitoring
- Railway provides built-in monitoring
- Set up uptime monitoring (UptimeRobot)
- Monitor error logs

---

## 🚀 **DEPLOYMENT COMMANDS**

### Quick Deploy Script
```bash
# 1. Deploy Frontend
cd client
npm install
npm run build
# Push to Vercel via GitHub integration

# 2. Deploy Backend  
cd ../server
# Push to Railway via GitHub integration

# 3. Update Environment Variables
# Set production values in Vercel and Railway dashboards
```

---

## ✅ **POST-DEPLOYMENT CHECKLIST**

- [ ] Frontend loads at https://kalm.live
- [ ] API responds at https://api.kalm.live/health
- [ ] User registration/login works
- [ ] File upload and analysis works
- [ ] Real-time collaboration works
- [ ] Stripe payments work with live keys
- [ ] Email confirmations work
- [ ] All analytics dashboards load
- [ ] Mobile responsiveness verified
- [ ] SSL certificates active
- [ ] Domain redirects properly (www → non-www)

---

## 🎯 **EXPECTED TIMELINE**

- **Frontend Deploy**: 10-15 minutes
- **Backend Deploy**: 15-20 minutes  
- **DNS Propagation**: 1-24 hours
- **SSL Setup**: Automatic
- **Total Time**: 2-4 hours including testing

---

## 💰 **MONTHLY COSTS**

- **Vercel**: $0 (Free tier)
- **Railway**: $5-10 (Hobby plan)
- **MongoDB Atlas**: $0 (Free tier)
- **Cloudflare**: $0 (Free tier)
- **Domain**: ~$10-15/year
- **Total**: ~$5-15/month

---

## 🆘 **SUPPORT & TROUBLESHOOTING**

### Common Issues:
1. **CORS Errors**: Check API URL in frontend env
2. **Database Connection**: Verify MongoDB URI
3. **Payment Issues**: Check Stripe keys and webhooks
4. **Email Issues**: Verify Gmail app password

### Health Checks:
- Frontend: https://kalm.live
- Backend: https://api.kalm.live/health
- Database: Check Railway logs

---

## 🎉 **CONGRATULATIONS!**

Once deployed, your KALM AI Sales Platform will be live at:
- **Main Site**: https://kalm.live
- **API**: https://api.kalm.live

Your professional AI sales platform is ready to serve customers worldwide! 🌍 