import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, StarIcon, SparklesIcon, CurrencyDollarIcon, UsersIcon, ShieldCheckIcon, CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import StripePaymentForm from './StripePaymentForm';
import { getAuthState, isAuthenticated } from '../utils/auth';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  features: string[];
  notIncluded: string[];
  popular: boolean;
  stripePriceId?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for individual sales professionals',
    icon: CurrencyDollarIcon,
    color: 'text-kalm-accent2',
    bgColor: 'bg-kalm-accent2/10',
    stripePriceId: 'price_starter_monthly',
    features: [
      'Up to 50 transcript analyses per month',
      'Basic AI insights and sentiment analysis',
      'Email template generation',
      'Individual dashboard',
      'Email support',
      'Mobile app access',
      'Basic objection analysis'
    ],
    notIncluded: [
      'Team collaboration',
      'CRM integrations',
      'Advanced analytics',
      'Priority support',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    description: 'Best for growing sales teams',
    icon: UsersIcon,
    color: 'text-kalm-primary',
    bgColor: 'bg-kalm-primary/10',
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
    ],
    notIncluded: [
      'SSO integration',
      'White-label options',
      'Custom AI training',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    description: 'Complete solution for large organizations',
    icon: SparklesIcon,
    color: 'text-kalm-accent1',
    bgColor: 'bg-kalm-accent1/10',
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
    ],
    notIncluded: [],
    popular: false,
  },
];

interface PricingPageProps {
  onSelectPlan?: (plan: PricingPlan) => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PricingPlan | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  // Check authentication status using utility functions
  useEffect(() => {
    const authState = getAuthState();
    setUser(authState.user);
  }, []);

  const handlePlanSelect = (plan: PricingPlan) => {
    // Check if user is authenticated before allowing payment using utility function
    if (!isAuthenticated()) {
      setShowAuthRequired(true);
      setSelectedPlanForPayment(plan);
      return;
    }

    // If authenticated, proceed to payment
    setSelectedPlanForPayment(plan);
    setShowAuthRequired(false);
    onSelectPlan?.(plan);
  };

  const handleSignInClick = () => {
    // Clear the plan selection and auth required state
    setSelectedPlanForPayment(null);
    setShowAuthRequired(false);
    
    // Refresh the page to trigger the main app's authentication flow
    window.location.reload();
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedPlanForPayment(null);
    }, 5000);
  };

  const handleBackToPlans = () => {
    setSelectedPlanForPayment(null);
    setShowAuthRequired(false);
  };

  // Authentication required screen
  if (showAuthRequired && selectedPlanForPayment) {
    return (
      <div className="min-h-screen bg-kalm-background py-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="card-kalm p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-kalm-secondary mb-4">Sign In Required</h2>
            <p className="text-kalm-text/70 mb-4">
              Please sign in to your account to continue with the {selectedPlanForPayment.name} plan purchase.
            </p>
            <div className="bg-kalm-primary/10 border border-kalm-primary/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-kalm-primary text-sm mb-2">Selected Plan:</h3>
              <div className="text-kalm-primary">
                <p className="font-medium">{selectedPlanForPayment.name}</p>
                <p className="text-sm">${selectedPlanForPayment.price}/month</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleSignInClick}
                className="btn-kalm-primary w-full"
              >
                Sign In to Continue
              </button>
              <button
                onClick={handleBackToPlans}
                className="btn-kalm-secondary w-full"
              >
                Back to Plans
              </button>
            </div>
            <p className="text-xs text-kalm-text/50 mt-4">
              Don't have an account? Signing up is free and takes less than a minute.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-kalm-background py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-kalm p-8">
            <CheckCircleIcon className="h-16 w-16 text-kalm-accent2 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-kalm-secondary mb-4">Payment Successful!</h2>
            <p className="text-kalm-text/70 mb-6">
              Welcome to KALM! Your subscription has been activated and you can start using all features immediately.
            </p>
            <div className="bg-kalm-accent2/10 border border-kalm-accent2/20 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-kalm-accent2 text-lg mb-2">What's Next?</h3>
              <ul className="text-left text-kalm-text/80 space-y-2">
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                  Upload your first sales conversation transcript
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                  Explore the AI-powered insights dashboard
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                  Generate personalized follow-up emails
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                  Set up your team collaboration features
                </li>
              </ul>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn-kalm-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment form screen
  if (selectedPlanForPayment) {
    return (
      <div className="min-h-screen bg-kalm-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <button
              onClick={handleBackToPlans}
              className="text-kalm-primary hover:text-kalm-accent1 transition-colors mb-4 flex items-center justify-center mx-auto"
            >
              ← Back to Plans
            </button>
            <h1 className="text-3xl font-bold text-kalm-secondary mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-kalm-text/70">
              Secure payment powered by Stripe
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="card-kalm p-8">
              <h2 className="text-2xl font-bold text-kalm-secondary mb-6">Order Summary</h2>
              <div className="bg-kalm-primary/10 border border-kalm-primary/20 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-kalm-secondary text-lg">{selectedPlanForPayment.name}</h3>
                    <p className="text-kalm-text/70 text-sm">{selectedPlanForPayment.description}</p>
                  </div>
                  <div className={`w-12 h-12 ${selectedPlanForPayment.bgColor} rounded-xl flex items-center justify-center`}>
                    <selectedPlanForPayment.icon className={`h-6 w-6 ${selectedPlanForPayment.color}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-kalm-text/70">Monthly subscription</span>
                  <span className="text-2xl font-bold text-kalm-secondary">${selectedPlanForPayment.price}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-kalm-secondary">What's included:</h4>
                <ul className="space-y-2">
                  {selectedPlanForPayment.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center text-kalm-text/80">
                      <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {selectedPlanForPayment.features.length > 5 && (
                    <li className="text-kalm-primary text-sm font-medium">
                      +{selectedPlanForPayment.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>

                         {/* Payment Form */}
             <div className="card-kalm p-8">
               <h2 className="text-2xl font-bold text-kalm-secondary mb-6">Payment Information</h2>
               <StripePaymentForm
                 amount={selectedPlanForPayment.price}
                 planId={selectedPlanForPayment.id}
                 onSuccess={handlePaymentSuccess}
                 onError={(error) => console.error('Payment error:', error)}
                 onCancel={handleBackToPlans}
               />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Main pricing page
  return (
    <div className="min-h-screen bg-kalm-background">
      {/* Header */}
      <div className="bg-kalm-surface border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-kalm-secondary mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your sales team. All plans include a 14-day free trial with no credit card required.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-kalm-text/70">
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <CheckIcon className="h-4 w-4 text-kalm-accent2 mr-2" />
                Free trial
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative ${plan.popular ? 'ring-2 ring-kalm-primary' : ''} card-kalm p-8 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-kalm-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className={`w-16 h-16 ${plan.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className={`h-8 w-8 ${plan.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-kalm-secondary mb-2">{plan.name}</h3>
                <p className="text-kalm-text/70 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-kalm-secondary">${plan.price}</span>
                  <span className="text-kalm-text/70">/month</span>
                </div>
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-kalm-primary text-white hover:bg-kalm-accent1 transform hover:scale-105'
                      : 'bg-kalm-surface text-kalm-primary border-2 border-kalm-primary hover:bg-kalm-primary hover:text-white'
                  }`}
                >
                  {plan.popular ? 'Get Started' : 'Choose Plan'}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-kalm-secondary">What's included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-kalm-accent2 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-kalm-text/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.notIncluded.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-kalm-text/70 mb-3">Not included:</h4>
                    <ul className="space-y-2">
                      {plan.notIncluded.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-kalm-text/50 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kalm-secondary mb-4">Frequently Asked Questions</h2>
            <p className="text-kalm-text/70">Everything you need to know about KALM pricing</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-kalm p-6">
              <h3 className="font-semibold text-kalm-secondary mb-3">Can I change plans anytime?</h3>
              <p className="text-kalm-text/70 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="card-kalm p-6">
              <h3 className="font-semibold text-kalm-secondary mb-3">Is there a free trial?</h3>
              <p className="text-kalm-text/70 text-sm">Yes, all plans include a 14-day free trial with full access to all features.</p>
            </div>
            <div className="card-kalm p-6">
              <h3 className="font-semibold text-kalm-secondary mb-3">What payment methods do you accept?</h3>
              <p className="text-kalm-text/70 text-sm">We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.</p>
            </div>
            <div className="card-kalm p-6">
              <h3 className="font-semibold text-kalm-secondary mb-3">Can I cancel anytime?</h3>
              <p className="text-kalm-text/70 text-sm">Absolutely. You can cancel your subscription at any time with no cancellation fees or penalties.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="card-kalm p-12">
            <h2 className="text-3xl font-bold text-kalm-secondary mb-4">Ready to Transform Your Sales Team?</h2>
            <p className="text-kalm-text/70 mb-8 max-w-2xl mx-auto">
              Join hundreds of sales teams already using KALM to close more deals and scale their coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handlePlanSelect(plans[1])} // Professional plan
                className="btn-kalm-primary"
              >
                Start Free Trial
              </button>
              <button className="btn-kalm-secondary">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 