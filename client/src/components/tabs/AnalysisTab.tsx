import { useState, useRef } from 'react';
import { Upload, FileText, Mic, Play, Pause, Volume2, Clock, Languages, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { CloudArrowUpIcon, DocumentCheckIcon, ExclamationTriangleIcon, SparklesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import AudioUpload from '../AudioUpload';

interface Analysis {
  summary: string;
  objections: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyTopics: { topic: string; frequency: number }[];
  participantCount: number;
  audioMetadata?: {
    duration: number;
    language: string;
    confidence: number;
    fileSize: number;
    whisperModel: string;
  };
  sourceType?: 'text' | 'audio';
  transcriptionConfidence?: number;
}

interface AnalysisTabProps {
  onAnalyze: (formData: FormData) => void;
  isAnalyzing: boolean;
  progress: number;
  stage: string;
  analysis: Analysis | null;
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({
  onAnalyze,
  isAnalyzing,
  progress,
  stage,
  analysis
}) => {
  const [uploadMode, setUploadMode] = useState<'text' | 'audio'>('text');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (selectedFile: File) => {
    setFile(selectedFile);
    const formData = new FormData();
    formData.append('transcript', selectedFile);
    onAnalyze(formData);
  };

  const handleTextFileUpload = () => {
    if (!file) return;
    handleFileUpload(file);
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          {/* Upload Mode Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setUploadMode('text')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  uploadMode === 'text'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Text Documents</span>
              </button>
              <button
                onClick={() => setUploadMode('audio')}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                  uploadMode === 'audio'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span>Audio Files</span>
              </button>
            </div>
          </div>

          {uploadMode === 'text' ? (
            <>
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
                          ref={fileInputRef}
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
                      onClick={handleTextFileUpload}
                      disabled={isAnalyzing}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                    >
                      {isAnalyzing ? (
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
                  
                  {isAnalyzing && (
                    <div className="mt-4 animate-fade-in">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{stage || 'Processing...'}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-300">
              <AudioUpload
                onUpload={handleFileUpload}
                isUploading={isAnalyzing}
                progress={progress}
                stage={stage}
              />
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
                  {analysis.sourceType === 'audio' && (
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {analysis.audioMetadata && (
                        <>
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatDuration(analysis.audioMetadata.duration)}
                          </span>
                          <span className="flex items-center">
                            <Languages className="w-4 h-4 mr-1" />
                            {analysis.audioMetadata.language.toUpperCase()}
                          </span>
                          <span className="flex items-center">
                            <Volume2 className="w-4 h-4 mr-1" />
                            {Math.round(analysis.audioMetadata.confidence * 100)}% confidence
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {analysis.sentiment && (
                  <div className={`px-6 py-3 bg-gradient-to-r ${getSentimentColor(analysis.sentiment)} text-white rounded-2xl font-semibold text-lg flex items-center shadow-lg`}>
                    <span className="mr-2">{getSentimentIcon(analysis.sentiment)}</span>
                    {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} Sentiment
                    <span className="ml-2 text-sm opacity-90">({analysis.confidence}%)</span>
                  </div>
                )}
                {analysis.sourceType && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    analysis.sourceType === 'audio' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {analysis.sourceType === 'audio' ? (
                      <>
                        <Mic className="w-3 h-3 mr-1" />
                        Audio Source
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        Text Source
                      </>
                    )}
                  </span>
                )}
              </div>
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
};

export default AnalysisTab; 