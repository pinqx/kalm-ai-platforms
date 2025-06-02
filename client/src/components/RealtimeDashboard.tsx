import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  UserGroupIcon, 
  BoltIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ActiveUser {
  email: string;
  joinedAt: string;
  isAnalyzing: boolean;
  currentFile?: string;
  lastAnalysis?: string;
}

interface AnalysisProgress {
  analysisId: string;
  progress: number;
  stage: string;
  timestamp: string;
}

interface AnalysisResult {
  analysisId: string;
  result: any;
  completedBy: string;
  timestamp: string;
  filename: string;
}

interface SystemMessage {
  type: 'welcome' | 'info' | 'error';
  message: string;
  timestamp: string;
}

interface UserActivity {
  userId: string;
  user: string;
  activity: string;
  filename?: string;
  timestamp: string;
}

interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
  userId: string;
}

const RealtimeDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisProgress | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('http://localhost:3007', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('🔗 Connected to real-time server');
      setIsConnected(true);
      
      // Join with user info
      newSocket.emit('join', {
        email: 'demo@example.com', // In production, get from auth context
        timestamp: new Date()
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time server');
      setIsConnected(false);
    });

    // Listen for system messages
    newSocket.on('systemMessage', (data: SystemMessage) => {
      setSystemMessages(prev => [data, ...prev].slice(0, 10));
    });

    // Listen for active users updates
    newSocket.on('activeUsers', (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    // Listen for analysis events
    newSocket.on('analysisStart', (data) => {
      setCurrentAnalysis({
        analysisId: data.analysisId,
        progress: 0,
        stage: 'Starting analysis...',
        timestamp: data.timestamp
      });
      
      setUserActivities(prev => [{
        userId: data.userId || 'unknown',
        user: data.startedBy,
        activity: 'started_analysis',
        filename: data.filename,
        timestamp: data.timestamp
      }, ...prev].slice(0, 20));
    });

    newSocket.on('analysisProgress', (data: AnalysisProgress) => {
      setCurrentAnalysis(data);
    });

    newSocket.on('analysisComplete', (data: AnalysisResult) => {
      setCurrentAnalysis(null);
      setRecentAnalyses(prev => [data, ...prev].slice(0, 5));
      
      setUserActivities(prev => [{
        userId: data.userId || 'unknown',
        user: data.completedBy,
        activity: 'completed_analysis',
        filename: data.filename,
        timestamp: data.timestamp
      }, ...prev].slice(0, 20));
    });

    newSocket.on('analysisError', (data) => {
      setCurrentAnalysis(null);
      setSystemMessages(prev => [{
        type: 'error',
        message: `Analysis failed: ${data.error}`,
        timestamp: data.timestamp
      }, ...prev].slice(0, 10));
    });

    // Listen for user activities
    newSocket.on('userActivity', (data: UserActivity) => {
      setUserActivities(prev => [data, ...prev].slice(0, 20));
    });

    // Listen for chat messages
    newSocket.on('chatMessage', (data: ChatMessage) => {
      setChatMessages(prev => [data, ...prev].slice(0, 50));
    });

    // Listen for shared analyses
    newSocket.on('analysisShared', (data) => {
      setSystemMessages(prev => [{
        type: 'info',
        message: `${data.sharedBy} shared analysis for ${data.filename}`,
        timestamp: data.timestamp
      }, ...prev].slice(0, 10));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendChatMessage = () => {
    if (socket && chatInput.trim()) {
      socket.emit('chatMessage', { message: chatInput });
      setChatInput('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'started_analysis':
        return <BoltIcon className="h-4 w-4 text-blue-500" />;
      case 'completed_analysis':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BoltIcon className="h-6 w-6 mr-2 text-blue-500" />
          Real-time Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Active Users ({activeUsers.length})
          </h3>
          <div className="space-y-2">
            {activeUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users connected</p>
            ) : (
              activeUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium text-sm">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      Joined {formatTimestamp(user.joinedAt)}
                    </div>
                  </div>
                  {user.isAnalyzing && (
                    <div className="flex items-center text-xs text-blue-600">
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      Analyzing
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Current Analysis
          </h3>
          {currentAnalysis ? (
            <div className="space-y-3">
              <div className="bg-white rounded border p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{currentAnalysis.stage}</span>
                  <span className="text-xs text-gray-500">{currentAnalysis.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentAnalysis.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {currentAnalysis.analysisId}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No analysis in progress</p>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Analyses</h3>
          <div className="space-y-2">
            {recentAnalyses.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent analyses</p>
            ) : (
              recentAnalyses.map((analysis, index) => (
                <div key={index} className="bg-white rounded border p-2">
                  <div className="font-medium text-sm">{analysis.filename}</div>
                  <div className="text-xs text-gray-500">
                    By {analysis.completedBy} • {formatTimestamp(analysis.timestamp)}
                  </div>
                  <div className="text-xs text-green-600">✓ Completed</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Live Activity Feed</h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {userActivities.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            userActivities.map((activity, index) => (
              <div key={index} className="flex items-center text-sm p-2 bg-white rounded border">
                {getActivityIcon(activity.activity)}
                <span className="ml-2">
                  <strong>{activity.user}</strong> {activity.activity.replace('_', ' ')}
                  {activity.filename && <em> {activity.filename}</em>}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Chat</h3>
          <div className="bg-white rounded border h-40 overflow-y-auto p-2 mb-3 space-y-1">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet</p>
            ) : (
              chatMessages.slice().reverse().map((msg, index) => (
                <div key={index} className="text-sm">
                  <strong className="text-blue-600">{msg.user}:</strong>
                  <span className="ml-1">{msg.message}</span>
                  <span className="ml-2 text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={sendChatMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* System Messages */}
      {systemMessages.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">System Messages</h3>
          <div className="space-y-2">
            {systemMessages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  msg.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
                  msg.type === 'welcome' ? 'bg-green-50 border-green-400 text-green-700' :
                  'bg-blue-50 border-blue-400 text-blue-700'
                }`}
              >
                <div className="flex justify-between">
                  <span>{msg.message}</span>
                  <span className="text-xs opacity-75">{formatTimestamp(msg.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeDashboard; 