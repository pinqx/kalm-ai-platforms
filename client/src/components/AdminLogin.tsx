import React, { useState } from 'react';
import { getApiUrl } from '../config';

interface AdminLoginProps {
  onAdminLogin: (user: any, token: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create admin user and get credentials
      const response = await fetch(`${getApiUrl()}/api/debug/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store credentials
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent handler
        onAdminLogin(data.user, data.token);
        
      } else {
        // Fallback to manual admin setup
        const adminUser = {
          id: 'admin-' + Date.now(),
          email: 'alex@kalm.live',
          firstName: 'Alex',
          lastName: 'Fisher',
          fullName: 'Alex Fisher',
          role: 'admin',
          company: 'KALM AI',
          subscription: {
            planId: 'enterprise',
            status: 'active'
          }
        };

        const mockToken = 'admin-token-' + Date.now();
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        onAdminLogin(adminUser, mockToken);
      }
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      setError('Failed to setup admin login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-600">Setup admin credentials for platform management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Admin Email</h3>
            <p className="text-blue-700">alex@kalm.live</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Access Level</h3>
            <p className="text-green-700">Enterprise (Unlimited)</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleAdminLogin}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Setup Admin Access'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This will create/update admin user with enterprise privileges
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 