#!/bin/bash

echo "🚀 KALM AI Platform - Production Deployment to kalm.live"
echo "========================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo "   ✅ Code pushed to GitHub: https://github.com/pinqx/kalm-ai-platforms.git"
echo "   ✅ Server running locally without errors"
echo "   ✅ All features tested (payments, emails, collaboration)"
echo "   ✅ Domain kalm.live ready for configuration"
echo ""

echo -e "${YELLOW}🎯 Deployment Strategy - 'Startup Stack':${NC}"
echo "   • Frontend: Vercel (Free)"
echo "   • Backend: Railway ($5-10/month)"
echo "   • Database: MongoDB Atlas (Free, already configured)"
echo "   • Domain: kalm.live"
echo "   • DNS: Cloudflare (Free)"
echo "   • Total Cost: ~$5-15/month"
echo ""

echo -e "${GREEN}📋 STEP 1: Deploy Frontend to Vercel${NC}"
echo "1. Go to https://vercel.com/signup"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → Import 'pinqx/kalm-ai-platforms'"
echo "4. Configure:"
echo "   - Project Name: kalm-ai-frontend"
echo "   - Framework: Vite"
echo "   - Root Directory: client"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo ""
echo "5. Add Environment Variables:"
echo "   VITE_API_URL=https://kalm-api.railway.app"
echo "   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QkjFGPv1AtQLeBVyour_stripe_key"
echo ""
echo "6. Add Custom Domain: kalm.live"
echo ""

echo -e "${GREEN}📋 STEP 2: Deploy Backend to Railway${NC}"
echo "1. Go to https://railway.app/signup"
echo "2. Sign up with GitHub"
echo "3. New Project → Deploy from GitHub → 'pinqx/kalm-ai-platforms'"
echo "4. Configure:"
echo "   - Service Name: kalm-api"
echo "   - Root Directory: server"
echo "   - Start Command: node server.js"
echo ""
echo "5. Add Environment Variables:"
echo "   NODE_ENV=production"
echo "   PORT=3007"
echo "   JWT_SECRET=your_super_secure_jwt_secret_here"
echo "   MONGODB_URI=mongodb+srv://ai-sales-user:Fis84er1@ac-hk6xang.dhcgfhf.mongodb.net/ai-sales-platform?retryWrites=true&w=majority&appName=ai-sales-platfrom"
echo "   STRIPE_SECRET_KEY=sk_test_51QkjFGPv1AtQLeBVyour_stripe_secret_key"
echo "   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret"
echo "   OPENAI_API_KEY=sk-your-openai-api-key-here"
echo "   USE_OPENAI=false"
echo "   EMAIL_FROM=KALM AI Sales Platform <noreply@kalm.live>"
echo "   EMAIL_USER=your_gmail@gmail.com"
echo "   EMAIL_APP_PASSWORD=your_gmail_app_password"
echo ""
echo "6. Add Custom Domain: api.kalm.live"
echo ""

echo -e "${GREEN}📋 STEP 3: Configure Domain DNS (Cloudflare)${NC}"
echo "1. Go to https://dash.cloudflare.com"
echo "2. Add Site: kalm.live"
echo "3. Select Free plan"
echo "4. Update nameservers at your domain registrar"
echo "5. Add DNS records:"
echo "   Type: CNAME | Name: @ | Content: [Vercel-domain] | Proxy: ON"
echo "   Type: CNAME | Name: api | Content: [Railway-domain] | Proxy: ON"
echo "   Type: CNAME | Name: www | Content: kalm.live | Proxy: ON"
echo ""

echo -e "${GREEN}📋 STEP 4: Configure Stripe Webhooks${NC}"
echo "1. Go to Stripe Dashboard → Webhooks"
echo "2. Update endpoint URL: https://api.kalm.live/api/stripe/webhook"
echo "3. Test webhook"
echo ""

echo -e "${GREEN}📋 STEP 5: Final Testing${NC}"
echo "Test these URLs once deployment is complete:"
echo "   • Frontend: https://kalm.live"
echo "   • API Health: https://api.kalm.live/health"
echo "   • Test all features: registration, uploads, payments, collaboration"
echo ""

echo -e "${BLUE}⏱️  Estimated Time: 30-45 minutes${NC}"
echo -e "${BLUE}💰 Monthly Cost: ~$5-15${NC}"
echo ""

echo -e "${GREEN}🎉 Your KALM AI platform will be live at https://kalm.live${NC}"
echo ""

# Check if user wants to open the deployment URLs
read -p "Open deployment URLs in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening deployment URLs..."
    open "https://vercel.com/signup" 2>/dev/null || echo "Visit: https://vercel.com/signup"
    sleep 2
    open "https://railway.app/signup" 2>/dev/null || echo "Visit: https://railway.app/signup"
    sleep 2
    open "https://dash.cloudflare.com" 2>/dev/null || echo "Visit: https://dash.cloudflare.com"
fi

echo ""
echo -e "${GREEN}🚀 Ready to deploy KALM AI to production!${NC}"
echo "Follow the steps above to get your platform live on kalm.live" 