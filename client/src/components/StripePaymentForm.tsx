import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CheckCircleIcon, ExclamationTriangleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { getApiUrl } from '../config';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_BQokikJOvBiI2HlWgH4olfQ2');

interface PaymentFormProps {
  amount: number;
  planId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, planId, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [amount, planId]);

  const createPaymentIntent = async () => {
    try {
      setError('');
      
      const token = localStorage.getItem('token');
      console.log('🔍 Payment Debug:', {
        hasToken: !!token,
        tokenLength: token?.length,
        amount,
        planId,
        apiUrl: getApiUrl()
      });
      
      if (!token) {
        throw new Error('Please sign in to continue with payment');
      }
      
      const response = await fetch(`${getApiUrl()}/api/payment/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          planId,
          currency: 'usd'
        })
      });

      console.log('🔍 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('🔍 Response Data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(data.error || `Payment setup failed (${response.status})`);
        }
      }

      setClientSecret(data.clientSecret);
      setIsReady(true);
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      console.error('Full error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('authentication')) {
        userMessage = 'Please sign in to continue with payment. The payment system requires authentication.';
      } else if (error.message.includes('Too many')) {
        userMessage = 'Too many payment attempts. Please wait a few minutes and try again.';
      } else if (error.message.includes('fetch')) {
        userMessage = 'Unable to connect to payment system. Please check your internet connection.';
      } else if (error.message.includes('Failed to create customer')) {
        userMessage = 'There was an issue setting up your payment profile. Please try again or contact support.';
      } else {
        // Show the actual error message instead of generic "development mode" text
        userMessage = error.message || 'Payment setup failed. Please try again or contact support.';
      }
      
      setError(userMessage);
      setIsReady(true);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm payment on backend
        const token = localStorage.getItem('token');
        const confirmResponse = await fetch(`${getApiUrl()}/api/payment/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            planId
          })
        });

        const confirmData = await confirmResponse.json();

        if (!confirmResponse.ok) {
          throw new Error(confirmData.error || 'Payment confirmation failed');
        }

        onSuccess();
      }
    } catch (error: any) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <CreditCardIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
        <div className="text-lg text-gray-600">
          ${amount}/month
        </div>
      </div>

      {/* Show error if payment setup failed */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Setup Error</h3>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          {error.includes('authentication') || error.includes('sign in') ? (
            <div className="text-red-600 text-xs">
              <p>• Please make sure you're signed in to your account</p>
              <p>• Try refreshing the page and signing in again</p>
              <p>• Contact support if the issue persists</p>
            </div>
          ) : error.includes('Too many') ? (
            <div className="text-red-600 text-xs">
              <p>• Please wait 5-10 minutes before trying again</p>
              <p>• The payment system has rate limiting for security</p>
            </div>
          ) : error.includes('Payment setup failed') || error.includes('Failed to create') ? (
            <div className="text-red-600 text-xs">
              <p>• Check that you're signed in to your account</p>
              <p>• Try refreshing the page and attempting payment again</p>
              <p>• If the issue persists, please contact support</p>
            </div>
          ) : (
            <div className="text-red-600 text-xs">
              <p>• Please try refreshing the page</p>
              <p>• Make sure you're signed in to your account</p>
              <p>• Contact support if the problem continues</p>
            </div>
          )}
        </div>
      )}

      {/* Show loading state */}
      {!isReady && !error && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      )}

      {/* Show form when ready or error */}
      {(isReady || error) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={!stripe || processing || !clientSecret || !!error}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                !stripe || processing || !clientSecret || !!error
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Processing...</span>
                </div>
              ) : error ? (
                'Payment Setup Failed'
              ) : (
                `Pay $${amount}/month`
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 px-4 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ← Back to Plans
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm; 