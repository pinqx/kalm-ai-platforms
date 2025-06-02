# 🧪 KALM Payment Testing Guide

## 🚀 **Quick Start Testing**

### **1. 💳 Stripe Test Cards**
Use these **official Stripe test cards** for different scenarios:

#### **✅ Successful Payments:**
- **Main Test Card**: `4242 4242 4242 4242`
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 8224 6310 005`

#### **❌ Declined Payments:**
- **Generic Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Lost Card**: `4000 0000 0000 9987`
- **Stolen Card**: `4000 0000 0000 9979`

#### **🔐 Security Testing:**
- **3D Secure Required**: `4000 0025 0000 3155`
- **3D Secure Optional**: `4000 0000 0000 3220`

#### **💰 International Cards:**
- **UK Visa**: `4000 0082 6000 0000`
- **Canadian Visa**: `4000 0001 2400 0000`
- **Australian Visa**: `4000 0003 6000 0000`

### **2. 📅 Test Data**
- **Expiry**: Use ANY future date (e.g., `12/25`, `01/26`)
- **CVC**: Use ANY 3-digit number (e.g., `123`, `456`)
- **ZIP**: Use ANY valid ZIP (e.g., `12345`, `90210`)

## 🎯 **Complete Testing Workflow**

### **Step 1: Access Your Platform**
```bash
# Frontend
open http://localhost:5173

# Backend API
curl http://localhost:3007/health
```

### **Step 2: Test Subscription Plans**
1. **$29 Starter Plan**
   - Navigate to payment page
   - Select Starter plan
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

2. **$79 Professional Plan**
   - Select Professional plan
   - Test with different card: `5555 5555 5555 4444`

3. **$149 Enterprise Plan**
   - Select Enterprise plan
   - Test international card: `4000 0082 6000 0000`

### **Step 3: Test Error Scenarios**
1. **Declined Payment**
   - Use card: `4000 0000 0000 0002`
   - Verify error handling

2. **Insufficient Funds**
   - Use card: `4000 0000 0000 9995`
   - Check error message

3. **3D Secure**
   - Use card: `4000 0025 0000 3155`
   - Complete 3D Secure flow

## 🔧 **Automated Testing Tools**

### **Payment API Testing**
```bash
# Test payment intent creation
curl -X POST http://localhost:3007/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 2900, "currency": "usd", "plan": "starter"}'

# Test subscription creation
curl -X POST http://localhost:3007/api/payment/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"paymentMethodId": "pm_test_xxx", "plan": "starter"}'
```

### **Frontend Testing Checklist**
- [ ] Payment form loads correctly
- [ ] All plan buttons work
- [ ] Stripe Elements render properly
- [ ] Error messages display
- [ ] Success confirmation shows
- [ ] Subscription status updates

### **Backend Testing Checklist**
- [ ] Payment intent creation
- [ ] Webhook handling
- [ ] Database updates
- [ ] Error logging
- [ ] Rate limiting
- [ ] Security validation

## 📊 **Monitor in Stripe Dashboard**

1. **Go to**: https://dashboard.stripe.com/test/payments
2. **Watch**: Real-time test transactions
3. **Check**: Payment statuses and details
4. **Verify**: Webhook events

## 🚨 **Common Issues & Solutions**

### **Issue**: Payment form doesn't load
**Solution**: Check browser console for Stripe key errors

### **Issue**: "Card declined" for test card
**Solution**: Verify you're using test keys, not live keys

### **Issue**: Webhook not firing
**Solution**: Check webhook URL and secret in Stripe dashboard

### **Issue**: 3D Secure not working
**Solution**: Ensure proper frontend 3D Secure handling

## 🎯 **Success Criteria**

✅ **All test cards process correctly**
✅ **Error scenarios handled gracefully**
✅ **Webhooks update database properly**
✅ **User subscriptions created/updated**
✅ **Payment confirmations sent**
✅ **Security measures working**

## 🔄 **Continuous Testing**

### **Daily Tests**
- [ ] Test one successful payment
- [ ] Verify webhook functionality
- [ ] Check subscription status

### **Weekly Tests**
- [ ] Full error scenario testing
- [ ] International card testing
- [ ] 3D Secure flow testing

### **Before Production**
- [ ] Complete end-to-end testing
- [ ] Security audit
- [ ] Performance testing
- [ ] Switch to live Stripe keys

---

## 🎉 **Your KALM Platform is Ready!**

**You can now accept real payments for:**
- 💎 $29/month Starter subscriptions
- 🚀 $79/month Professional subscriptions  
- 🏆 $149/month Enterprise subscriptions

**Start making money today!** 💰 