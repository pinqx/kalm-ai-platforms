import React from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  MinusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface TranscriptAnalysisProps {
  transcript: {
    _id: string;
    originalFileName: string;
    formattedFileSize: string;
    timeAgo: string;
    createdAt: string;
    analysis: {
      summary: string;
      objections: string[];
      actionItems: string[];
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
      keyTopics?: Array<{ topic: string; frequency: number }>;
      participantCount?: number;
    };
    status: 'processing' | 'completed' | 'failed';
  };
  onBack: () => void;
}

export default function TranscriptAnalysis({ transcript, onBack }: TranscriptAnalysisProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <FaceSmileIcon className="h-6 w-6 text-green-500" />;
      case 'negative':
        return <FaceFrownIcon className="h-6 w-6 text-red-500" />;
      default:
        return <MinusIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'Positive conversation with good engagement';
      case 'negative':
        return 'Challenging conversation with objections';
      default:
        return 'Neutral conversation tone';
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {transcript.originalFileName}
              </h1>
            </div>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {transcript.timeAgo}
              </span>
              <span>{transcript.formattedFileSize}</span>
              <span className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {transcript.analysis.participantCount || 2} participants
              </span>
              <span className="flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                {transcript.analysis.confidence}% confidence
              </span>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to History
          </button>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="p-6 space-y-6">
        {/* Sentiment Overview */}
        <div className={`rounded-lg border p-4 ${getSentimentColor(transcript.analysis.sentiment)}`}>
          <div className="flex items-center">
            {getSentimentIcon(transcript.analysis.sentiment)}
            <div className="ml-3">
              <h3 className="text-lg font-semibold capitalize">
                {transcript.analysis.sentiment} Sentiment
              </h3>
              <p className="text-sm">
                {getSentimentText(transcript.analysis.sentiment)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Call Summary
          </h2>
          <p className="text-blue-800 leading-relaxed">
            {transcript.analysis.summary}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objections */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Objections & Concerns ({transcript.analysis.objections.length})
            </h2>
            {transcript.analysis.objections.length > 0 ? (
              <ul className="space-y-2">
                {transcript.analysis.objections.map((objection, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-800 text-xs rounded-full flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span className="ml-3 text-red-800">{objection}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-700 italic">No objections identified in this call</p>
            )}
          </div>

          {/* Action Items */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Action Items ({transcript.analysis.actionItems.length})
            </h2>
            {transcript.analysis.actionItems.length > 0 ? (
              <ul className="space-y-2">
                {transcript.analysis.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-green-800">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-700 italic">No specific action items identified</p>
            )}
          </div>
        </div>

        {/* Key Topics */}
        {transcript.analysis.keyTopics && transcript.analysis.keyTopics.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Key Topics Discussed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {transcript.analysis.keyTopics.map((topic, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="text-sm font-medium text-purple-900">{topic.topic}</div>
                  <div className="text-xs text-purple-600">
                    Mentioned {topic.frequency} time{topic.frequency !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {transcript.analysis.confidence}%
              </div>
              <div className="text-sm text-gray-600">Analysis Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {transcript.analysis.objections.length}
              </div>
              <div className="text-sm text-gray-600">Objections Raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {transcript.analysis.actionItems.length}
              </div>
              <div className="text-sm text-gray-600">Action Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 