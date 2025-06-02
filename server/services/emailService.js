const nodemailer = require('nodemailer');

// FORCE RAILWAY REDEPLOY - 2025-06-02 - Final fix for logger.error issues
// Use try-catch for logger import to handle initialization issues
// Updated: Added extra safety for Railway deployment
let logger, logError;
try {
  const loggerModule = require('../utils/logger');
  logger = loggerModule.logger;
  logError = loggerModule.logError;
  
  // Verify logger has required methods
  if (!logger || typeof logError !== 'function') {
    throw new Error('Logger not properly initialized');
  }
} catch (err) {
  // Fallback to console if logger is not available
  console.warn('⚠️  Logger not available, using console fallback for email service');
  logger = {
    error: (message, meta) => console.error('Email Service Error:', message, meta),
    info: (message, meta) => console.log('Email Service Info:', message, meta),
    warn: (message, meta) => console.warn('Email Service Warning:', message, meta),
    debug: (message, meta) => console.log('Email Service Debug:', message, meta)
  };
  logError = (message, error, req, meta) => {
    console.error('Email Service Error:', message, error, meta);
  };
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    // Don't initialize immediately - use lazy initialization
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
      // Use safe error logging for Railway deployment compatibility
      if (typeof logError === 'function') {
        logError('Failed to initialize email transporter', error);
      } else {
        console.error('Email Service Error: Failed to initialize email transporter', error);
      }
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
      if (typeof logError === 'function') {
        logError('Failed to create test email account', error);
      } else {
        console.error('Email Service Error: Failed to create test email account', error);
      }
    }
  }

  async sendPaymentConfirmation(userEmail, paymentDetails) {
    try {
      // Ensure email service is initialized
      await this.ensureInitialized();
      
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
          console.log('📧 Email preview URL:', { previewUrl });
          console.log('📧 Email Preview URL:', previewUrl);
        }
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (typeof logError === 'function') {
        logError('Failed to send payment confirmation email', error, null, { userEmail });
      } else {
        console.error('Email Service Error: Failed to send payment confirmation email', error);
      }
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
                padding: 5px 0;
            }
            .detail-label {
                font-weight: 600;
                color: #6b7280;
            }
            .detail-value {
                color: #1f2937;
                font-weight: 500;
            }
            .amount {
                font-size: 20px;
                color: #10b981;
                font-weight: bold;
            }
            .features {
                margin: 30px 0;
            }
            .feature-list {
                list-style: none;
                padding: 0;
            }
            .feature-item {
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .feature-item:before {
                content: "✅ ";
                margin-right: 8px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .support-info {
                margin-top: 20px;
                padding: 15px;
                background: #fef3c7;
                border-radius: 8px;
                color: #92400e;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="success-icon">🎉</div>
                <h1 class="title">Payment Confirmed!</h1>
                <p>Welcome to ${planName}, ${userName}!</p>
            </div>

            <div class="payment-details">
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
                    <span class="detail-label">Account:</span>
                    <span class="detail-value">${userEmail}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Next Billing:</span>
                    <span class="detail-value">${billingDate}</span>
                </div>
            </div>

            <div class="features">
                <h3>Your Plan Includes:</h3>
                <ul class="feature-list">
                    <li class="feature-item">Advanced AI-powered sales call analysis</li>
                    <li class="feature-item">Real-time collaboration tools</li>
                    <li class="feature-item">Comprehensive analytics dashboard</li>
                    <li class="feature-item">Priority customer support</li>
                    <li class="feature-item">Integration with popular CRM systems</li>
                </ul>
            </div>

            <div class="support-info">
                <h4>Need Help Getting Started?</h4>
                <p>Our team is here to help! Contact us at support@kalm-ai.com or visit our documentation center.</p>
            </div>

            <div class="footer">
                <p>Thank you for choosing KALM AI Sales Platform!</p>
                <p>Questions? Email us at support@kalm-ai.com</p>
                <p>KALM AI • Making Sales Smarter</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePaymentConfirmationText(details) {
    const { userName, planName, amount, paymentIntentId, billingDate } = details;
    
    return `
🎉 PAYMENT CONFIRMED - KALM AI Sales Platform

Hello ${userName},

Your payment has been successfully processed!

PAYMENT DETAILS:
- Plan: ${planName}
- Amount: $${amount}
- Payment ID: ${paymentIntentId}
- Next Billing: ${billingDate}

YOUR PLAN INCLUDES:
✅ Advanced AI-powered sales call analysis
✅ Real-time collaboration tools
✅ Comprehensive analytics dashboard
✅ Priority customer support
✅ Integration with popular CRM systems

GETTING STARTED:
Visit your dashboard to start analyzing your sales calls and gain valuable insights.

Need help? Contact our support team at support@kalm-ai.com

Thank you for choosing KALM AI!

---
KALM AI Sales Platform
Making Sales Smarter
    `;
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      // Ensure email service is initialized
      await this.ensureInitialized();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'KALM AI Sales Platform <noreply@kalm-ai.com>',
        to: userEmail,
        subject: `🚀 Welcome to KALM AI Sales Platform!`,
        html: this.generateWelcomeHTML(userName, userEmail),
        text: this.generateWelcomeText(userName)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Welcome email sent:', { userEmail, messageId: info.messageId });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (typeof logError === 'function') {
        logError('Failed to send welcome email', error, null, { userEmail });
      } else {
        console.error('Email Service Error: Failed to send welcome email', error);
      }
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
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6b7280;
                font-size: 18px;
            }
            .content {
                margin: 30px 0;
                line-height: 1.8;
            }
            .features {
                background: #f8fafc;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #4f46e5;
            }
            .feature-list {
                list-style: none;
                padding: 0;
                margin: 15px 0;
            }
            .feature-item {
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 16px;
            }
            .feature-item:last-child {
                border-bottom: none;
            }
            .feature-item:before {
                content: "🚀 ";
                margin-right: 8px;
            }
            .cta-button {
                display: inline-block;
                background: #4f46e5;
                color: white;
                padding: 15px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .highlight {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                color: #92400e;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="welcome-icon">🚀</div>
                <h1 class="title">Welcome, ${userName}!</h1>
                <p class="subtitle">Your AI-powered sales analysis journey starts now</p>
            </div>

            <div class="content">
                <p>Thank you for joining KALM AI Sales Platform! We're excited to help you transform your sales call analysis with cutting-edge AI technology.</p>
                
                <div class="features">
                    <h3>🎯 What you can do with KALM AI:</h3>
                    <ul class="feature-list">
                        <li class="feature-item">Upload and analyze sales call transcripts with advanced AI</li>
                        <li class="feature-item">Get real-time insights on call performance and outcomes</li>
                        <li class="feature-item">Collaborate with your team in real-time</li>
                        <li class="feature-item">Track analytics and measure improvement over time</li>
                        <li class="feature-item">Generate AI-powered follow-up emails</li>
                    </ul>
                </div>

                <div class="highlight">
                    <h4>🎉 Ready to get started?</h4>
                    <p>Log in to your dashboard and upload your first sales call transcript to see the magic happen!</p>
                </div>

                <div style="text-align: center;">
                    <a href="https://kalm.live" class="cta-button">Access Your Dashboard</a>
                </div>

                <p>If you have any questions or need assistance, our support team is here to help at <strong>support@kalm-ai.com</strong>.</p>
            </div>

            <div class="footer">
                <p>Welcome to the future of sales analysis!</p>
                <p>KALM AI Sales Platform • Making Sales Smarter</p>
                <p>This email was sent to ${userEmail}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateWelcomeText(userName) {
    return `
🚀 WELCOME TO KALM AI SALES PLATFORM!

Hello ${userName},

Thank you for joining KALM AI! We're excited to help you transform your sales call analysis with cutting-edge AI technology.

🎯 WHAT YOU CAN DO WITH KALM AI:
• Upload and analyze sales call transcripts with advanced AI
• Get real-time insights on call performance and outcomes  
• Collaborate with your team in real-time
• Track analytics and measure improvement over time
• Generate AI-powered follow-up emails

🎉 READY TO GET STARTED?
Log in to your dashboard and upload your first sales call transcript to see the magic happen!

Visit: https://kalm.live

Need help? Contact our support team at support@kalm-ai.com

Welcome to the future of sales analysis!

---
KALM AI Sales Platform
Making Sales Smarter
    `;
  }
}

// Export a singleton instance
module.exports = new EmailService(); 