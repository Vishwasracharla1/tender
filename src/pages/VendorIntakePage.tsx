import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Filter, Upload, X, FileText } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';

interface VendorIntakePageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding' | 'evaluation-breakdown' | 'evaluation-recommendation' | 'vendor-intake') => void;
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
}

export function VendorIntakePage({ onNavigate }: VendorIntakePageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTender, setSelectedTender] = useState('TND-2025-001');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const tenders: Tender[] = [
    { id: 'TND-2025-001', title: 'Municipal Building Renovation', department: 'Roads & Construction', category: 'WORKS', dateCreated: '2025-01-15', status: 'evaluation' },
    { id: 'TND-2025-002', title: 'Solar Panel Installation', department: 'Water Management', category: 'WORKS', dateCreated: '2025-02-01', status: 'evaluation' },
    { id: 'TND-2025-003', title: 'IT Equipment Procurement', department: 'Administration', category: 'SUPPLIES', dateCreated: '2025-02-10', status: 'evaluation' },
    { id: 'TND-2025-004', title: 'Healthcare Cleaning Services', department: 'Maintenance', category: 'SERVICES', dateCreated: '2025-02-15', status: 'completed' },
    { id: 'TND-2025-005', title: 'Legal Advisory Services', department: 'Legal', category: 'CONSULTANCY', dateCreated: '2025-03-01', status: 'evaluation' },
    { id: 'TND-2025-006', title: 'Waste Collection Services', department: 'Waste Management', category: 'SERVICES', dateCreated: '2025-03-05', status: 'locked' },
    { id: 'TND-2025-007', title: 'Parking System Upgrade', department: 'Parking Management', category: 'WORKS', dateCreated: '2025-03-10', status: 'evaluation' },
  ];

  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      return true;
    });
  }, [selectedDepartment]);

  const currentTender = filteredTenders.find(t => t.id === selectedTender) || filteredTenders[0];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = 9 - uploadedFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      const newFiles: UploadedFile[] = filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'pending',
        progress: 0,
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
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
    
    const newFiles: UploadedFile[] = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
                >
                  <option value="all">All Departments</option>
                  {RAK_DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
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
                >
                  {filteredTenders.map((tender) => (
                    <option key={tender.id} value={tender.id}>
                      {tender.id} - {tender.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedDepartment !== 'all' || selectedTender) && (
              <div className="mt-5 pt-5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-blue-700">
                  Selected: {currentTender?.title}
                </span>
                {selectedDepartment !== 'all' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-300 shadow-sm">
                    {selectedDepartment}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedTender('TND-2025-001');
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
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
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

