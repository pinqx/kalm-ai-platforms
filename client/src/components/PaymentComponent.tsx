import React, { useState, useEffect } from 'react';
import { CreditCardIcon, CheckIcon, StarIcon, ShieldCheckIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import StripePaymentForm from './StripePaymentForm';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

interface PaymentComponentProps {
  onSuccess?: (planId: string) => void;
  currentUser?: any;
  selectedPlan?: PricingPlan;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ onSuccess, currentUser, selectedPlan }) => {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PricingPlan | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Always use these hardcoded plans to ensure consistent data
  const plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      description: 'Perfect for individual sales professionals',
      stripePriceId: 'price_starter_monthly',
      features: [
        'Up to 50 transcript analyses per month',
        'Basic AI insights and sentiment analysis',
        'Email template generation',
        'Individual dashboard',
        'Email support',
        'Mobile app access',
        'Basic objection analysis'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      description: 'Best for growing sales teams',
      recommended: true,
      stripePriceId: 'price_professional_monthly',
      features: [
        'Unlimited transcript analyses',
        'Advanced AI coaching and insights',
        'Team collaboration features',
        'Real-time live dashboard',
        'Advanced analytics & reporting',
        'CRM integrations',
        'Custom email templates',
        'Priority support',
        'Team chat and presence',
        'Competitor mention tracking'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      description: 'Complete solution for large organizations',
      stripePriceId: 'price_enterprise_monthly',
      features: [
        'Everything in Professional',
        'SSO integration',
        'Advanced predictive analytics',
        'Custom AI model training',
        'White-label options',
        'Dedicated customer success manager',
        'API access',
        'Advanced security features',
        'Custom integrations',
        'Phone support',
        'Service level agreements',
        'Advanced compliance features'
      ]
    }
  ];

  // If a plan was pre-selected from pricing page, use it immediately
  useEffect(() => {
    if (selectedPlan && selectedPlan.id && selectedPlan.price) {
      // Find matching plan from our hardcoded list to ensure consistency
      const matchingPlan = plans.find(p => p.id === selectedPlan.id);
      if (matchingPlan) {
        setSelectedPlanForPayment(matchingPlan);
      }
    }
  }, [selectedPlan]);

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlanForPayment(plan);
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    if (onSuccess && selectedPlanForPayment) {
      onSuccess(selectedPlanForPayment.id);
    }
    
    // Reset after showing success
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedPlanForPayment(null);
    }, 3000);
  };

  const handleBackToPlans = () => {
    setSelectedPlanForPayment(null);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Welcome to the {selectedPlanForPayment?.name} plan!
            </p>
            <p className="text-sm text-gray-500">
              You'll receive a confirmation email shortly. Your subscription is now active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPlanForPayment) {
    console.log('PaymentComponent: Rendering payment form for plan:', selectedPlanForPayment);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
            <div className="text-lg text-gray-600">
              {selectedPlanForPayment.name} Plan - ${selectedPlanForPayment.price}/month
            </div>
          </div>
          
          {/* Temporary debug info */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
            <div>✅ Plan selected: {selectedPlanForPayment.name}</div>
            <div>✅ Amount: ${selectedPlanForPayment.price}</div>
            <div>✅ Plan ID: {selectedPlanForPayment.id}</div>
            <div>About to render StripePaymentForm...</div>
          </div>
          
          <StripePaymentForm
            amount={selectedPlanForPayment.price}
            planId={selectedPlanForPayment.id}
            onSuccess={handlePaymentSuccess}
            onError={(error) => {
              console.error('Payment error:', error);
              // Don't automatically go back - let user see the error
              // handleBackToPlans();
            }}
            onCancel={handleBackToPlans}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Show message if no plan selected */}
        {!selectedPlanForPayment && (
          <div className="text-center mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <strong>Choose your plan below to continue with payment</strong>
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            30-day money-back guarantee
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your sales conversations with AI-powered insights. Start your journey to better sales performance today.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.recommended ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="flex items-center justify-center mb-6">
                  <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  plan.recommended
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">256-bit SSL encryption</span>
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">30-day money back</span>
            </div>
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Secure payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent; 