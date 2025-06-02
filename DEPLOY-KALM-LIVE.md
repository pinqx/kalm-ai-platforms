# 🚀 **Deploy KALM AI to kalm.live - Complete Guide**

## ✅ **Current Status**
- ✅ Platform is production-ready
- ✅ All features working (payments, emails, analytics, real-time collaboration)  
- ✅ Code pushed to GitHub: https://github.com/pinqx/kalm-ai-platforms.git
- ✅ Email service logger fixed and working
- ✅ Server running stable on localhost:3007
- ✅ Frontend running stable on localhost:5173
- ⏳ Ready to deploy to kalm.live

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
1. Go to https://vercel.com/signup
2. **Sign up with GitHub** (recommended for easy integration)
3. Connect your GitHub account

### 1.2 Deploy Frontend
1. **Import Project**: Click "New Project" on Vercel dashboard
2. **Select Repository**: Choose `pinqx/kalm-ai-platforms`
3. **Configure Project**:
   - **Project Name**: `kalm-ai-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 1.3 Configure Environment Variables
Add these environment variables in Vercel project settings:
```bash
VITE_API_URL=https://kalm-api.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QkjFGPv1AtQLeBVyour_stripe_key
```

### 1.4 Custom Domain Setup
1. **Domain Settings**: Go to Vercel project → Settings → Domains
2. **Add Domain**: Enter `kalm.live`
3. **DNS Configuration**: Vercel will provide DNS records

---

## 📋 **STEP 2: Deploy Backend to Railway**

### 2.1 Create Railway Account
1. Go to https://railway.app/signup
2. **Sign up with GitHub**
3. Connect your GitHub account

### 2.2 Deploy Backend
1. **New Project**: Click "New Project" on Railway dashboard
2. **Deploy from GitHub**: Select `pinqx/kalm-ai-platforms`
3. **Configure Deployment**:
   - **Service Name**: `kalm-api`
   - **Root Directory**: `server`
   - **Start Command**: `node server.js`

### 2.3 Configure Environment Variables
Add these environment variables in Railway:
```bash
NODE_ENV=production
PORT=3007
JWT_SECRET=your_super_secure_jwt_secret_here
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ac-hk6xang.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom
STRIPE_SECRET_KEY=sk_test_51QkjFGPv1AtQLeBVyour_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
OPENAI_API_KEY=sk-your-openai-api-key-here
USE_OPENAI=false
EMAIL_FROM=KALM AI Sales Platform <noreply@kalm.live>
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

### 2.4 Custom Domain Setup
1. **Custom Domain**: In Railway project settings
2. **Add Domain**: `api.kalm.live`
3. **DNS Configuration**: Railway will provide CNAME record

---

## 📋 **STEP 3: Configure Domain DNS (Cloudflare)**

### 3.1 Add kalm.live to Cloudflare
1. Go to https://dash.cloudflare.com
2. **Add Site**: Enter `kalm.live`
3. **Select Plan**: Free plan is perfect
4. **Update Nameservers**: Point your domain to Cloudflare nameservers

### 3.2 DNS Records
Add these DNS records in Cloudflare:
```
Type: CNAME | Name: @ | Content: [Vercel-provided-domain] | Proxy: ON
Type: CNAME | Name: api | Content: [Railway-provided-domain] | Proxy: ON
Type: CNAME | Name: www | Content: kalm.live | Proxy: ON
```

---

## 📋 **STEP 4: Configure Stripe Webhooks**

### 4.1 Update Stripe Webhook URL
1. Go to Stripe Dashboard → Webhooks
2. **Edit Webhook**: Update endpoint URL to `https://api.kalm.live/api/stripe/webhook`
3. **Test Webhook**: Ensure it's receiving events

---

## 📋 **STEP 5: Final Testing**

### 5.1 Test All Features
- ✅ Frontend loads at `https://kalm.live`
- ✅ API responds at `https://api.kalm.live/health`
- ✅ User registration/login works
- ✅ File upload and AI analysis works
- ✅ Stripe payments work
- ✅ Email confirmations work
- ✅ Real-time collaboration works

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your KALM AI Sales Platform will be live at:
- **Main Site**: https://kalm.live
- **API**: https://api.kalm.live
- **Status**: Professional production deployment

**Estimated Total Time**: 30-45 minutes
**Monthly Cost**: ~$5-15 (Railway backend hosting)

---

## 🔧 **Need Help?**

If you encounter any issues during deployment:
1. Check the deployment logs in Vercel/Railway dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints individually
4. Check domain DNS propagation (can take up to 24 hours)

**Your KALM AI platform is ready for the world! 🚀** 