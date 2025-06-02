import { useState } from 'react';
import { EnvelopeIcon, SparklesIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface TranscriptAnalysis {
  summary: string;
  objections: string[];
  actionItems: string[];
}

interface EmailGeneratorProps {
  analysis: TranscriptAnalysis | null;
}

export default function EmailGenerator({ analysis }: EmailGeneratorProps) {
  const [emailType, setEmailType] = useState<'followup' | 'proposal' | 'objection'>('followup');
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [tone, setTone] = useState<'professional' | 'casual' | 'persuasive'>('professional');
  const [customPrompt, setCustomPrompt] = useState('');

  const generateEmail = async () => {
    if (!analysis) return;
    
    setGenerating(true);
    try {
      const response = await fetch('http://localhost:3007/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis,
          emailType,
          tone,
          customPrompt
        }),
      });
      
      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error('Email generation failed:', error);
      setGeneratedEmail('Error generating email. Please try again.');
    }
    setGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
  };

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Generator</h3>
          <p className="text-gray-500">Upload and analyze a transcript first to generate personalized emails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Email Generator</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
          <select 
            value={emailType} 
            onChange={(e) => setEmailType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="followup">Follow-up Email</option>
            <option value="proposal">Proposal Email</option>
            <option value="objection">Objection Handling</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="persuasive">Persuasive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Prompt</label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={generateEmail}
        disabled={generating}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-6"
      >
        {generating ? (
          <>
            <SparklesIcon className="h-5 w-5 mr-2 animate-spin" />
            Generating Email...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5 mr-2" />
            Generate Email
          </>
        )}
      </button>

      {generatedEmail && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900">Generated Email</h4>
            <button
              onClick={copyToClipboard}
              className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {generatedEmail}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 