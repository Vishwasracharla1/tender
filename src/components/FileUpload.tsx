import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { TenderDocument } from '../lib/supabase';
import { uploadFileToCDN, ingestFileToSchema } from '../services/api';

interface FileUploadProps {
  tenderId: string;
  onFilesUploaded: (files: TenderDocument[]) => void;
  onSubmitToOverview?: () => void;
}

export function FileUpload({ tenderId, onFilesUploaded, onSubmitToOverview }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<TenderDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

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
    const uploadPromises = files.map(async (file) => {
      const fileId = crypto.randomUUID();
      const tempDoc: TenderDocument = {
        id: fileId,
        tender_id: tenderId,
        filename: file.name,
        file_type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        file_size: file.size,
        upload_status: 'uploading',
        validation_status: 'pending',
        uploaded_at: new Date().toISOString(),
      };

      // Add to uploading set
      setUploadingFiles(prev => new Set(prev).add(fileId));
      
      // Add temporary doc to show upload in progress
      setUploadedFiles(prev => [...prev, tempDoc]);

      try {
        // Upload file to CDN
        const uploadResponse = await uploadFileToCDN(file, 'CMS');
        
        // Update document with CDN URL
        const finalDoc: TenderDocument = {
          ...tempDoc,
          upload_status: 'validated',
          validation_status: 'passed',
          cdn_url: uploadResponse.cdn_url,
        };

        // Ingest file data into schema (filename and CDN URL)
        if (uploadResponse.cdn_url) {
          try {
            await ingestFileToSchema(file.name, uploadResponse.cdn_url);
            console.log(`✅ File ${file.name} ingested into schema successfully`);
          } catch (schemaError) {
            console.error(`⚠️ Failed to ingest ${file.name} into schema:`, schemaError);
            // Don't fail the upload if schema ingestion fails, just log the error
          }
        }

        // Remove from uploading set
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });

        // Update the file in the list
        setUploadedFiles(prev => {
          return prev.map(f => f.id === fileId ? finalDoc : f);
        });

        return finalDoc;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        
        // Update document with error status
        const errorDoc: TenderDocument = {
          ...tempDoc,
          upload_status: 'error',
          validation_status: 'failed',
        };

        // Remove from uploading set
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });

        // Update the file in the list
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? errorDoc : f));

        return errorDoc;
      }
    });

    // Wait for all uploads to complete
    const uploadedDocs = await Promise.all(uploadPromises);
    
    // Only call callback with successfully uploaded files
    const successfulUploads = uploadedDocs.filter(doc => doc.upload_status === 'validated');
    if (successfulUploads.length > 0) {
      onFilesUploaded(successfulUploads);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (file: TenderDocument) => {
    if (uploadingFiles.has(file.id)) {
      return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
    if (file.upload_status === 'validated' || file.validation_status === 'passed') {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (file.upload_status === 'error' || file.validation_status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileNameWithoutExtension = (filename: string) => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
          ${isDragging
            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 shadow-[0_18px_40px_rgba(5,150,105,0.15)]'
            : 'border-slate-300 bg-gradient-to-br from-white via-slate-50 to-white hover:border-indigo-400 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-inner transition-all duration-300 ${
            isDragging
              ? 'from-emerald-500 to-teal-500'
              : 'from-indigo-500 to-purple-500'
          }`}>
            <Upload className={`w-8 h-8 text-white`} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              All file types supported (PDF, DOC, DOCX, XLS, XLSX, ZIP, etc.)
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-4 bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {getFileNameWithoutExtension(file.filename)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatFileSize(file.file_size)} • {file.file_type}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(file)}
                  {file.cdn_url && (
                    <a
                      href={file.cdn_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      title="View file"
                    >
                      View
                    </a>
                  )}
                  {!uploadingFiles.has(file.id) && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button - Small, below uploaded files */}
          {onSubmitToOverview && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setUploadedFiles([]);
                  setUploadingFiles(new Set());
                  // Navigate to overview page
                  onSubmitToOverview();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
