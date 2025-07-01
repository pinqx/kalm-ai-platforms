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
  BoltIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('https://web-production-e7159.up.railway.app/api/email-signup', {
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
      title: 'AI-Powered Sales Analysis',
      description: 'Get instant insights on sentiment, objections, and next steps from every sales conversation.',
      color: 'text-kalm-primary',
      bgColor: 'bg-kalm-primary/10'
    },
    {
      icon: EnvelopeIcon,
      title: 'Smart Email Generation',
      description: 'Generate personalized follow-up emails and proposals based on conversation analysis.',
      color: 'text-kalm-accent1',
      bgColor: 'bg-kalm-accent1/10'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Sales Coaching Assistant',
      description: 'Chat with your AI coach to get strategic advice and objection handling tips.',
      color: 'text-kalm-accent2',
      bgColor: 'bg-kalm-accent2/10'
    },
    {
      icon: UserGroupIcon,
      title: 'Team Performance Tracking',
      description: 'Scale coaching across entire teams with comprehensive performance analytics.',
      color: 'text-kalm-primary',
      bgColor: 'bg-kalm-primary/10'
    }
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
    <div className="bg-kalm-background min-h-screen">
      {/* Header */}
      <header className="header-kalm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-kalm-primary to-kalm-accent1 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-kalm-secondary">KALM</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                Features
              </a>
              <a href="#pricing" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                Pricing
              </a>
              <a href="#contact" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                Contact
              </a>
              <button
                onClick={onGetStarted}
                className="btn-kalm-primary"
              >
                Book Demo
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-kalm-text hover:text-kalm-primary transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                  Pricing
                </a>
                <a href="#contact" className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                  Contact
                </a>
                <button
                  onClick={onGetStarted}
                  className="btn-kalm-primary w-full"
                >
                  Book Demo
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-kalm relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-kalm-primary/20 rounded-full mix-blend-multiply animate-bounce-gentle"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-kalm-accent1/20 rounded-full mix-blend-multiply animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-kalm-accent2/20 rounded-full mix-blend-multiply animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 animate-gradient">
                AI-Powered Sales Support
              </span>
              <span className="block text-white mt-4">
                That Closes Deals
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform every sales conversation into actionable insights with KALM's AI-powered analysis. 
              Boost performance by 40%, close more deals, and scale coaching across your entire team.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
              <button
                onClick={onGetStarted}
                className="btn-kalm-primary group"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button className="btn-kalm-secondary">
                Book a Demo
              </button>
            </div>
            <p className="text-blue-200 text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              ✨ Free 14-day trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-kalm-surface py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-kalm-text/70 text-lg mb-12 font-medium">
            Trusted by sales teams at innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {['TechCorp', 'GrowthCo', 'ScaleUp Inc', 'InnovateSales'].map((company, index) => (
              <div key={company} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-kalm p-8">
                  <p className="text-kalm-text font-bold text-lg">{company}</p>
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
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-kalm-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-kalm-secondary mb-6">
              Everything You Need to Scale Sales
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Powerful AI tools designed specifically for modern sales teams
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="feature-card-kalm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-kalm-secondary mb-4">{feature.title}</h3>
                <p className="text-kalm-text/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-kalm-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-kalm-secondary mb-6">
              Proven Results That Drive Revenue
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Our customers see measurable improvements in sales performance within 30 days
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="stats-card-kalm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-kalm-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-kalm-secondary mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Join hundreds of sales teams already using KALM to close more deals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.author} className="testimonial-card-kalm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-kalm-text/80 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-kalm-primary to-kalm-accent1 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-kalm-secondary">{testimonial.author}</div>
                    <div className="text-sm text-kalm-text/70">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-kalm-primary to-kalm-accent1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Sales Team?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join hundreds of sales teams already using KALM to close more deals and scale their coaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-kalm-primary px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-kalm-primary transition-all duration-300">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kalm-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-kalm-primary to-kalm-accent1 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">KALM</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                AI-powered sales intelligence that helps teams close more deals through intelligent conversation analysis and coaching.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 KALM. All rights reserved. | <a href="#" className="hover:text-white transition-colors">Privacy Policy</a> | <a href="#" className="hover:text-white transition-colors">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
} 