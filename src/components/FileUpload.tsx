import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { TenderDocument } from '../lib/supabase';
import { uploadFileToCDN, ingestFilesToSchema, callTenderIntakeAgent, updateSchemaInstanceWithAgentResponse } from '../services/api';

interface FileUploadProps {
  tenderId: string;
  onFilesUploaded: (files: TenderDocument[]) => void;
  onSubmitToOverview?: () => void;
  department?: string;
  category?: string;
  subcategory?: string;
}

export function FileUpload({ tenderId, onFilesUploaded, onSubmitToOverview, department, category, subcategory }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<TenderDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);

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

        // Store file info for batch ingestion after all uploads complete
        // (We'll ingest all files together at the end)

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
    
    // Batch ingest all successfully uploaded files to schema
    if (successfulUploads.length > 0) {
      try {
        const filesToIngest = successfulUploads
          .filter(doc => doc.cdn_url)
          .map(doc => ({
            filename: doc.filename,
            cdnUrl: doc.cdn_url!,
          }));
        
        if (filesToIngest.length > 0) {
          await ingestFilesToSchema(filesToIngest, department, category, subcategory);
          console.log(`✅ Successfully ingested ${filesToIngest.length} file(s) to schema with department: ${department}, category: ${category}, subcategory: ${subcategory}`);
        }
      } catch (schemaError) {
        console.error(`⚠️ Failed to ingest files to schema:`, schemaError);
        // Don't fail the upload if schema ingestion fails, just log the error
      }
      
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
                onClick={async () => {
                  // Get CDN URLs from successfully uploaded files
                  const cdnUrls = uploadedFiles
                    .filter(doc => doc.cdn_url && doc.upload_status === 'validated')
                    .map(doc => doc.cdn_url!);
                  
                  if (cdnUrls.length === 0) {
                    alert('Please upload at least one file before submitting.');
                    return;
                  }

                  setIsAgentProcessing(true);
                  
                  try {
                    console.log('🤖 Calling Tender Intake Agent with uploaded documents...');
                    const agentResponse = await callTenderIntakeAgent(tenderId, cdnUrls);
                    console.log('✅ Tender Intake Agent processed documents:', agentResponse);
                    
                    // Wait a moment for agent processing to complete
                    console.log('⏳ Waiting 3 seconds for agent processing to complete...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Update schema instance with agent response using stored ID
                    try {
                      console.log('📝 Updating schema instance with agent response...');
                      await updateSchemaInstanceWithAgentResponse(agentResponse);
                      console.log('✅ Schema instance updated successfully with agent response');
                    } catch (updateError) {
                      console.error('❌ Failed to update schema instance:', updateError);
                      // Don't fail the whole process if update fails, just log the error
                    }
                    
                    // Extract tender data from agent response and store in sessionStorage
                    // Try to parse the text field from agent response
                    let parsedText: any = {};
                    if (agentResponse?.text) {
                      try {
                        parsedText = typeof agentResponse.text === 'string' 
                          ? JSON.parse(agentResponse.text) 
                          : agentResponse.text;
                      } catch (e) {
                        // If parsing fails, try to extract JSON
                        const jsonMatch = agentResponse.text.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                          parsedText = JSON.parse(jsonMatch[0]);
                        }
                      }
                    }
                    
                    // Use parsed text or fallback to agentResponse.data or agentResponse
                    const responseData = parsedText || agentResponse.data || agentResponse;
                    
                    // Store tender data in sessionStorage for TenderOverviewPage
                    sessionStorage.setItem('agent_response', JSON.stringify(responseData));
                    console.log('💾 Stored tender data in sessionStorage for TenderOverviewPage');
                    
                    // Clear files and navigate to overview page
                    setUploadedFiles([]);
                    setUploadingFiles(new Set());
                    
                    // Navigate to tender overview page
                    if (onSubmitToOverview) {
                      onSubmitToOverview();
                    }
                    
                  } catch (agentError) {
                    console.error(`❌ Failed to call Tender Intake Agent:`, agentError);
                    alert('Failed to process documents with agent. Please try again.');
                  } finally {
                    setIsAgentProcessing(false);
                  }
                }}
                disabled={isAgentProcessing || uploadingFiles.size > 0}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAgentProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Agent Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    Submit
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Agent Processing Loader Overlay */}
          {isAgentProcessing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Agent Processing Documents
                    </h3>
                    <p className="text-sm text-gray-600">
                      The agent is extracting and analyzing your documents. This may take a few moments...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
