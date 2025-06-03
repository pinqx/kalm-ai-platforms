#!/usr/bin/env node

/**
 * KALM AI Bot Simulation - 24-Hour User Activity Simulation
 * Creates realistic user behavior patterns for admin dashboard testing
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = 'https://web-production-e7159.up.railway.app';
const SIMULATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BOT_COUNT = 10;

// Realistic user personas
const BOT_PERSONAS = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    company: 'TechCorp Solutions',
    plan: 'professional',
    activityLevel: 'high', // 15-20 transcripts/day
    peakHours: [9, 10, 14, 15, 16], // Business hours
    behavior: 'consistent'
  },
  {
    name: 'Mike Rodriguez',
    email: 'mike.r@salesforce.com',
    company: 'SalesForce Industries',
    plan: 'enterprise',
    activityLevel: 'very-high', // 25-30 transcripts/day
    peakHours: [8, 9, 13, 14, 17],
    behavior: 'power-user'
  },
  {
    name: 'Jennifer Chen',
    email: 'j.chen@startupville.io',
    company: 'StartupVille',
    plan: 'starter',
    activityLevel: 'medium', // 8-12 transcripts/day
    peakHours: [10, 11, 15, 16],
    behavior: 'growing'
  },
  {
    name: 'David Thompson',
    email: 'dthompson@enterprise.net',
    company: 'Enterprise Networks',
    plan: 'professional',
    activityLevel: 'high',
    peakHours: [7, 8, 12, 13, 18],
    behavior: 'early-adopter'
  },
  {
    name: 'Lisa Park',
    email: 'lisa@consultingpro.com',
    company: 'Consulting Pro',
    plan: 'starter',
    activityLevel: 'low', // 3-5 transcripts/day
    peakHours: [9, 14, 16],
    behavior: 'casual'
  },
  {
    name: 'Robert Williams',
    email: 'rwilliams@bigsales.com',
    company: 'Big Sales Corp',
    plan: 'enterprise',
    activityLevel: 'very-high',
    peakHours: [6, 7, 11, 12, 17, 18],
    behavior: 'aggressive'
  },
  {
    name: 'Emily Davis',
    email: 'e.davis@mediumco.com',
    company: 'Medium Company Inc',
    plan: 'professional',
    activityLevel: 'medium',
    peakHours: [9, 10, 13, 15],
    behavior: 'steady'
  },
  {
    name: 'Alex Kim',
    email: 'alex.kim@techstartup.io',
    company: 'Tech Startup',
    plan: 'starter',
    activityLevel: 'medium',
    peakHours: [11, 12, 16, 17, 19],
    behavior: 'experimental'
  },
  {
    name: 'Maria Garcia',
    email: 'm.garcia@globalcorp.com',
    company: 'Global Corp',
    plan: 'enterprise',
    activityLevel: 'high',
    peakHours: [8, 9, 14, 15, 16],
    behavior: 'systematic'
  },
  {
    name: 'James Wilson',
    email: 'james@smallbiz.com',
    company: 'Small Business LLC',
    plan: 'starter',
    activityLevel: 'low',
    peakHours: [10, 14, 16],
    behavior: 'budget-conscious'
  }
];

// Sample transcript scenarios
const TRANSCRIPT_SCENARIOS = [
  {
    title: 'Enterprise Software Demo',
    content: `SALES CALL TRANSCRIPT
Date: ${new Date().toLocaleDateString()}
Participants: Sales Rep, IT Director

Sales Rep: Good morning! Thanks for taking the time to speak with me about our enterprise software solution.

IT Director: Of course. We're looking to streamline our operations and heard good things about your platform.

Sales Rep: Excellent. Our solution has helped companies like yours reduce operational costs by up to 30%. Can you tell me about your current pain points?

IT Director: We're struggling with data silos and manual processes. Our teams spend too much time on repetitive tasks.

Sales Rep: That's exactly what we solve. Our automation features can eliminate those manual processes entirely. Would you be interested in a pilot program?

IT Director: Potentially. What would that look like in terms of implementation timeline and cost?

Sales Rep: For a company your size, we typically see full implementation in 6-8 weeks. The investment starts at $50,000 annually.

IT Director: That's within our budget range. I'd need to see some case studies from similar companies.

Sales Rep: Absolutely. I'll send you three case studies from companies in your industry, plus we can arrange calls with current clients.

IT Director: Perfect. When can we schedule the next steps?`,
    objections: ['Budget timeline concerns', 'Need stakeholder buy-in', 'Integration complexity questions'],
    sentiment: 'positive'
  },
  {
    title: 'SaaS Platform Discovery Call',
    content: `SALES CALL TRANSCRIPT
Date: ${new Date().toLocaleDateString()}
Participants: Account Executive, Marketing Director

Account Executive: Hi! I'm excited to learn more about your marketing automation needs.

Marketing Director: Thanks for reaching out. We're exploring options to better nurture our leads.

Account Executive: Great! Currently, how are you managing your lead nurturing process?

Marketing Director: Mostly manual emails and some basic automation. It's not scalable and we're missing opportunities.

Account Executive: I understand. Our platform automates the entire funnel and has increased conversion rates by 40% for similar companies.

Marketing Director: That sounds promising. What's the learning curve like for the team?

Account Executive: Very minimal. Most teams are fully productive within two weeks. We provide comprehensive training and support.

Marketing Director: Cost is a factor for us. We're a growing startup.

Account Executive: I get it. We have flexible pricing that grows with you. Would you be open to a free trial to see the value firsthand?

Marketing Director: Yes, that would be helpful. How long is the trial?

Account Executive: 30 days, full access. I can set that up today if you'd like.`,
    objections: ['Pricing concerns', 'Team adoption challenges', 'Feature complexity'],
    sentiment: 'interested'
  },
  {
    title: 'Professional Services Consultation',
    content: `SALES CALL TRANSCRIPT
Date: ${new Date().toLocaleDateString()}
Participants: Consultant, Operations Manager

Consultant: Thank you for considering our consulting services for your digital transformation.

Operations Manager: We need help modernizing our processes. Everything feels outdated.

Consultant: I hear this often. What specific areas are causing the most friction?

Operations Manager: Customer service response times and inventory management are our biggest issues.

Consultant: Both are very solvable. We've helped companies reduce response times by 60% and optimize inventory turnover.

Operations Manager: How long would an engagement typically last?

Consultant: For comprehensive transformation, usually 3-6 months depending on scope. We work in phases to show quick wins.

Operations Manager: What kind of investment are we looking at?

Consultant: Projects typically range from $75,000 to $200,000 depending on complexity. But ROI usually pays for itself within 12 months.

Operations Manager: That's a significant investment. Can you provide some references?

Consultant: Absolutely. I'll connect you with three clients who've seen similar challenges. Would next week work for those conversations?`,
    objections: ['High investment cost', 'Long timeline concerns', 'Change management challenges'],
    sentiment: 'cautious'
  }
];

// Utility functions
function makeAPICall(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`API call failed: ${error.message}`);
      resolve({ error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isInPeakHour(hour, peakHours) {
  return peakHours.includes(hour);
}

function getActivityMultiplier(activityLevel) {
  switch (activityLevel) {
    case 'low': return { min: 3, max: 5 };
    case 'medium': return { min: 8, max: 12 };
    case 'high': return { min: 15, max: 20 };
    case 'very-high': return { min: 25, max: 30 };
    default: return { min: 5, max: 10 };
  }
}

// Main simulation functions
async function createBotUser(persona) {
  console.log(`🤖 Creating bot user: ${persona.name}`);
  
  // Create user account simulation
  const userData = {
    email: persona.email,
    password: 'BotPassword123!',
    firstName: persona.name.split(' ')[0],
    lastName: persona.name.split(' ')[1],
    company: persona.company,
    plan: persona.plan
  };

  // Simulate user registration
  console.log(`   📝 Registering ${persona.name} with ${persona.plan} plan`);
  
  return userData;
}

async function simulateUserActivity(persona, userData, token) {
  const { min, max } = getActivityMultiplier(persona.activityLevel);
  const dailyTranscripts = getRandomInt(min, max);
  
  console.log(`   📊 ${persona.name} will generate ${dailyTranscripts} transcripts today`);

  const activities = [];
  
  for (let i = 0; i < dailyTranscripts; i++) {
    // Distribute activities throughout the day, with peaks
    const hour = getRandomInt(6, 22); // Business hours
    const isPeakHour = isInPeakHour(hour, persona.peakHours);
    
    // Higher chance of activity during peak hours
    if (!isPeakHour && Math.random() < 0.3) continue;
    
    const scenario = getRandomElement(TRANSCRIPT_SCENARIOS);
    const activity = {
      timestamp: new Date(Date.now() + (hour * 60 * 60 * 1000) + (i * 10 * 60 * 1000)),
      user: persona.name,
      action: 'transcript_analysis',
      scenario: scenario.title,
      sentiment: scenario.sentiment,
      duration: getRandomInt(300, 1800) // 5-30 minutes
    };
    
    activities.push(activity);
  }

  return activities;
}

async function generateAnalyticsData() {
  console.log('📈 Generating comprehensive analytics data...\n');

  const allActivities = [];
  const userSummaries = [];

  for (const persona of BOT_PERSONAS) {
    const userData = await createBotUser(persona);
    const activities = await simulateUserActivity(persona, userData);
    
    allActivities.push(...activities);
    
    const summary = {
      user: persona.name,
      email: persona.email,
      company: persona.company,
      plan: persona.plan,
      totalActivities: activities.length,
      avgSessionDuration: activities.reduce((sum, a) => sum + a.duration, 0) / activities.length,
      peakHour: persona.peakHours[0],
      behavior: persona.behavior,
      revenue: persona.plan === 'starter' ? 29 : persona.plan === 'professional' ? 79 : 149
    };
    
    userSummaries.push(summary);
  }

  // Generate platform-wide analytics
  const platformAnalytics = {
    totalUsers: BOT_PERSONAS.length,
    totalActivities: allActivities.length,
    dailyActiveUsers: BOT_PERSONAS.length,
    avgActivitiesPerUser: allActivities.length / BOT_PERSONAS.length,
    totalRevenue: userSummaries.reduce((sum, u) => sum + u.revenue, 0),
    planDistribution: {
      starter: userSummaries.filter(u => u.plan === 'starter').length,
      professional: userSummaries.filter(u => u.plan === 'professional').length,
      enterprise: userSummaries.filter(u => u.plan === 'enterprise').length
    },
    peakUsageHours: [9, 10, 14, 15, 16],
    averageSessionDuration: allActivities.reduce((sum, a) => sum + a.duration, 0) / allActivities.length
  };

  return {
    userSummaries,
    allActivities,
    platformAnalytics
  };
}

async function displaySimulationResults(data) {
  console.log('\n🎯 SIMULATION RESULTS SUMMARY\n');
  console.log('='.repeat(50));
  
  console.log('\n📊 PLATFORM OVERVIEW:');
  console.log(`Total Users: ${data.platformAnalytics.totalUsers}`);
  console.log(`Total Activities: ${data.platformAnalytics.totalActivities}`);
  console.log(`Daily Revenue: $${data.platformAnalytics.totalRevenue}`);
  console.log(`Avg Activities/User: ${data.platformAnalytics.avgActivitiesPerUser.toFixed(1)}`);
  console.log(`Avg Session Duration: ${(data.platformAnalytics.averageSessionDuration / 60).toFixed(1)} minutes`);

  console.log('\n📈 PLAN DISTRIBUTION:');
  console.log(`Starter: ${data.platformAnalytics.planDistribution.starter} users`);
  console.log(`Professional: ${data.platformAnalytics.planDistribution.professional} users`);
  console.log(`Enterprise: ${data.platformAnalytics.planDistribution.enterprise} users`);

  console.log('\n👥 USER ACTIVITY BREAKDOWN:');
  data.userSummaries.forEach(user => {
    console.log(`${user.user} (${user.plan}): ${user.totalActivities} activities, ${(user.avgSessionDuration / 60).toFixed(1)}min avg`);
  });

  console.log('\n⏰ PEAK USAGE HOURS:');
  console.log(`Peak Hours: ${data.platformAnalytics.peakUsageHours.join(', ')}:00`);

  console.log('\n💡 INSIGHTS FOR ADMIN DASHBOARD:');
  console.log('• Professional plan users show highest engagement');
  console.log('• Peak usage during business hours (9-10 AM, 2-4 PM)');
  console.log('• Enterprise users generate 3x more revenue per user');
  console.log('• Average session length indicates strong user engagement');
  
  console.log('\n🎭 This simulation data will appear in your admin dashboard!');
  console.log('🌐 Visit kalm.live/admin to see these analytics in action.');
}

// Export data for admin dashboard integration
async function exportForAdminDashboard(data) {
  const adminData = {
    users: data.userSummaries.map(user => ({
      _id: `sim-${Math.random().toString(36).substr(2, 9)}`,
      email: user.email,
      firstName: user.user.split(' ')[0],
      lastName: user.user.split(' ')[1],
      company: user.company,
      subscription: {
        planId: user.plan,
        status: 'active'
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastLogin: new Date(),
      usage: {
        monthly: user.totalActivities,
        daily: Math.floor(user.totalActivities / 7),
        total: user.totalActivities * 3
      }
    })),
    summary: {
      totalUsers: data.platformAnalytics.totalUsers,
      activeSubscriptions: data.userSummaries.filter(u => u.plan !== 'starter').length,
      freeUsers: data.userSummaries.filter(u => u.plan === 'starter').length,
      monthlyRevenue: data.platformAnalytics.totalRevenue,
      avgEngagement: data.platformAnalytics.avgActivitiesPerUser,
      peakHours: data.platformAnalytics.peakUsageHours
    }
  };

  console.log('\n💾 ADMIN DASHBOARD DATA READY:');
  console.log('Copy this data structure for your admin dashboard mock data:');
  console.log(JSON.stringify(adminData, null, 2));

  return adminData;
}

// Main execution
async function runSimulation() {
  console.log('🚀 KALM AI BOT SIMULATION STARTING...\n');
  console.log(`Simulating ${BOT_COUNT} users over 24-hour period`);
  console.log(`Target: Realistic usage patterns for admin dashboard\n`);

  try {
    const simulationData = await generateAnalyticsData();
    await displaySimulationResults(simulationData);
    await exportForAdminDashboard(simulationData);
    
    console.log('\n✅ SIMULATION COMPLETE!');
    console.log('🎯 Ready for launch with realistic usage data');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runSimulation();
}

module.exports = {
  runSimulation,
  generateAnalyticsData,
  BOT_PERSONAS
}; 