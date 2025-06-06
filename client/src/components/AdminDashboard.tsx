import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  EnvelopeIcon,
  CogIcon,
  EyeIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { getApiUrl } from '../config';

// Admin Authentication Component
const AdminLogin: React.FC<{ onAuthenticate: (email: string) => void }> = ({ onAuthenticate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const AUTHORIZED_ADMIN_EMAILS = [
    'alexfisher@mac.home',
    'alexfisher.dev@gmail.com', 
    'alex@kalm.live',
    'admin@kalm.live'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if email is authorized
    if (!AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('Unauthorized email address. Admin access is restricted.');
      setLoading(false);
      return;
    }

    // For demo purposes, use a simple password check
    // In production, this would connect to your auth system
    if (password === 'kalm2024admin' || password === 'admin123') {
      // Store admin session
      localStorage.setItem('kalm_admin_session', JSON.stringify({
        email: email,
        timestamp: Date.now(),
        role: 'admin'
      }));
      onAuthenticate(email);
    } else {
      setError('Invalid password. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <ShieldCheckIcon className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please authenticate with your authorized admin credentials
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="admin-email" className="sr-only">
                Email address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="sr-only">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <LockClosedIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-red-500 group-hover:text-red-400" aria-hidden="true" />
              </span>
              {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Restricted access - Authorized personnel only
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  subscription: {
    planId: string;
    status: string;
  };
  createdAt: string;
  lastLogin: string;
  usage: {
    monthly: number;
    daily: number;
    total: number;
  };
}

interface AdminData {
  users: User[];
  totalUsers: number;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  summary: {
    totalUsers: number;
    activeSubscriptions: number;
    freeUsers: number;
    monthlyRevenue: number;
    avgEngagement?: number;
    peakHours?: number[];
  };
}

// Realistic bot simulation data from our recent simulation
const BOT_SIMULATION_DATA: AdminData = {
  users: [
    {
      _id: 'sim-dce4yx3fo',
      email: 'sarah.johnson@techcorp.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      company: 'TechCorp Solutions',
      subscription: { planId: 'professional', status: 'active' },
      createdAt: '2025-05-19T07:06:51.295Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 18, daily: 3, total: 54 }
    },
    {
      _id: 'sim-osniweiim',
      email: 'mike.r@salesforce.com',
      firstName: 'Mike',
      lastName: 'Rodriguez',
      company: 'SalesForce Industries',
      subscription: { planId: 'enterprise', status: 'active' },
      createdAt: '2025-05-22T17:44:30.204Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 28, daily: 4, total: 84 }
    },
    {
      _id: 'sim-efil4p64t',
      email: 'j.chen@startupville.io',
      firstName: 'Jennifer',
      lastName: 'Chen',
      company: 'StartupVille',
      subscription: { planId: 'starter', status: 'active' },
      createdAt: '2025-05-21T20:36:04.889Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 12, daily: 2, total: 36 }
    },
    {
      _id: 'sim-wcqwj3i3r',
      email: 'dthompson@enterprise.net',
      firstName: 'David',
      lastName: 'Thompson',
      company: 'Enterprise Networks',
      subscription: { planId: 'professional', status: 'active' },
      createdAt: '2025-06-03T12:41:46.689Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 16, daily: 2, total: 48 }
    },
    {
      _id: 'sim-vfq1io2yn',
      email: 'lisa@consultingpro.com',
      firstName: 'Lisa',
      lastName: 'Park',
      company: 'Consulting Pro',
      subscription: { planId: 'starter', status: 'active' },
      createdAt: '2025-05-17T11:51:04.921Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 4, daily: 1, total: 12 }
    },
    {
      _id: 'sim-x4s5uk6ui',
      email: 'rwilliams@bigsales.com',
      firstName: 'Robert',
      lastName: 'Williams',
      company: 'Big Sales Corp',
      subscription: { planId: 'enterprise', status: 'active' },
      createdAt: '2025-05-12T18:39:54.394Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 27, daily: 4, total: 81 }
    },
    {
      _id: 'sim-gh7cbw1mx',
      email: 'e.davis@mediumco.com',
      firstName: 'Emily',
      lastName: 'Davis',
      company: 'Medium Company Inc',
      subscription: { planId: 'professional', status: 'active' },
      createdAt: '2025-05-30T20:00:26.402Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 8, daily: 1, total: 24 }
    },
    {
      _id: 'sim-cb2sgju34',
      email: 'alex.kim@techstartup.io',
      firstName: 'Alex',
      lastName: 'Kim',
      company: 'Tech Startup',
      subscription: { planId: 'starter', status: 'active' },
      createdAt: '2025-05-16T19:43:44.262Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 9, daily: 1, total: 27 }
    },
    {
      _id: 'sim-1vttp63tn',
      email: 'm.garcia@globalcorp.com',
      firstName: 'Maria',
      lastName: 'Garcia',
      company: 'Global Corp',
      subscription: { planId: 'enterprise', status: 'active' },
      createdAt: '2025-05-17T13:49:11.079Z',
      lastLogin: '2025-06-03T20:32:08.193Z',
      usage: { monthly: 18, daily: 3, total: 54 }
    },
    {
      _id: 'sim-3fs08g8bo',
      email: 'james@smallbiz.com',
      firstName: 'James',
      lastName: 'Wilson',
      company: 'Small Business LLC',
      subscription: { planId: 'starter', status: 'active' },
      createdAt: '2025-05-10T06:35:35.485Z',
      lastLogin: '2025-06-03T20:32:08.194Z',
      usage: { monthly: 4, daily: 1, total: 12 }
    }
  ],
  totalUsers: 10,
  pagination: { current: 1, pages: 1, total: 10 },
  summary: {
    totalUsers: 10,
    activeSubscriptions: 6, // Professional + Enterprise users
    freeUsers: 4, // Starter plan users
    monthlyRevenue: 800, // 3×$149 + 3×$79 + 4×$29 = $447 + $237 + $116 = $800
    avgEngagement: 14.4, // Average activities per user
    peakHours: [9, 10, 14, 15, 16]
  }
};

const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('kalm_admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (Date.now() - session.timestamp < oneHour) {
          setIsAuthenticated(true);
          setAdminEmail(session.email);
        } else {
          // Session expired
          localStorage.removeItem('kalm_admin_session');
        }
      } catch (error) {
        localStorage.removeItem('kalm_admin_session');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleAuthenticate = (email: string) => {
    setIsAuthenticated(true);
    setAdminEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('kalm_admin_session');
    setIsAuthenticated(false);
    setAdminEmail('');
  };

  // If not authenticated, show admin login
  if (!isAuthenticated) {
    return <AdminLogin onAuthenticate={handleAuthenticate} />;
  }

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${getApiUrl()}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('Failed to load admin data');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAdminData(data);
      setUsingMockData(false);
    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'starter': return 'bg-green-100 text-green-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !adminData) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-700">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor user activity and platform metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Admin: {adminEmail}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CogIcon className="h-4 w-4 text-gray-400" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LockClosedIcon className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminData.summary.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{adminData.summary.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(adminData.summary.monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Free Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminData.summary.freeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Metrics</h3>
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {adminData.summary.totalUsers > 0 
                ? Math.round((adminData.summary.activeSubscriptions / adminData.summary.totalUsers) * 100)
                : 0}%
            </p>
            <p className="text-xs text-gray-500">Free to Paid</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Revenue Per User</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(adminData.summary.totalUsers > 0 
                ? adminData.summary.monthlyRevenue / adminData.summary.totalUsers 
                : 0)}
            </p>
            <p className="text-xs text-gray-500">Monthly ARPU</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Growth Potential</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(adminData.summary.freeUsers * 79)}
            </p>
            <p className="text-xs text-gray-500">If all free users upgrade to Pro</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Directory</h3>
          <p className="text-sm text-gray-600">Platform users from bot simulation - showing realistic usage patterns</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Analytics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminData.users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          {user.lastName?.charAt(0) || ''}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.company && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            {user.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(user.subscription.planId)}`}>
                        {user.subscription.planId.charAt(0).toUpperCase() + user.subscription.planId.slice(1)}
                      </span>
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscription.status)}`}>
                          {user.subscription.status.charAt(0).toUpperCase() + user.subscription.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <ChartBarIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="font-semibold text-gray-900">{user.usage.monthly}</span>
                        <span className="text-gray-500 ml-1">this month</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{user.usage.daily} today • {user.usage.total} total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min((user.usage.monthly / 30) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>{formatDate(user.createdAt)}</div>
                      <div className="text-xs text-gray-400">
                        {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>{formatDate(user.lastLogin)}</div>
                      <div className="flex items-center text-xs">
                        <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
                        <span className="text-green-600">Recently active</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(
                          user.subscription.planId === 'starter' ? 29 :
                          user.subscription.planId === 'professional' ? 79 :
                          user.subscription.planId === 'enterprise' ? 149 : 0
                        )}
                      </div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-gray-600">Total: {adminData.totalUsers} users</span>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-gray-600">Monthly Revenue: {formatCurrency(adminData.summary.monthlyRevenue)}</span>
              </div>
              {adminData.summary.avgEngagement && (
                <div className="flex items-center">
                  <ChartBarIcon className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-gray-600">Avg Engagement: {adminData.summary.avgEngagement.toFixed(1)} activities/user</span>
                </div>
              )}
            </div>
            <div className="text-gray-500">
              Showing {adminData.users.length} of {adminData.totalUsers}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Insights */}
      {adminData.summary.peakHours && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Insights</h3>
            <EyeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Peak Usage Hours</h4>
              <div className="flex items-center space-x-2">
                {adminData.summary.peakHours.map((hour, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {hour}:00
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Times when users are most active</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">User Behavior Patterns</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Enterprise users avg:</span>
                  <span className="font-medium">24.3 activities/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Professional users avg:</span>
                  <span className="font-medium">14.0 activities/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Starter users avg:</span>
                  <span className="font-medium">7.3 activities/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 