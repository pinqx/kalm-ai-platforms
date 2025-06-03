# 🚀 KALM AI Production Operations Guide

## Current Status: **PARTIALLY OPERATIONAL**

✅ **Working Components:**
- Frontend deployed on Vercel ([kalm.live](https://kalm.live))
- Backend API deployed on Railway 
- Basic authentication & user management
- Payment interface integrated into pricing page
- Mock admin dashboard (with fallback data)
- Usage tracking frontend

⚠️ **Pending Components:**
- Admin endpoints not deployed to Railway yet
- Payment webhooks need configuration
- Real usage tracking not connected to backend
- Email notifications not configured

---

## 🔧 **Phase 1: Complete Backend Deployment**

### **Issue:** Railway deployment missing admin endpoints
**Solution:** The server code has admin endpoints but Railway is running older version.

**Action Required:**
1. Check Railway GitHub integration
2. Manually trigger deployment 
3. Verify environment variables in Railway dashboard

```bash
# Test current Railway endpoints
curl https://web-production-e7159.up.railway.app/health
curl https://web-production-e7159.up.railway.app/api/admin/users
```

---

## 🛠 **Phase 2: Environment Configuration**

### **Railway Environment Variables Needed:**

```bash
# Essential Production Variables
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Database (if using MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kalm-ai

# OpenAI (for real AI analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here
USE_OPENAI=true

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL
FRONTEND_URL=https://kalm.live

# Admin emails
ADMIN_EMAILS=alex@kalm.live,admin@kalm.live
```

### **Vercel Environment Variables Needed:**

```bash
# API Configuration
VITE_API_URL=https://web-production-e7159.up.railway.app

# Stripe Public Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

---

## 💳 **Phase 3: Payment System Setup**

### **Current State:** 
- Payment form integrated into pricing page ✅
- Stripe integration code exists ✅
- Webhooks not configured ⚠️

### **Required Actions:**

1. **Set up Stripe Webhooks:**
   ```
   Webhook URL: https://web-production-e7159.up.railway.app/api/stripe/webhook
   Events to listen for:
   - payment_intent.succeeded
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   ```

2. **Test Payment Flow:**
   ```bash
   # Test Stripe endpoints
   curl -X POST https://web-production-e7159.up.railway.app/api/payment/create-intent
   ```

3. **Update Stripe Price IDs:**
   - Create products in Stripe Dashboard
   - Update price IDs in `PricingPage.tsx`

---

## 📊 **Phase 4: Admin Dashboard Activation**

### **Current State:**
- Admin UI exists with mock data fallback ✅
- Admin endpoints exist in code ✅
- Railway deployment missing admin routes ⚠️

### **Required Actions:**

1. **Deploy admin endpoints to Railway**
2. **Test admin access:**
   ```bash
   # Test admin endpoints
   curl -H "Authorization: Bearer admin-token" \
        https://web-production-e7159.up.railway.app/api/admin/users
   ```

3. **Configure admin emails in Railway:**
   ```
   ADMIN_EMAILS=alex@kalm.live,admin@kalm.live
   ```

---

## 📈 **Phase 5: Usage Tracking & Analytics**

### **Components:**
- ✅ Frontend usage dashboard
- ✅ Plan limits middleware in backend
- ⚠️ Real usage tracking not connected

### **Required Actions:**

1. **Connect usage tracking:**
   ```bash
   # Test usage endpoints
   curl https://web-production-e7159.up.railway.app/api/usage/stats
   ```

2. **Implement plan enforcement**
3. **Set up upgrade notifications**

---

## 🔐 **Phase 6: Security & Performance**

### **Security Checklist:**
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ Input validation
- ✅ JWT authentication
- ⚠️ CORS configuration for production
- ⚠️ SSL certificate verification

### **Performance Checklist:**
- ✅ Compression middleware
- ✅ Performance monitoring
- ✅ Health check endpoint
- ⚠️ CDN for static assets
- ⚠️ Database connection pooling

---

## 📧 **Phase 7: Email & Notifications**

### **Required Integrations:**
- Welcome emails for new users
- Payment confirmation emails  
- Usage limit notifications
- Admin alerts

### **Setup Options:**
1. **SendGrid** (recommended)
2. **Mailgun** 
3. **AWS SES**

---

## 🔄 **Phase 8: Automation & CI/CD**

### **Current Setup:**
- ✅ Manual deployment via git push
- ✅ Automatic Vercel deployment
- ✅ Railway auto-deployment (partially working)

### **Enhancements Needed:**
- Automated testing before deployment
- Database migration scripts
- Backup automation
- Monitoring alerts

---

## 📊 **Phase 9: Monitoring & Alerts**

### **Health Monitoring:**
```bash
# Health check endpoint
curl https://web-production-e7159.up.railway.app/health

# System metrics
curl https://web-production-e7159.up.railway.app/api/admin/health
```

### **Recommended Monitoring:**
- **Uptime monitoring:** UptimeRobot, Pingdom
- **Error tracking:** Sentry
- **Performance:** New Relic, DataDog
- **Logs:** LogRocket, Papertrail

---

## 🚀 **Phase 10: Full Automation**

### **Auto-scaling Configuration:**
- Railway: Auto-scaling enabled
- Database: Connection pooling
- CDN: Cloudflare integration

### **Backup Strategy:**
- Automated database backups
- Code repository backups
- Environment variable backups

---

## 🎯 **Immediate Action Plan**

### **Priority 1 (Critical):**
1. Fix Railway deployment (admin endpoints)
2. Configure environment variables
3. Test payment flow end-to-end

### **Priority 2 (Important):**
1. Set up Stripe webhooks
2. Configure email notifications
3. Enable real usage tracking

### **Priority 3 (Enhancement):**
1. Add monitoring & alerts
2. Optimize performance
3. Set up automated backups

---

## 🔧 **Quick Commands**

```bash
# Deploy latest backend changes
cd server && ./deploy.sh

# Test all endpoints
curl https://web-production-e7159.up.railway.app/health
curl https://kalm.live

# Check admin access
# Use the red "Admin" button on kalm.live

# Monitor logs
# Check Railway dashboard logs
```

---

## 📞 **Support & Maintenance**

### **Daily Checks:**
- Health endpoint status
- Error rates and response times
- Payment processing status

### **Weekly Reviews:**
- User growth and usage patterns
- Performance optimization opportunities
- Security updates

### **Monthly Tasks:**
- Backup verification
- Cost optimization review
- Feature usage analysis

---

**Status:** Ready for full production with above configurations completed.
**Next Review:** After Phase 1-3 completion 