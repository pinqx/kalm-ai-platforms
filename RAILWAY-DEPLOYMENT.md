# 🚂 **Railway Deployment Guide for KALM AI**

## ✅ **BUILD ISSUE FIXED**

The Nixpacks build failure has been resolved by adding:
- `package.json` at root level
- `nixpacks.toml` configuration
- `railway.toml` deployment settings

---

## 🚀 **Deploy Backend to Railway**

### **Step 1: Commit the Fixed Configuration**

```bash
# Commit the new configuration files
git add package.json nixpacks.toml railway.toml
git commit -m "🚂 Fixed Railway deployment configuration"
git push origin main
```

### **Step 2: Deploy to Railway**

1. **Go to Railway**: https://railway.app
2. **Connect GitHub**: Link your `kalm-ai-platforms` repository
3. **Deploy**: Railway will now detect the Node.js app correctly

### **Step 3: Environment Variables**

Add these environment variables in Railway dashboard:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=3007
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB Atlas (your existing database)
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ac-hk6xang.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom

# OpenAI API
OPENAI_API_KEY=your-openai-api-key-here

# Stripe Payment Keys
STRIPE_SECRET_KEY=your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key-here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# CORS Settings
FRONTEND_URL=https://kalm.live
```

### **Step 4: Domain Configuration**

1. **Custom Domain**: Add `api.kalm.live` in Railway settings
2. **DNS Setup**: Point `api.kalm.live` to Railway's provided URL

---

## 🔧 **Build Configuration Explanation**

### **package.json (Root)**
- Tells Railway this is a Node.js project
- `postinstall` script installs server dependencies
- `start` script runs the server from subdirectory

### **nixpacks.toml**
- Configures the build process
- Installs dependencies in `server/` directory
- Sets up proper start command

### **railway.toml**
- Railway-specific deployment settings
- Health check configuration
- Restart policy

---

## 🎯 **Expected Results**

After deployment:
- ✅ Backend running on Railway
- ✅ Health check at: `https://your-railway-url.railway.app/health`
- ✅ API endpoints accessible
- ✅ Database connected to MongoDB Atlas
- ✅ Ready for frontend deployment to Vercel

---

## 🔍 **Troubleshooting**

### **If build still fails:**
```bash
# Check Railway logs
railway logs

# Test locally first
npm run build
npm start
```

### **Common Issues:**
1. **Missing Environment Variables**: Add all required vars in Railway dashboard
2. **Database Connection**: Verify MongoDB Atlas whitelist includes Railway IPs
3. **Port Issues**: Railway auto-assigns PORT, server should use `process.env.PORT`

---

## 📋 **Next Steps**

1. ✅ Deploy backend to Railway (this guide)
2. 🌐 Deploy frontend to Vercel 
3. 🔗 Configure domain `kalm.live`
4. 🎉 Launch live platform!

**Backend URL**: `https://your-app-name.railway.app`
**Health Check**: `https://your-app-name.railway.app/health` 