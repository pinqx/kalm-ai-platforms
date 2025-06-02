#!/bin/bash

echo "🔧 KALM Stripe Keys Setup Script"
echo "================================="

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ Error: Please run this script from the ai-sales-platform directory"
    exit 1
fi

# Get Stripe keys from user
echo ""
echo "📋 Please enter your Stripe API keys from: https://dashboard.stripe.com/apikeys"
echo ""
read -p "🔑 Enter your Stripe Secret Key (sk_test_...): " STRIPE_SECRET
read -p "🔑 Enter your Stripe Publishable Key (pk_test_...): " STRIPE_PUBLISHABLE
echo ""
read -p "🔗 Enter your Stripe Webhook Secret (whsec_... - optional): " STRIPE_WEBHOOK

# Validate keys
if [[ ! $STRIPE_SECRET =~ ^sk_test_ ]]; then
    echo "❌ Error: Secret key should start with 'sk_test_'"
    exit 1
fi

if [[ ! $STRIPE_PUBLISHABLE =~ ^pk_test_ ]]; then
    echo "❌ Error: Publishable key should start with 'pk_test_'"
    exit 1
fi

# Update server .env file
echo "📝 Updating server environment..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$STRIPE_SECRET/" server/.env
    sed -i '' "s/STRIPE_PUBLISHABLE_KEY=.*/STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE/" server/.env
    if [ ! -z "$STRIPE_WEBHOOK" ]; then
        sed -i '' "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK/" server/.env
    fi
else
    # Linux
    sed -i "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$STRIPE_SECRET/" server/.env
    sed -i "s/STRIPE_PUBLISHABLE_KEY=.*/STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE/" server/.env
    if [ ! -z "$STRIPE_WEBHOOK" ]; then
        sed -i "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK/" server/.env
    fi
fi

# Update client .env file
echo "📝 Updating client environment..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VITE_STRIPE_PUBLISHABLE_KEY=.*/VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE/" client/.env
else
    # Linux
    sed -i "s/VITE_STRIPE_PUBLISHABLE_KEY=.*/VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE/" client/.env
fi

echo ""
echo "✅ Stripe keys updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your backend server:"
echo "   cd server && node server.js"
echo ""
echo "2. Restart your frontend server:"
echo "   cd client && npm run dev"
echo ""
echo "3. Test with card: 4242 4242 4242 4242"
echo ""
echo "🎯 Your KALM platform is now ready to accept payments!" 