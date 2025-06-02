# 🚂 **Railway Deployment - Quick Fix Guide**

## ✅ **Issues Fixed**

1. **Nixpacks Configuration**: Simplified to use standard Node.js provider
2. **Email Service**: Fixed logger initialization errors
3. **Railway Config**: Simplified build and deploy commands
4. **Docker Fallback**: Added Dockerfile for alternative deployment
5. **Health Check**: Added dedicated healthcheck script

---

## 🚀 **Step-by-Step Railway Deployment**

### **Step 1: Commit All Fixes**
```bash
git add .
git commit -m "🚂 Railway deployment fixes - simplified nixpacks and Docker fallback"
git push origin main
```

### **Step 2: Deploy on Railway**

1. **Go to Railway Dashboard**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Select**: `pinqx/kalm-ai-platforms`
4. **Auto-deploy**: Should start automatically

### **Step 3: Add Environment Variables**

In Railway dashboard, go to your project → **Variables** tab and add:

```bash
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_here

# OpenAI (optional)
OPENAI_API_KEY=your_openai_key_here
USE_OPENAI=false

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email (optional)
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_app_password

# Environment
NODE_ENV=production
PORT=3000
```

### **Step 4: Verify Deployment**

1. **Check Logs**: Railway will show build and deployment logs
2. **Test Health**: Visit `https://your-app.railway.app/health`
3. **Domain**: Railway provides automatic HTTPS domain

---

## 🔧 **Configuration Files Added/Updated**

### **1. nixpacks.toml** (Simplified)
- Uses standard Node.js 18 provider
- Simplified install command: `npm ci --prefix server`
- Direct server start: `node server.js`

### **2. railway.toml** (Updated)
- Simplified build command
- Direct node start command
- Health check configuration

### **3. Dockerfile** (NEW - Fallback Method)
- Alpine Linux base for smaller size
- Production-ready configuration
- Built-in health checks

### **4. .nvmrc** (NEW)
- Explicit Node.js version specification

### **5. healthcheck.js** (NEW)
- Dedicated health check script for Docker

### **6. Fixed emailService.js**
- Robust logger fallback system
- Prevents startup crashes from logger errors

---

## 🚨 **Troubleshooting Nixpacks Failures**

### **If you see "nix-env" errors:**

**Option 1: Force Dockerfile Deployment**
```bash
# In Railway dashboard:
# Settings → Build → Builder → Change from "Nixpacks" to "Dockerfile"
```

**Option 2: Simplify nixpacks.toml further**
```toml
# Minimal nixpacks.toml
[start]
cmd = 'cd server && node server.js'
```

**Option 3: Use Procfile only**
```bash
# Delete nixpacks.toml and railway.toml
# Railway will use Procfile automatically
```

### **Common Nixpacks Issues:**
- **Node version conflicts**: Ensure consistency between `.nvmrc`, `nixpacks.toml`, and `package.json`
- **Package installation**: Use `npm ci` instead of `npm install`
- **Path issues**: Always specify `cd server` before starting

---

## 🎯 **Expected Result**

After these fixes, Railway should:
- ✅ Detect Node.js app automatically (Nixpacks or Docker)
- ✅ Install dependencies correctly
- ✅ Start server on correct PORT
- ✅ Pass health checks at `/health`
- ✅ Deploy successfully with HTTPS

---

## 🔍 **If Still Having Issues**

### **Check Railway Logs For:**
1. **Nix Package Errors**: Switch to Dockerfile deployment
2. **Build Errors**: Dependencies not installing properly
3. **Start Errors**: Server not starting on PORT
4. **Health Check**: `/health` endpoint not responding

### **Emergency Fallback Steps:**
1. Switch builder to "Dockerfile" in Railway settings
2. Remove `nixpacks.toml` and `railway.toml`
3. Keep only `Procfile` for simple deployment
4. Ensure all environment variables are set

---

## 🌐 **After Successful Deployment**

1. **Custom Domain**: Point `kalm.live` to Railway domain in DNS
2. **SSL**: Railway provides automatic SSL certificates
3. **Monitoring**: Railway provides built-in monitoring and logs
4. **Scaling**: Railway can auto-scale based on traffic

Your KALM AI platform will be live at: `https://your-app.railway.app`

## 📝 **Quick Deploy Commands**

```bash
# If Railway deployment fails, try these in order:

# 1. Force refresh
git add . && git commit -m "trigger rebuild" && git push

# 2. Switch to Dockerfile
# (Do this in Railway dashboard: Settings → Build → Builder → Dockerfile)

# 3. Minimal config
echo "web: cd server && node server.js" > Procfile
rm nixpacks.toml railway.toml
git add . && git commit -m "minimal config" && git push
``` 