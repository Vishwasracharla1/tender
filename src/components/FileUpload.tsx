import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { TenderDocument } from '../lib/supabase';

interface FileUploadProps {
  tenderId: string;
  onFilesUploaded: (files: TenderDocument[]) => void;
}

export function FileUpload({ tenderId, onFilesUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<TenderDocument[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const newDocs: TenderDocument[] = files.map(file => ({
      id: crypto.randomUUID(),
      tender_id: tenderId,
      filename: file.name,
      file_type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      file_size: file.size,
      upload_status: Math.random() > 0.3 ? 'validated' : 'processing',
      validation_status: Math.random() > 0.3 ? 'passed' : 'warning',
      uploaded_at: new Date().toISOString(),
    }));

    setUploadedFiles(prev => [...prev, ...newDocs]);
    onFilesUploaded(newDocs);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (status: string) => {
    if (status === 'validated' || status === 'passed') {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (status === 'error' || status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.xls,.xlsx,.zip"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, XLS, or ZIP files up to 50MB
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} • {file.file_type}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(file.validation_status)}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
