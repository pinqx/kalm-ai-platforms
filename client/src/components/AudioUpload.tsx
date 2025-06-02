import React, { useState, useRef } from 'react';
import { Upload, Mic, FileAudio, AlertCircle, CheckCircle } from 'lucide-react';

interface AudioUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
  stage: string;
  acceptedFormats?: string[];
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  onUpload,
  isUploading,
  progress,
  stage,
  acceptedFormats = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/flac']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatNames = {
    'audio/mpeg': 'MP3',
    'audio/wav': 'WAV',
    'audio/mp4': 'M4A',
    'audio/webm': 'WEBM',
    'audio/ogg': 'OGG',
    'audio/flac': 'FLAC'
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format. Supported formats: ${acceptedFormats.map(f => formatNames[f as keyof typeof formatNames] || f).join(', ')}`
      };
    }

    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 25MB.'
      };
    }

    return { valid: true };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadStatus('validating');
    setErrorMessage('');

    const validation = validateAudioFile(file);
    
    if (!validation.valid) {
      setUploadStatus('error');
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setUploadStatus('success');
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getProgressColor = () => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (uploadStatus === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (uploadStatus === 'success' && !isUploading) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isUploading) return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <FileAudio className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          disabled={isUploading}
        />

        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {isUploading ? (
              <div className="relative">
                <Mic className="w-12 h-12 text-blue-500" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : (
              <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isUploading ? 'Processing Audio...' : 'Upload Audio File'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isUploading 
                ? stage 
                : 'Drag and drop your audio file here, or click to select'
              }
            </p>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Status Message */}
          {uploadStatus === 'error' && errorMessage && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {uploadStatus === 'success' && !isUploading && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">File ready for processing</span>
            </div>
          )}

          {/* Upload Button */}
          {!isUploading && (
            <button
              onClick={onButtonClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Audio File
            </button>
          )}
        </div>
      </div>

      {/* Supported Formats */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supported formats: {acceptedFormats.map(format => formatNames[format as keyof typeof formatNames]).join(', ')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: 25MB
        </p>
      </div>

      {/* Processing Info */}
      {isUploading && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                Audio Processing Pipeline
              </h4>
              <div className="mt-2 text-xs text-blue-700 space-y-1">
                <div className={`flex items-center space-x-2 ${progress >= 10 ? 'text-blue-900 font-medium' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 10 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span>File validation</span>
                </div>
                <div className={`flex items-center space-x-2 ${progress >= 25 ? 'text-blue-900 font-medium' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span>Audio preprocessing</span>
                </div>
                <div className={`flex items-center space-x-2 ${progress >= 50 ? 'text-blue-900 font-medium' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span>Speech-to-text transcription</span>
                </div>
                <div className={`flex items-center space-x-2 ${progress >= 75 ? 'text-blue-900 font-medium' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span>AI analysis</span>
                </div>
                <div className={`flex items-center space-x-2 ${progress >= 100 ? 'text-blue-900 font-medium' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUpload; 