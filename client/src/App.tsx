import React, { useState, useEffect } from 'react'
import AnalysisTab from './components/tabs/AnalysisTab'
import CollaborationTab from './components/tabs/CollaborationTab'
import EmailGenerator from './components/EmailGenerator'
import ChatInterface from './components/ChatInterface'
import AuthModal from './components/AuthModal'
import TranscriptHistory from './components/TranscriptHistory'
import PricingPage from './components/PricingPage'
import Analytics from './components/Analytics'
import AdvancedAnalytics from './components/AdvancedAnalytics'
import LandingPage from './components/LandingPage'
import RealtimeDashboard from './components/RealtimeDashboard'
import PaymentTester from './components/PaymentTester'
import AdminDashboard from './components/AdminDashboard'
import UsageDashboard from './components/UsageDashboard'
import AdminLogin from './components/AdminLogin'
import PrivacyPolicy from './components/PrivacyPolicy'
import TermsOfService from './components/TermsOfService'
import Footer from './components/Footer'
import { 
  DocumentTextIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  HomeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BoltIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { getApiUrl } from './config'

interface TranscriptAnalysis {
  summary: string;
  objections: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyTopics: { topic: string; frequency: number }[];
  participantCount: number;
  audioMetadata?: {
    duration: number;
    language: string;
    confidence: number;
    fileSize: number;
    whisperModel: string;
  };
  sourceType?: 'text' | 'audio';
  transcriptionConfidence?: number;
}

type ActiveTab = 'home' | 'upload' | 'email' | 'chat' | 'dashboard' | 'history' | 'pricing' | 'realtime' | 'collaboration' | 'advanced-analytics' | 'admin' | 'usage' | 'privacy' | 'terms';

function App() {
  const [analysis, setAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Site-wide authentication protection
  useEffect(() => {
    // If user is not authenticated and trying to access protected content
    if (!user && activeTab !== 'home' && activeTab !== 'pricing') {
      setActiveTab('home');
      setShowAuthModal(true);
    }
  }, [activeTab, user]);

  const handleAuth = (userData: any, authToken: string) => {
    console.log('🔐 handleAuth called with user:', userData);
    
    // Clear old user data first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Set new user data
    setUser(userData);
    setToken(authToken);
    
    // Save to localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ User state updated:', {
      firstName: userData?.firstName,
      email: userData?.email,
      tokenLength: authToken?.length
    });
    
    // After successful authentication, redirect to upload tab
    if (activeTab === 'home') {
      setActiveTab('upload');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken('');
    setActiveTab('home');
  };

  const handleSelectTranscript = (transcript: any) => {
    setAnalysis(transcript.analysis);
    setActiveTab('dashboard');
  };

  const handleGetStarted = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setActiveTab('upload');
  };

  const handleAdminLogin = (userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setShowAdminLogin(false);
    setActiveTab('admin'); // Go directly to admin tab
  };

  const handleAnalyze = async (formData: FormData) => {
    // Check if user is authenticated
    if (!token && !user) {
      console.warn('⚠️ No authentication - prompting user to sign in');
      setAnalysisError('Please sign in to analyze transcripts');
      setShowAuthModal(true);
      return;
    }
    
    if (!token) {
      console.warn('⚠️ No token available, using demo-token (may fail)');
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStage('Uploading file...');
    setAnalysisError(null);
    
    try {
      // Log FormData contents for debugging
      console.log('📤 Starting analysis request...', { 
        hasToken: !!token, 
        hasUser: !!user,
        tokenLength: token?.length || 0,
        apiUrl: getApiUrl()
      });
      
      // Log FormData entries
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`FormData entry: ${key} = File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`FormData entry: ${key} = ${value}`);
        }
      }
      
      const response = await fetch(`${getApiUrl()}/api/analyze-transcript`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || 'demo-token'}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      });

      console.log('📥 Analysis response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Analysis successful:', result);
        
        // Validate that we got analysis results, not file content
        if (typeof result === 'string' || (!result.summary && !result.objections && !result.actionItems)) {
          console.error('❌ Invalid analysis response - received file content instead of analysis');
          setAnalysisError('Server returned file content instead of analysis. Please try again.');
          setAnalysisStage('Analysis failed');
          return;
        }
        
        // Ensure analysis has required fields
        const analysisResult = {
          summary: result.summary || 'Analysis completed',
          objections: result.objections || [],
          actionItems: result.actionItems || [],
          sentiment: result.sentiment || 'neutral',
          confidence: result.confidence || 75,
          keyTopics: result.keyTopics || [],
          participantCount: result.participantCount || 2,
          ...result // Include any additional fields
        };
        
        console.log('✅ Validated analysis result:', analysisResult);
        setAnalysis(analysisResult);
        setAnalysisStage('Analysis complete');
        setAnalysisProgress(100);
        setAnalysisError(null);
      } else {
        let errorData: any = { error: 'Unknown error occurred' };
        let errorText = '';
        
        try {
          // Try to get the response as text first
          errorText = await response.text();
          console.log('❌ Error response body (raw):', errorText);
          console.log('❌ Error response length:', errorText.length);
          
          if (errorText && errorText.trim().length > 0) {
            try {
              errorData = JSON.parse(errorText);
              console.log('❌ Error response (parsed):', errorData);
            } catch (parseError) {
              // If it's not JSON, use the text as the error message
              console.log('❌ Response is not JSON, using as plain text');
              errorData = { error: errorText };
            }
          } else {
            // Empty response body
            console.warn('⚠️ Empty error response body');
            errorData = { 
              error: `Server returned ${response.status} ${response.statusText} with no error message`,
              code: 'EMPTY_RESPONSE'
            };
          }
        } catch (readError) {
          console.error('❌ Failed to read error response:', readError);
          errorData = { 
            error: `Server error: ${response.status} ${response.statusText}. Could not read error details.`,
            code: 'READ_ERROR'
          };
        }
        
        const errorMessage = errorData.error || errorData.message || `Analysis failed with status ${response.status}`;
        const errorCode = errorData.code || 'UNKNOWN_ERROR';
        
        console.error('❌ Analysis failed:', {
          status: response.status,
          error: errorMessage,
          code: errorCode,
          fullError: errorData
        });
        setAnalysisStage('Analysis failed');
        
        // Provide more helpful error messages based on error code
        let userFriendlyMessage = errorMessage;
        if (errorCode === 'NO_FILE_RECEIVED') {
          userFriendlyMessage = 'No file was received by the server. Please try selecting the file again.';
        } else if (errorCode === 'INVALID_FILE_TYPE') {
          userFriendlyMessage = 'Invalid file type. Please upload a TXT, PDF, DOC, DOCX, or audio file.';
        } else if (errorCode === 'FILE_TOO_LARGE') {
          userFriendlyMessage = 'File is too large. Maximum size is 25MB.';
        } else if (errorCode === 'INVALID_FIELD_NAME') {
          userFriendlyMessage = 'File upload error. Please try again.';
        }
        
        setAnalysisError(userFriendlyMessage);
        
        // If authentication failed, prompt user to sign in
        if (response.status === 401 || response.status === 403) {
          setAnalysisError(`${userFriendlyMessage} Please sign in and try again.`);
          setShowAuthModal(true);
        }
      }
    } catch (error: any) {
      console.error('💥 Analysis network error:', error);
      const errorMessage = error?.message || 'Failed to connect to server. Please check your connection and try again.';
      setAnalysisStage('Analysis failed');
      setAnalysisError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  // Check if current user is admin
  const isAdmin = (user: any) => {
    const adminEmails = [
      'alexfisher@mac.home', 
      'alexfisher.dev@gmail.com',
      'alex@kalm.live',
      'admin@kalm.live',
      // Add your actual email here
    ];
    return user && adminEmails.includes(user.email);
  };

  const allTabs = [
    { id: 'home', name: 'Home', icon: HomeIcon, color: 'blue' },
    { id: 'upload', name: 'Analysis', icon: DocumentTextIcon, color: 'indigo' },
    { id: 'realtime', name: 'Live', icon: BoltIcon, color: 'emerald' },
    { id: 'email', name: 'Email Gen', icon: EnvelopeIcon, color: 'purple' },
    { id: 'chat', name: 'AI Assistant', icon: ChatBubbleLeftRightIcon, color: 'green' },
    { id: 'dashboard', name: 'Analytics', icon: ChartBarIcon, color: 'yellow' },
    { id: 'history', name: 'History', icon: ClockIcon, color: 'red' },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon, color: 'pink' },
    { id: 'collaboration', name: 'Collaboration', icon: UsersIcon, color: 'teal' },
    { id: 'advanced-analytics', name: 'Advanced Analytics', icon: TrophyIcon, color: 'purple' },
    { id: 'usage', name: 'Usage', icon: ChartBarIcon, color: 'yellow' },
    { id: 'admin', name: 'Admin', icon: Cog6ToothIcon, color: 'red' }, // Admin tab
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => {
    if (tab.id === 'admin') {
      return isAdmin(user); // Only show admin tabs to admin users
    }
    return true; // Show all other tabs to everyone
  });

  const TabIcon = ({ icon: Icon, active, color }: { icon: any, active: boolean, color: string }) => (
    <Icon className={`h-5 w-5 transition-all duration-200 ${active ? `text-${color}-600` : 'text-gray-500 group-hover:text-gray-700'}`} />
  );

  const getStatusIndicator = () => {
    if (analysis) {
      return (
        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Transcript Analyzed
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          Ready for Upload
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header with gradient and better styling */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center group">
              <button 
                onClick={() => setActiveTab('home')}
                className="hover:opacity-80 transition-opacity duration-200"
              >
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  KALM
                </h1>
              </button>
            </div>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      Welcome back, {user.firstName}!
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="relative group">
                    <button className="p-3 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-all duration-200">
                      <UserIcon className="h-6 w-6" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:scale-100 scale-95 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                          <div className="font-medium text-gray-700">{user.firstName} {user.lastName}</div>
                          <div className="truncate">{user.email}</div>
                        </div>
                        <button
                          onClick={() => setActiveTab('history')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                        >
                          <ClockIcon className="h-5 w-5 mr-3" />
                          Transcript History
                        </button>
                        <button
                          onClick={() => setActiveTab('dashboard')}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                        >
                          <ChartBarIcon className="h-5 w-5 mr-3" />
                          Analytics Dashboard
                        </button>
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-xl"
                          >
                            <Cog6ToothIcon className="h-5 w-5 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </button>
              )}
              
              {/* Admin Access Button */}
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs with modern design */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`group flex items-center py-3 px-4 border-b-3 font-medium text-sm transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50/50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <TabIcon icon={tab.icon} active={activeTab === tab.id} color={tab.color} />
                <span className="ml-2 font-medium">{tab.name}</span>
                {activeTab === tab.id && (
                  <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with improved layout */}
      {activeTab === 'home' ? (
        <LandingPage 
          onGetStarted={handleGetStarted}
        />
      ) : (
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'upload' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Upload & Analyze Sales Transcripts
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Upload your call recordings or transcripts to get AI-powered insights, objection analysis, and next-step recommendations.
                      </p>
                    </div>
                  </div>
                  {!user && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <SparklesIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-800 font-medium mb-1 text-sm">
                            💡 Sign in to unlock the full power of AI analysis!
                          </p>
                          <p className="text-blue-700 text-xs">
                            Create an account to access transcript history, advanced analytics, team collaboration features, and more.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <AnalysisTab 
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  progress={analysisProgress}
                  stage={analysisStage}
                  analysis={analysis}
                  error={analysisError}
                  onNavigateToEmail={() => setActiveTab('email')}
                  onNavigateToChat={() => setActiveTab('chat')}
                  onNavigateToAnalytics={() => setActiveTab('dashboard')}
                />
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <EnvelopeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Personalized Email Generator
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Generate tailored follow-up emails, proposals, and objection-handling messages based on your transcript analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <EmailGenerator analysis={analysis} />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        AI Sales Assistant
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Chat with your AI assistant to get strategic advice, objection handling tips, and next-step recommendations.
                      </p>
                    </div>
                  </div>
                </div>
                <ChatInterface analysis={analysis} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Transcript History
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Review your previous analyses and track your progress over time.
                      </p>
                    </div>
                  </div>
                </div>
                <TranscriptHistory 
                  onSelectTranscript={handleSelectTranscript}
                  user={user}
                  token={token}
                />
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="animate-fade-in">
                <PricingPage onSelectPlan={handleSelectPlan} />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Analytics Dashboard
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Comprehensive insights from your sales conversation analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <Analytics user={user} token={token} />
              </div>
            )}

            {activeTab === 'realtime' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                      <BoltIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Realtime Dashboard
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Live insights from your sales conversation analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <RealtimeDashboard user={user} />
              </div>
            )}

            {activeTab === 'collaboration' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-lime-600 rounded-lg flex items-center justify-center mr-3">
                      <UsersIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Collaboration
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Collaborate with your team on sales conversations and analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <CollaborationTab currentUser={user} />
              </div>
            )}

            {activeTab === 'advanced-analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <TrophyIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Advanced Analytics
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Advanced analytics and insights from your sales conversation analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <AdvancedAnalytics user={user} token={token} />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <Cog6ToothIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Admin Dashboard
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Manage and monitor system activities.
                      </p>
                    </div>
                  </div>
                </div>
                <AdminDashboard />
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Usage Dashboard
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Track usage and performance metrics.
                      </p>
                    </div>
                  </div>
                </div>
                <UsageDashboard />
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="animate-fade-in">
                <PrivacyPolicy />
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="animate-fade-in">
                <TermsOfService />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer - Show on all pages except admin */}
      {activeTab !== 'admin' && <Footer />}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onAdminLogin={handleAdminLogin}
        />
      )}

      {/* Development Payment Tester */}
      {process.env.NODE_ENV === 'development' && <PaymentTester />}
    </div>
  )
}

export default App
