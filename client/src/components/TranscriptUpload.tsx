import { useState } from 'react';
import { CloudArrowUpIcon, DocumentCheckIcon, ExclamationTriangleIcon, SparklesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TranscriptAnalysis {
  summary: string;
  objections: string[];
  actionItems: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence?: number;
}

interface TranscriptUploadProps {
  onAnalysis: (analysis: TranscriptAnalysis) => void;
  user?: any;
  token?: string;
}

export default function TranscriptUpload({ onAnalysis, user, token }: TranscriptUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<TranscriptAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('transcript', file);
    
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('http://localhost:3007/api/analyze-transcript', {
        method: 'POST',
        headers,
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setAnalysis(data);
      onAnalysis(data); // Call the parent callback with the analysis
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload and analyze transcript. Please try again.');
      setUploadProgress(0);
    }
    
    setUploading(false);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'from-green-500 to-emerald-600';
      case 'negative': return 'from-red-500 to-rose-600';
      default: return 'from-yellow-500 to-orange-600';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
          <div className="flex items-center mb-4">
            <SparklesIcon className="h-8 w-8 mr-3" />
            <h2 className="text-3xl font-bold">Upload Sales Call Transcript</h2>
          </div>
          <p className="text-indigo-100 text-lg">
            Get instant AI-powered insights from your sales conversations
          </p>
        </div>
        
        <div className="p-8">
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50 scale-105' 
                : file 
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="animate-fade-in">
                <DocumentCheckIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <p className="text-xl font-semibold text-gray-900 mb-2">File Ready!</p>
                <p className="text-gray-600">{file.name}</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-6 transition-all duration-300 ${
                  dragActive ? 'text-indigo-500 scale-110' : 'text-gray-400'
                }`} />
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-gray-900">
                    Drop your transcript file here
                  </p>
                  <p className="text-gray-500 text-lg">or</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 cursor-pointer font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.doc,.docx,.pdf"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                  📄 Supports: TXT, DOC, DOCX, PDF files • Max 10MB
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <DocumentCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={uploadFile}
                  disabled={uploading}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Analyze Transcript
                    </>
                  )}
                </button>
              </div>
              
              {uploading && (
                <div className="mt-4 animate-fade-in">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Results Header */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-600 text-lg">AI-powered insights from your sales conversation</p>
                </div>
              </div>
              {analysis.sentiment && (
                <div className={`px-6 py-3 bg-gradient-to-r ${getSentimentColor(analysis.sentiment)} text-white rounded-2xl font-semibold text-lg flex items-center shadow-lg`}>
                  <span className="mr-2">{getSentimentIcon(analysis.sentiment)}</span>
                  {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} Sentiment
                  {analysis.confidence && (
                    <span className="ml-2 text-sm opacity-90">({analysis.confidence}%)</span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis Cards */}
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {/* Summary Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <DocumentCheckIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Summary</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary}</p>
            </div>
            
            {/* Objections Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Objections</h4>
              </div>
              <ul className="space-y-3">
                {analysis.objections.map((objection, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{objection}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action Items Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Next Steps</h4>
              </div>
              <ul className="space-y-3">
                {analysis.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
            <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">What's Next?</h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                📧 Generate Follow-up Email
              </button>
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                🤖 Chat with AI Assistant
              </button>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                📊 View Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
