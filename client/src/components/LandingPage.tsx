import React, { useState } from 'react';
import {
  PlayIcon,
  ChartBarIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3007/api/email-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing-page'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Thanks! We\'ll be in touch soon with early access.');
        setEmail('');
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Email signup error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: ChartBarIcon,
      title: 'AI-Powered Analysis',
      description: 'Get instant insights on sentiment, objections, and next steps from every sales conversation.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: EnvelopeIcon,
      title: 'Smart Email Generation',
      description: 'Generate personalized follow-up emails and proposals based on conversation analysis.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Sales Coaching Assistant',
      description: 'Chat with your AI coach to get strategic advice and objection handling tips.',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  const benefits = [
    '40% improvement in sales team performance',
    'Reduce coaching time by 60%',
    'Increase deal close rates by 25%',
    'Scale coaching across entire teams',
    'Real-time conversation insights',
    'Automated follow-up sequences'
  ];

  const testimonials = [
    {
      quote: "This platform transformed how we coach our sales team. We've seen a 35% increase in close rates since implementing it.",
      author: "Sarah Johnson",
      title: "VP of Sales, TechCorp",
      avatar: "SJ",
      rating: 5
    },
    {
      quote: "The AI insights help our reps identify objections they were missing. Game-changer for our business.",
      author: "Mike Chen",
      title: "Sales Manager, GrowthCo",
      avatar: "MC",
      rating: 5
    },
    {
      quote: "Finally, a tool that actually helps us understand what's happening in our sales calls. ROI was immediate.",
      author: "Lisa Rodriguez",
      title: "Head of Revenue, ScaleUp Inc",
      avatar: "LR",
      rating: 5
    }
  ];

  const stats = [
    { number: '40%', label: 'Performance Improvement', icon: TrophyIcon },
    { number: '60%', label: 'Time Saved', icon: BoltIcon },
    { number: '25%', label: 'Higher Close Rates', icon: StarIcon },
  ];

  return (
    <div className="bg-white overflow-hidden">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply opacity-20 animate-bounce-gentle"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply opacity-20 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply opacity-20 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <SparklesIcon className="h-20 w-20 text-yellow-300 animate-pulse-soft" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 animate-gradient">
                KALM
              </span>
              <span className="block text-white">
                Your AI Sales Intelligence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform every sales conversation into actionable insights with KALM's AI-powered analysis. 
              Boost performance by 40%, close more deals, and scale coaching across your entire team.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              <button
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 flex items-center justify-center shadow-2xl transform hover:scale-105 hover:shadow-3xl"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              ✨ Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Social Proof */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-lg mb-12 font-medium">
            Trusted by sales teams at innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {['TechCorp', 'GrowthCo', 'ScaleUp Inc', 'InnovateSales'].map((company, index) => (
              <div key={company} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                  <p className="text-gray-800 font-bold text-lg">{company}</p>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Results Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Proven Results That Drive Revenue
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our customers see measurable improvements in sales performance within 30 days
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-2xl border border-blue-100">
                  <div className="flex justify-center mb-4">
                    <stat.icon className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    {stat.number}
                  </div>
                  <p className="text-xl text-gray-900 font-semibold mb-2">{stat.label}</p>
                  <p className="text-gray-600">Average improvement across all customers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Scale Sales Coaching
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed for modern sales teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="group animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="bg-white rounded-3xl p-10 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-gray-100 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-5xl font-bold text-gray-900 mb-8">
                Transform Your Sales Organization
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Stop relying on gut feeling. Make data-driven decisions that actually improve your sales outcomes.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                      <CheckIcon className="h-5 w-5 text-white font-bold" />
                    </div>
                    <span className="text-gray-700 text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-10 shadow-2xl animate-fade-in border border-blue-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h3>
              <div className="space-y-8">
                {[
                  { step: '1', title: 'Upload Transcripts', desc: 'Upload call recordings or paste conversation text' },
                  { step: '2', title: 'AI Analysis', desc: 'Get instant insights on sentiment, objections, and opportunities' },
                  { step: '3', title: 'Take Action', desc: 'Generate follow-ups, get coaching tips, track performance' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mr-6 mt-1 shadow-lg">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Testimonials */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">Real results from real sales teams</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 h-full">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-8 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to Transform Your Sales Team?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join hundreds of sales teams who are already using AI to improve their performance
          </p>
          
          <form onSubmit={handleEmailSignup} className="max-w-lg mx-auto mb-12">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-4 focus:ring-yellow-400 text-lg shadow-xl"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 px-8 py-4 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-105"
              >
                {loading ? 'Signing up...' : 'Get Started'}
              </button>
            </div>
            {message && (
              <p className={`mt-6 text-lg ${message.includes('🎉') ? 'text-green-200' : 'text-red-200'}`}>
                {message}
              </p>
            )}
          </form>
          
          <p className="text-blue-200 text-lg">
            ✨ Free 14-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
} 