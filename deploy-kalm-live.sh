#!/bin/bash

echo "🚀 KALM AI Platform - Deploy to kalm.live"
echo "=========================================="
echo ""

# Check if GitHub repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Missing GitHub repository URL"
    echo ""
    echo "📋 FIRST: Create GitHub repository at https://github.com/new"
    echo "   - Repository name: kalm-ai-platform"
    echo "   - Visibility: Public"
    echo "   - Don't initialize with README"
    echo ""
    echo "📋 THEN: Run this script with your repository URL:"
    echo "   ./deploy-kalm-live.sh https://github.com/YOUR_USERNAME/kalm-ai-platform.git"
    echo ""
    exit 1
fi

GITHUB_URL="$1"
echo "🔗 GitHub Repository: $GITHUB_URL"
echo ""

# Add GitHub remote
echo "📡 Adding GitHub remote..."
git remote add origin "$GITHUB_URL" 2>/dev/null || git remote set-url origin "$GITHUB_URL"

# Push to GitHub
echo "📤 Pushing code to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code successfully pushed to GitHub!"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo ""
    echo "1. 🚂 Deploy Backend to Railway:"
    echo "   - Go to: https://railway.app"
    echo "   - Click: 'Deploy from GitHub repo'"
    echo "   - Select: kalm-ai-platform"
    echo "   - Set Root Directory: server/"
    echo ""
    echo "2. ⚡ Deploy Frontend to Vercel:"
    echo "   - Go to: https://vercel.com"
    echo "   - Click: 'Add New Project'"
    echo "   - Select: kalm-ai-platform"
    echo "   - Set Root Directory: client/"
    echo ""
    echo "3. 🌐 Connect kalm.live domain in Vercel"
    echo ""
    echo "📖 Full guide: See DEPLOY-TO-KALM-LIVE.md"
    echo ""
    echo "🎉 Your platform will be live at https://kalm.live!"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub repository URL and try again"
fi 