#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Stripe Keys for KALM Platform\n');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

// Check if Stripe keys already exist
if (envContent.includes('STRIPE_SECRET_KEY')) {
  console.log('✅ Stripe keys already configured in .env file');
  console.log('\n📝 To update your Stripe keys:');
  console.log('1. Edit .env file manually');
  console.log('2. Replace the placeholder values with your actual Stripe keys');
  process.exit(0);
}

// Add Stripe configuration
const stripeConfig = `
# Stripe Configuration (Replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here`;

// Append to .env file
const updatedContent = envContent + stripeConfig;

try {
  fs.writeFileSync(envPath, updatedContent);
  console.log('✅ Added Stripe configuration to .env file');
} catch (error) {
  console.error('❌ Error writing to .env file:', error.message);
  process.exit(1);
}

console.log('\n🎯 Next Steps:');
console.log('1. Get your Stripe API keys from: https://dashboard.stripe.com/apikeys');
console.log('2. Replace the placeholder values in .env with your actual keys:');
console.log('   - STRIPE_SECRET_KEY=sk_test_... (your secret key)');
console.log('   - STRIPE_PUBLISHABLE_KEY=pk_test_... (your publishable key)');
console.log('   - STRIPE_WEBHOOK_SECRET=whsec_... (from webhook setup)');
console.log('\n3. Create frontend .env file with:');
console.log('   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...');
console.log('\n4. Restart your server for changes to take effect');
console.log('\n💡 Test cards for development:');
console.log('   - 4242424242424242 (Visa)');
console.log('   - 4000000000000002 (Declined)');
console.log('   - Any future expiry date, any CVC'); 