import { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Filter, Upload, X, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchVendorIntakeInstances, type VendorIntakeInstanceItem, uploadFileToCDN } from '../services/api';

interface VendorIntakePageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding' | 'evaluation-breakdown' | 'evaluation-recommendation' | 'evaluation-gov-tender' | 'admin' | 'vendor-intake') => void;
}

interface Tender {
  id: string;
  title: string;
  department: string;
  category: string;
  dateCreated: string;
  status: 'evaluation' | 'locked' | 'completed';
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  cdn_url?: string;
}

export function VendorIntakePage({ onNavigate }: VendorIntakePageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTender, setSelectedTender] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [schemaInstances, setSchemaInstances] = useState<VendorIntakeInstanceItem[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  
  // Store all CDN URLs in one variable for agent payload
  const [cdnUrls, setCdnUrls] = useState<string[]>([]);

  // Extract unique departments from schema instances
  const departmentsFromSchema = useMemo(() => {
    const deptSet = new Set<string>();
    schemaInstances.forEach((instance) => {
      // Try multiple possible field name variations
      const dept = (instance as any).department || (instance as any).Department || (instance as any).departmentName || 
                   (instance as any)['//department'] || (instance as any)['department'];
      if (dept && typeof dept === 'string' && dept.trim()) {
        deptSet.add(dept.trim());
      }
    });
    const departments = Array.from(deptSet).sort();
    console.log('📋 Extracted departments:', departments);
    return departments;
  }, [schemaInstances]);

  // Extract unique tenders from schema instances
  const tendersFromSchema = useMemo(() => {
    const tenderMap = new Map<string, Tender>();
    schemaInstances.forEach((instance, index) => {
      const inst = instance as any;
      // Try multiple possible field name variations for tender name - check lowercase first
      const tenderName = inst.tenderName || inst['tenderName'] || inst.tender || inst.Tender || 
                         inst.TenderName || inst.tender_name || inst['Tender Name'];
      // Try multiple possible field name variations for department - check lowercase first
      const department = inst.department || inst['department'] || inst.Department || 
                         inst.departmentName || inst['//department'] || inst['Department'];
      
      // Debug log for first few instances
      if (index < 3) {
        console.log(`🔍 Instance ${index}:`, {
          hasTenderName: !!tenderName,
          tenderNameValue: tenderName,
          hasDepartment: !!department,
          departmentValue: department,
          allKeys: Object.keys(inst)
        });
      }
      
      if (tenderName && typeof tenderName === 'string' && tenderName.trim()) {
        // Create a unique ID - use tenderId if available, otherwise generate from tenderName
        const tenderId = inst.tenderId ? String(inst.tenderId) : 
                         (instance.id ? String(instance.id) : 
                         tenderName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase());
        
        const tenderKey = tenderId || `TND-${tenderName.trim().replace(/\s+/g, '-').substring(0, 20)}`;
        
        if (!tenderMap.has(tenderKey)) {
          tenderMap.set(tenderKey, {
            id: tenderKey,
            title: tenderName.trim(),
            department: (department && typeof department === 'string') ? department.trim() : '',
            category: '',
            dateCreated: inst.timestamp ? new Date(inst.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: 'evaluation',
          });
        }
      }
    });
    const tenders = Array.from(tenderMap.values());
    console.log('📋 Extracted tenders:', tenders);
    console.log('📋 Total tenders extracted:', tenders.length);
    console.log('📋 Tenders by department:', tenders.reduce((acc, t) => {
      const dept = t.department || '(no department)';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    return tenders;
  }, [schemaInstances]);

  // Fetch schema instances on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchSchemaData = async () => {
      try {
        setIsLoadingSchema(true);
        setSchemaError(null);
        console.log('Fetching vendor intake schema instances...');
        const instances = await fetchVendorIntakeInstances(100);
        setSchemaInstances(instances);
        console.log('✅ Vendor intake schema instances loaded:', instances);
        console.log('📊 Total instances:', instances.length);
        if (instances.length > 0) {
          console.log('📊 Sample instance structure:', instances[0]);
          console.log('📊 All field keys in first instance:', Object.keys(instances[0]));
          // Check for department and tenderName fields
          const sample = instances[0] as any;
          console.log('📊 Department value:', sample.department || sample.Department || sample['//department']);
          console.log('📊 TenderName value:', sample.tenderName || sample.tender || sample.Tender);
        }
      } catch (error) {
        console.error('❌ Error fetching vendor intake schema:', error);
        setSchemaError(error instanceof Error ? error.message : 'Failed to load schema data');
      } finally {
        setIsLoadingSchema(false);
      }
    };

    fetchSchemaData();
  }, []);

  // Update default selected tender when tenders are loaded
  useEffect(() => {
    if (tendersFromSchema.length > 0 && !selectedTender) {
      setSelectedTender(tendersFromSchema[0].id);
    }
  }, [tendersFromSchema, selectedTender]);
  
  // Sync CDN URLs array with uploaded files that have CDN URLs
  useEffect(() => {
    const urls = uploadedFiles
      .filter(file => file.cdn_url && file.status === 'completed')
      .map(file => file.cdn_url!);
    
    setCdnUrls(urls);
    
    // Console log all CDN URLs whenever they change
    if (urls.length > 0) {
      console.log('📋 All CDN URLs stored:', urls);
      console.log('📋 Total CDN URLs:', urls.length);
      urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });
    }
  }, [uploadedFiles]);

  const filteredTenders = useMemo(() => {
    const filtered = tendersFromSchema.filter(tender => {
      if (selectedDepartment === 'all') return true;
      // Case-insensitive and trimmed comparison
      const tenderDept = (tender.department || '').trim();
      const selectedDept = selectedDepartment.trim();
      return tenderDept === selectedDept || tenderDept.toLowerCase() === selectedDept.toLowerCase();
    });
    console.log('🔍 Filtered tenders:', {
      selectedDepartment,
      totalTenders: tendersFromSchema.length,
      filteredCount: filtered.length,
      filteredTenders: filtered
    });
    return filtered;
  }, [selectedDepartment, tendersFromSchema]);

  const currentTender = filteredTenders.find(t => t.id === selectedTender) || filteredTenders[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 9 - uploadedFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);
      handleFiles(filesToAdd);
    }
  };
  
  const handleFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const fileId = crypto.randomUUID();
      const tempFile: UploadedFile = {
        id: fileId,
        file,
        status: 'uploading',
        progress: 0,
      };
      
      // Add temporary file to show upload in progress
      setUploadedFiles(prev => [...prev, tempFile]);
      
      try {
        // Upload file to CDN
        console.log(`📤 Uploading file to CDN: ${file.name} (${file.size} bytes)`);
        const uploadResponse = await uploadFileToCDN(file, 'CMS');
        
        // Ensure CDN URL starts with https://cdn.gov-cloud.ai/_
        let cdnUrl = uploadResponse.cdn_url || '';
        if (cdnUrl && !cdnUrl.startsWith('https://cdn.gov-cloud.ai/_')) {
          console.warn(`⚠️ CDN URL doesn't start with expected prefix: ${cdnUrl}`);
        }
        
        console.log(`✅ File uploaded to CDN:`, {
          filename: file.name,
          cdn_url: cdnUrl,
        });
        
        // Update file with CDN URL and completed status
        const finalFile: UploadedFile = {
          ...tempFile,
          status: 'completed',
          cdn_url: cdnUrl,
        };
        
        // Update the file in the list
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? finalFile : f));
        
        return finalFile;
      } catch (error) {
        console.error(`❌ Error uploading ${file.name}:`, error);
        
        // Update file with error status
        const errorFile: UploadedFile = {
          ...tempFile,
          status: 'error',
        };
        
        // Update the file in the list
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? errorFile : f));
        
        return errorFile;
      }
    });
    
    // Wait for all uploads to complete
    const uploadedResults = await Promise.all(uploadPromises);
    
    // Extract and log all successful CDN URLs after all uploads complete
    const successfulCdnUrls = uploadedResults
      .filter(file => file.cdn_url && file.status === 'completed')
      .map(file => file.cdn_url!);
    
    if (successfulCdnUrls.length > 0) {
      console.log('📋 All CDN URLs after uploads complete:', successfulCdnUrls);
      console.log('📋 Total CDN URLs:', successfulCdnUrls.length);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const remainingSlots = 9 - uploadedFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    handleFiles(filesToAdd);
  };

  const removeFile = (id: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === id);
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    
    // Remove CDN URL from array if it exists
    if (fileToRemove?.cdn_url) {
      setCdnUrls(prev => {
        const updated = prev.filter(url => url !== fileToRemove.cdn_url);
        console.log('📋 CDN URLs after removal:', updated);
        return updated;
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Sidebar currentPage="vendor-intake" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-[95rem] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Vendor Intake
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload vendor documents for evaluation
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[95rem] mx-auto px-6 py-8">
          {/* Filter Section with Blue Gradient */}
          <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_20px_45px_rgba(59,130,246,0.12)] overflow-hidden p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Filters</h2>
                <p className="text-xs text-blue-600 mt-0.5">Select department and tender</p>
              </div>
            </div>

            {isLoadingSchema ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
                <span className="text-sm text-blue-600">Loading schema data...</span>
              </div>
            ) : schemaError ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">Error loading schema data</p>
                  <p className="text-xs text-red-600 mt-1">{schemaError}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
                    disabled={isLoadingSchema}
                  >
                    <option value="all">All Departments</option>
                    {departmentsFromSchema.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                    Tender
                  </label>
                  <select
                    value={selectedTender}
                    onChange={(e) => setSelectedTender(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
                    disabled={isLoadingSchema}
                  >
                    {isLoadingSchema ? (
                      <option value="">Loading tenders...</option>
                    ) : filteredTenders.length === 0 ? (
                      <option value="">
                        {selectedDepartment === 'all' 
                          ? 'No tenders available' 
                          : `No tenders found for ${selectedDepartment}`}
                      </option>
                    ) : (
                      filteredTenders.map((tender) => (
                        <option key={tender.id} value={tender.id}>
                          {tender.title}
                        </option>
                      ))
                    )}
                  </select>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && filteredTenders.length === 0 && tendersFromSchema.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Debug: Found {tendersFromSchema.length} total tenders, but none match "{selectedDepartment}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {(selectedDepartment !== 'all' || selectedTender) && !isLoadingSchema && !schemaError && (
              <div className="mt-5 pt-5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-blue-700">
                  Selected: {currentTender?.title || 'No tender selected'}
                </span>
                {selectedDepartment !== 'all' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-300 shadow-sm">
                    {selectedDepartment}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    if (filteredTenders.length > 0) {
                      setSelectedTender(filteredTenders[0].id);
                    } else {
                      setSelectedTender('');
                    }
                  }}
                  className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-inner">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Upload Vendor Documents
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Accepts all document types (Maximum 9 files)
                </p>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                uploadedFiles.length >= 9
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-blue-300 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
              }`}
            >
              {uploadedFiles.length >= 9 ? (
                <div className="text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm font-medium">Maximum 9 files reached</p>
                  <p className="text-xs mt-1">Remove files to upload more</p>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="*/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploadedFiles.length >= 9}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drag and drop files here, or click to browse
                    </p>
                 
                  </label>
                </>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Uploaded Files ({uploadedFiles.length}/9)
                </h3>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatFileSize(file.file.size)} • {file.file.type || 'Unknown type'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {file.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                      {file.status === 'completed' && file.cdn_url && (
                        <span title={`CDN URL: ${file.cdn_url}`}>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {file.cdn_url && (
                        <span className="text-xs text-blue-600 font-mono" title={file.cdn_url}>
                          CDN✓
                        </span>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
                        disabled={file.status === 'uploading'}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

