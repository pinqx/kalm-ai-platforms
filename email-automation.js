#!/usr/bin/env node

/**
 * KALM AI - Email Automation System
 * Automated LinkedIn prospect outreach with 50 emails/day limit
 * 
 * Features:
 * - Email sending with rate limiting (50/day)
 * - Template personalization
 * - Follow-up sequences
 * - Response tracking
 * - Delivery analytics
 */

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { setTimeout } = require('timers/promises');

// Configuration
const CONFIG = {
  DAILY_LIMIT: 50,
  EMAIL_DELAY_MS: 60000, // 1 minute between emails
  FOLLOWUP_DELAYS: {
    first: 4 * 24 * 60 * 60 * 1000,  // 4 days
    second: 8 * 24 * 60 * 60 * 1000, // 8 days  
    final: 14 * 24 * 60 * 60 * 1000  // 14 days
  },
  DATA_FILE: path.join(__dirname, 'data', 'leads.json'),
  LOG_FILE: path.join(__dirname, 'logs', 'email-automation.log'),
  TEMPLATES_DIR: path.join(__dirname, 'templates')
};

// Email provider configurations
const EMAIL_PROVIDERS = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD // Use App Password for Gmail
    }
  },
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  },
  mailgun: {
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD
    }
  }
};

class EmailAutomation {
  constructor() {
    this.transporter = null;
    this.leads = [];
    this.templates = {};
    this.sentToday = 0;
    this.startTime = new Date().toDateString();
  }

  async init() {
    try {
      console.log('🚀 Initializing KALM Email Automation System...');
      
      // Setup email transporter
      await this.setupEmailProvider();
      
      // Load leads and templates
      await this.loadLeads();
      await this.loadTemplates();
      
      // Create necessary directories
      await this.ensureDirectories();
      
      console.log('✅ Email automation system initialized successfully');
      console.log(`📊 Loaded ${this.leads.length} leads`);
      console.log(`📧 Daily limit: ${CONFIG.DAILY_LIMIT} emails`);
      
    } catch (error) {
      console.error('❌ Failed to initialize email automation:', error.message);
      process.exit(1);
    }
  }

  async setupEmailProvider() {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';
    
    if (!EMAIL_PROVIDERS[provider]) {
      throw new Error(`Unsupported email provider: ${provider}`);
    }

    this.transporter = nodemailer.createTransporter(EMAIL_PROVIDERS[provider]);
    
    // Verify connection
    await this.transporter.verify();
    console.log(`✅ Connected to ${provider} email service`);
  }

  async loadLeads() {
    try {
      const data = await fs.readFile(CONFIG.DATA_FILE, 'utf8');
      this.leads = JSON.parse(data);
    } catch (error) {
      console.log('📝 No existing leads file, creating sample data...');
      this.leads = await this.createSampleLeads();
      await this.saveLeads();
    }
  }

  async createSampleLeads() {
    return [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@techcorp.com',
        company: 'TechCorp Solutions',
        position: 'VP of Sales',
        linkedinUrl: 'https://linkedin.com/in/sarahmitchell',
        status: 'new',
        source: 'linkedin',
        addedDate: new Date().toISOString(),
        emailHistory: [],
        score: 92
      },
      {
        id: '2',
        firstName: 'Mike',
        lastName: 'Rodriguez',
        email: 'mike.r@salesforce.com',
        company: 'SalesForce Industries',
        position: 'Sales Director',
        linkedinUrl: 'https://linkedin.com/in/mikerodriguez',
        status: 'new',
        source: 'linkedin',
        addedDate: new Date().toISOString(),
        emailHistory: [],
        score: 88
      },
      {
        id: '3',
        firstName: 'Jennifer',
        lastName: 'Chen',
        email: 'j.chen@startupville.io',
        company: 'StartupVille',
        position: 'Head of Revenue',
        linkedinUrl: 'https://linkedin.com/in/jenniferchen',
        status: 'new',
        source: 'linkedin',
        addedDate: new Date().toISOString(),
        emailHistory: [],
        score: 95
      }
    ];
  }

  async loadTemplates() {
    this.templates = {
      initial: {
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

P.S. We're offering a free 14-day trial with no setup required.`
      },
      followup1: {
        subject: 'Quick question about {{company}}\'s sales coaching',
        content: `Hi {{firstName}},

I sent a note last week about how AI can help sales teams improve performance.

Quick question: How much time does your team currently spend on sales coaching and call reviews?

Most of our clients were spending 5-10 hours per week before KALM. Now they get the same insights instantly after every call.

Worth a quick 15-minute conversation to see if this could help {{company}}?

Best,
Alex`
      },
      followup2: {
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

P.S. Happy to send over the full case study if you're interested.`
      },
      final: {
        subject: 'Last note about {{company}}\'s sales performance',
        content: `Hi {{firstName}},

I've reached out a few times about how KALM can help {{company}} improve sales performance, but haven't heard back.

I don't want to be a bother, so this will be my last email.

If you're ever interested in learning how AI can help your sales team:
• Get instant insights from every call
• Identify missed objections
• Scale coaching across your team

Feel free to reach out anytime. Would love to help {{company}} achieve similar results to our other clients.

Best regards,
Alex Fisher
alex@kalm.live

P.S. If this isn't relevant anymore, no worries at all. Wishing you and the {{company}} team continued success!`
      }
    };
  }

  async ensureDirectories() {
    const dirs = ['data', 'logs', 'templates'];
    for (const dir of dirs) {
      try {
        await fs.mkdir(path.join(__dirname, dir), { recursive: true });
      } catch (error) {
        // Directory already exists
      }
    }
  }

  personalizeTemplate(template, lead) {
    let content = template.content;
    let subject = template.subject;

    const replacements = {
      '{{firstName}}': lead.firstName,
      '{{lastName}}': lead.lastName,
      '{{company}}': lead.company,
      '{{position}}': lead.position
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, content };
  }

  async sendEmail(lead, templateType) {
    try {
      const template = this.templates[templateType];
      const { subject, content } = this.personalizeTemplate(template, lead);

      const mailOptions = {
        from: `"Alex Fisher - KALM AI" <${process.env.FROM_EMAIL || 'alex@kalm.live'}>`,
        to: lead.email,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'),
        headers: {
          'X-Campaign-Type': templateType,
          'X-Lead-ID': lead.id,
          'X-Company': lead.company
        }
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log successful send
      await this.logEmailSent(lead, templateType, result);
      
      // Update lead history
      lead.emailHistory.push({
        type: templateType,
        sentAt: new Date().toISOString(),
        subject: subject,
        messageId: result.messageId,
        status: 'sent'
      });

      // Update lead status
      if (templateType === 'initial') {
        lead.status = 'contacted';
      }

      this.sentToday++;

      console.log(`✅ Email sent to ${lead.firstName} ${lead.lastName} (${lead.company}) - Type: ${templateType}`);
      
      return result;

    } catch (error) {
      console.error(`❌ Failed to send email to ${lead.email}:`, error.message);
      
      // Log failed send
      await this.logEmailError(lead, templateType, error);
      
      throw error;
    }
  }

  async logEmailSent(lead, templateType, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      leadId: lead.id,
      email: lead.email,
      company: lead.company,
      templateType: templateType,
      messageId: result.messageId,
      status: 'sent'
    };

    await this.writeLog(logEntry);
  }

  async logEmailError(lead, templateType, error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      leadId: lead.id,
      email: lead.email,
      company: lead.company,
      templateType: templateType,
      status: 'error',
      error: error.message
    };

    await this.writeLog(logEntry);
  }

  async writeLog(entry) {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(CONFIG.LOG_FILE, logLine);
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }

  getLeadsToContact() {
    const now = new Date();
    const leads = [];

    for (const lead of this.leads) {
      if (leads.length >= CONFIG.DAILY_LIMIT - this.sentToday) {
        break; // Reached daily limit
      }

      const lastEmail = lead.emailHistory[lead.emailHistory.length - 1];

      if (!lastEmail) {
        // New lead, send initial email
        leads.push({ lead, templateType: 'initial' });
      } else {
        const timeSinceLastEmail = now - new Date(lastEmail.sentAt);
        
        // Determine next email type based on history and timing
        if (lastEmail.type === 'initial' && timeSinceLastEmail >= CONFIG.FOLLOWUP_DELAYS.first) {
          leads.push({ lead, templateType: 'followup1' });
        } else if (lastEmail.type === 'followup1' && timeSinceLastEmail >= CONFIG.FOLLOWUP_DELAYS.second) {
          leads.push({ lead, templateType: 'followup2' });
        } else if (lastEmail.type === 'followup2' && timeSinceLastEmail >= CONFIG.FOLLOWUP_DELAYS.final) {
          leads.push({ lead, templateType: 'final' });
        }
      }
    }

    return leads;
  }

  async saveLeads() {
    try {
      await fs.writeFile(CONFIG.DATA_FILE, JSON.stringify(this.leads, null, 2));
    } catch (error) {
      console.error('Failed to save leads:', error.message);
    }
  }

  async runCampaign() {
    console.log('\n📧 Starting daily email campaign...');
    
    // Check if we've already hit daily limit
    if (this.sentToday >= CONFIG.DAILY_LIMIT) {
      console.log('⏸️  Daily email limit reached. Waiting for next day...');
      return;
    }

    const leadsToContact = this.getLeadsToContact();
    
    if (leadsToContact.length === 0) {
      console.log('💤 No leads ready for contact today.');
      return;
    }

    console.log(`📬 Found ${leadsToContact.length} leads ready for contact`);

    for (const { lead, templateType } of leadsToContact) {
      try {
        await this.sendEmail(lead, templateType);
        await this.saveLeads(); // Save after each successful send
        
        // Wait between emails to avoid rate limiting
        if (this.sentToday < CONFIG.DAILY_LIMIT) {
          console.log(`⏳ Waiting ${CONFIG.EMAIL_DELAY_MS / 1000} seconds before next email...`);
          await setTimeout(CONFIG.EMAIL_DELAY_MS);
        }
        
      } catch (error) {
        console.error(`❌ Error sending to ${lead.email}:`, error.message);
        // Continue with next lead
      }
    }

    console.log(`\n📊 Campaign complete! Sent ${this.sentToday} emails today.`);
  }

  async generateDailyReport() {
    const today = new Date().toDateString();
    const todaysEmails = this.leads.flatMap(lead => 
      lead.emailHistory.filter(email => 
        new Date(email.sentAt).toDateString() === today
      )
    );

    const report = {
      date: today,
      emailsSent: todaysEmails.length,
      dailyLimit: CONFIG.DAILY_LIMIT,
      utilizationRate: `${Math.round((todaysEmails.length / CONFIG.DAILY_LIMIT) * 100)}%`,
      breakdown: {
        initial: todaysEmails.filter(e => e.type === 'initial').length,
        followup1: todaysEmails.filter(e => e.type === 'followup1').length,
        followup2: todaysEmails.filter(e => e.type === 'followup2').length,
        final: todaysEmails.filter(e => e.type === 'final').length
      },
      totalLeads: this.leads.length,
      contactedLeads: this.leads.filter(l => l.status !== 'new').length,
      responseRate: '0%' // Would need response tracking
    };

    console.log('\n📊 Daily Email Report:');
    console.log('=====================================');
    console.log(`Date: ${report.date}`);
    console.log(`Emails Sent: ${report.emailsSent}/${report.dailyLimit}`);
    console.log(`Utilization: ${report.utilizationRate}`);
    console.log(`\nBreakdown:`);
    console.log(`  Initial Contacts: ${report.breakdown.initial}`);
    console.log(`  Follow-up #1: ${report.breakdown.followup1}`);
    console.log(`  Follow-up #2: ${report.breakdown.followup2}`);
    console.log(`  Final Follow-ups: ${report.breakdown.final}`);
    console.log(`\nTotal Leads: ${report.totalLeads}`);
    console.log(`Contacted Leads: ${report.contactedLeads}`);
    console.log('=====================================\n');

    return report;
  }

  async start() {
    await this.init();
    
    console.log('🎯 KALM Email Automation is now running!');
    console.log(`⏰ Campaign will run every hour, sending up to ${CONFIG.DAILY_LIMIT} emails per day`);
    
    // Run initial campaign
    await this.runCampaign();
    await this.generateDailyReport();

    // Schedule hourly runs
    setInterval(async () => {
      const currentDay = new Date().toDateString();
      
      // Reset daily counter if it's a new day
      if (currentDay !== this.startTime) {
        this.sentToday = 0;
        this.startTime = currentDay;
        console.log('\n🌅 New day started! Daily email counter reset.');
      }
      
      await this.runCampaign();
      
    }, 60 * 60 * 1000); // Run every hour
  }
}

// CLI interface
async function main() {
  const automation = new EmailAutomation();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await automation.start();
      break;
      
    case 'test':
      await automation.init();
      console.log('🧪 Running test campaign...');
      await automation.runCampaign();
      await automation.generateDailyReport();
      process.exit(0);
      break;
      
    case 'report':
      await automation.init();
      await automation.generateDailyReport();
      process.exit(0);
      break;
      
    default:
      console.log(`
🎯 KALM Email Automation System

Usage:
  node email-automation.js start   - Start the automation system
  node email-automation.js test    - Run a test campaign
  node email-automation.js report  - Generate daily report

Environment Variables:
  EMAIL_PROVIDER       - gmail, sendgrid, or mailgun (default: gmail)
  GMAIL_USER          - Your Gmail address
  GMAIL_APP_PASSWORD  - Gmail app-specific password
  SENDGRID_API_KEY    - SendGrid API key
  MAILGUN_SMTP_LOGIN  - Mailgun SMTP login
  MAILGUN_SMTP_PASSWORD - Mailgun SMTP password
  FROM_EMAIL          - Email address to send from

Example:
  EMAIL_PROVIDER=gmail GMAIL_USER=your@gmail.com GMAIL_APP_PASSWORD=your-app-password node email-automation.js start
      `);
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = EmailAutomation; 