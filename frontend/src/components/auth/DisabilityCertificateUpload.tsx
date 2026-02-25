import React, { useState, useRef } from 'react';
import { Upload, FileCheck, Loader2, AlertCircle, Accessibility } from 'lucide-react';

interface DisabilityCertificateUploadProps {
  onUpload: (file: File) => Promise<boolean>;
  onBack: () => void;
  isLoading: boolean;
}

export const DisabilityCertificateUpload: React.FC<DisabilityCertificateUploadProps> = ({
  onUpload,
  onBack,
  isLoading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const success = await onUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="bg-black/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-black/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Accessibility className="text-black" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Upload Disability Certificate</h2>
          <p className="text-black/70">Please upload a valid disability certificate for accessible voting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${dragActive ? 'border-blue-400 bg-blue-500/10' : 'border-black/30 hover:border-black/50'}
              ${file ? 'border-green-400 bg-green-500/10' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="space-y-3">
                <FileCheck className="mx-auto text-green-400" size={48} />
                <p className="text-black font-medium">{file.name}</p>
                <p className="text-black/60 text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="mx-auto text-black/60" size={48} />
                <p className="text-black/90">Drop your disability certificate here</p>
                <p className="text-black/60 text-sm">or click to browse</p>
              </div>
            )}

            {isLoading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="bg-black/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-black/70 text-sm mt-2">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-1">Accepted Documents:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Government issued disability certificate</li>
                <li>Medical certificate from recognized hospital</li>
                <li>JPG, PNG, PDF formats accepted</li>
                <li>File size must be under 10MB</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-black rounded-xl font-semibold
                       hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !file}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-600 
                       text-black rounded-xl font-semibold
                       hover:from-purple-600 hover:to-blue-700 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-105 transition-all duration-300
                       shadow-lg hover:shadow-xl
                       flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Verifying...
                </>
              ) : (
                'Upload & Verify'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-black/60 text-sm">
            Your certificate will be verified by our accessibility team
          </p>
        </div>
      </div>
    </div>
  );
};