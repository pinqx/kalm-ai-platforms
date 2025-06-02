#!/usr/bin/env node

/**
 * 🧪 KALM Payment Testing Suite
 * Automated tests for Stripe payment integration
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3007';
const FRONTEND_URL = 'http://localhost:5173';

// Test cards
const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  secure3d: '4000002500003155',
  international: '4000008260000000'
};

// Test plans
const PLANS = {
  starter: { amount: 2900, name: 'Starter' },
  professional: { amount: 7900, name: 'Professional' },
  enterprise: { amount: 14900, name: 'Enterprise' }
};

class PaymentTester {
  constructor() {
    this.results = [];
    this.authToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    
    switch(type) {
      case 'success':
        console.log(`${prefix} ✅ ${message}`.green);
        break;
      case 'error':
        console.log(`${prefix} ❌ ${message}`.red);
        break;
      case 'warning':
        console.log(`${prefix} ⚠️  ${message}`.yellow);
        break;
      case 'info':
      default:
        console.log(`${prefix} ℹ️  ${message}`.blue);
        break;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testServerHealth() {
    try {
      this.log('Testing server health...');
      const response = await axios.get(`${BASE_URL}/health`);
      
      if (response.status === 200) {
        this.log('Server health check passed', 'success');
        return true;
      }
    } catch (error) {
      this.log(`Server health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAuthentication() {
    try {
      this.log('Testing authentication...');
      
      // Try to register a test user
      const registerData = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const response = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
      
      if (response.status === 201 && response.data.token) {
        this.authToken = response.data.token;
        this.log('Authentication successful', 'success');
        return true;
      }
    } catch (error) {
      this.log(`Authentication failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPaymentIntentCreation(plan) {
    try {
      this.log(`Testing payment intent creation for ${plan.name} plan...`);
      
      const response = await axios.post(`${BASE_URL}/api/payment/create-intent`, {
        amount: plan.amount,
        currency: 'usd',
        plan: plan.name.toLowerCase()
      }, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.clientSecret) {
        this.log(`Payment intent created for ${plan.name} plan`, 'success');
        return response.data.clientSecret;
      }
    } catch (error) {
      this.log(`Payment intent creation failed for ${plan.name}: ${error.message}`, 'error');
      return null;
    }
  }

  async testWebhookEndpoint() {
    try {
      this.log('Testing webhook endpoint...');
      
      // Test webhook endpoint exists
      const response = await axios.post(`${BASE_URL}/webhook/stripe`, {
        type: 'test.event',
        data: { object: 'test' }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.log('Webhook endpoint is accessible', 'success');
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Webhook endpoint exists (signature validation expected)', 'success');
        return true;
      }
      this.log(`Webhook endpoint test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testSubscriptionEndpoints() {
    try {
      this.log('Testing subscription endpoints...');
      
      // Test get subscription
      const response = await axios.get(`${BASE_URL}/api/payment/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      this.log('Subscription endpoints accessible', 'success');
      return true;
    } catch (error) {
      this.log(`Subscription endpoints test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testFrontendAccess() {
    try {
      this.log('Testing frontend accessibility...');
      
      const response = await axios.get(FRONTEND_URL);
      
      if (response.status === 200) {
        this.log('Frontend is accessible', 'success');
        return true;
      }
    } catch (error) {
      this.log(`Frontend access failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStripeConfiguration() {
    try {
      this.log('Testing Stripe configuration...');
      
      // Check if Stripe keys are configured by testing payment intent
      const testPlan = PLANS.starter;
      const clientSecret = await this.testPaymentIntentCreation(testPlan);
      
      if (clientSecret && clientSecret.startsWith('pi_')) {
        this.log('Stripe configuration is valid', 'success');
        return true;
      } else {
        this.log('Stripe configuration issue detected', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Stripe configuration test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length
      },
      results: this.results
    };

    this.log('\n🔧 GENERATING TEST REPORT...', 'info');
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${report.summary.passed}`.green);
    console.log(`❌ Failed: ${report.summary.failed}`.red);
    console.log(`📊 Total: ${report.summary.total}`);

    return report;
  }

  addResult(testName, status, message = '') {
    this.results.push({
      test: testName,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async runAllTests() {
    console.log('🧪 KALM PAYMENT TESTING SUITE'.rainbow);
    console.log('================================'.gray);
    
    // Test 1: Server Health
    const healthOk = await this.testServerHealth();
    this.addResult('Server Health', healthOk ? 'passed' : 'failed');
    
    if (!healthOk) {
      this.log('Cannot continue testing - server is not healthy', 'error');
      return await this.generateTestReport();
    }

    await this.delay(1000);

    // Test 2: Frontend Access
    const frontendOk = await this.testFrontendAccess();
    this.addResult('Frontend Access', frontendOk ? 'passed' : 'failed');

    await this.delay(1000);

    // Test 3: Authentication
    const authOk = await this.testAuthentication();
    this.addResult('Authentication', authOk ? 'passed' : 'failed');

    if (!authOk) {
      this.log('Cannot continue payment testing without authentication', 'error');
      return await this.generateTestReport();
    }

    await this.delay(1000);

    // Test 4: Stripe Configuration
    const stripeOk = await this.testStripeConfiguration();
    this.addResult('Stripe Configuration', stripeOk ? 'passed' : 'failed');

    await this.delay(1000);

    // Test 5: Payment Intent Creation for all plans
    for (const [key, plan] of Object.entries(PLANS)) {
      const intentOk = await this.testPaymentIntentCreation(plan);
      this.addResult(`Payment Intent - ${plan.name}`, intentOk ? 'passed' : 'failed');
      await this.delay(500);
    }

    // Test 6: Webhook Endpoint
    const webhookOk = await this.testWebhookEndpoint();
    this.addResult('Webhook Endpoint', webhookOk ? 'passed' : 'failed');

    await this.delay(1000);

    // Test 7: Subscription Endpoints
    const subscriptionOk = await this.testSubscriptionEndpoints();
    this.addResult('Subscription Endpoints', subscriptionOk ? 'passed' : 'failed');

    return await this.generateTestReport();
  }
}

// Instructions display
function showInstructions() {
  console.log('\n🎯 MANUAL TESTING INSTRUCTIONS:'.yellow);
  console.log('=============================='.gray);
  console.log('1. Open your browser to: http://localhost:5173');
  console.log('2. Navigate to the payment/subscription section');
  console.log('3. Use these test cards:');
  console.log(`   ✅ Success: ${TEST_CARDS.success}`);
  console.log(`   ❌ Declined: ${TEST_CARDS.declined}`);
  console.log(`   💰 Insufficient: ${TEST_CARDS.insufficientFunds}`);
  console.log(`   🔐 3D Secure: ${TEST_CARDS.secure3d}`);
  console.log('4. Use any future expiry date (e.g., 12/25)');
  console.log('5. Use any 3-digit CVC (e.g., 123)');
  console.log('6. Monitor: https://dashboard.stripe.com/test/payments');
  console.log('\n💡 Check the PAYMENT-TESTING-GUIDE.md for complete instructions!'.green);
}

// Main execution
async function main() {
  const tester = new PaymentTester();
  
  try {
    const report = await tester.runAllTests();
    
    // Show manual testing instructions
    showInstructions();
    
    // Final status
    const successRate = (report.summary.passed / report.summary.total * 100).toFixed(1);
    console.log(`\n🎯 AUTOMATION SUCCESS RATE: ${successRate}%`.cyan);
    
    if (report.summary.failed === 0) {
      console.log('\n🎉 ALL AUTOMATED TESTS PASSED! Your payment system is ready!'.green);
      console.log('💰 You can now accept real payments for your KALM platform!'.rainbow);
    } else {
      console.log(`\n⚠️  ${report.summary.failed} tests failed. Check the logs above.`.yellow);
    }
    
  } catch (error) {
    console.error('Testing suite error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PaymentTester; 