import React from 'react';
import { ShieldCheckIcon, LockClosedIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <ShieldCheckIcon className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Protecting your data is our priority</p>
          <p className="text-sm text-gray-500 mt-2">Last updated: June 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              AI Sales Platform ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
              sales analysis platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="h-6 w-6 mr-2 text-blue-600" />
              2. Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Email address and name (for account creation)</li>
                  <li>Company information (optional)</li>
                  <li>Contact preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Transcript files and analysis results</li>
                  <li>Platform usage analytics</li>
                  <li>Performance metrics and insights</li>
                  <li>Chat and collaboration data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Technical Data</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP addresses and device information</li>
                  <li>Browser type and version</li>
                  <li>Session data and cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Service Delivery</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Process and analyze transcripts</li>
                  <li>• Generate insights and reports</li>
                  <li>• Provide AI-powered recommendations</li>
                  <li>• Enable collaboration features</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Platform Improvement</h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Improve AI algorithms</li>
                  <li>• Enhance user experience</li>
                  <li>• Develop new features</li>
                  <li>• Monitor system performance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <LockClosedIcon className="h-6 w-6 mr-2 text-green-600" />
              4. Data Protection & Security
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Encryption</h3>
                  <p className="text-green-800 text-sm">All data is encrypted in transit and at rest using industry-standard encryption.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Access Control</h3>
                  <p className="text-green-800 text-sm">Strict access controls and authentication mechanisms protect your data.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Secure Infrastructure</h3>
                  <p className="text-green-800 text-sm">Hosted on enterprise-grade cloud infrastructure with 24/7 monitoring.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Data Minimization</h3>
                  <p className="text-green-800 text-sm">We only collect and retain data necessary for service functionality.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">OpenAI</h3>
                <p className="text-gray-600 text-sm">We use OpenAI's API for transcript analysis. Data is processed according to OpenAI's privacy policy.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">MongoDB Atlas</h3>
                <p className="text-gray-600 text-sm">Database services provided by MongoDB with enterprise-grade security and compliance.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">Analytics</h3>
                <p className="text-gray-600 text-sm">Anonymous usage analytics to improve our service (you can opt-out).</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-6 w-6 mr-2 text-purple-600" />
              6. Your Rights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Access & Portability</h3>
                <p className="text-purple-800 text-sm">Request copies of your data in a portable format.</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Correction</h3>
                <p className="text-purple-800 text-sm">Update or correct inaccurate personal information.</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Deletion</h3>
                <p className="text-purple-800 text-sm">Request deletion of your account and associated data.</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Opt-Out</h3>
                <p className="text-purple-800 text-sm">Withdraw consent for certain data processing activities.</p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Account Data:</span>
                  <span className="text-gray-600">Retained while account is active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Transcript Data:</span>
                  <span className="text-gray-600">Retained for 2 years or until deletion</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Analytics Data:</span>
                  <span className="text-gray-600">Aggregated data retained indefinitely</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Backup Data:</span>
                  <span className="text-gray-600">Removed within 30 days of deletion</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact & Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact & Updates</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-2 text-blue-800">
                <p><strong>Email:</strong> privacy@aisalesplatform.com</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Response Time:</strong> We respond to all requests within 72 hours</p>
              </div>
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Policy Updates:</strong> We will notify you via email of any material changes to this Privacy Policy. 
                  Continued use of the platform constitutes acceptance of updated terms.
                </p>
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Compliance</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">GDPR</div>
                <p className="text-gray-600 text-sm">European data protection compliance</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">CCPA</div>
                <p className="text-gray-600 text-sm">California privacy rights protection</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">SOC 2</div>
                <p className="text-gray-600 text-sm">Security and availability standards</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of June 2025 and was last updated on June 2, 2025.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 