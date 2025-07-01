import React, { useState } from 'react';
import {
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
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface LandingPageProps {
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Sticky Minimal Header */}
      <header className="header-kalm shadow-sm sticky top-0 z-50 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-kalm-primary to-kalm-accent1 rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-kalm-secondary tracking-tight">KALM</span>
          </a>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map(link => (
              <a key={link.href} href={link.href} className="text-kalm-text hover:text-kalm-primary transition-colors duration-200 font-medium">
                {link.label}
              </a>
            ))}
            <button
              onClick={onGetStarted}
              className="btn-kalm-primary ml-4"
            >
              Start Free Trial
            </button>
          </nav>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-kalm-text hover:text-kalm-primary transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
          </button>
        </div>
        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <nav className="flex flex-col px-6 py-6 space-y-4">
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} className="text-kalm-text hover:text-kalm-primary text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                className="btn-kalm-primary w-full mt-2"
              >
                Start Free Trial
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32 bg-kalm-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-kalm-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-kalm-accent1/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-kalm-accent2/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-kalm-secondary mb-6 leading-tight">
            AI-Powered Sales Support That <span className="gradient-text-kalm">Closes Deals</span>
          </h1>
          <p className="text-xl md:text-2xl text-kalm-text/70 mb-10 max-w-2xl mx-auto">
            Transform every sales conversation into actionable insights. Boost performance, close more deals, and scale coaching across your entire team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="btn-kalm-primary text-lg px-8 py-4"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-kalm-surface py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-kalm-text/60 text-lg mb-8 font-medium">
            Trusted by sales teams at innovative companies worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {['TechCorp', 'GrowthCo', 'ScaleUp Inc', 'InnovateSales'].map((company, index) => (
              <div key={company} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-kalm p-6">
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-kalm-secondary mb-4">
              Everything You Need to Scale Sales
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Powerful AI tools designed specifically for modern sales teams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="feature-card-kalm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-kalm-secondary mb-2">{feature.title}</h3>
                <p className="text-kalm-text/70 leading-relaxed text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-kalm-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-kalm-secondary mb-4">
              Proven Results That Drive Revenue
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Our customers see measurable improvements in sales performance within 30 days
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="stats-card-kalm animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-kalm-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-kalm-secondary mb-4">
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

      {/* Pricing Section (imported) */}
      <section id="pricing" className="py-24 bg-kalm-surface border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* PricingPage component should be rendered here in the main App, not duplicated */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-kalm-secondary mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-kalm-text/70 max-w-3xl mx-auto">
              Choose the perfect plan for your sales team. All plans include a 14-day free trial with no credit card required.
            </p>
          </div>
          {/* You can import and render <PricingPage /> here, or keep a summary and link to full pricing */}
          <div className="flex justify-center">
            <button
              onClick={onGetStarted}
              className="btn-kalm-primary text-lg px-8 py-4"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-kalm-primary to-kalm-accent1">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kalm-secondary text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-kalm-primary to-kalm-accent1 rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">KALM</span>
            </div>
            <div className="flex flex-col md:flex-row md:space-x-8 text-gray-300 text-sm">
              <a href="#features" className="hover:text-white transition-colors mb-2 md:mb-0">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors mb-2 md:mb-0">Pricing</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-xs">
            &copy; 2024 KALM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 