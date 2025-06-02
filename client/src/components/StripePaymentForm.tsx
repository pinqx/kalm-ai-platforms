import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCardIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
  };
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [plan]);

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3007/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: plan.price,
          planId: plan.id,
          currency: 'usd'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      setErrorMessage(error?.message || 'Failed to initialize payment');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setErrorMessage('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm payment with the client secret
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        // Handle different types of errors
        console.error('Payment error:', error);
        
        if (error.type === 'card_error' || error.type === 'validation_error') {
          switch (error.code) {
            case 'card_declined':
              setErrorMessage('💳 Card Declined: Your card was declined. Please try a different payment method.');
              break;
            case 'insufficient_funds':
              setErrorMessage('💰 Insufficient Funds: Your card has insufficient funds.');
              break;
            case 'expired_card':
              setErrorMessage('📅 Expired Card: Your card has expired.');
              break;
            case 'incorrect_cvc':
              setErrorMessage('🔒 Incorrect CVC: The CVC code is incorrect.');
              break;
            case 'processing_error':
              setErrorMessage('⚙️ Processing Error: An error occurred while processing your card.');
              break;
            default:
              setErrorMessage(`❌ Payment Error: ${error.message}`);
          }
        } else {
          setErrorMessage(`❌ Payment Error: ${error.message}`);
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded!
        console.log('Payment succeeded:', paymentIntent);
        
        // Confirm payment with backend
        try {
          const token = localStorage.getItem('token');
          const confirmResponse = await fetch('http://localhost:3007/api/payment/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              planId: plan.id
            })
          });

          const confirmData = await confirmResponse.json();
          
          if (confirmResponse.ok) {
            onSuccess({
              paymentIntent,
              subscription: confirmData.subscription
            });
          } else {
            setErrorMessage('Payment succeeded but subscription setup failed. Please contact support.');
          }
        } catch (confirmError: any) {
          console.error('Error confirming payment:', confirmError);
          setErrorMessage('Payment succeeded but confirmation failed. Please contact support.');
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
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
          {plan.name} Plan - ${plan.price}/month
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{errorMessage}</div>
        </div>
      )}

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
            disabled={!stripe || isProcessing || !clientSecret}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !stripe || isProcessing || !clientSecret
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay $${plan.price}/month`
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        <div className="mb-2 font-medium">🧪 Test Cards for Development:</div>
        <div className="space-y-1">
          <div><strong>Success:</strong> 4242 4242 4242 4242</div>
          <div><strong>Declined:</strong> 4000 0000 0000 0002</div>
          <div><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</div>
          <div><strong>3D Secure:</strong> 4000 0025 0000 3155</div>
        </div>
        <div className="mt-2 text-xs">
          Use any future expiry (12/25) and any CVC (123)
        </div>
      </div>
    </div>
  );
};

const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm; 