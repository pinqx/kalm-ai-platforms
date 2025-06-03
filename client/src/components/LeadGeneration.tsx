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
  BoltIcon
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

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  templates: string[];
  leads: string[];
  dailyLimit: number;
  sentToday: number;
  totalSent: number;
  responses: number;
  conversions: number;
  createdDate: string;
}

const LeadGeneration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leads' | 'templates' | 'campaigns' | 'analytics'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Mock leads data
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
        notes: 'High-potential lead, manages 20+ person sales team',
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
        notes: 'Responded positively to initial outreach',
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
        notes: 'Interested in demo, scheduled for next week',
        score: 95
      }
    ]);

    // Mock email templates
    setTemplates([
      {
        id: '1',
        name: 'Initial LinkedIn Outreach',
        subject: 'Transform your sales team performance with AI - {{company}}',
        content: `Hi {{firstName}},

I noticed you're leading sales at {{company}} and thought you'd be interested in how AI is transforming sales performance.

At KALM, we help sales teams like yours:
• Increase close rates by 25%
• Reduce coaching time by 60%
• Get instant insights from every sales conversation

We've helped companies like TechCorp and GrowthCo see measurable improvements within 30 days.

Would you be open to a 15-minute demo to see how this could impact {{company}}'s sales performance?

Best regards,
Alex Fisher
Founder, KALM AI

P.S. We're offering a free 14-day trial with no setup required.`,
        type: 'initial',
        openRate: 68,
        responseRate: 24
      },
      {
        id: '2',
        name: 'Follow-up #1',
        subject: 'Quick question about {{company}}\'s sales coaching',
        content: `Hi {{firstName}},

I sent a note last week about how AI can help sales teams improve performance.

Quick question: How much time does your team currently spend on sales coaching and call reviews?

Most of our clients were spending 5-10 hours per week before KALM. Now they get the same insights instantly after every call.

Worth a quick 15-minute conversation to see if this could help {{company}}?

Best,
Alex`,
        type: 'followup1',
        openRate: 72,
        responseRate: 18
      },
      {
        id: '3',
        name: 'Follow-up #2 - Case Study',
        subject: 'How TechCorp increased sales by 35% with AI',
        content: `Hi {{firstName}},

Thought you'd find this interesting - one of our clients, TechCorp, just shared their results after 3 months with KALM:

✅ 35% increase in close rates
✅ 60% reduction in coaching time
✅ $2M+ additional revenue attributed to better call insights

The VP of Sales said: "KALM helped us identify objections we were missing and coach our team more effectively."

Would love to show you how similar results could work for {{company}}.

Available for a quick call this week?

Best,
Alex

P.S. Happy to send over the full case study if you're interested.`,
        type: 'followup2',
        openRate: 65,
        responseRate: 22
      }
    ]);

    // Mock campaigns
    setCampaigns([
      {
        id: '1',
        name: 'LinkedIn Sales Leaders Q1 2024',
        status: 'active',
        templates: ['1', '2', '3'],
        leads: ['1', '2', '3'],
        dailyLimit: 50,
        sentToday: 23,
        totalSent: 1247,
        responses: 89,
        conversions: 12,
        createdDate: '2024-01-01'
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Lead Generation & Automation</h2>
            <p className="text-gray-600 text-sm">Automate LinkedIn outreach and email sequences to scale your customer acquisition</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-700 font-medium">System Active</span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm">
              <BoltIcon className="h-4 w-4 mr-2" />
              Quick Setup
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent Today</p>
              <p className="text-2xl font-bold text-gray-900">23/50</p>
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
              <p className="text-2xl font-bold text-gray-900">22.8%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'leads', name: 'Lead Management', icon: UserGroupIcon },
              { id: 'templates', name: 'Email Templates', icon: EnvelopeIcon },
              { id: 'campaigns', name: 'Campaigns', icon: PlayIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
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
          {/* Lead Management Tab */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
                <div className="flex items-center space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    Import from LinkedIn
                  </button>
                  <button 
                    onClick={() => setShowAddLead(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Lead
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.addedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <LinkIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                <button 
                  onClick={() => setShowAddTemplate(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{template.openRate}%</div>
                          <div>Open Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{template.responseRate}%</div>
                          <div>Response Rate</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-900 mb-2">Subject: {template.subject}</div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{template.content.substring(0, 200)}...</div>
                    </div>
                    <div className="mt-4 flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">Duplicate</button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">Preview</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
                <button 
                  onClick={() => setShowAddCampaign(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Campaign
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-800">
                          <PlayIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-800">
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{campaign.totalSent}</div>
                        <div className="text-sm text-gray-500">Total Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{campaign.responses}</div>
                        <div className="text-sm text-gray-500">Responses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{campaign.conversions}</div>
                        <div className="text-sm text-gray-500">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{campaign.sentToday}/{campaign.dailyLimit}</div>
                        <div className="text-sm text-gray-500">Today's Quota</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{Math.round((campaign.responses / campaign.totalSent) * 100)}%</div>
                        <div className="text-sm text-gray-500">Response Rate</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(campaign.createdDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">Edit</button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">Clone</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Leads Generated</p>
                      <p className="text-3xl font-bold">1,247</p>
                    </div>
                    <UserGroupIcon className="h-12 w-12 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Conversion Rate</p>
                      <p className="text-3xl font-bold">9.6%</p>
                    </div>
                    <ChartBarIcon className="h-12 w-12 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Revenue Generated</p>
                      <p className="text-3xl font-bold">$2,847</p>
                    </div>
                    <UserPlusIcon className="h-12 w-12 text-purple-200" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Campaign Performance</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Open Rate</span>
                    <span className="text-sm font-medium text-gray-900">68.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68.2%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-sm font-medium text-gray-900">22.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '22.8%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium text-gray-900">9.6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '9.6%' }}></div>
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