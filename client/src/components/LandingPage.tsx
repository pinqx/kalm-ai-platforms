import React, { useState, useEffect, useRef } from 'react';
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

const TOOLS_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

// Add Intersection Observer for scroll animations
function useScrollReveal() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const reveal = (el: HTMLDivElement | null) => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-8');
      }
    };
    revealRefs.current.forEach(reveal);
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return revealRefs;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const revealRefs = useScrollReveal();

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
      color: 'text-kalm-gold',
      bgColor: 'bg-kalm-gold/10'
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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 text-center max-w-3xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          AI Sales Intelligence for <span className="text-blue-600">Modern Teams</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10">
          Instantly analyze sales calls, <span className="text-blue-600 font-semibold">coach reps</span>, and close more deals with <span className="text-blue-600 font-semibold">AI-powered insights</span>.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-block bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold px-10 py-4 rounded-2xl shadow-lg transition-all duration-300"
        >
          Start Free Trial
        </button>
      </section>

      {/* Trust Bar - REMOVED */}

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Upload Call",
                description: "Simply upload your sales call recordings or transcripts",
                icon: "📁",
                delay: "0s"
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our AI analyzes every conversation for key insights",
                icon: "🤖",
                delay: "0.2s"
              },
              {
                step: "03",
                title: "Get Insights", 
                description: "Receive detailed reports on performance and opportunities",
                icon: "📊",
                delay: "0.4s"
              },
              {
                step: "04",
                title: "Coach & Improve",
                description: "Use insights to coach your team and close more deals",
                icon: "🎯",
                delay: "0.6s"
              }
            ].map((item, i) => (
              <div
                key={item.step}
                ref={(el: HTMLDivElement | null) => (revealRefs.current[features.length + testimonials.length + i] = el)}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center transition-all duration-700 relative transform hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: item.delay,
                  animation: 'slideInFromBottom 0.8s ease-out forwards'
                }}
              >
                <div className="text-4xl mb-4 transform hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <div className="text-sm font-bold text-blue-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-400 text-2xl animate-pulse">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                ref={(el: HTMLDivElement | null) => (revealRefs.current[i] = el)}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center transition-all duration-700"
              >
                <div className={`w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-blue-50`}>
                  <feature.icon className="h-7 w-7 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.author}
                ref={(el: HTMLDivElement | null) => (revealRefs.current[features.length + i] = el)}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transition-all duration-700"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <StarIcon key={j} className="h-5 w-5 text-blue-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-900 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-500 text-sm">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto px-4">
          &copy; {new Date().getFullYear()} KALM. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 