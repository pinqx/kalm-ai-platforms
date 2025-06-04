import React, { useState, useEffect } from 'react';
import { Activity, Eye, Play, Pause, Share2, Clock, User, FileText, Mic2, CheckCircle, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface LiveAnalysis {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar: {
      initial: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  title: string;
  progress: number;
  stage: string;
  startTime: Date;
  isLive: boolean;
  viewers: Set<string>;
  lastUpdate: Date;
  sourceType?: 'text' | 'audio';
  fileName?: string;
  results?: any;
  completedAt?: Date;
}

interface LiveAnalysisFeedProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  onViewAnalysis?: (analysis: LiveAnalysis) => void;
  maxItems?: number;
}

const LiveAnalysisFeed: React.FC<LiveAnalysisFeedProps> = ({
  currentUser,
  onViewAnalysis,
  maxItems = 10
}) => {
  const [liveAnalyses, setLiveAnalyses] = useState<LiveAnalysis[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'completed'>('all');

  useEffect(() => {
    console.log('🚀 LiveAnalysisFeed: Initializing with user:', currentUser);
    
    const newSocket = io('https://web-production-e7159.up.railway.app', {
      withCredentials: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true
    });

    setSocket(newSocket);

    // Join collaboration using correct event name
    const userData = {
      userId: currentUser?.id || `user_${Date.now()}`,
      name: currentUser?.name || 'Demo User',
      email: currentUser?.email || 'demo@example.com',
      teamId: 'default-team',
      role: 'member'
    };

    console.log('🔗 LiveAnalysisFeed: Joining collaboration with:', userData);
    newSocket.emit('join-collaboration', userData);

    // Listen for live analyses (from CollaborationService)
    newSocket.on('live-analyses', (data) => {
      console.log('📊 LiveAnalysisFeed: Received live analyses:', data);
      if (data && Array.isArray(data.analyses)) {
        setLiveAnalyses(data.analyses);
      }
    });

    // Listen for new analysis started
    newSocket.on('live-analysis-started', (data) => {
      console.log('🎬 LiveAnalysisFeed: Analysis started:', data);
      if (data && data.analysis) {
        setLiveAnalyses(prev => {
          const exists = prev.find(a => a.id === data.analysis.id);
          if (!exists) {
            return [data.analysis, ...prev].slice(0, maxItems);
          }
          return prev;
        });
      }
    });

    // Listen for analysis progress updates
    newSocket.on('analysis-progress-update', (data) => {
      console.log('📈 LiveAnalysisFeed: Progress update:', data);
      if (data && data.analysisId) {
        setLiveAnalyses(prev => prev.map(analysis => {
          if (analysis.id === data.analysisId) {
            return {
              ...analysis,
              progress: data.progress,
              stage: data.stage,
              isLive: !data.completed,
              results: data.results,
              completedAt: data.completed ? new Date() : undefined,
              lastUpdate: new Date()
            };
          }
          return analysis;
        }));
      }
    });

    // Listen for analysis disconnected
    newSocket.on('analysis-disconnected', (data) => {
      console.log('🔌 LiveAnalysisFeed: Analysis disconnected:', data);
      if (data && data.analysisId) {
        setLiveAnalyses(prev => prev.map(analysis => {
          if (analysis.id === data.analysisId) {
            return {
              ...analysis,
              isLive: false,
              lastUpdate: new Date()
            };
          }
          return analysis;
        }));
      }
    });

    // Connection status handlers
    newSocket.on('connect', () => {
      console.log('✅ LiveAnalysisFeed: Connected to collaboration server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ LiveAnalysisFeed: Disconnected from collaboration server:', reason);
      setIsConnected(false);
    });

    // Connection error handling
    newSocket.on('connect_error', (error) => {
      console.error('❌ LiveAnalysisFeed: Connection error:', error);
      setIsConnected(false);
    });

    // Reconnection handling
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 LiveAnalysisFeed: Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Re-join collaboration after reconnection
      newSocket.emit('join-collaboration', userData);
    });

    return () => {
      console.log('🧹 LiveAnalysisFeed: Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [currentUser, maxItems]);

  const filteredAnalyses = liveAnalyses.filter(analysis => {
    switch (filter) {
      case 'live':
        return analysis.isLive;
      case 'completed':
        return !analysis.isLive && analysis.results;
      default:
        return true;
    }
  });

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diff = end.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusIcon = (analysis: LiveAnalysis) => {
    if (analysis.isLive) {
      return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
    } else if (analysis.results) {
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleViewAnalysis = (analysis: LiveAnalysis) => {
    if (onViewAnalysis) {
      onViewAnalysis(analysis);
    }
  };

  const handleShareAnalysis = (analysis: LiveAnalysis) => {
    if (socket && analysis.results) {
      socket.emit('team-message', {
        content: `📊 Check out this analysis: ${analysis.title}`,
        type: 'analysis-share',
        metadata: {
          analysisId: analysis.id,
          title: analysis.title,
          results: analysis.results
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Live Analysis Feed</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['all', 'live', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                filter === filterType 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAnalyses.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {filter === 'live' ? 'No live analyses' : 
               filter === 'completed' ? 'No completed analyses' : 
               'No analyses yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Start analyzing transcripts to see them here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Analysis Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* User Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: analysis.user.avatar.backgroundColor,
                        color: analysis.user.avatar.textColor
                      }}
                    >
                      {analysis.user.avatar.initial}
                    </div>

                    {/* Analysis Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {analysis.title}
                        </h4>
                        {getStatusIcon(analysis)}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{analysis.user.name}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(new Date(analysis.startTime))}</span>
                        {analysis.sourceType && (
                          <>
                            <span>•</span>
                            {analysis.sourceType === 'audio' ? (
                              <Mic2 className="w-3 h-3" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            <span>{analysis.sourceType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    {analysis.results && (
                      <button
                        onClick={() => handleShareAnalysis(analysis)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Share in team chat"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleViewAnalysis(analysis)}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="View analysis"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar (for live analyses) */}
                {analysis.isLive && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{analysis.stage}</span>
                      <span className="text-xs text-gray-500">{analysis.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(analysis.progress)}`}
                        style={{ width: `${analysis.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                {!analysis.isLive && analysis.results && (
                  <div className="flex items-center space-x-2 text-xs text-green-600 mb-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>
                      Completed in {formatDuration(new Date(analysis.startTime), analysis.completedAt)}
                    </span>
                  </div>
                )}

                {/* Results Preview */}
                {analysis.results && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="text-xs text-gray-600 mb-1">Key Insights:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {analysis.results.sentiment || 'Positive'}
                        </div>
                        <div className="text-gray-500">Sentiment</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {analysis.results.confidence || 85}%
                        </div>
                        <div className="text-gray-500">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {analysis.results.actionItems?.length || 3}
                        </div>
                        <div className="text-gray-500">Actions</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Name */}
                {analysis.fileName && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                    <FileText className="w-3 h-3" />
                    <span className="truncate">{analysis.fileName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredAnalyses.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {filteredAnalyses.filter(a => a.isLive).length} live • {filteredAnalyses.filter(a => !a.isLive && a.results).length} completed
            </span>
            <span>
              {isConnected ? 'Real-time updates' : 'Reconnecting...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAnalysisFeed; 