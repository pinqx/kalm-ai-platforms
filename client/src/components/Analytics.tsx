import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config';

interface AnalyticsData {
  totalTranscripts: number;
  recentTranscripts: number;
  sentimentBreakdown: Array<{ _id: string; count: number }>;
  topObjections: Array<{ _id: string; count: number }>;
  generatedAt: string;
}

interface AnalyticsProps {
  user: any;
  token: string;
}

export default function Analytics({ user, token }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log('Analytics component rendered with user:', !!user, 'token:', !!token);

  useEffect(() => {
    if (user && token) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      setAnalytics(data);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FaceSmileIcon className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <FaceFrownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view analytics</h3>
        <p className="text-gray-600 text-lg mb-6">Create an account to access your performance metrics and insights</p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">What you'll get with analytics:</h4>
          <ul className="text-left text-blue-800 space-y-2">
            <li className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Conversation sentiment tracking
            </li>
            <li className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Total transcripts analyzed
            </li>
            <li className="flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              Performance trends over time
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading your analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No data available</h3>
        <p className="text-gray-600 text-lg">Upload some transcripts to see your analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Transcripts
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.totalTranscripts}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Recent (30 days)
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.recentTranscripts}
                  </div>
                  {analytics.totalTranscripts > 0 && (
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      <span className="sr-only">Increased by</span>
                      {Math.round((analytics.recentTranscripts / analytics.totalTranscripts) * 100)}%
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Sentiment
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.sentimentBreakdown.length > 0 ? (
                      (analytics.sentimentBreakdown.find(s => s._id === 'positive')?.count || 0) > 
                      (analytics.sentimentBreakdown.find(s => s._id === 'negative')?.count || 0)
                        ? 'Positive' : 'Mixed'
                    ) : 'N/A'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Top Objections
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {analytics.topObjections.length}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
          <div className="space-y-3">
            {analytics.sentimentBreakdown.map((sentiment) => (
              <div key={sentiment._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getSentimentIcon(sentiment._id)}
                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                    {sentiment._id}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(sentiment._id)}`}>
                    {sentiment.count} calls
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Objections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Common Objections</h3>
          <div className="space-y-3">
            {analytics.topObjections.slice(0, 5).map((objection, index) => (
              <div key={objection._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="flex-shrink-0 w-4 h-4 bg-red-100 text-red-800 text-xs rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-sm text-gray-900 truncate">
                    {objection._id}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {objection.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 Activity Level</h4>
            <p className="text-sm text-blue-700">
              {analytics.recentTranscripts >= 10 ? 
                "Excellent! You're consistently analyzing calls." :
                analytics.recentTranscripts >= 5 ?
                "Good progress! Try to analyze more calls for better insights." :
                "Getting started! Upload more transcripts to unlock insights."
              }
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">📈 Sentiment Trend</h4>
            <p className="text-sm text-green-700">
              {(analytics.sentimentBreakdown.find(s => s._id === 'positive')?.count || 0) > 
               (analytics.sentimentBreakdown.find(s => s._id === 'negative')?.count || 0) ?
                "Your calls show positive sentiment overall!" :
                "Focus on addressing objections to improve sentiment."
              }
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">🎓 Coaching Tip</h4>
            <p className="text-sm text-purple-700">
              {analytics.topObjections.length > 0 ?
                `Most common objection: "${analytics.topObjections[0]?._id}". Prepare responses!` :
                "Great job! No major objections patterns detected."
              }
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.generatedAt).toLocaleDateString()}
      </div>
    </div>
  );
} 