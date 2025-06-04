import React, { useState } from 'react';
import { Users, MessageSquare, Activity, Settings, Maximize2, Minimize2 } from 'lucide-react';
import UserPresence from '../collaboration/UserPresence';
import TeamChat from '../collaboration/TeamChat';
import LiveAnalysisFeed from '../collaboration/LiveAnalysisFeed';

interface CollaborationTabProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

const CollaborationTab: React.FC<CollaborationTabProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'chat' | 'activity'>('overview');
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('🚀 CollaborationTab mounted with user:', currentUser);
    console.log('🌐 Expected server at: https://web-production-e7159.up.railway.app');
  }, [currentUser]);

  // Transform currentUser to match expected User interface
  const collaborationUser = currentUser ? {
    ...currentUser,
    role: currentUser.role || 'member',
    avatar: {
      initial: (currentUser.name || 'U').charAt(0).toUpperCase(),
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF'
    },
    status: 'online' as const,
    lastActivity: new Date()
  } : {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'member',
    avatar: {
      initial: 'D',
      backgroundColor: '#4F46E5',
      textColor: '#FFFFFF'
    },
    status: 'online' as const,
    lastActivity: new Date()
  };

  const handleViewAnalysis = (analysis: any) => {
    setSelectedAnalysis(analysis);
    // Could open a modal or navigate to detailed view
    console.log('Viewing analysis:', analysis);
  };

  const getSectionContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className="h-full">
            <TeamChat
              currentUser={collaborationUser}
              isMinimized={isChatMinimized}
              onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
            />
          </div>
        );
      
      case 'activity':
        return (
          <div className="h-full">
            <LiveAnalysisFeed
              currentUser={collaborationUser}
              onViewAnalysis={handleViewAnalysis}
            />
          </div>
        );
      
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - User Presence */}
            <div className="lg:col-span-1">
              <UserPresence currentUser={collaborationUser} />
            </div>

            {/* Middle Column - Live Analysis Feed */}
            <div className="lg:col-span-1">
              <LiveAnalysisFeed
                currentUser={collaborationUser}
                onViewAnalysis={handleViewAnalysis}
                maxItems={8}
              />
            </div>

            {/* Right Column - Team Chat */}
            <div className="lg:col-span-1">
              <TeamChat
                currentUser={collaborationUser}
                isMinimized={false}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Connection Status Banner */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-800">
                Real-time collaboration active - Server: web-production-e7159.up.railway.app
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Check browser console for connection logs
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Real-time collaboration workspace for your sales team
            </p>
          </div>

          {/* Section Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'chat', label: 'Chat', icon: MessageSquare },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeSection === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Team Members</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Live Analyses</p>
                <p className="text-2xl font-bold text-green-600">2</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Messages Today</p>
                <p className="text-2xl font-bold text-purple-600">47</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Shared Files</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {getSectionContent()}
      </div>

      {/* Analysis Modal/Preview */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedAnalysis.title}
              </h3>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-600">
                    {selectedAnalysis.results?.summary || 'Analysis results will appear here...'}
                  </p>
                </div>

                {selectedAnalysis.results?.actionItems && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                    <ul className="space-y-1">
                      {selectedAnalysis.results.actionItems.map((item: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Analyzed by {selectedAnalysis.user.name} • {selectedAnalysis.startTime}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Export
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (when minimized) */}
      <TeamChat
        currentUser={collaborationUser}
        isMinimized={isChatMinimized && activeSection !== 'chat'}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
      />
    </div>
  );
};

export default CollaborationTab; 