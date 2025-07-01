const axios = require('axios');

const BASE_URL = process.env.SERVER_URL || 'http://localhost:3010';

class AuthenticationTester {
  constructor() {
    this.authToken = null;
    this.testUser = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '🔍',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || '🔍';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async testUserRegistration() {
    try {
      this.log('Testing user registration...');
      
      const testEmail = `test-auth-${Date.now()}@example.com`;
      const registerData = {
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Auth',
        lastName: 'Tester',
        company: 'Test Company'
      };

      const response = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
      
      if (response.status === 201 && response.data.token) {
        this.authToken = response.data.token;
        this.testUser = response.data.user;
        this.log('User registration successful', 'success');
        this.log(`Test user: ${testEmail}`, 'info');
        return true;
      }
    } catch (error) {
      this.log(`User registration failed: ${error.response?.data?.error || error.message}`, 'error');
      return false;
    }
  }

  async testAuthenticationValidation() {
    try {
      this.log('Testing authentication validation...');
      
      if (!this.authToken) {
        throw new Error('No auth token available');
      }

      const response = await axios.get(`${BASE_URL}/api/debug/auth`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.status === 200) {
        this.log('Authentication validation successful', 'success');
        this.log(`Authenticated as: ${response.data.user.email}`, 'info');
        return true;
      }
    } catch (error) {
      this.log(`Authentication validation failed: ${error.response?.data?.error || error.message}`, 'error');
      return false;
    }
  }

  async testPaymentIntentWithAuth() {
    try {
      this.log('Testing payment intent creation with authentication...');
      
      if (!this.authToken) {
        throw new Error('No auth token available');
      }

      const paymentData = {
        amount: 79,
        currency: 'usd',
        planId: 'professional'
      };

      const response = await axios.post(`${BASE_URL}/api/payment/create-intent`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.clientSecret) {
        this.log('Payment intent creation successful', 'success');
        this.log(`Client secret received (length: ${response.data.clientSecret.length})`, 'info');
        return true;
      }
    } catch (error) {
      this.log(`Payment intent creation failed: ${error.response?.data?.error || error.message}`, 'error');
      return false;
    }
  }

  async testPaymentIntentWithoutAuth() {
    try {
      this.log('Testing payment intent creation without authentication...');
      
      const paymentData = {
        amount: 79,
        currency: 'usd',
        planId: 'professional'
      };

      const response = await axios.post(`${BASE_URL}/api/payment/create-intent`, paymentData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // This should fail
      this.log('Payment intent creation unexpectedly succeeded without auth', 'warning');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('Payment intent correctly rejected without authentication', 'success');
        return true;
      } else {
        this.log(`Unexpected error: ${error.response?.data?.error || error.message}`, 'error');
        return false;
      }
    }
  }

  async testInvalidTokenFormat() {
    try {
      this.log('Testing payment intent with invalid token format...');
      
      const paymentData = {
        amount: 79,
        currency: 'usd',
        planId: 'professional'
      };

      const response = await axios.post(`${BASE_URL}/api/payment/create-intent`, paymentData, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });

      // This should fail
      this.log('Payment intent creation unexpectedly succeeded with invalid token', 'warning');
      return false;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        this.log('Payment intent correctly rejected with invalid token', 'success');
        return true;
      } else {
        this.log(`Unexpected error: ${error.response?.data?.error || error.message}`, 'error');
        return false;
      }
    }
  }

  async runAllTests() {
    this.log('Starting Authentication & Payment Tests...', 'info');
    
    const results = {
      userRegistration: await this.testUserRegistration(),
      authValidation: await this.testAuthenticationValidation(),
      paymentWithAuth: await this.testPaymentIntentWithAuth(),
      paymentWithoutAuth: await this.testPaymentIntentWithoutAuth(),
      invalidTokenTest: await this.testInvalidTokenFormat()
    };

    this.log('Test Results Summary:', 'info');
    Object.entries(results).forEach(([test, passed]) => {
      this.log(`${test}: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    this.log(`Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'success' : 'warning');

    if (passedTests === totalTests) {
      this.log('All authentication improvements are working correctly!', 'success');
    } else {
      this.log('Some tests failed. Please review the authentication implementation.', 'error');
    }

    return results;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthenticationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AuthenticationTester; 