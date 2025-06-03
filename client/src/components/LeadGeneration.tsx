import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  LinkIcon,
  UserPlusIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  linkedinUrl: string;
  status: 'new' | 'contacted' | 'responded' | 'converted' | 'rejected';
  source: 'linkedin' | 'website' | 'referral';
  addedDate: string;
  lastContactDate?: string;
  notes: string;
  score: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'initial' | 'followup1' | 'followup2' | 'followup3';
  openRate: number;
  responseRate: number;
}

const LeadGeneration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'templates' | 'tracking' | 'compliance'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock leads data - for manual tracking only
    setLeads([
      {
        id: '1',
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@techcorp.com',
        company: 'TechCorp Solutions',
        position: 'VP of Sales',
        linkedinUrl: 'https://linkedin.com/in/sarahmitchell',
        status: 'new',
        source: 'linkedin',
        addedDate: '2024-01-15',
        notes: 'Found via LinkedIn search - 20+ person sales team, SaaS company',
        score: 92
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        email: 'mike.r@salesforce.com',
        company: 'SalesForce Industries',
        position: 'Sales Director',
        linkedinUrl: 'https://linkedin.com/in/mikerodriguez',
        status: 'contacted',
        source: 'linkedin',
        addedDate: '2024-01-14',
        lastContactDate: '2024-01-15',
        notes: 'Manually reached out via LinkedIn - positive response',
        score: 88
      },
      {
        id: '3',
        name: 'Jennifer Chen',
        email: 'j.chen@startupville.io',
        company: 'StartupVille',
        position: 'Head of Revenue',
        linkedinUrl: 'https://linkedin.com/in/jenniferchen',
        status: 'responded',
        source: 'linkedin',
        addedDate: '2024-01-13',
        lastContactDate: '2024-01-16',
        notes: 'Interested in demo - scheduled for next week',
        score: 95
      }
    ]);

    // Email templates for manual sending
    setTemplates([
      {
        id: '1',
        name: 'Initial LinkedIn Message',
        subject: 'AI Sales Intelligence for [COMPANY NAME]',
        content: `Hi [FIRST NAME],

I noticed you're leading sales at [COMPANY NAME] and thought you might be interested in how AI is helping sales teams improve their call analysis and coaching.

At KALM, we help teams like yours:
• Get instant insights from every sales conversation
• Identify missed objections and opportunities
• Scale coaching across the entire team

Would you be open to a quick 15-minute conversation about how this could help [COMPANY NAME]'s sales performance?

Best regards,
Alex Fisher
Founder, KALM AI`,
        type: 'initial',
        openRate: 0, // Manual tracking
        responseRate: 0
      },
      {
        id: '2',
        name: 'Follow-up Message',
        subject: 'Quick follow-up - AI sales coaching for [COMPANY NAME]',
        content: `Hi [FIRST NAME],

I wanted to follow up on my previous message about AI-powered sales coaching.

I noticed [COMPANY NAME] has been growing rapidly, and many fast-growing companies struggle with:
• Inconsistent sales messaging across the team
• Difficulty scaling coaching to all reps
• Missing key insights from customer conversations

KALM AI solves these exact problems. Would you be interested in seeing a quick 15-minute demo of how it works?

Best,
Alex Fisher
KALM AI`,
        type: 'followup1',
        openRate: 0,
        responseRate: 0
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Warning Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Manual Outreach Tool - Compliance Required</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p><strong>This tool is for organizing MANUAL outreach only.</strong> All communication must be done personally by you.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="font-medium">✅ What's Safe:</p>
                  <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                    <li>Manual LinkedIn connections</li>
                    <li>Personal email sending</li>
                    <li>Lead tracking and notes</li>
                    <li>Template organization</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">❌ What's Prohibited:</p>
                  <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                    <li>Automated LinkedIn actions</li>
                    <li>Mass email automation</li>
                    <li>Profile scraping tools</li>
                    <li>Bulk connection requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Manual Lead Management System</h2>
            <p className="text-gray-600 text-sm">Organize and track your personal LinkedIn outreach for KALM AI customer acquisition</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center text-sm">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-medium">Compliance Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Manual Outreach Today</p>
              <p className="text-2xl font-bold text-gray-900">0/10</p>
              <p className="text-xs text-gray-500">Daily goal</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">33%</p>
              <p className="text-xs text-gray-500">Manual tracking</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Demos Booked</p>
              <p className="text-2xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'leads', name: 'Lead Tracking', icon: UserGroupIcon },
              { id: 'templates', name: 'Message Templates', icon: DocumentTextIcon },
              { id: 'tracking', name: 'Outreach Tracker', icon: ChartBarIcon },
              { id: 'compliance', name: 'Compliance Guide', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
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
          {/* Lead Tracking Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Manual Lead Tracking</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">💡 Manual LinkedIn Prospecting Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Search LinkedIn for "VP Sales" + "SaaS" + "50-500 employees"</li>
                  <li>• Send 5-10 personal connection requests daily</li>
                  <li>• Wait 3-7 days after connection before messaging</li>
                  <li>• Keep messages personalized and specific to their company</li>
                  <li>• Track all interactions manually in this system</li>
                </ul>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              <div className="text-xs text-gray-500">{lead.email}</div>
                              <div className="text-xs text-gray-400">{lead.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${lead.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{lead.score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate">{lead.notes}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => window.open(lead.linkedinUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-900 text-xs hover:underline"
                          >
                            View LinkedIn
                          </button>
                          <button 
                            onClick={() => alert(`Update notes for ${lead.name}\n\nCurrent notes: ${lead.notes}\n\n(In a real app, this would open an edit modal)`)}
                            className="text-green-600 hover:text-green-900 text-xs hover:underline"
                          >
                            Update Notes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Message Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Message Templates (For Manual Use)</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">📝 How to Use Templates</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Copy template content manually</li>
                  <li>• Replace [FIRST NAME] and [COMPANY NAME] with actual names</li>
                  <li>• Personalize each message before sending</li>
                  <li>• Send via LinkedIn or personal email client</li>
                  <li>• Track responses manually in the system</li>
                </ul>
              </div>

              <div className="grid gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(template.content);
                          alert('Template copied to clipboard! Remember to replace [FIRST NAME] and [COMPANY NAME] with actual values.');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors duration-200"
                      >
                        📋 Copy Template
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Subject: {template.subject}</div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{template.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">LinkedIn & Email Compliance Guide</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Safe Manual Practices
                  </h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• Send 5-10 LinkedIn connections daily</li>
                    <li>• Personalize every message</li>
                    <li>• Wait 3-7 days between touchpoints</li>
                    <li>• Use your personal LinkedIn account</li>
                    <li>• Send emails from your business email</li>
                    <li>• Include unsubscribe options</li>
                    <li>• Respect "no" responses immediately</li>
                    <li>• Keep detailed manual records</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-medium text-red-900 mb-4 flex items-center">
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Prohibited Activities
                  </h4>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• Automated LinkedIn tools</li>
                    <li>• Mass connection requests</li>
                    <li>• Profile scraping software</li>
                    <li>• Bulk email automation</li>
                    <li>• Generic mass messaging</li>
                    <li>• Ignoring opt-out requests</li>
                    <li>• Using fake profiles</li>
                    <li>• Exceeding LinkedIn limits</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">📋 Recommended Tools for Manual Outreach</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <p className="font-medium">LinkedIn Sales Navigator</p>
                    <p>Advanced search and lead discovery</p>
                  </div>
                  <div>
                    <p className="font-medium">Google Sheets/Excel</p>
                    <p>Manual lead tracking and notes</p>
                  </div>
                  <div>
                    <p className="font-medium">Personal Email Client</p>
                    <p>Gmail, Outlook for direct emails</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Manual Outreach Tracker</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">📊 Track Your Daily Progress</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-gray-900 mb-2">Today's Goals</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>☐ 5 LinkedIn connection requests</li>
                      <li>☐ 3 follow-up messages</li>
                      <li>☐ Update lead notes</li>
                      <li>☐ Research 10 new prospects</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-gray-900 mb-2">This Week</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>📞 2 Demo calls scheduled</li>
                      <li>📧 15 Emails sent</li>
                      <li>🤝 25 LinkedIn connections</li>
                      <li>💬 8 Responses received</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-gray-900 mb-2">This Month</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>🎯 Goal: 10 demos</li>
                      <li>📈 Progress: 6/10</li>
                      <li>📊 Response rate: 32%</li>
                      <li>💰 Potential value: $85k</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Activity Log</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Connected with Sarah Mitchell</p>
                      <p className="text-sm text-gray-600">VP of Sales at TechCorp - Sent personalized message</p>
                    </div>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Follow-up email sent</p>
                      <p className="text-sm text-gray-600">Mike Rodriguez - Case study shared</p>
                    </div>
                    <span className="text-xs text-gray-500">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Demo scheduled! 🎉</p>
                      <p className="text-sm text-green-700">Jennifer Chen - Next Tuesday 2PM</p>
                    </div>
                    <span className="text-xs text-gray-500">Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadGeneration; 