import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  TrashIcon, 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface Transcript {
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
  };
  status: 'processing' | 'completed' | 'failed';
}

interface TranscriptHistoryProps {
  onSelectTranscript: (transcript: Transcript) => void;
  user: any;
  token: string;
}

export default function TranscriptHistory({ onSelectTranscript, user, token }: TranscriptHistoryProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  console.log('TranscriptHistory component rendered with user:', !!user, 'token:', !!token);

  const fetchTranscripts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3007/api/transcripts?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transcripts');
      }

      setTranscripts(data.transcripts || []);
      setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchTranscripts(page);
    } else {
      setLoading(false);
    }
  }, [user, token, page]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-400" />;
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

  const deleteTranscript = async (transcriptId: string) => {
    if (!confirm('Are you sure you want to delete this transcript?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3007/api/transcripts/${transcriptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTranscripts(transcripts.filter(t => t._id !== transcriptId));
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete transcript');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view history</h3>
        <p className="text-gray-600 text-lg mb-6">Create an account to save and access your transcript analyses</p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h4 className="text-lg font-semibold text-green-900 mb-3">What you'll get with history:</h4>
          <ul className="text-left text-green-800 space-y-2">
            <li className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              All your analyzed transcripts
            </li>
            <li className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Track progress over time
            </li>
            <li className="flex items-center">
              <EyeIcon className="h-5 w-5 mr-2" />
              Review past conversations
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading && transcripts.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg">Loading your transcripts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchTranscripts(page)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No transcripts yet</h3>
        <p className="text-gray-600 text-lg">Upload and analyze your first sales call transcript to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transcript History</h3>
        <p className="text-gray-500 text-sm mt-1">
          {pagination.total} transcript{pagination.total !== 1 ? 's' : ''} analyzed
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {transcripts.map((transcript) => (
          <div key={transcript._id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h4 className="font-medium text-gray-900 truncate">
                    {transcript.originalFileName}
                  </h4>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getSentimentColor(transcript.analysis.sentiment)}`}>
                    <span className="flex items-center">
                      {getSentimentIcon(transcript.analysis.sentiment)}
                      <span className="ml-1 capitalize">{transcript.analysis.sentiment}</span>
                    </span>
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {transcript.analysis.summary}
                </p>

                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {transcript.timeAgo}
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(transcript.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    {transcript.formattedFileSize}
                  </span>
                  <span>
                    {transcript.analysis.confidence}% confidence
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {transcript.analysis.objections.slice(0, 2).map((objection, index) => (
                    <span key={index} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      {objection.length > 30 ? objection.substring(0, 30) + '...' : objection}
                    </span>
                  ))}
                  {transcript.analysis.objections.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      +{transcript.analysis.objections.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onSelectTranscript(transcript)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                  title="View Analysis"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteTranscript(transcript._id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 