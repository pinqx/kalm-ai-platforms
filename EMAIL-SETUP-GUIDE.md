# 📧 Email Setup Guide - KALM AI Platform

## Overview

The KALM AI platform now includes automated email functionality for:
- **Payment Confirmation Emails** - Sent after successful purchases
- **Welcome Emails** - Sent after user registration

## 🚀 Development Setup (Automatic)

For development, the system automatically uses **Ethereal Email** (a test email service):
- No configuration needed
- Test emails are logged in the console with preview URLs
- You can view sent emails at the provided URLs

**Current Development Behavior:**
- When the server starts, you'll see email account details in the logs
- After sending emails, check the console for preview URLs

## 🌐 Production Setup

### Option 1: Gmail SMTP (Recommended for Small-Medium Scale)

1. **Create App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com)
   - Enable 2-Factor Authentication
   - Go to "App passwords" → Generate new app password
   - Select "Mail" and your device/app

2. **Add Environment Variables:**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_APP_PASSWORD=your-16-digit-app-password
   EMAIL_FROM="KALM AI Sales Platform <your-gmail@gmail.com>"
   ```

### Option 2: SendGrid (Recommended for High Volume)

1. **Create SendGrid Account:**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Verify your domain
   - Create API key

2. **Update Email Service (server/services/emailService.js):**
   ```javascript
   // Replace the transporter configuration with:
   this.transporter = nodemailer.createTransporter({
     host: 'smtp.sendgrid.net',
     port: 587,
     secure: false,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   });
   ```

3. **Add Environment Variables:**
   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM="KALM AI Sales Platform <noreply@yourdomain.com>"
   ```

### Option 3: AWS SES (Enterprise Scale)

1. **Setup AWS SES:**
   - Configure AWS SES in your AWS account
   - Verify your domain
   - Get SMTP credentials

2. **Update Configuration:**
   ```bash
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=your-aws-smtp-username
   EMAIL_PASSWORD=your-aws-smtp-password
   EMAIL_FROM="KALM AI Sales Platform <noreply@yourdomain.com>"
   ```

## 📝 Environment Variables Reference

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@domain.com
EMAIL_APP_PASSWORD=your-password-or-api-key
EMAIL_FROM="KALM AI Sales Platform <noreply@yourdomain.com>"

# Optional for other providers
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
SENDGRID_API_KEY=your-sendgrid-key
```

## 🧪 Testing Email Functionality

### 1. Test User Registration (Welcome Email)
```bash
curl -X POST http://localhost:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Test Payment Confirmation
- Complete a test purchase through the frontend
- Check logs for email sending confirmation
- In development, check console for Ethereal preview URL

## 📧 Email Templates

The system includes two main email types:

### Payment Confirmation Email
- **Trigger:** After successful payment
- **Content:** 
  - Payment details
  - Plan information
  - Next billing date
  - Access button
  - Support information

### Welcome Email
- **Trigger:** After user registration
- **Content:**
  - Welcome message
  - Getting started guide
  - Platform features
  - Access button

## 🔧 Customization

### Modify Email Templates

Edit the email templates in `server/services/emailService.js`:
- `generatePaymentConfirmationHTML()` - Payment confirmation styling
- `generateWelcomeHTML()` - Welcome email styling
- Update company branding, colors, and content

### Add New Email Types

1. Add new method to `emailService.js`:
   ```javascript
   async sendCustomEmail(userEmail, customData) {
     // Implementation
   }
   ```

2. Call from your endpoint:
   ```javascript
   await emailService.sendCustomEmail(user.email, data);
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **Gmail "Less secure app access" error:**
   - Use App Passwords instead of regular password
   - Ensure 2FA is enabled

2. **SendGrid delivery issues:**
   - Verify domain authentication
   - Check sender reputation

3. **Development email not working:**
   - Check internet connection (Ethereal needs internet)
   - Look for error logs in console

### Debug Mode

Enable email debugging by adding to `.env`:
```env
DEBUG_EMAIL=true
```

## 📊 Monitoring

The system logs all email activity:
- **Success:** Email sent with message ID
- **Failure:** Error details and user information
- **Development:** Preview URLs for test emails

Check your logs for email status updates.

## 🔐 Security Best Practices

1. **Never commit email credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor email sending** for abuse
5. **Verify email domains** in production

## 🎯 Next Steps

1. Choose your email provider
2. Set up environment variables
3. Test email functionality
4. Customize templates to match your brand
5. Monitor email delivery in production

Your KALM AI platform now has professional email functionality! 🎉 