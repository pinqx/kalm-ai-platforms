const nodemailer = require('nodemailer');

// Railway-safe email service - NO external logger dependencies
// Use only console for all logging to prevent initialization issues

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    console.log('📧 EmailService instance created (Railway-safe mode)');
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeTransporter();
      this.initialized = true;
    }
  }

  async initializeTransporter() {
    try {
      // Configure Gmail SMTP (you can also use other providers)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_APP_PASSWORD // Your app-specific password
        }
      });

      // For development, we'll use Ethereal Email (test email service)
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        await this.createTestAccount();
      }
      
      console.log('✅ Email transporter initialized successfully');
    } catch (error) {
      console.error('❌ Email Service Error: Failed to initialize email transporter', error.message);
      // Don't throw - let app continue without email functionality
    }
  }

  async createTestAccount() {
    try {
      // Create a test account for development
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('📧 Development email account created:', {
        user: testAccount.user,
        pass: testAccount.pass,
        webUrl: 'https://ethereal.email'
      });
    } catch (error) {
      console.error('❌ Email Service Error: Failed to create test email account', error.message);
    }
  }

  async sendPaymentConfirmation(userEmail, paymentDetails) {
    try {
      // Ensure email service is initialized
      await this.ensureInitialized();
      
      if (!this.transporter) {
        console.warn('⚠️  Email transporter not available, skipping email send');
        return { success: false, error: 'Email service not initialized' };
      }
      
      const { planId, amount, paymentIntentId, userName, billingDate } = paymentDetails;
      
      const planNames = {
        starter: 'Starter Plan',
        professional: 'Professional Plan', 
        enterprise: 'Enterprise Plan'
      };

      const planName = planNames[planId] || planId;

      const emailHtml = this.generatePaymentConfirmationHTML({
        userName: userName || 'Valued Customer',
        planName,
        amount,
        paymentIntentId,
        billingDate,
        userEmail
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'KALM AI Sales Platform <noreply@kalm-ai.com>',
        to: userEmail,
        subject: `🎉 Payment Confirmed - Welcome to ${planName}!`,
        html: emailHtml,
        text: this.generatePaymentConfirmationText({
          userName: userName || 'Valued Customer',
          planName,
          amount,
          paymentIntentId,
          billingDate
        })
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Payment confirmation email sent:', {
        userEmail,
        messageId: info.messageId,
        planId,
        amount,
        paymentIntentId
      });

      // For development with Ethereal Email, log the preview URL
      if (process.env.NODE_ENV === 'development' && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Email preview URL:', previewUrl);
        }
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email Service Error: Failed to send payment confirmation email', error.message);
      return { success: false, error: error.message };
    }
  }

  generatePaymentConfirmationHTML(details) {
    const { userName, planName, amount, paymentIntentId, billingDate, userEmail } = details;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation - KALM AI</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            .success-icon {
                font-size: 48px;
                color: #10b981;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .payment-details {
                background: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #4f46e5;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            .detail-value {
                color: #6b7280;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #10b981;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: #4f46e5;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
            }
            .features {
                background: #f0f9ff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .feature-list {
                list-style: none;
                padding: 0;
            }
            .feature-list li {
                padding: 8px 0;
                color: #1e40af;
            }
            .feature-list li:before {
                content: "✓ ";
                color: #10b981;
                font-weight: bold;
                margin-right: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="success-icon">✅</div>
                <h1 class="title">Payment Successful!</h1>
                <p>Thank you for choosing KALM AI Sales Platform</p>
            </div>

            <div class="payment-details">
                <h3 style="margin-top: 0; color: #1f2937;">Payment Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Plan:</span>
                    <span class="detail-value">${planName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value amount">$${amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment ID:</span>
                    <span class="detail-value">${paymentIntentId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${userEmail}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Billing Date:</span>
                    <span class="detail-value">${billingDate || new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div class="features">
                <h3 style="margin-top: 0; color: #1e40af;">What's Included in Your ${planName}</h3>
                <ul class="feature-list">
                    <li>Advanced AI-powered sales call analysis</li>
                    <li>Real-time collaboration tools</li>
                    <li>Comprehensive analytics dashboard</li>
                    <li>Email automation and insights</li>
                    <li>Priority customer support</li>
                    <li>Secure data encryption</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://kalm.live'}" class="button">
                    Access Your Dashboard
                </a>
            </div>

            <div class="footer">
                <p>
                    <strong>Need help?</strong> Contact our support team at 
                    <a href="mailto:support@kalm-ai.com">support@kalm-ai.com</a>
                </p>
                <p>
                    This email was sent to ${userEmail}.<br>
                    KALM AI Sales Platform | Transforming Sales with AI
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePaymentConfirmationText(details) {
    const { userName, planName, amount, paymentIntentId, billingDate } = details;
    
    return `
    🎉 Payment Successful - Welcome to ${planName}!

    Hi ${userName},

    Thank you for choosing KALM AI Sales Platform! Your payment has been successfully processed.

    Payment Details:
    ================
    Plan: ${planName}
    Amount: $${amount}
    Payment ID: ${paymentIntentId}
    Billing Date: ${billingDate || new Date().toLocaleDateString()}

    What's Included:
    ================
    ✓ Advanced AI-powered sales call analysis
    ✓ Real-time collaboration tools  
    ✓ Comprehensive analytics dashboard
    ✓ Email automation and insights
    ✓ Priority customer support
    ✓ Secure data encryption

    Get Started:
    ============
    Access your dashboard: ${process.env.FRONTEND_URL || 'https://kalm.live'}

    Need help? Contact support@kalm-ai.com

    Thank you for choosing KALM AI!
    The KALM AI Team
    `;
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      await this.ensureInitialized();
      
      if (!this.transporter) {
        console.warn('⚠️  Email transporter not available, skipping welcome email');
        return { success: false, error: 'Email service not initialized' };
      }

      const emailHtml = this.generateWelcomeHTML(userName, userEmail);
      const emailText = this.generateWelcomeText(userName);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'KALM AI Sales Platform <noreply@kalm-ai.com>',
        to: userEmail,
        subject: '🚀 Welcome to KALM AI Sales Platform!',
        html: emailHtml,
        text: emailText
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Welcome email sent:', {
        userEmail,
        messageId: info.messageId
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email Service Error: Failed to send welcome email', error.message);
      return { success: false, error: error.message };
    }
  }

  generateWelcomeHTML(userName, userEmail) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KALM AI</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8fafc;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            .welcome-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 28px;
                margin-bottom: 20px;
            }
            .subtitle {
                color: #6b7280;
                font-size: 18px;
                margin-bottom: 30px;
            }
            .features {
                background: #f0f9ff;
                border-radius: 8px;
                padding: 24px;
                margin: 24px 0;
            }
            .feature-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                margin-top: 16px;
            }
            .feature-item {
                padding: 16px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid #4f46e5;
            }
            .feature-icon {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .feature-title {
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
            }
            .feature-desc {
                font-size: 14px;
                color: #6b7280;
            }
            .cta {
                text-align: center;
                margin: 30px 0;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #4f46e5;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="welcome-icon">🚀</div>
                <h1 class="title">Welcome to the Future of Sales!</h1>
                <p class="subtitle">Hi ${userName}, you're all set to transform your sales process with AI</p>
            </div>

            <div class="features">
                <h3 style="margin-top: 0; color: #1e40af; text-align: center;">What You Can Do Now</h3>
                
                <div class="feature-grid">
                    <div class="feature-item">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">Analyze Calls</div>
                        <div class="feature-desc">Upload sales call transcripts for instant AI-powered insights</div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">👥</div>
                        <div class="feature-title">Team Collaboration</div>
                        <div class="feature-desc">Work together in real-time with your sales team</div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">📈</div>
                        <div class="feature-title">Advanced Analytics</div>
                        <div class="feature-desc">Track performance metrics and conversion insights</div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">✉️</div>
                        <div class="feature-title">Email Automation</div>
                        <div class="feature-desc">Generate personalized follow-up emails automatically</div>
                    </div>
                </div>
            </div>

            <div class="cta">
                <a href="${process.env.FRONTEND_URL || 'https://kalm.live'}" class="button">
                    Start Analyzing Calls Now
                </a>
            </div>

            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <h4 style="margin-top: 0; color: #92400e;">💡 Quick Start Tips</h4>
                <ul style="color: #92400e; margin: 0;">
                    <li>Upload your first sales call transcript to see AI analysis in action</li>
                    <li>Explore the Live tab for real-time collaboration features</li>
                    <li>Check out Advanced Analytics for deeper insights</li>
                    <li>Use the email generator to create follow-up messages</li>
                </ul>
            </div>

            <div class="footer">
                <p>
                    <strong>Questions? We're here to help!</strong><br>
                    Contact us at <a href="mailto:support@kalm-ai.com">support@kalm-ai.com</a>
                </p>
                
                <div class="social-links">
                    <a href="https://kalm.live">🌐 Website</a>
                    <a href="mailto:support@kalm-ai.com">📧 Support</a>
                    <a href="${process.env.FRONTEND_URL || 'https://kalm.live'}">📊 Dashboard</a>
                </div>
                
                <p>
                    This email was sent to ${userEmail}<br>
                    KALM AI Sales Platform | Transforming Sales with AI
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateWelcomeText(userName) {
    return `
    🚀 Welcome to KALM AI Sales Platform!

    Hi ${userName},

    Welcome to the future of sales! You're all set to transform your sales process with AI-powered insights.

    What You Can Do Now:
    ===================
    📊 Analyze Calls - Upload sales call transcripts for instant AI insights
    👥 Team Collaboration - Work together in real-time with your sales team  
    📈 Advanced Analytics - Track performance metrics and conversion insights
    ✉️ Email Automation - Generate personalized follow-up emails automatically

    Quick Start Tips:
    ================
    • Upload your first sales call transcript to see AI analysis in action
    • Explore the Live tab for real-time collaboration features
    • Check out Advanced Analytics for deeper insights
    • Use the email generator to create follow-up messages

    Get Started: ${process.env.FRONTEND_URL || 'https://kalm.live'}

    Questions? Contact us at support@kalm-ai.com

    Welcome to KALM AI!
    The KALM AI Team
    `;
  }
}

// Export a singleton instance
const emailService = new EmailService();
module.exports = emailService; 