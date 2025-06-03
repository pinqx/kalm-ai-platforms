import React, { useState } from 'react';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ChartBarIcon,
  LinkIcon,
  PlayIcon,
  PauseIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface AutomationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  estimatedTime: string;
  category: 'linkedin' | 'email' | 'integration';
}

const AutomationSetup: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'overview' | 'linkedin' | 'email' | 'integration'>('overview');
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([
    {
      id: 'linkedin-account',
      title: 'Connect LinkedIn Account',
      description: 'Connect your LinkedIn account to enable automated prospecting and outreach',
      status: 'pending',
      estimatedTime: '5 minutes',
      category: 'linkedin'
    },
    {
      id: 'linkedin-search',
      title: 'Setup Search Criteria',
      description: 'Define your ideal customer profile and search parameters',
      status: 'pending',
      estimatedTime: '10 minutes',
      category: 'linkedin'
    },
    {
      id: 'email-provider',
      title: 'Connect Email Provider',
      description: 'Connect Gmail, Outlook, or SMTP for automated email sending',
      status: 'pending',
      estimatedTime: '5 minutes',
      category: 'email'
    },
    {
      id: 'email-templates',
      title: 'Create Email Sequences',
      description: 'Setup your email templates and follow-up sequences',
      status: 'pending',
      estimatedTime: '15 minutes',
      category: 'email'
    },
    {
      id: 'crm-integration',
      title: 'CRM Integration',
      description: 'Connect with Salesforce, HubSpot, or Pipedrive to sync leads',
      status: 'pending',
      estimatedTime: '10 minutes',
      category: 'integration'
    },
    {
      id: 'webhook-setup',
      title: 'Webhook Configuration',
      description: 'Setup webhooks for real-time lead notifications',
      status: 'pending',
      estimatedTime: '5 minutes',
      category: 'integration'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStepStatus = (stepId: string, newStatus: AutomationStep['status']) => {
    setAutomationSteps(steps => 
      steps.map(step => 
        step.id === stepId ? { ...step, status: newStatus } : step
      )
    );
  };

  const filteredSteps = activeCategory === 'overview' 
    ? automationSteps 
    : automationSteps.filter(step => step.category === activeCategory);

  const completedSteps = automationSteps.filter(step => step.status === 'completed').length;
  const totalSteps = automationSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Automation Setup</h2>
            <p className="text-gray-600 text-sm">Configure LinkedIn prospecting and email automation to scale your outreach</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{completedSteps}/{totalSteps}</div>
              <div className="text-sm text-gray-500">Steps Complete</div>
            </div>
            <div className="w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercentage}, 100`}
                  className="text-blue-600"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Start Guide</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
            <span className="text-gray-700">Connect LinkedIn & Email accounts</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
            <span className="text-gray-700">Setup targeting & email templates</span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
            <span className="text-gray-700">Launch automated campaigns</span>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'linkedin', name: 'LinkedIn Setup', icon: UserGroupIcon },
              { id: 'email', name: 'Email Automation', icon: EnvelopeIcon },
              { id: 'integration', name: 'Integrations', icon: LinkIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeCategory === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* LinkedIn Setup */}
          {activeCategory === 'linkedin' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Automation Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Recommended: Phantombuster</h4>
                    <p className="text-sm text-gray-600 mb-3">Professional LinkedIn automation with advanced safety features</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• Search & extract LinkedIn profiles</li>
                      <li>• Send connection requests</li>
                      <li>• Automated messaging sequences</li>
                      <li>• Built-in safety limits</li>
                    </ul>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm w-full">
                      Setup Phantombuster ($59/month)
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Alternative: LinkedHelper</h4>
                    <p className="text-sm text-gray-600 mb-3">Chrome extension for LinkedIn automation</p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• Chrome browser extension</li>
                      <li>• Profile visiting & messaging</li>
                      <li>• Connection automation</li>
                      <li>• Lower cost option</li>
                    </ul>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm w-full">
                      Setup LinkedHelper ($15/month)
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">LinkedIn Safety Guidelines</h4>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Maximum 50-100 connection requests per day</li>
                      <li>• 24-48 hour delays between messages</li>
                      <li>• Personalize messages to avoid spam detection</li>
                      <li>• Monitor account health regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Automation */}
          {activeCategory === 'email' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Automation Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">SendGrid</h4>
                    <p className="text-sm text-gray-600 mb-3">Reliable email delivery with high reputation</p>
                    <div className="text-sm text-gray-600 mb-3">$14.95/month for 50k emails</div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm w-full">
                      Setup SendGrid
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Mailgun</h4>
                    <p className="text-sm text-gray-600 mb-3">Developer-friendly with good deliverability</p>
                    <div className="text-sm text-gray-600 mb-3">$35/month for 50k emails</div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm w-full">
                      Setup Mailgun
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Gmail SMTP</h4>
                    <p className="text-sm text-gray-600 mb-3">Use your existing Gmail account</p>
                    <div className="text-sm text-gray-600 mb-3">Free (500 emails/day)</div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm w-full">
                      Setup Gmail
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Sequence Strategy</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Initial Contact (Day 0)</h4>
                      <p className="text-sm text-gray-600">Personalized intro mentioning their company and role. Include value proposition.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Follow-up #1 (Day 4)</h4>
                      <p className="text-sm text-gray-600">Ask a relevant question about their current challenges. Keep it brief.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Follow-up #2 (Day 8)</h4>
                      <p className="text-sm text-gray-600">Share a relevant case study or success story. Provide social proof.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                    <div>
                      <h4 className="font-medium text-gray-900">Final Follow-up (Day 14)</h4>
                      <p className="text-sm text-gray-600">Soft breakup email. Offer to stay in touch for future opportunities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Overview */}
          {activeCategory === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
              
              <div className="space-y-4">
                {filteredSteps.map((step) => (
                  <div key={step.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(step.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                              {step.status.charAt(0).toUpperCase() + step.status.slice(1).replace('-', ' ')}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {step.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {step.status === 'pending' && (
                          <button
                            onClick={() => updateStepStatus(step.id, 'in-progress')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Start Setup
                          </button>
                        )}
                        {step.status === 'in-progress' && (
                          <button
                            onClick={() => updateStepStatus(step.id, 'completed')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            Mark Complete
                          </button>
                        )}
                        {step.status === 'completed' && (
                          <span className="text-green-600 text-sm font-medium">✓ Complete</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeCategory === 'integration' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">CRM & Tool Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Supported CRMs</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">Salesforce</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">HubSpot</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">Pipedrive</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Notification Channels</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">Slack</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">Discord</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Connect</button>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <span className="font-medium">Webhooks</span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Setup</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {progressPercentage === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Setup Complete!</h3>
                <p className="text-green-700">Your automation system is ready to start generating leads.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center">
                <PlayIcon className="h-5 w-5 mr-2" />
                Launch Campaign
              </button>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationSetup; 