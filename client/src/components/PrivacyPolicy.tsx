import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Personal Information:</strong> When you create an account, we collect your name, email address, and payment information.</p>
                <p><strong>Usage Data:</strong> We collect information about how you use our service, including uploaded transcripts, analysis results, and interaction patterns.</p>
                <p><strong>Technical Data:</strong> We automatically collect IP addresses, browser type, device information, and usage analytics.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Service Provision:</strong> To provide and maintain our AI sales analysis service.</p>
                <p><strong>Improvement:</strong> To improve our algorithms and user experience.</p>
                <p><strong>Communication:</strong> To send you service updates, security alerts, and support messages.</p>
                <p><strong>Billing:</strong> To process payments and manage your subscription.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Processing and AI</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Transcript Analysis:</strong> Your uploaded transcripts are processed by OpenAI's API to generate sales insights and recommendations.</p>
                <p><strong>Data Retention:</strong> Analysis results are stored securely and can be deleted upon request.</p>
                <p><strong>No Training:</strong> We do not use your data to train our own AI models.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols.</p>
                <p><strong>Access Control:</strong> Strict access controls limit who can access your data.</p>
                <p><strong>Regular Audits:</strong> We conduct regular security audits and updates.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Sharing</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Third-Party Services:</strong> We use OpenAI for AI processing and Stripe for payments. These services have their own privacy policies.</p>
                <p><strong>Legal Requirements:</strong> We may share data if required by law or to protect our rights.</p>
                <p><strong>No Sale:</strong> We never sell your personal information to third parties.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Access:</strong> You can access and download your data at any time.</p>
                <p><strong>Deletion:</strong> You can request deletion of your account and all associated data.</p>
                <p><strong>Correction:</strong> You can update your personal information in your account settings.</p>
                <p><strong>Portability:</strong> You can export your data in a machine-readable format.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-600">
                <p><strong>Essential Cookies:</strong> We use cookies necessary for the service to function.</p>
                <p><strong>Analytics:</strong> We use analytics to understand usage patterns and improve our service.</p>
                <p><strong>Opt-out:</strong> You can disable cookies in your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. International Transfers</h2>
              <div className="space-y-4 text-gray-600">
                <p>Your data may be processed in countries other than your own. We ensure adequate protection through standard contractual clauses and other safeguards.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
              <div className="space-y-4 text-gray-600">
                <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may update this privacy policy from time to time. We will notify you of any material changes via email or through our service.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
              <div className="space-y-4 text-gray-600">
                <p>If you have questions about this privacy policy or our data practices, please contact us at:</p>
                <p><strong>Email:</strong> privacy@kalm.live</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Effective Date</h2>
              <div className="space-y-4 text-gray-600">
                <p>This privacy policy is effective as of July 1, 2024.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 