const OpenAI = require('openai');
const fs = require('fs');
const FormData = require('form-data');
const { logAI } = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param {string} audioFilePath - Path to the audio file
 * @param {Object} options - Transcription options
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {Promise<Object>} Transcription result
 */
async function transcribeAudioFile(audioFilePath, options = {}, progressCallback = null) {
  try {
    logAI('Audio transcription started', {
      filePath: audioFilePath,
      options,
      timestamp: new Date().toISOString()
    });

    // Progress update: File validation
    if (progressCallback) {
      progressCallback({
        stage: 'Validating audio file...',
        progress: 10
      });
    }

    // Validate file exists and size
    const stats = fs.statSync(audioFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > 25) {
      throw new Error('Audio file too large. Maximum size is 25MB for Whisper API.');
    }

    // Progress update: Preparing upload
    if (progressCallback) {
      progressCallback({
        stage: 'Preparing audio for transcription...',
        progress: 25
      });
    }

    // Check if we should use real OpenAI or mock
    const useOpenAI = process.env.USE_OPENAI !== 'false' && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    
    let transcriptionResult;

    if (useOpenAI) {
      // Progress update: Sending to OpenAI
      if (progressCallback) {
        progressCallback({
          stage: 'Transcribing audio with AI...',
          progress: 50
        });
      }

      // Create transcription using Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: options.language || 'en', // Auto-detect if not specified
        response_format: 'verbose_json', // Get detailed response with timestamps
        temperature: 0.2 // Lower temperature for more consistent results
      });

      transcriptionResult = {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments || [],
        confidence: calculateAverageConfidence(transcription.segments || [])
      };

      logAI('OpenAI Whisper transcription completed', {
        textLength: transcription.text.length,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments?.length || 0
      });

    } else {
      // Mock transcription for development/testing
      if (progressCallback) {
        progressCallback({
          stage: 'Processing audio (mock mode)...',
          progress: 70
        });
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      transcriptionResult = {
        text: generateMockTranscription(audioFilePath),
        language: 'en',
        duration: 180.5, // Mock duration
        segments: generateMockSegments(),
        confidence: 0.95,
        mockMode: true
      };

      logAI('Mock audio transcription completed', {
        filePath: audioFilePath,
        textLength: transcriptionResult.text.length
      });
    }

    // Progress update: Processing complete
    if (progressCallback) {
      progressCallback({
        stage: 'Transcription complete!',
        progress: 100
      });
    }

    return {
      success: true,
      transcription: transcriptionResult,
      metadata: {
        originalFileName: audioFilePath.split('/').pop(),
        fileSize: fileSizeMB,
        processingTime: Date.now(),
        whisperModel: useOpenAI ? 'whisper-1' : 'mock',
        apiUsed: useOpenAI ? 'OpenAI' : 'Mock'
      }
    };

  } catch (error) {
    logAI('Audio transcription failed', {
      error: error.message,
      filePath: audioFilePath,
      stack: error.stack
    });

    if (progressCallback) {
      progressCallback({
        stage: 'Transcription failed',
        progress: 0,
        error: error.message
      });
    }

    throw new Error(`Audio transcription failed: ${error.message}`);
  }
}

/**
 * Calculate average confidence from segments
 */
function calculateAverageConfidence(segments) {
  if (!segments || segments.length === 0) return 0.9; // Default confidence
  
  const totalConfidence = segments.reduce((sum, segment) => {
    return sum + (segment.confidence || 0.9);
  }, 0);
  
  return totalConfidence / segments.length;
}

/**
 * Generate mock transcription for testing
 */
function generateMockTranscription(filePath) {
  const mockTranscripts = [
    "Thank you for taking the time to speak with me today about our AI-powered sales platform. I understand you're looking for a solution that can help your team analyze sales calls more effectively and improve conversion rates. Let me walk you through how our platform works. We use advanced AI to automatically transcribe and analyze your sales conversations, identifying key objections, sentiment, and providing actionable insights. The platform can help you track which talking points resonate most with prospects and which objections come up frequently. This allows you to refine your sales approach and train your team more effectively. What specific challenges is your sales team currently facing with call analysis?",
    
    "Good morning! I'm calling to follow up on our previous conversation about implementing our sales intelligence platform at your company. I know you mentioned concerns about the integration process and training requirements. I've prepared some case studies from similar companies in your industry that show the implementation typically takes 2-3 weeks and our team provides comprehensive onboarding support. The ROI has been impressive - most clients see a 25-30% improvement in conversion rates within the first quarter. Would you like me to schedule a technical demonstration where we can show you exactly how the platform would work with your existing CRM system?",
    
    "Hi there, I wanted to reach out because I noticed your company has been expanding rapidly and I thought our conversation intelligence platform might be valuable for scaling your sales operations. Many growing companies like yours struggle with maintaining consistent sales performance as they add new team members. Our platform helps by providing real-time coaching insights and identifying the most effective sales strategies from your top performers. We can analyze patterns in successful calls and help replicate that success across your entire team. Are you currently using any tools for sales call analysis or training?"
  ];

  const randomIndex = Math.floor(Math.random() * mockTranscripts.length);
  return mockTranscripts[randomIndex];
}

/**
 * Generate mock segments for testing
 */
function generateMockSegments() {
  return [
    {
      id: 0,
      start: 0.0,
      end: 8.5,
      text: "Thank you for taking the time to speak with me today about our AI-powered sales platform.",
      confidence: 0.98
    },
    {
      id: 1,
      start: 8.5,
      end: 15.2,
      text: "I understand you're looking for a solution that can help your team analyze sales calls more effectively.",
      confidence: 0.96
    },
    {
      id: 2,
      start: 15.2,
      end: 22.8,
      text: "Let me walk you through how our platform works and the benefits it can provide.",
      confidence: 0.94
    }
  ];
}

/**
 * Get supported audio formats
 */
function getSupportedAudioFormats() {
  return [
    'audio/mpeg', // MP3
    'audio/wav',  // WAV
    'audio/mp4',  // M4A
    'audio/webm', // WEBM
    'audio/ogg',  // OGG
    'audio/flac'  // FLAC
  ];
}

/**
 * Validate audio file format
 */
function isValidAudioFormat(mimeType) {
  return getSupportedAudioFormats().includes(mimeType);
}

module.exports = {
  transcribeAudioFile,
  getSupportedAudioFormats,
  isValidAudioFormat
}; 