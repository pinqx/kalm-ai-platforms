import React, { useState, useEffect } from 'react';
import { Users, Dot, Eye, MessageCircle, FileText, Mic } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: {
    initial: string;
    backgroundColor: string;
    textColor: string;
  };
  role: string;
  status: 'online' | 'away' | 'busy';
  currentDocument?: string;
  lastActivity: Date;
  isAnalyzing?: boolean;
}

interface UserPresenceProps {
  currentUser?: User;
  maxVisible?: number;
  showActivity?: boolean;
}

const UserPresence: React.FC<UserPresenceProps> = ({ 
  currentUser, 
  maxVisible = 8, 
  showActivity = true 
}) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 UserPresence: Initializing with user:', currentUser);
    
    // Initialize socket connection with error handling and retries
    const newSocket = io('https://web-production-e7159.up.railway.app', {
      withCredentials: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true
    });

    setSocket(newSocket);

    // Join collaboration using the correct event name
    const userData = {
      userId: currentUser?.id || `user_${Date.now()}`,
      name: currentUser?.name || 'Demo User',
      email: currentUser?.email || 'demo@example.com',
      role: currentUser?.role || 'member',
      teamId: 'default-team',
      avatar: currentUser?.avatar || {
        initial: (currentUser?.name || 'D').charAt(0).toUpperCase(),
        backgroundColor: '#4F46E5',
        textColor: '#FFFFFF'
      }
    };

    console.log('🔗 UserPresence: Joining collaboration with:', userData);
    newSocket.emit('join-collaboration', userData);

    // Listen for active users updates (correct event name from CollaborationService)
    newSocket.on('active-users', (data) => {
      console.log('👥 UserPresence: Received active users:', data);
      if (data && data.users && Array.isArray(data.users)) {
        setActiveUsers(data.users);
      } else {
        console.warn('⚠️ UserPresence: Invalid active users data:', data);
        setActiveUsers([]);
      }
    });

    // Listen for user joined (correct event name)
    newSocket.on('user-joined', (data) => {
      console.log('👤 UserPresence: User joined:', data);
      if (data && data.user) {
        setActiveUsers(prev => {
          const exists = prev.find(u => u.id === data.user.id);
          if (!exists) {
            return [...prev, data.user];
          }
          return prev;
        });
      }
    });

    // Listen for user left
    newSocket.on('user-left', (data) => {
      console.log('👋 UserPresence: User left:', data);
      if (data && data.userId) {
        setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
      }
    });

    // Connection status handlers
    newSocket.on('connect', () => {
      console.log('✅ UserPresence: Connected to collaboration server');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ UserPresence: Disconnected from collaboration server:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    // Connection error handling
    newSocket.on('connect_error', (error) => {
      console.error('❌ UserPresence: Connection error:', error);
      setIsConnected(false);
      setConnectionError(error.message || 'Connection failed');
    });

    // Reconnection events
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 UserPresence: Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      // Re-join collaboration after reconnection
      newSocket.emit('join-collaboration', userData);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ UserPresence: Reconnection error:', error);
      setConnectionError('Reconnection failed');
    });

    return () => {
      console.log('🧹 UserPresence: Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (user: User) => {
    if (user.isAnalyzing) return <Mic className="w-3 h-3 text-blue-500" />;
    if (user.currentDocument) return <FileText className="w-3 h-3 text-green-500" />;
    return <Eye className="w-3 h-3 text-gray-400" />;
  };

  const getActivityText = (user: User) => {
    if (user.isAnalyzing) return 'Analyzing transcript...';
    if (user.currentDocument) return 'Viewing document';
    return 'Online';
  };

  const visibleUsers = activeUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, activeUsers.length - maxVisible);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Team ({activeUsers.length})
          </h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        
        <div className="text-xs flex items-center">
          {isConnected ? (
            <div className="text-green-600 flex items-center">
              <Dot className="w-4 h-4 animate-pulse" />
              Live
            </div>
          ) : (
            <div className="text-red-600 flex items-center">
              <Dot className="w-4 h-4" />
              {connectionError ? 'Error' : 'Connecting...'}
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      {connectionError && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          Connection error: {connectionError}
        </div>
      )}

      {/* User List */}
      <div className="space-y-3">
        {visibleUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ 
                  backgroundColor: user.avatar?.backgroundColor || '#4F46E5',
                  color: user.avatar?.textColor || '#FFFFFF'
                }}
              >
                {user.avatar?.initial || user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status || 'online')}`} />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                {user.role === 'admin' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              
              {showActivity && (
                <div className="flex items-center space-x-1 mt-1">
                  {getActivityIcon(user)}
                  <p className="text-xs text-gray-500 truncate">
                    {getActivityText(user)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-gray-200 rounded">
                <MessageCircle className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}

        {/* Hidden Users Count */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center py-2 text-xs text-gray-500">
            +{hiddenCount} more user{hiddenCount > 1 ? 's' : ''}
          </div>
        )}

        {/* Empty State */}
        {activeUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {isConnected ? 'No other team members online' : 'Connecting to collaboration server...'}
            </p>
            {!isConnected && (
              <p className="text-xs text-gray-400 mt-1">
                Make sure the server is running on port 3007
              </p>
            )}
          </div>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Connected: {isConnected ? '✅' : '❌'}</div>
            <div>Socket ID: {socket?.id || 'None'}</div>
            <div>Users: {activeUsers.length}</div>
            <div>Server: https://web-production-e7159.up.railway.app</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPresence; 