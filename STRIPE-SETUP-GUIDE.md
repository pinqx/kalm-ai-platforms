# 💳 Stripe Payment Setup Guide for KALM

## 🚀 **Quick Setup Steps**

### **Step 1: Create Stripe Account**
1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** to create account
3. Fill in your business details
4. Verify your email address

### **Step 2: Get API Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **"Developers"** → **"API keys"**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - **Keep this secure!**

### **Step 3: Update Environment Files**

#### **Backend (.env file in /server directory):**
```env
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **Frontend (.env file in /client directory):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### **Step 4: Set Up Webhook (Optional for testing)**
1. In Stripe Dashboard: **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. URL: `http://localhost:3007/webhook/stripe`
4. Events: Select `payment_intent.succeeded`
5. Copy the **Signing secret** (starts with `whsec_`)

## 🧪 **Testing Your Setup**

### **Test Credit Cards (Use in Stripe Test Mode):**
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0000 0000 3220`
- **Insufficient Funds**: `4000 0000 0000 9995`

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3-digit number (e.g., 123)

### **Subscription Plans Available:**
1. **Starter** - $29/month - Basic features
2. **Professional** - $79/month - Advanced analytics
3. **Enterprise** - $149/month - Full platform access

## 🔧 **How to Apply Your Keys**

### **Method 1: Manual Edit**
1. Open `ai-sales-platform/server/.env`
2. Replace placeholder values with your actual keys
3. Open `ai-sales-platform/client/.env`
4. Replace placeholder with your publishable key

### **Method 2: Using Terminal (macOS/Linux)**
```bash
# Update server .env
cd ai-sales-platform/server
sed -i 's/sk_test_your_stripe_secret_key_here/YOUR_ACTUAL_SECRET_KEY/' .env
sed -i 's/pk_test_your_stripe_publishable_key_here/YOUR_ACTUAL_PUBLISHABLE_KEY/' .env

# Update client .env
cd ../client
sed -i 's/pk_test_your_stripe_publishable_key_here/YOUR_ACTUAL_PUBLISHABLE_KEY/' .env
```

## 🚀 **After Setup**

1. **Restart your servers:**
   ```bash
   # Terminal 1 - Backend
   cd ai-sales-platform/server
   node server.js
   
   # Terminal 2 - Frontend
   cd ai-sales-platform/client
   npm run dev
   ```

2. **Test payment flow:**
   - Go to http://localhost:5173
   - Click on any subscription plan
   - Use test card: `4242 4242 4242 4242`
   - Complete the payment

## ✅ **Verification Checklist**

- [ ] Stripe account created and verified
- [ ] API keys copied from Stripe dashboard
- [ ] Server .env file updated with secret key
- [ ] Client .env file updated with publishable key
- [ ] Both servers restarted
- [ ] Test payment completed successfully

## 🔒 **Security Notes**

⚠️ **IMPORTANT:**
- Never share your **Secret Key** (`sk_test_...`)
- Only the **Publishable Key** (`pk_test_...`) goes in frontend
- Add `.env` to `.gitignore` (already done)
- Use test keys during development
- Switch to live keys only for production

## 🆘 **Troubleshooting**

### **Error: "No such customer"**
- Check that STRIPE_SECRET_KEY is set correctly
- Verify the key starts with `sk_test_`

### **Error: "Invalid publishable key"**
- Check frontend .env file
- Verify key starts with `pk_test_`
- Restart frontend server

### **Payment not working**
- Check browser console for errors
- Verify both .env files are updated
- Try with test card: `4242 4242 4242 4242`

## 📞 **Need Help?**

1. **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
2. **Test Cards**: [stripe.com/docs/testing](https://stripe.com/docs/testing)
3. **Webhooks Guide**: [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)

---

💡 **Tip**: Start with test keys, then switch to live keys when ready for production! 