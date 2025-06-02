# 🚀 KALM - AI Sales Intelligence Platform Setup Guide

## 🎯 **Welcome to KALM**

**KALM** is your AI-powered sales intelligence platform that transforms every conversation into actionable insights. This guide will help you set up both the core platform and Stripe payment integration.

---

## ✅ **What You've Built**

### 🌟 **Platform Features**
- ✅ **Real-time AI Analysis** - Instant conversation insights
- ✅ **Advanced Analytics** - Predictive AI and performance metrics  
- ✅ **Team Collaboration** - Real-time chat and presence
- ✅ **Email Generation** - AI-powered follow-up emails
- ✅ **Payment Integration** - Stripe-powered subscription billing
- ✅ **Professional UI** - Modern, responsive design
- ✅ **Secure Authentication** - JWT-based user management

### 💳 **Payment Plans**
- **Starter**: $29/month - Individual professionals
- **Professional**: $79/month - Growing teams (Most Popular)
- **Enterprise**: $149/month - Large organizations

---

## 🛠️ **Complete Setup Instructions**

### **Step 1: Environment Configuration**

Create or update your `.env` files:

#### **Backend (.env in `/server` folder)**
```env
# Database
MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ac-hk6xang.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom

# JWT Secret (generate a new one for production)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
USE_OPENAI=false  # Set to true when ready to use real API

# Server Configuration
PORT=3007
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Stripe Configuration (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **Frontend (.env in `/client` folder)**
```env
VITE_API_URL=http://localhost:3007
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### **Step 2: Install Dependencies**

```bash
# Install Stripe dependency
cd ai-sales-platform/server
npm install stripe

# Install frontend dependencies (if needed)
cd ../client
npm install
```

### **Step 3: Set Up Stripe Account**

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete business verification

2. **Get API Keys**
   - Dashboard → Developers → API Keys
   - Copy **Publishable Key** (pk_test_...)
   - Copy **Secret Key** (sk_test_...)
   - Add to your `.env` files

3. **Create Products in Stripe**
   ```bash
   # You can create products via Stripe Dashboard or API
   # Dashboard → Products → Add Product
   
   Starter Plan: $29/month
   Professional Plan: $79/month  
   Enterprise Plan: $149/month
   ```

4. **Set Up Webhook** (Optional but recommended)
   - Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/webhook/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### **Step 4: Start the Platform**

```bash
# Terminal 1: Start Backend
cd ai-sales-platform/server
node server.js

# Terminal 2: Start Frontend  
cd ai-sales-platform/client
npm run dev
```

### **Step 5: Access Your Platform**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3007
- **Health Check**: http://localhost:3007/health

---

## 💳 **Payment Integration Features**

### **For Users**
1. **View Pricing Plans** - Click "Payment" tab
2. **Select Plan** - Choose Starter, Professional, or Enterprise
3. **Enter Payment Details** - Secure Stripe checkout
4. **Instant Access** - Immediate feature activation

### **For Administrators**
- **Subscription Management** - Track all user subscriptions
- **Payment History** - View transaction history
- **Revenue Analytics** - Monitor business metrics
- **Customer Support** - Handle billing inquiries

### **API Endpoints**
```
POST /api/payment/create-intent  # Create payment intent
POST /api/payment/confirm        # Confirm payment  
GET  /api/payment/subscription   # Get subscription status
POST /api/payment/cancel         # Cancel subscription
POST /webhook/stripe             # Stripe webhook handler
```

---

## 🎯 **Testing Payments**

### **Test Credit Cards (Stripe Test Mode)**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

### **Test Payment Flow**
1. Navigate to "Payment" tab
2. Select any plan
3. Use test credit card details
4. Complete payment
5. Verify subscription activation

---

## 🚀 **Production Deployment**

### **Prerequisites**
- [ ] Domain name registered
- [ ] SSL certificate configured  
- [ ] Stripe account verified
- [ ] Production API keys obtained

### **Environment Updates**
```env
# Production Backend
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...  # Live key
USE_OPENAI=true  # Enable real OpenAI

# Production Frontend  
VITE_API_URL=https://api.your-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Live key
```

### **Deployment Options**

#### **Option A: Vercel + Railway** (Recommended)
```bash
# Deploy Frontend to Vercel
npm run build
vercel --prod

# Deploy Backend to Railway
# Connect GitHub repository
# Set environment variables
# Deploy automatically
```

#### **Option B: DigitalOcean**
- Use App Platform for full-stack deployment
- Configure build and run commands
- Set environment variables

#### **Option C: AWS/Heroku**
- Deploy backend to Heroku/AWS
- Deploy frontend to Netlify/S3+CloudFront

---

## 📊 **Business Metrics You Can Track**

### **Revenue Metrics**
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Conversion Rates by Plan

### **Usage Metrics**
- Daily/Monthly Active Users
- Transcripts Analyzed per User
- Feature Adoption Rates
- User Engagement Scores

### **Platform Metrics**
- Response Times
- Uptime/Availability  
- Error Rates
- Support Ticket Volume

---

## 🔐 **Security Checklist**

- [x] **JWT Authentication** implemented
- [x] **Rate Limiting** configured
- [x] **Input Validation** active
- [x] **CORS** properly configured
- [x] **Helmet.js** security headers
- [x] **Password Hashing** with bcrypt
- [x] **Environment Variables** secured
- [ ] **SSL Certificate** (for production)
- [ ] **Stripe Webhook Verification** (optional)

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Payment Not Working**
```bash
# Check Stripe keys are correct
echo $STRIPE_SECRET_KEY
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Verify webhook endpoint
curl -X POST http://localhost:3007/webhook/stripe
```

#### **Database Connection Issues**
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected')).catch(err => console.log('❌ Failed:', err))"
```

#### **Frontend/Backend Communication**
```bash
# Test API endpoint
curl http://localhost:3007/health

# Check CORS configuration
curl -H "Origin: http://localhost:5173" http://localhost:3007/health
```

---

## 🎉 **You're Ready to Launch!**

### **Next Steps**
1. **Test All Features** - Go through each tab and feature
2. **Process Test Payments** - Verify billing works
3. **Deploy to Production** - Use deployment guide above
4. **Market Your Platform** - Start acquiring customers!

### **Support Resources**
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
- **OpenAI API**: [platform.openai.com](https://platform.openai.com)

---

## 💰 **Revenue Potential**

With your completed KALM platform:

### **Conservative Projections**
- 10 customers × $79/month = $790/month
- 50 customers × $79/month = $3,950/month  
- 100 customers × $79/month = $7,900/month

### **Optimistic Projections**
- Enterprise deals at $149/month
- Annual contracts (20% discount)
- Professional services add-ons

**Your platform is ready to generate revenue!** 🚀💰 