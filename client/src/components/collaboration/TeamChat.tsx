import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Hash, Users, Bell, BellOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
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
  content: string;
  type: 'text' | 'system' | 'analysis-share' | 'file';
  timestamp: Date;
  reactions: { [emoji: string]: string[] };
  metadata?: any;
}

interface TeamChatProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
  teamId?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const TeamChat: React.FC<TeamChatProps> = ({
  currentUser,
  teamId = 'default-team',
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('🚀 TeamChat: Initializing with user:', currentUser);
    
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
      teamId,
      role: 'member'
    };

    console.log('🔗 TeamChat: Joining collaboration with:', userData);
    newSocket.emit('join-collaboration', userData);

    // Listen for team messages (from CollaborationService)
    newSocket.on('team-message', (message: Message) => {
      console.log('💬 TeamChat: Received message:', message);
      setMessages(prev => [...prev, message]);
      
      // Show notification if enabled and not from current user
      if (notifications && message.userId !== currentUser?.id) {
        showNotification(message);
      }
    });

    // Listen for typing indicators
    newSocket.on('user-typing', (data) => {
      console.log('⌨️ TeamChat: User typing:', data);
      if (data.userId !== currentUser?.id) {
        setIsTyping(prev => {
          if (!prev.includes(data.user.name)) {
            return [...prev, data.user.name];
          }
          return prev;
        });

        // Clear typing after 3 seconds
        setTimeout(() => {
          setIsTyping(prev => prev.filter(name => name !== data.user.name));
        }, 3000);
      }
    });

    // Listen for system notifications
    newSocket.on('system-notification', (notification) => {
      console.log('📢 TeamChat: System notification:', notification);
      const systemMessage: Message = {
        id: notification.id || `system_${Date.now()}`,
        userId: 'system',
        user: {
          name: 'System',
          email: 'system@platform.com',
          avatar: {
            initial: 'S',
            backgroundColor: '#6B7280',
            textColor: '#FFFFFF'
          }
        },
        content: notification.message,
        type: 'system',
        timestamp: new Date(notification.timestamp),
        reactions: {}
      };
      
      setMessages(prev => [...prev, systemMessage]);
    });

    // Connection status handlers
    newSocket.on('connect', () => {
      console.log('✅ TeamChat: Connected to collaboration server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ TeamChat: Disconnected from collaboration server:', reason);
      setIsConnected(false);
    });

    // Connection error handling
    newSocket.on('connect_error', (error) => {
      console.error('❌ TeamChat: Connection error:', error);
      setIsConnected(false);
    });

    // Reconnection handling
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 TeamChat: Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Re-join collaboration after reconnection
      newSocket.emit('join-collaboration', userData);
    });

    return () => {
      console.log('🧹 TeamChat: Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [currentUser, teamId, notifications]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showNotification = (message: Message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${message.user.name} in Team Chat`, {
        body: message.content,
        icon: '/chat-icon.png'
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage.trim(),
      type: 'text',
      teamId
    };

    socket.emit('team-message', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (socket && newMessage.length > 0) {
      socket.emit('typing', {
        teamId,
        userId: currentUser?.id,
        user: currentUser
      });
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDateHeader = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const messageDate = new Date(message.timestamp);
    const prevDate = new Date(prevMessage.timestamp);
    return messageDate.toDateString() !== prevDate.toDateString();
  };

  const shouldShowAvatar = (message: Message, index: number) => {
    if (index === messages.length - 1) return true;
    const nextMessage = messages[index + 1];
    return message.userId !== nextMessage.userId || 
           new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime() > 300000; // 5 minutes
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-50 text-blue-800 text-center italic';
      case 'analysis-share':
        return 'bg-green-50 border-l-4 border-green-400 pl-4';
      default:
        return 'bg-white';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Hash className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Team Chat</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setNotifications(!notifications)}
            className={`p-1 rounded ${notifications ? 'text-blue-600' : 'text-gray-400'}`}
            title={notifications ? 'Disable notifications' : 'Enable notifications'}
          >
            {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Hash className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id}>
              {/* Date Header */}
              {shouldShowDateHeader(message, index) && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(new Date(message.timestamp))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div className={`flex items-start space-x-3 ${getMessageTypeStyle(message.type)}`}>
                {/* Avatar */}
                {shouldShowAvatar(message, index) && message.type !== 'system' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: message.user.avatar.backgroundColor,
                      color: message.user.avatar.textColor
                    }}
                  >
                    {message.user.avatar.initial}
                  </div>
                )}

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  {shouldShowAvatar(message, index) && message.type !== 'system' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(new Date(message.timestamp))}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-800 break-words">
                    {message.content}
                  </div>

                  {/* Analysis Share Metadata */}
                  {message.type === 'analysis-share' && message.metadata && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600">
                        📊 Shared analysis: {message.metadata.title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>
              {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Paperclip className="w-4 h-4" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isConnected}
            />
          </div>
          
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Smile className="w-4 h-4" />
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">Reconnecting to chat...</p>
        )}
      </div>
    </div>
  );
};

export default TeamChat; 