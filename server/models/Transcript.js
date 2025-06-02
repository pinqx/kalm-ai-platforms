const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  transcriptContent: {
    type: String,
    required: true
  },
  analysis: {
    summary: {
      type: String,
      required: true
    },
    objections: [{
      type: String
    }],
    actionItems: [{
      type: String
    }],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    keyTopics: [{
      topic: String,
      frequency: Number
    }],
    participantCount: {
      type: Number,
      default: 2
    }
  },
  metadata: {
    duration: Number, // in seconds
    callDate: Date,
    participants: [{
      name: String,
      role: String,
      company: String
    }],
    prospect: {
      company: String,
      industry: String,
      size: String,
      revenue: String
    }
  },
  generatedEmails: [{
    type: {
      type: String,
      enum: ['followup', 'proposal', 'objection'],
      required: true
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'persuasive'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatHistory: [{
    message: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
transcriptSchema.index({ userId: 1, createdAt: -1 });
transcriptSchema.index({ 'analysis.sentiment': 1 });
transcriptSchema.index({ status: 1 });
transcriptSchema.index({ tags: 1 });

// Virtual for formatted file size
transcriptSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for time ago
transcriptSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Ensure virtual fields are serialized
transcriptSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transcript', transcriptSchema); 