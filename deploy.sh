#!/bin/bash

echo "🚀 AI Sales Platform - Quick Deploy Script"
echo "=========================================="

# Check if required tools are installed
command -v gh >/dev/null 2>&1 || { echo "❌ GitHub CLI is required. Install: brew install gh"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required. Install Node.js"; exit 1; }

echo "✅ Dependencies check passed"

# Create GitHub repository
echo "📁 Creating GitHub repository..."
read -p "Enter repository name (default: ai-sales-platform): " repo_name
repo_name=${repo_name:-ai-sales-platform}

gh repo create $repo_name --public --description "AI Sales Platform with Advanced Analytics, Real-time Collaboration, and Voice-to-Text Analysis" --confirm

echo "🔗 Adding remote origin..."
git remote add origin https://github.com/$(gh api user --jq .login)/$repo_name.git

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "🎉 SUCCESS! Your code is now on GitHub"
echo "📦 Repository: https://github.com/$(gh api user --jq .login)/$repo_name"
echo ""
echo "🚀 NEXT STEPS FOR DEPLOYMENT:"
echo ""
echo "1️⃣  DEPLOY BACKEND (Railway):"
echo "   • Visit: https://railway.app"
echo "   • Click 'New Project' → 'Deploy from GitHub'"
echo "   • Select your repository: $repo_name"
echo "   • Set Root Directory: 'server'"
echo "   • Add environment variables:"
echo "     - MONGODB_URI (your MongoDB Atlas connection string)"
echo "     - JWT_SECRET (generate with: openssl rand -hex 64)"
echo "     - OPENAI_API_KEY (your OpenAI API key)"
echo "     - USE_OPENAI=true"
echo ""
echo "2️⃣  DEPLOY FRONTEND (Vercel):"
echo "   • Visit: https://vercel.com"
echo "   • Click 'New Project' → Import from GitHub"
echo "   • Select your repository: $repo_name"
echo "   • Set Root Directory: 'client'"
echo "   • Build Command: 'npm run build'"
echo "   • Output Directory: 'dist'"
echo ""
echo "3️⃣  UPDATE FRONTEND URL:"
echo "   • After backend deploys, update FRONTEND_URL in Railway"
echo "   • After frontend deploys, update VITE_API_URL in Vercel"
echo ""
echo "📚 Full deployment guide: See QUICK-DEPLOY.md"
echo ""
echo "🌐 Your platform will be live in ~10 minutes!" 