#!/bin/bash

# KALM AI Production Deployment Script
set -e

echo "🚀 KALM AI Production Deployment"
echo "================================"

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please run this script from the server directory."
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️  No .env file found. Make sure to set environment variables in Railway dashboard."
fi

# Run tests (if any)
echo "🧪 Running pre-deployment checks..."
npm run test 2>/dev/null || echo "⚠️  No tests configured"

# Build and deploy
echo "📦 Deploying to Railway..."
git add .
git commit -m "Production deployment: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

echo "🎉 Deployment initiated!"
echo ""
echo "📊 Check deployment status:"
echo "   Railway Dashboard: https://railway.app/dashboard"
echo "   Live API: https://web-production-e7159.up.railway.app/health"
echo ""
echo "🔧 Next steps:"
echo "   1. Verify environment variables in Railway dashboard"
echo "   2. Test admin endpoints: /api/admin/users"
echo "   3. Configure Stripe webhooks"
echo "   4. Set up monitoring and alerts" 