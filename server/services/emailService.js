const nodemailer = require('nodemailer');

// Use try-catch for logger import to handle initialization issues
let logger, logError;
try {
  const loggerModule = require('../utils/logger');
  logger = loggerModule.logger;
  logError = loggerModule.logError;
  
  // Verify logger has required methods
  if (!logger || typeof logger.error !== 'function') {
    throw new Error('Logger not properly initialized');
  }
} catch (err) {
  // Fallback to console if logger is not available
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
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Configure Gmail SMTP (you can also use other providers)
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_APP_PASSWORD // Your app-specific password
        }
      });

      // For development, we'll use Ethereal Email (test email service)
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        this.createTestAccount();
      }
    } catch (error) {
      logError('Failed to initialize email transporter', error);
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
      logError('Failed to create test email account', error);
    }
  }

  async sendPaymentConfirmation(userEmail, paymentDetails) {
    try {
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
      logError('Failed to send payment confirmation email', error, null, { userEmail });
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
                margin-right: 10px;
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
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            .support-info {
                background: #fef3c7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="success-icon">🎉</div>
                <h1 class="title">Payment Confirmed!</h1>
                <p>Thank you for your purchase, ${userName}!</p>
            </div>

            <div class="payment-details">
                <h3 style="margin-top: 0; color: #4f46e5;">Payment Details</h3>
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
                    <span class="detail-label">Next Billing:</span>
                    <span class="detail-value">${new Date(billingDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${userEmail}</span>
                </div>
            </div>

            <div class="features">
                <h3 style="color: #4f46e5;">What's included in your ${planName}:</h3>
                <ul class="feature-list">
                    <li class="feature-item">AI-powered sales call analysis</li>
                    <li class="feature-item">Smart email generation</li>
                    <li class="feature-item">Real-time collaboration tools</li>
                    <li class="feature-item">Advanced analytics dashboard</li>
                    <li class="feature-item">Priority customer support</li>
                    <li class="feature-item">Regular feature updates</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="http://localhost:5173" class="cta-button">Access Your Dashboard</a>
            </div>

            <div class="support-info">
                <strong>Need Help?</strong><br>
                Our support team is here to help you get the most out of KALM AI. 
                Contact us at support@kalm-ai.com or visit our help center.
            </div>

            <div class="footer">
                <p>This email was sent to ${userEmail} because you recently made a purchase with KALM AI.</p>
                <p>KALM AI Sales Platform | AI-Powered Sales Enablement</p>
                <p style="font-size: 12px; margin-top: 15px;">
                    If you have any questions about this payment, please contact our support team.
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
KALM AI - Payment Confirmation

Hi ${userName},

Thank you for your purchase! Your payment has been successfully processed.

Payment Details:
• Plan: ${planName}
• Amount: $${amount}
• Payment ID: ${paymentIntentId}
• Next Billing: ${new Date(billingDate).toLocaleDateString()}

Your ${planName} includes:
✅ AI-powered sales call analysis
✅ Smart email generation
✅ Real-time collaboration tools
✅ Advanced analytics dashboard
✅ Priority customer support
✅ Regular feature updates

Access your dashboard: http://localhost:5173

Need help? Contact us at support@kalm-ai.com

Best regards,
The KALM AI Team

---
This email was sent because you recently made a purchase with KALM AI.
If you have any questions about this payment, please contact our support team.
    `;
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'KALM AI Sales Platform <noreply@kalm-ai.com>',
        to: userEmail,
        subject: '🚀 Welcome to KALM AI - Let\'s Get Started!',
        html: this.generateWelcomeHTML(userName, userEmail),
        text: this.generateWelcomeText(userName)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Welcome email sent:', {
        userEmail,
        messageId: info.messageId
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logError('Failed to send welcome email', error, null, { userEmail });
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
                font-size: 28px;
                font-weight: bold;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            .welcome-icon {
                font-size: 48px;
                margin-bottom: 20px;
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
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KALM AI</div>
                <div class="welcome-icon">🚀</div>
                <h1>Welcome to KALM AI!</h1>
                <p>Hi ${userName}, we're excited to have you on board!</p>
            </div>

            <p>You're now part of the KALM AI family - the most advanced AI-powered sales enablement platform.</p>
            
            <p>Ready to revolutionize your sales process? Here's what you can do next:</p>
            
            <ul>
                <li>Upload your first sales call transcript for AI analysis</li>
                <li>Generate personalized follow-up emails</li>
                <li>Explore your analytics dashboard</li>
                <li>Collaborate with your team in real-time</li>
            </ul>

            <div style="text-align: center;">
                <a href="http://localhost:5173" class="cta-button">Get Started Now</a>
            </div>

            <p>If you have any questions, our support team is here to help at support@kalm-ai.com</p>

            <div class="footer">
                <p>Welcome aboard!</p>
                <p>The KALM AI Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateWelcomeText(userName) {
    return `
Welcome to KALM AI!

Hi ${userName},

We're excited to have you on board! You're now part of the KALM AI family - the most advanced AI-powered sales enablement platform.

Ready to revolutionize your sales process? Here's what you can do next:
• Upload your first sales call transcript for AI analysis
• Generate personalized follow-up emails  
• Explore your analytics dashboard
• Collaborate with your team in real-time

Get started: http://localhost:5173

If you have any questions, our support team is here to help at support@kalm-ai.com

Welcome aboard!
The KALM AI Team
    `;
  }
}

module.exports = new EmailService(); 