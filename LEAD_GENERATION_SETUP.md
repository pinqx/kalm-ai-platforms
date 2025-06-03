# KALM AI - Lead Generation & Email Automation Setup Guide

## 🎯 Overview

This guide will help you set up an automated lead generation and email outreach system that can send 50 personalized emails daily to LinkedIn prospects. The system includes:

- **LinkedIn prospecting automation**
- **Email sequence automation** (50 emails/day)
- **Lead management and tracking**
- **Response monitoring**
- **Performance analytics**

## 📋 Prerequisites

- Node.js 16+ installed
- Email provider account (Gmail, SendGrid, or Mailgun)
- LinkedIn automation tool (Phantombuster or LinkedHelper)
- Basic command line knowledge

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ai-sales-platform
npm install nodemailer
```

### 2. Setup Email Provider

Choose one of the following email providers:

#### Option A: Gmail (Recommended for getting started)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create password for "Mail"
3. Set environment variables:
```bash
export EMAIL_PROVIDER=gmail
export GMAIL_USER=your@gmail.com
export GMAIL_APP_PASSWORD=your-app-password
export FROM_EMAIL=your@gmail.com
```

#### Option B: SendGrid (Recommended for production)
1. Sign up at sendgrid.com
2. Create API key with Mail Send permissions
3. Set environment variables:
```bash
export EMAIL_PROVIDER=sendgrid
export SENDGRID_API_KEY=your-api-key
export FROM_EMAIL=your@domain.com
```

#### Option C: Mailgun (Developer-friendly)
1. Sign up at mailgun.com
2. Get SMTP credentials from dashboard
3. Set environment variables:
```bash
export EMAIL_PROVIDER=mailgun
export MAILGUN_SMTP_LOGIN=your-smtp-login
export MAILGUN_SMTP_PASSWORD=your-smtp-password
export FROM_EMAIL=your@domain.com
```

### 3. Run Email Automation

```bash
# Test the system
node email-automation.js test

# Start automation (runs continuously)
node email-automation.js start

# Generate daily report
node email-automation.js report
```

## 🔧 LinkedIn Lead Generation

### Option 1: Phantombuster (Recommended)

**Pricing:** $59/month
**Features:** Professional automation with safety limits

1. Sign up at phantombuster.com
2. Create LinkedIn automation phantoms:
   - **LinkedIn Search Export** - Extract profiles
   - **LinkedIn Auto Connect** - Send connection requests
   - **LinkedIn Message Sender** - Send messages

3. Setup workflow:
   - Search for target prospects (VP Sales, Sales Directors, etc.)
   - Extract 50-100 new leads daily
   - Send connection requests with personalized messages
   - Export data to CSV/JSON

4. Import leads to KALM system:
```bash
# Add leads from CSV export
node scripts/import-leads.js phantombuster-export.csv
```

### Option 2: LinkedHelper (Budget-friendly)

**Pricing:** $15/month
**Features:** Chrome extension automation

1. Install LinkedHelper Chrome extension
2. Configure automation settings:
   - Daily limits: 50 connection requests max
   - Message delays: 24-48 hours between messages
   - Profile visits: 100-200 per day

3. Setup sequences:
   - Profile visit → Connection request → Message sequence
   - Export prospect data weekly

### Safety Guidelines for LinkedIn

⚠️ **Important:** Follow these limits to avoid account restrictions:

- **Connection requests:** 50-100 per day max
- **Messages:** 25-50 per day max
- **Profile visits:** 200-300 per day max
- **Delays:** 24-48 hours between touchpoints
- **Personalization:** Always customize messages
- **Monitor:** Check account health weekly

## 📧 Email Sequence Strategy

### Default Sequence (4 emails over 14 days)

1. **Initial Contact (Day 0)**
   - Personalized intro mentioning their company
   - Clear value proposition
   - Soft call-to-action

2. **Follow-up #1 (Day 4)**
   - Ask relevant question about their challenges
   - Keep it brief and helpful
   - No hard sell

3. **Follow-up #2 (Day 8)**
   - Share case study or success story
   - Provide social proof
   - Specific benefits for their industry

4. **Final Follow-up (Day 14)**
   - Soft breakup email
   - Leave door open for future
   - Professional and respectful

### Email Templates

Templates are automatically personalized with:
- `{{firstName}}` - Contact's first name
- `{{lastName}}` - Contact's last name  
- `{{company}}` - Company name
- `{{position}}` - Job title

## 📊 Tracking & Analytics

### Daily Reports

The system generates daily reports showing:
- Emails sent vs. daily limit (50)
- Sequence breakdown (initial, follow-ups)
- Response rates
- Lead status distribution

### Lead Scoring

Leads are scored based on:
- Company size and industry
- Position level (VP, Director, Manager)
- LinkedIn engagement
- Email engagement (opens, clicks)

### Response Tracking

Monitor responses through:
- Email provider analytics
- Manual response logging
- Integration with CRM systems

## 🔗 CRM Integration

### Supported CRMs

- **Salesforce** - Enterprise-grade integration
- **HubSpot** - Marketing automation features
- **Pipedrive** - Sales-focused pipeline management

### Setup Integration

1. Access Lead Generation tab in KALM dashboard
2. Navigate to Integrations section
3. Click "Connect" for your CRM
4. Follow OAuth flow to authorize
5. Configure field mapping

## 📈 Scaling Your Outreach

### Week 1: Foundation (50 leads)
- Setup email automation
- Test LinkedIn prospecting
- Refine message templates
- Monitor deliverability

### Week 2-4: Scale Up (200+ leads)
- Increase LinkedIn activity
- Add email warming sequences
- Implement A/B testing
- Optimize based on responses

### Month 2+: Automation (500+ leads)
- Full automation workflows
- Advanced segmentation
- Multi-channel sequences
- Team collaboration features

## 🛡️ Compliance & Best Practices

### Email Compliance

- **CAN-SPAM Act compliance**
- Clear unsubscribe links
- Accurate sender information
- No misleading subject lines

### LinkedIn Compliance

- Follow LinkedIn's Terms of Service
- Respect daily limits
- Avoid spam-like behavior
- Personalize all outreach

### Data Protection

- GDPR/CCPA compliance
- Secure data storage
- Opt-out mechanisms
- Regular data cleanup

## 🚨 Troubleshooting

### Common Issues

**Email delivery problems:**
- Check spam folder placement
- Verify domain authentication
- Monitor sending reputation
- Use email warming services

**LinkedIn account restrictions:**
- Reduce daily limits
- Increase delays between actions
- Improve message personalization
- Use different IP addresses

**Low response rates:**
- A/B test subject lines
- Improve message personalization
- Segment by industry/role
- Optimize sending times

### Getting Help

1. Check logs in `logs/email-automation.log`
2. Review daily reports for patterns
3. Monitor email provider analytics
4. Contact support if needed

## 📞 Support

For technical support or questions:
- Email: alex@kalm.live
- Documentation: [Link to full docs]
- Community: [Link to Discord/Slack]

## 🎯 Next Steps

1. ✅ Complete email provider setup
2. ✅ Run test campaign
3. ✅ Setup LinkedIn automation tool
4. ✅ Import first batch of leads
5. ✅ Launch live campaign
6. ✅ Monitor and optimize

**Goal:** Generate 50 qualified leads per week with 20%+ response rate.

---

*Built with ❤️ by the KALM AI team* 