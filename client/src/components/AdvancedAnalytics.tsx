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
  CalendarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  LightBulbIcon,
  ArrowDownTrayIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  FireIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config';

interface AdvancedAnalyticsData {
  // Basic analytics
  totalTranscripts: number;
  recentTranscripts: number;
  sentimentBreakdown: Array<{ _id: string; count: number }>;
  topObjections: Array<{ _id: string; count: number }>;
  
  // Advanced metrics
  conversionTrends: Array<{ date: string; rate: number; transcripts: number }>;
  performanceMetrics: {
    avgCallDuration: number;
    successRate: number;
    followUpRate: number;
    responseTime: number;
  };
  sentimentTrends: Array<{ date: string; positive: number; negative: number; neutral: number }>;
  topKeywords: Array<{ word: string; frequency: number; sentiment: string }>;
  weeklyProgress: Array<{ week: string; calls: number; deals: number; revenue: number }>;
  predictiveInsights: {
    nextWeekPrediction: number;
    trendDirection: 'up' | 'down' | 'stable';
    confidence: number;
    recommendations: string[];
  };
  competitorMentions: Array<{ name: string; mentions: number; sentiment: string }>;
  timeAnalysis: {
    bestPerformingHours: Array<{ hour: number; successRate: number }>;
    avgCallsByDay: Array<{ day: string; calls: number }>;
  };
  generatedAt: string;
}

interface AdvancedAnalyticsProps {
  user?: any;
  token?: string;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ user, token }) => {
  const [analytics, setAnalytics] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && token) {
      fetchAdvancedAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, token, timeRange]);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/advanced-analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Failed to load advanced analytics');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error fetching advanced analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advanced-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPredictionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const safeFormatNumber = (value: any, decimals: number = 1): string => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
        <p className="text-gray-600 text-lg mb-6">Sign in to access powerful insights and predictions</p>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
          <h4 className="text-lg font-semibold text-purple-900 mb-3">Premium Analytics Features:</h4>
          <ul className="text-left text-purple-800 space-y-2">
            <li className="flex items-center">
              <PresentationChartLineIcon className="h-5 w-5 mr-2" />
              Predictive performance insights
            </li>
            <li className="flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2" />
              Advanced sentiment analysis
            </li>
            <li className="flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2" />
              AI-powered recommendations
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Processing advanced analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No data available</h3>
        <p className="text-gray-600 text-lg">Upload transcripts to unlock advanced insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600 mt-1">AI-powered insights and predictions</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={exportData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'performance', name: 'Performance', icon: TrophyIcon },
            { id: 'predictions', name: 'Predictions', icon: LightBulbIcon },
            { id: 'insights', name: 'Insights', icon: FireIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Conversations</p>
                  <p className="text-3xl font-bold">{analytics.totalTranscripts}</p>
                  <p className="text-blue-100 text-sm">+{analytics.recentTranscripts} this period</p>
                </div>
                <DocumentTextIcon className="h-12 w-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold">{analytics.performanceMetrics.successRate}%</p>
                  <p className="text-green-100 text-sm flex items-center">
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    +5.2% vs last period
                  </p>
                </div>
                <TrophyIcon className="h-12 w-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Call Duration</p>
                  <p className="text-3xl font-bold">{analytics.performanceMetrics.avgCallDuration}m</p>
                  <p className="text-purple-100 text-sm">Optimal range</p>
                </div>
                <ClockIcon className="h-12 w-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Response Time</p>
                  <p className="text-3xl font-bold">{analytics.performanceMetrics.responseTime}h</p>
                  <p className="text-orange-100 text-sm">Industry leading</p>
                </div>
                <FireIcon className="h-12 w-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Trends Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trends</h3>
              <div className="space-y-4">
                {analytics.sentimentTrends.slice(-5).map((trend, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 w-20">
                      {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="flex h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${trend.positive}%` }}
                          title={`Positive: ${trend.positive.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-gray-400" 
                          style={{ width: `${trend.neutral}%` }}
                          title={`Neutral: ${trend.neutral.toFixed(1)}%`}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${trend.negative}%` }}
                          title={`Negative: ${trend.negative.toFixed(1)}%`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
              <div className="space-y-3">
                {analytics.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{keyword.word}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSentimentColor(keyword.sentiment)}`}>
                        {keyword.sentiment}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {keyword.frequency} mentions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Weekly Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {analytics.weeklyProgress.map((week, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{week.week}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Calls:</span>
                      <span className="text-sm font-medium">{week.calls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Deals:</span>
                      <span className="text-sm font-medium">{week.deals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Revenue:</span>
                      <span className="text-sm font-medium">${week.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Performing Hours</h3>
              <div className="space-y-3">
                {analytics.timeAnalysis.bestPerformingHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {hour.hour}:00 - {hour.hour + 1}:00
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${hour.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {safeFormatNumber(hour.successRate, 1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Call Volume</h3>
              <div className="space-y-3">
                {analytics.timeAnalysis.avgCallsByDay.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{day.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(day.calls / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {day.calls} avg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {/* Prediction Card */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Next Week Prediction</h3>
                <p className="text-purple-100">AI-powered performance forecast</p>
              </div>
              {getPredictionIcon(analytics.predictiveInsights.trendDirection)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-purple-100 text-sm">Predicted Success Rate</p>
                <p className="text-4xl font-bold">{safeFormatNumber(analytics.predictiveInsights.nextWeekPrediction, 1)}%</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Trend Direction</p>
                <p className="text-2xl font-semibold capitalize">{analytics.predictiveInsights.trendDirection}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Confidence Level</p>
                <p className="text-2xl font-semibold">{safeFormatNumber(analytics.predictiveInsights.confidence, 0)}%</p>
              </div>
            </div>
          </div>

          {/* Conversion Trends */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trends</h3>
            <div className="space-y-4">
              {analytics.conversionTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(trend.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">{trend.transcripts} conversations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{safeFormatNumber(trend.rate, 1)}%</p>
                    <p className="text-xs text-gray-500">conversion rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
              AI-Powered Recommendations
            </h3>
            <div className="space-y-4">
              {analytics.predictiveInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Mentions</h3>
            <div className="space-y-3">
              {analytics.competitorMentions.map((comp, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSentimentColor(comp.sentiment)}`}>
                      {comp.sentiment}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{comp.mentions} mentions</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Objections Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Objection Patterns</h3>
            <div className="space-y-3">
              {analytics.topObjections.map((objection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">{objection._id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600">{objection.count}</span>
                    <span className="text-xs text-gray-500 ml-1">times</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.generatedAt).toLocaleString()} • 
        <span className="text-purple-600 ml-1">AI Analytics v2.0</span>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 