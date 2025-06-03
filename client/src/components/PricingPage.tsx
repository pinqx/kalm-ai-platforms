import React from 'react';
import { CheckIcon, XMarkIcon, StarIcon, SparklesIcon, CurrencyDollarIcon, UsersIcon } from '@heroicons/react/24/solid';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'Perfect for individual sales reps',
    icon: CurrencyDollarIcon,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Up to 50 transcript analyses/month',
      'Basic AI insights',
      'Email template generation',
      'Individual dashboard',
      'Email support',
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
    color: 'from-blue-500 to-indigo-600',
    features: [
      'Unlimited transcript analyses',
      'Advanced AI coaching',
      'Team collaboration features',
      'CRM integrations',
      'Custom templates',
      'Video call integration',
      'Priority support',
      'Advanced analytics',
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
    description: 'For large sales organizations',
    icon: SparklesIcon,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Everything in Professional',
      'SSO integration',
      'Advanced analytics & reporting',
      'Custom AI training',
      'White-label options',
      'Dedicated customer success manager',
      'API access',
      'Advanced security features',
    ],
    notIncluded: [],
    popular: false,
  },
];

interface PricingPageProps {
  onSelectPlan?: (plan: typeof plans[0]) => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-lg font-semibold leading-7 text-blue-600 mb-4">Transparent Pricing</h2>
          <p className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Choose the right plan for your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              success
            </span>
          </p>
          <p className="text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Transform your sales conversations into coaching opportunities with AI-powered insights. 
            Start with a 14-day free trial on any plan.
          </p>
        </div>

        <div className="mx-auto mt-20 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative group animate-fade-in transform hover:scale-105 transition-all duration-300 ${
                plan.popular
                  ? 'scale-105 z-10'
                  : ''
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center">
                    <StarIcon className="h-4 w-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div
                className={`h-full rounded-3xl p-8 xl:p-10 shadow-2xl border border-gray-200/50 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-500 shadow-blue-200/50'
                    : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between gap-x-4 mb-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mr-4`}>
                      <plan.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 text-lg mb-6">{plan.description}</p>
                
                <div className="mb-8">
                  <div className="flex items-baseline gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-lg font-semibold text-gray-500">/user/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Billed annually • 20% savings</p>
                </div>
                
                <button
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800'
                  }`}
                  onClick={() => onSelectPlan?.(plan)}
                >
                  Start Free Trial
                </button>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-0.5">
                          <XMarkIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-gray-400 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-lg leading-7 text-gray-600">
            Need a custom solution?{' '}
            <a href="#contact" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 underline decoration-2 underline-offset-4">
              Contact our sales team →
            </a>
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-5xl animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="lg:flex">
              <div className="p-10 lg:flex-auto">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-white">Enterprise+</h3>
                </div>
                <p className="text-lg leading-8 text-gray-300 mb-8">
                  For large organizations that need custom integrations, on-premise deployment, 
                  or specialized AI model training.
                </p>
                <div className="grid grid-cols-1 gap-6 text-gray-300 sm:grid-cols-2">
                  {[
                    'Custom integrations',
                    'On-premise deployment', 
                    'Advanced security features',
                    'Custom AI model training',
                    'SLA guarantees',
                    '24/7 priority support'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                  <div className="mx-auto max-w-xs">
                    <p className="text-lg font-semibold text-yellow-400 mb-4">Custom Pricing</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold tracking-tight text-white">Contact us</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-8">
                      Starting at $5,000/month for teams of 50+
                    </p>
                    <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-4 rounded-xl text-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      Contact Sales Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-24 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h3>
            <p className="text-lg text-gray-600">Every plan includes these powerful features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: SparklesIcon,
                title: 'AI-Powered Insights',
                description: 'Get instant analysis of conversation sentiment, objections, and opportunities',
                color: 'from-blue-500 to-indigo-600'
              },
              {
                icon: StarIcon,
                title: '14-Day Free Trial',
                description: 'Try any plan risk-free with full access to all features',
                color: 'from-yellow-500 to-orange-600'
              },
              {
                icon: UsersIcon,
                title: 'Expert Support',
                description: 'Get help from our sales coaching experts whenever you need it',
                color: 'from-green-500 to-emerald-600'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200/50 text-center transform hover:scale-105 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-20 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 text-center border border-green-200 animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">30-Day Money-Back Guarantee</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love the results.
          </p>
        </div>
      </div>
    </div>
  );
} 