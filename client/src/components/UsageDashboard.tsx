import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  SparklesIcon, 
  ArrowUpIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config';

interface UsageStats {
  currentPlan: string;
  limits: {
    monthlyTranscripts: number;
    dailyTranscripts: number;
    features: Record<string, boolean>;
  };
  usage: {
    monthly: {
      used: number;
      limit: number;
      remaining: number | string;
      percentage: number;
    };
    daily: {
      used: number;
      limit: number;
      remaining: number | string;
      percentage: number;
    };
    total: number;
  };
  features: Record<string, boolean>;
  upgradeSuggestions: Array<{
    type: string;
    message: string;
    action: string;
    urgency: string;
  }>;
}

interface UsageDashboardProps {
  onUpgrade?: (planId: string) => void;
}

// Realistic fallback usage data for when backend isn't available
const FALLBACK_USAGE_DATA: UsageStats = {
  currentPlan: 'free_trial',
  limits: {
    monthlyTranscripts: 5,
    dailyTranscripts: 5,
    features: {
      advancedAnalytics: false,
      teamCollaboration: false,
      prioritySupport: false,
      crmIntegrations: false,
      customTemplates: false
    }
  },
  usage: {
    monthly: {
      used: 2,
      limit: 5,
      remaining: 3,
      percentage: 40
    },
    daily: {
      used: 1,
      limit: 5,
      remaining: 4,
      percentage: 20
    },
    total: 2
  },
  features: {
    advancedAnalytics: false,
    teamCollaboration: false,
    prioritySupport: false,
    crmIntegrations: false,
    customTemplates: false
  },
  upgradeSuggestions: [
    {
      type: 'limit_approaching',
      message: 'You have 3 free analyses remaining. Upgrade to continue analyzing transcripts.',
      action: 'Choose a Plan',
      urgency: 'medium'
    },
    {
      type: 'feature',
      message: 'Unlock advanced analytics and team collaboration features',
      action: 'Upgrade to Professional',
      urgency: 'low'
    }
  ]
};

const UsageDashboard: React.FC<UsageDashboardProps> = ({ onUpgrade }) => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallbackData, setUsingFallbackData] = useState(false);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view usage statistics');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/usage/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Failed to load usage statistics');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setUsageStats(data);
      setUsingFallbackData(false);
    } catch (error: any) {
      console.error('Error fetching usage stats:', error);
      setError('Failed to load usage statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-600 bg-gray-100';
      case 'free_trial': return 'text-orange-600 bg-orange-100';
      case 'starter': return 'text-green-600 bg-green-100';
      case 'professional': return 'text-blue-600 bg-blue-100';
      case 'enterprise': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageBarColor = (percentage: number, urgency?: string) => {
    if (urgency === 'high' || percentage >= 90) return 'bg-red-500';
    if (urgency === 'medium' || percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default: return <SparklesIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading && !usageStats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!usageStats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700">Loading usage data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(usageStats.currentPlan)}`}>
                  {usageStats.currentPlan === 'free_trial' ? 'Free Trial' : 
                   usageStats.currentPlan.charAt(0).toUpperCase() + usageStats.currentPlan.slice(1)} Plan
                </span>
                {(usageStats.currentPlan === 'free' || usageStats.currentPlan === 'free_trial') && (
                  <span className="text-xs text-gray-500">• Limited features</span>
                )}
              </div>
            </div>
          </div>
          {usageStats.currentPlan !== 'enterprise' && (
            <button
              onClick={() => onUpgrade?.('professional')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpIcon className="h-4 w-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Monthly Usage</h4>
            <span className="text-2xl font-bold text-gray-900">
              {usageStats.usage.monthly.used}
              {usageStats.usage.monthly.limit > 0 && `/${usageStats.usage.monthly.limit}`}
            </span>
          </div>
          
          {usageStats.usage.monthly.limit > 0 ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(usageStats.usage.monthly.percentage)}`}
                  style={{ width: `${Math.min(usageStats.usage.monthly.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{usageStats.usage.monthly.percentage}% used</span>
                <span>{usageStats.usage.monthly.remaining} remaining</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm">Unlimited</span>
            </div>
          )}
        </div>

        {/* Daily Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Today's Usage</h4>
            <span className="text-2xl font-bold text-gray-900">
              {usageStats.usage.daily.used}
              {usageStats.usage.daily.limit > 0 && `/${usageStats.usage.daily.limit}`}
            </span>
          </div>
          
          {usageStats.usage.daily.limit > 0 ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(usageStats.usage.daily.percentage)}`}
                  style={{ width: `${Math.min(usageStats.usage.daily.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{usageStats.usage.daily.percentage}% used</span>
                <span>{usageStats.usage.daily.remaining} remaining</span>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm">Unlimited</span>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Suggestions */}
      {usageStats.upgradeSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Recommendations</h4>
          {usageStats.upgradeSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                suggestion.urgency === 'high'
                  ? 'bg-red-50 border-red-200'
                  : suggestion.urgency === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getUrgencyIcon(suggestion.urgency)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{suggestion.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{suggestion.action}</p>
                  <button
                    onClick={() => onUpgrade?.('professional')}
                    className={`mt-2 text-xs font-medium underline ${
                      suggestion.urgency === 'high'
                        ? 'text-red-600 hover:text-red-700'
                        : suggestion.urgency === 'medium'
                        ? 'text-yellow-600 hover:text-yellow-700'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    View Plans →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Access */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Feature Access</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries({
            'Advanced Analytics': usageStats.features.advancedAnalytics,
            'Team Collaboration': usageStats.features.teamCollaboration,
            'Priority Support': usageStats.features.prioritySupport,
            'CRM Integrations': usageStats.features.crmIntegrations,
            'Custom Templates': usageStats.features.customTemplates,
          }).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center space-x-2">
              {enabled ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
              )}
              <span className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                {feature}
              </span>
              {!enabled && (
                <span className="text-xs text-gray-400">(Pro)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total Usage */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Analyses</span>
          <span className="text-lg font-semibold text-gray-900">{usageStats.usage.total}</span>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard; 