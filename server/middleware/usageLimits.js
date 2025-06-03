const User = require('../models/User');
const Transcript = require('../models/Transcript');

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    monthlyTranscripts: 5,
    dailyTranscripts: 2,
    features: {
      advancedAnalytics: false,
      teamCollaboration: false,
      prioritySupport: false,
      crmIntegrations: false,
      customTemplates: false
    }
  },
  starter: {
    monthlyTranscripts: 50,
    dailyTranscripts: 10,
    features: {
      advancedAnalytics: false,
      teamCollaboration: false,
      prioritySupport: false,
      crmIntegrations: false,
      customTemplates: true
    }
  },
  professional: {
    monthlyTranscripts: 0, // unlimited
    dailyTranscripts: 0, // unlimited
    features: {
      advancedAnalytics: true,
      teamCollaboration: true,
      prioritySupport: true,
      crmIntegrations: true,
      customTemplates: true
    }
  },
  enterprise: {
    monthlyTranscripts: 0, // unlimited
    dailyTranscripts: 0, // unlimited
    features: {
      advancedAnalytics: true,
      teamCollaboration: true,
      prioritySupport: true,
      crmIntegrations: true,
      customTemplates: true,
      ssoIntegration: true,
      apiAccess: true,
      whiteLabel: true
    }
  }
};

// Check transcript upload limits
const checkTranscriptLimits = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = req.user;
    
    // Admin emails get unlimited access
    const adminEmails = [
      'alexfisher@mac.home', 
      'alexfisher.dev@gmail.com',
      'alex@kalm.live',
      'admin@kalm.live'
    ].map(email => email.toLowerCase()); // Normalize admin emails
    
    const userEmail = user.email?.toLowerCase(); // Normalize user email
    
    if (userEmail && adminEmails.includes(userEmail)) {
      console.log(`✅ Admin access granted for ${user.email}`);
      return next(); // Skip all limits for admin
    }
    
    // Get user's current plan (default to free)
    const planId = user.subscription?.planId || 'free';
    const planLimits = PLAN_LIMITS[planId];
    
    if (!planLimits) {
      return res.status(400).json({ 
        error: 'Invalid subscription plan',
        code: 'INVALID_PLAN'
      });
    }
    
    // Check if plan has unlimited usage
    if (planLimits.monthlyTranscripts === 0) {
      return next(); // Unlimited - proceed
    }
    
    // Calculate date ranges
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get current usage
    const [monthlyCount, dailyCount] = await Promise.all([
      Transcript.countDocuments({ 
        userId: userId, 
        createdAt: { $gte: monthStart } 
      }),
      Transcript.countDocuments({ 
        userId: userId, 
        createdAt: { $gte: dayStart } 
      })
    ]);
    
    // Check monthly limit
    if (monthlyCount >= planLimits.monthlyTranscripts) {
      return res.status(429).json({
        error: `Monthly limit exceeded. You've used ${monthlyCount}/${planLimits.monthlyTranscripts} transcript analyses this month.`,
        code: 'MONTHLY_LIMIT_EXCEEDED',
        currentUsage: {
          monthly: monthlyCount,
          limit: planLimits.monthlyTranscripts,
          planId: planId
        },
        upgradeMessage: 'Upgrade to Professional for unlimited analyses'
      });
    }
    
    // Check daily limit
    if (planLimits.dailyTranscripts > 0 && dailyCount >= planLimits.dailyTranscripts) {
      return res.status(429).json({
        error: `Daily limit exceeded. You've used ${dailyCount}/${planLimits.dailyTranscripts} transcript analyses today.`,
        code: 'DAILY_LIMIT_EXCEEDED',
        currentUsage: {
          daily: dailyCount,
          limit: planLimits.dailyTranscripts,
          planId: planId
        },
        upgradeMessage: 'Upgrade for higher daily limits'
      });
    }
    
    // Add usage info to request for display
    req.usageInfo = {
      planId,
      monthly: {
        used: monthlyCount,
        limit: planLimits.monthlyTranscripts,
        remaining: planLimits.monthlyTranscripts - monthlyCount
      },
      daily: {
        used: dailyCount,
        limit: planLimits.dailyTranscripts,
        remaining: planLimits.dailyTranscripts > 0 ? planLimits.dailyTranscripts - dailyCount : 'unlimited'
      }
    };
    
    next();
    
  } catch (error) {
    console.error('Usage limit check error:', error);
    res.status(500).json({ 
      error: 'Failed to check usage limits',
      code: 'USAGE_CHECK_FAILED'
    });
  }
};

// Check feature access
const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Admin emails get access to all features
      const adminEmails = [
        'alexfisher@mac.home', 
        'alexfisher.dev@gmail.com',
        'alex@kalm.live',
        'admin@kalm.live'
      ].map(email => email.toLowerCase()); // Normalize admin emails
      
      const userEmail = user.email?.toLowerCase(); // Normalize user email
      
      if (userEmail && adminEmails.includes(userEmail)) {
        console.log(`✅ Admin feature access granted for ${user.email}: ${feature}`);
        return next(); // Skip all feature restrictions for admin
      }
      
      const planId = user.subscription?.planId || 'free';
      const planLimits = PLAN_LIMITS[planId];
      
      if (!planLimits) {
        return res.status(400).json({ 
          error: 'Invalid subscription plan',
          code: 'INVALID_PLAN'
        });
      }
      
      if (!planLimits.features[feature]) {
        return res.status(403).json({
          error: `Feature '${feature}' is not available in your ${planId} plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          requiredPlan: getMinimumPlanForFeature(feature),
          upgradeMessage: `Upgrade to ${getMinimumPlanForFeature(feature)} to access this feature`
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ 
        error: 'Failed to check feature access',
        code: 'FEATURE_CHECK_FAILED'
      });
    }
  };
};

// Get usage statistics for a user
const getUserUsageStats = async (userId) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [monthlyCount, dailyCount, totalCount] = await Promise.all([
      Transcript.countDocuments({ 
        userId: userId, 
        createdAt: { $gte: monthStart } 
      }),
      Transcript.countDocuments({ 
        userId: userId, 
        createdAt: { $gte: dayStart } 
      }),
      Transcript.countDocuments({ userId: userId })
    ]);
    
    return {
      monthly: monthlyCount,
      daily: dailyCount,
      total: totalCount,
      monthStart: monthStart,
      dayStart: dayStart
    };
    
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return null;
  }
};

// Helper function to determine minimum plan for feature
const getMinimumPlanForFeature = (feature) => {
  for (const [planName, planConfig] of Object.entries(PLAN_LIMITS)) {
    if (planConfig.features[feature]) {
      return planName;
    }
  }
  return 'enterprise';
};

module.exports = {
  checkTranscriptLimits,
  checkFeatureAccess,
  getUserUsageStats,
  PLAN_LIMITS
}; 