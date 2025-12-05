import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { AlertTriangle, CheckCircle2, FileText, Target, ShieldAlert, Building2, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { 
  saveVendorEvaluationSummary,
  fetchVendorEvaluationDepartments,
  fetchVendorEvaluationTenders,
  fetchVendorEvaluationVendors,
  fetchVendorEvaluationData,
  type VendorEvaluationDepartment,
  type VendorEvaluationTender,
  type VendorEvaluationVendor,
} from '../services/api';
import { useAuthStore } from '../store/authStore';

interface EvaluationMatrixVendorPageProps {
  onNavigate: (
    page:
      | 'intake'
      | 'evaluation'
      | 'benchmark'
      | 'integrity'
      | 'justification'
      | 'award'
      | 'leadership'
      | 'monitoring'
      | 'integration'
      | 'tender-article'
      | 'tender-overview'
      | 'tender-prebidding'
      | 'evaluation-gov-tender'
      | 'evaluation-matrix-vendor'
      | 'vendor-intake'
  ) => void;
}

// Type definition for vendor evaluation response data structure
interface VendorEvaluationData {
  text?: string | null;
  tenderMeta?: {
    departmentName?: string;
    tenderId?: string;
    tenderTitle?: string;
    issueDate?: string | null;
    submissionDeadline?: string | null;
    currency?: string;
    documentVersion?: string;
    sourceFileName?: string;
    detectedLanguage?: string;
  };
  documentStructure?: {
    sections?: Array<{
      sectionId?: string;
      title?: string;
      pageRange?: [number, number];
      summary?: string;
    }>;
    missingKeySections?: string[];
  };
  completenessCheck?: {
    overallStatus?: string;
    score?: number;
    expectedSections?: string[];
    foundSections?: string[];
    missingSections?: string[];
    remarks?: string;
  };
  evaluation?: {
    eligibility?: {
      score?: number;
      verdict?: string;
      summary?: string;
      keyPoints?: string[];
      ambiguities?: string[];
      referencedSections?: string[];
    };
    scopeAndObjectives?: {
      score?: number;
      verdict?: string;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
      referencedSections?: string[];
    };
    technicalRequirements?: {
      score?: number;
      verdict?: string;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
      referencedSections?: string[];
    };
    commercialTerms?: {
      score?: number;
      verdict?: string;
      summary?: string;
      paymentTerms?: string;
      priceBasis?: string;
      keyRisks?: string[];
      referencedSections?: string[];
    };
    legalAndRegulatory?: {
      score?: number;
      verdict?: string;
      summary?: string;
      strengths?: string[];
      gaps?: string[];
      referencedSections?: string[];
    };
    timelineAndDeliverables?: {
      score?: number;
      verdict?: string;
      summary?: string;
      keyDates?: {
        projectStart?: string | null;
        projectCompletion?: string | null;
        maintenancePeriod?: string;
      };
      gaps?: string[];
      referencedSections?: string[];
    };
  };
  riskAssessment?: {
    overallRiskLevel?: string;
    dimensions?: {
      legalRisk?: {
        level?: string;
        reasons?: string[];
      };
      financialRisk?: {
        level?: string;
        reasons?: string[];
      };
      technicalRisk?: {
        level?: string;
        reasons?: string[];
      };
      deliveryRisk?: {
        level?: string;
        reasons?: string[];
      };
    };
  };
  issuesAndClarifications?: {
    criticalIssues?: any[];
    clarificationQuestions?: Array<{
      id?: string;
      category?: string;
      question?: string;
      relatedSections?: string[];
    }>;
  };
  overallRecommendation?: {
    overallScore?: number;
    summaryVerdict?: string;
    narrativeSummary?: string;
    keyStrengths?: string[];
    keyConcerns?: string[];
    recommendedActionsBeforeBidding?: string[];
  };
  // Root level fields from agent response
  tenderName?: string;
  vendorId?: string;
  vendorName?: string;
  tenderId?: string;
  department?: string;
  evaluation_scores?: string | number;
  approvedBy?: string;
  pointsForScore?: string[];
}

export function EvaluationMatrixVendorPage({
  onNavigate,
}: EvaluationMatrixVendorPageProps) {
  const [data, setData] = useState<VendorEvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed to false - will be set true when loading departments
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('');
  const [departments, setDepartments] = useState<VendorEvaluationDepartment[]>([]);
  const [tenders, setTenders] = useState<VendorEvaluationTender[]>([]);
  const [vendors, setVendors] = useState<VendorEvaluationVendor[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserInitiatedTenderSelection, setIsUserInitiatedTenderSelection] = useState(false);
  const [isUserInitiatedVendorSelection, setIsUserInitiatedVendorSelection] = useState(false);
  const { user } = useAuthStore();
  
  // Get logged-in user's name for approvedBy field
  const getApprovedBy = (): string => {
    if (!user) return '';
    
    // Try to get full name from firstName + lastName
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    
    // Try to get name field
    if (user.name) {
      return user.name;
    }
    
    // Fallback to username
    if (user.username) {
      return user.username;
    }
    
    // Fallback to email
    if (user.email) {
      return user.email;
    }
    
    return '';
  };

  // Reset state and load departments on mount/remount
  useEffect(() => {
    // Reset all state when component mounts
    setData(null);
    setSelectedDepartment('');
    setSelectedTenderId('');
    setSelectedVendorName('');
    setError(null);
    
    // First, check localStorage for vendor evaluation response (from VendorIntakePage)
    let hasLocalStorageData = false;
    let localStorageDepartment = '';
    let localStorageTenderId = '';
    let localStorageVendorName = '';
    
    try {
      const storedResponse = localStorage.getItem('vendorEvaluationResponse');
      const storedMetadata = localStorage.getItem('vendorIntakeMetadata');
      
      if (storedResponse && storedMetadata) {
        console.log('📋 Found vendor evaluation response in localStorage, auto-loading...');
        hasLocalStorageData = true;
        
        // Parse metadata to get department, tenderId
        const metadata = JSON.parse(storedMetadata);
        localStorageDepartment = metadata.department || '';
        localStorageTenderId = metadata.tenderId || '';
        
        // Parse response to get vendorName and data
        const response = JSON.parse(storedResponse);
        let vendorName = '';
        
        // Extract vendorName from response
        if (response.data?.text) {
          try {
            const parsedText = typeof response.data.text === 'string' 
              ? JSON.parse(response.data.text) 
              : response.data.text;
            vendorName = parsedText.vendorName || parsedText.vendor_name || '';
          } catch (e) {
            // Try direct access
            vendorName = response.data.vendorName || response.data.vendor_name || '';
          }
        } else if (response.text) {
          try {
            const parsedText = typeof response.text === 'string' 
              ? JSON.parse(response.text) 
              : response.text;
            vendorName = parsedText.vendorName || parsedText.vendor_name || '';
          } catch (e) {
            vendorName = response.vendorName || response.vendor_name || '';
          }
        } else {
          vendorName = response.vendorName || response.vendor_name || response.data?.vendorName || '';
        }
        
        localStorageVendorName = vendorName;
        
        // Set filters if we have the data
        if (localStorageDepartment) {
          setSelectedDepartment(localStorageDepartment);
        }
        if (localStorageTenderId) {
          setSelectedTenderId(localStorageTenderId);
        }
        if (localStorageVendorName) {
          setSelectedVendorName(localStorageVendorName);
        }
        
        // Also load and display the localStorage data immediately
        try {
          let parsedData: VendorEvaluationData | null = null;
          
          if (response.data) {
            if (response.data.text && typeof response.data.text === 'string') {
              try {
                parsedData = JSON.parse(response.data.text);
              } catch (e) {
                parsedData = response.data;
              }
            } else {
              parsedData = response.data;
            }
          } else if (response.text && typeof response.text === 'string') {
            try {
              parsedData = JSON.parse(response.text);
            } catch (e) {
              parsedData = response;
            }
          } else {
            parsedData = response;
          }
          
          if (parsedData) {
            // Add metadata
            parsedData.vendorName = localStorageVendorName || parsedData.vendorName;
            parsedData.tenderId = localStorageTenderId || parsedData.tenderId;
            parsedData.tenderName = metadata.tenderName || parsedData.tenderName;
            parsedData.department = localStorageDepartment || parsedData.department;
            
            setData(parsedData);
            console.log('✅ Loaded vendor evaluation data from localStorage');
          }
        } catch (parseError) {
          console.error('Error parsing localStorage response:', parseError);
        }
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
    
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setError(null);
        const depts = await fetchVendorEvaluationDepartments();
        setDepartments(depts);
        
        // Only auto-select first department if no localStorage data was found
        if (depts.length > 0 && !hasLocalStorageData) {
          setSelectedDepartment(depts[0].department);
        }
      } catch (err: any) {
        console.error('Error loading departments:', err);
        setError(err.message || 'Failed to load departments');
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // Load tenders when department is selected
  useEffect(() => {
    const loadTenders = async () => {
      if (!selectedDepartment) {
        setTenders([]);
        setSelectedTenderId('');
        return;
      }

      try {
        setIsLoadingTenders(true);
        setError(null);
        const tenderList = await fetchVendorEvaluationTenders(selectedDepartment);
        setTenders(tenderList);
        
        if (tenderList.length > 0) {
          // Only auto-select first tender if no tender is already selected (e.g., from localStorage)
          const currentTenderId = selectedTenderId;
          if (!currentTenderId || !tenderList.find(t => t.tenderId === currentTenderId)) {
            setSelectedTenderId(tenderList[0].tenderId);
            setIsUserInitiatedTenderSelection(false); // Mark as auto-selected
          } else {
            // Keep the current selection (from localStorage)
            setIsUserInitiatedTenderSelection(false);
          }
        } else {
          // Only clear data if we're not keeping localStorage data
          if (!selectedTenderId) {
            setSelectedTenderId('');
            setData(null);
          }
        }
      } catch (err: any) {
        console.error('Error loading tenders:', err);
        setError(err.message || 'Failed to load tenders');
        setTenders([]);
        setSelectedTenderId('');
      } finally {
        setIsLoadingTenders(false);
      }
    };

    loadTenders();
  }, [selectedDepartment]);

  // Load vendors when both department and tender are selected
  useEffect(() => {
    const loadVendors = async () => {
      if (!selectedDepartment || !selectedTenderId) {
        setVendors([]);
        setSelectedVendorName('');
        return;
      }

      try {
        setIsLoadingVendors(true);
        setError(null);
        const vendorList = await fetchVendorEvaluationVendors(selectedDepartment, selectedTenderId);
        setVendors(vendorList);
        
        if (vendorList.length > 0) {
          // Only auto-select first vendor if no vendor is already selected (e.g., from localStorage)
          const currentVendorName = selectedVendorName;
          if (!currentVendorName || !vendorList.find(v => v.vendorName === currentVendorName)) {
            // Default to first vendor - this will automatically trigger data load via useEffect
            setSelectedVendorName(vendorList[0].vendorName);
          }
          // If current vendor is in the list, keep it (don't override)
        } else {
          // Only clear data if we're not keeping localStorage data
          if (!selectedVendorName) {
            setSelectedVendorName('');
            setData(null);
          }
        }
      } catch (err: any) {
        console.error('Error loading vendors:', err);
        setError(err.message || 'Failed to load vendors');
        setVendors([]);
        setSelectedVendorName('');
      } finally {
        setIsLoadingVendors(false);
      }
    };

    loadVendors();
  }, [selectedDepartment, selectedTenderId]);

  // Load vendor evaluation data when department, tender, and vendor are selected
  useEffect(() => {
    const loadVendorEvaluationData = async () => {
      if (!selectedDepartment || !selectedTenderId || !selectedVendorName) {
        setData(null);
        return;
      }
      
      // Always fetch when all three filters are selected
      // The isUserInitiatedVendorSelection flag is just for tracking, not blocking
      // This ensures data loads automatically when filters are auto-selected

      try {
        setIsLoadingData(true);
        setError(null);
        const vendorData = await fetchVendorEvaluationData(selectedDepartment, selectedTenderId, selectedVendorName);
        
        if (!vendorData || !vendorData.evm_response) {
          setData(null);
          setIsLoadingData(false);
          return;
        }

        // Parse the evm_response to get the vendor evaluation data
        let parsedData: VendorEvaluationData | null = null;
        const evmResponse = vendorData.evm_response;
        
        if (typeof evmResponse === 'string') {
          try {
            parsedData = JSON.parse(evmResponse);
          } catch (e) {
            console.error('Error parsing evm_response:', e);
            parsedData = evmResponse as any;
          }
        } else if (typeof evmResponse === 'object') {
          parsedData = evmResponse as VendorEvaluationData;
        }

        if (parsedData) {
          // Add vendorName and other metadata from the fetched data
          parsedData.vendorName = vendorData.vendorName;
          parsedData.tenderId = vendorData.tenderId;
          parsedData.tenderName = vendorData.tenderName;
          parsedData.department = vendorData.department;
          setData(parsedData);
        } else {
          setData(null);
        }
      } catch (err: any) {
        console.error('Error loading vendor evaluation data:', err);
        setError(err.message || 'Failed to load vendor evaluation data');
        setData(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadVendorEvaluationData();
  }, [selectedDepartment, selectedTenderId, selectedVendorName]);

  // Legacy: Read vendor evaluation response from localStorage (set by VendorIntakePage)
  // This will be used as fallback if no filter selection is made
  // Only load from localStorage if no department/tender is selected via filters
  useEffect(() => {
    // Skip localStorage loading if filters are being used
    if (selectedDepartment && selectedTenderId) {
      setIsLoading(false);
      return;
    }

    const loadAndIngestData = async () => {
      try {
        const storedResponse = localStorage.getItem('vendorEvaluationResponse');
        let parsedData: VendorEvaluationData | null = null;

        if (storedResponse) {
          try {
            const response = JSON.parse(storedResponse);
            
            // The agent response structure: response.data.text contains JSON string, or response.data is the object
            if (response.data) {
              if (response.data.text && typeof response.data.text === 'string') {
                // Parse the JSON string from text field
                try {
                  parsedData = JSON.parse(response.data.text);
                } catch (e) {
                  // If parsing fails, try using response.data directly
                  parsedData = response.data;
                }
              } else {
                // response.data is already the object
                parsedData = response.data;
              }
            } else if (response.text && typeof response.text === 'string') {
              // Response has text field at root level
              try {
                parsedData = JSON.parse(response.text);
              } catch (e) {
                parsedData = response;
              }
            } else {
              // Response is already the parsed object
              parsedData = response;
            }
            
            console.log('📊 Parsed vendor evaluation data:', parsedData);
            
            // Ingest data into schema after parsing
            if (parsedData) {
              try {
                // Get the raw response for evm_response as JSON object
                const rawResponse = localStorage.getItem('vendorEvaluationResponse');
                let evmResponseObj: any = null;
                
                if (rawResponse) {
                  try {
                    const rawResponseObj = JSON.parse(rawResponse);
                    // Get the text field from response.data.text or response.text and parse it
                    if (rawResponseObj.data?.text && typeof rawResponseObj.data.text === 'string') {
                      // Parse the JSON string from text field
                      evmResponseObj = JSON.parse(rawResponseObj.data.text);
                    } else if (rawResponseObj.text && typeof rawResponseObj.text === 'string') {
                      // Parse the JSON string from root text field
                      evmResponseObj = JSON.parse(rawResponseObj.text);
                    } else if (rawResponseObj.data) {
                      // Use response.data directly if it's an object
                      evmResponseObj = rawResponseObj.data;
                    } else {
                      // Use the entire response as object
                      evmResponseObj = rawResponseObj;
                    }
                  } catch (e) {
                    // If parsing fails, try to parse the raw string
                    try {
                      evmResponseObj = JSON.parse(rawResponse);
                    } catch (e2) {
                      console.error('❌ Could not parse evm_response:', e2);
                      evmResponseObj = null;
                    }
                  }
                }
                
                // Get tenderId and department from Vendor Intake metadata (stored when documents were submitted)
                let vendorIntakeTenderId = '';
                let vendorIntakeDepartment = '';
                let vendorIntakeTenderName = '';
                let vendorIntakeVendorName = '';
                
                try {
                  const vendorIntakeMetadataStr = localStorage.getItem('vendorIntakeMetadata');
                  if (vendorIntakeMetadataStr) {
                    const vendorIntakeMetadata = JSON.parse(vendorIntakeMetadataStr);
                    vendorIntakeTenderId = vendorIntakeMetadata.tenderId || '';
                    vendorIntakeDepartment = vendorIntakeMetadata.department || '';
                    vendorIntakeTenderName = vendorIntakeMetadata.tenderName || '';
                    vendorIntakeVendorName = vendorIntakeMetadata.vendorName || '';
                    console.log('📋 Using vendor intake metadata:', vendorIntakeMetadata);
                  }
                } catch (e) {
                  console.warn('⚠️ Could not read vendor intake metadata:', e);
                }
                
                // Extract vendorName from multiple possible sources with fallbacks
                const extractVendorName = (): string => {
                  if (!parsedData) return '';
                  
                  // Priority 1: From parsedData.vendorName
                  if (parsedData.vendorName && parsedData.vendorName.trim()) {
                    return parsedData.vendorName.trim();
                  }
                  
                  // Priority 2: From vendorIntakeMetadata
                  if (vendorIntakeVendorName && vendorIntakeVendorName.trim()) {
                    return vendorIntakeVendorName.trim();
                  }
                  
                  // Priority 3: From evm_response if it's an object
                  if (evmResponseObj && typeof evmResponseObj === 'object') {
                    if (evmResponseObj.vendorName && typeof evmResponseObj.vendorName === 'string' && evmResponseObj.vendorName.trim()) {
                      return evmResponseObj.vendorName.trim();
                    }
                    if (evmResponseObj.vendor_name && typeof evmResponseObj.vendor_name === 'string' && evmResponseObj.vendor_name.trim()) {
                      return evmResponseObj.vendor_name.trim();
                    }
                    if (evmResponseObj.companyName && typeof evmResponseObj.companyName === 'string' && evmResponseObj.companyName.trim()) {
                      return evmResponseObj.companyName.trim();
                    }
                  }
                  
                  // Priority 4: Try to extract from sourceFileName (remove extension and clean up)
                  if (parsedData.tenderMeta?.sourceFileName) {
                    const fileName = parsedData.tenderMeta.sourceFileName;
                    // Remove file extension and common prefixes
                    let extractedName = fileName
                      .replace(/\.[^/.]+$/, '') // Remove extension
                      .replace(/^V\d+_/, '') // Remove version prefix like "V1_"
                      .replace(/^\d+[-_]/, '') // Remove leading numbers
                      .trim();
                    
                    if (extractedName && extractedName.length > 0) {
                      return extractedName;
                    }
                  }
                  
                  // Priority 5: Check parsedData for alternative field names
                  if ((parsedData as any).vendor_name && typeof (parsedData as any).vendor_name === 'string' && (parsedData as any).vendor_name.trim()) {
                    return (parsedData as any).vendor_name.trim();
                  }
                  if ((parsedData as any).companyName && typeof (parsedData as any).companyName === 'string' && (parsedData as any).companyName.trim()) {
                    return (parsedData as any).companyName.trim();
                  }
                  
                  // If still not found, log warning and return empty string
                  console.warn('⚠️ Could not extract vendorName from any source. Available fields:', {
                    parsedDataVendorName: parsedData.vendorName,
                    vendorIntakeVendorName: vendorIntakeVendorName,
                    sourceFileName: parsedData.tenderMeta?.sourceFileName,
                    evmResponseKeys: evmResponseObj ? Object.keys(evmResponseObj) : null,
                  });
                  
                  return '';
                };
                
                const vendorName = extractVendorName();
                
                if (!vendorName) {
                  console.error('❌ Vendor name is required but could not be extracted from any source');
                  throw new Error('Vendor name is required for ingestion but was not found in the response data');
                }
                
                // Get logged-in user's name for approvedBy
                const approvedBy = getApprovedBy();

                // IMPORTANT: tenderId must always come from the primary key captured in Vendor Intake,
                // not from the EVM/agent response body. This ensures all downstream modules
                // (Evaluation Matrix, Justification Composer, etc.) use the same tender PK.
                if (!vendorIntakeTenderId) {
                  console.error('❌ Tender primary key (tenderId) is missing from vendorIntakeMetadata. Aborting ingestion to avoid wrong tender linkage.');
                  throw new Error('Tender primary key (tenderId) is required but was not found in vendorIntakeMetadata');
                }

                // Prepare data for ingestion using the primary-key tenderId
                const ingestionData = {
                  tenderName: vendorIntakeTenderName || parsedData.tenderName || parsedData.tenderMeta?.tenderTitle || '',
                  vendorName: vendorName, // Extracted with multiple fallbacks
                  tenderId: vendorIntakeTenderId,
                  department: vendorIntakeDepartment || parsedData.department || parsedData.tenderMeta?.departmentName || '',
                  timestamp: new Date().toISOString(),
                  points_followed_to_score: parsedData.pointsForScore || [],
                  approvedBy: approvedBy, // Use logged-in user's name
                  evaluation_scores: parsedData.overallRecommendation?.overallScore || parsedData.evaluation_scores || 0,
                  evm_response: evmResponseObj || parsedData, // Use parsed JSON object, fallback to parsedData
                };
                
                console.log('📤 Ingesting vendor evaluation data to schema:', ingestionData);
                
                await saveVendorEvaluationSummary(ingestionData);
                
                console.log('✅ Vendor evaluation data ingested successfully');
              } catch (ingestionError) {
                console.error('❌ Error ingesting vendor evaluation data:', ingestionError);
                // Don't block the UI if ingestion fails
              }
            }
          } catch (parseError) {
            console.error('❌ Error parsing vendor evaluation response:', parseError);
            setData(null);
            setIsLoading(false);
            return;
          }
        }

        if (!parsedData) {
          console.warn('⚠️ No vendor evaluation response found in localStorage');
          setData(null);
        } else {
          setData(parsedData);
        }
      } catch (error) {
        console.error('❌ Error loading vendor evaluation data:', error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndIngestData();
  }, []);

  // Removed early returns - filters should always be visible

  const getVerdictColor = (verdict?: string) => {
    if (!verdict) return 'text-slate-600';
    if (verdict === 'CLEAR') return 'text-emerald-600';
    if (verdict === 'MINOR_GAPS') return 'text-amber-600';
    if (verdict === 'MAJOR_GAPS') return 'text-red-600';
    return 'text-slate-600';
  };

  const getRiskLevelColor = (level?: string) => {
    if (!level) return 'text-slate-600';
    if (level === 'LOW') return 'text-emerald-600';
    if (level === 'MEDIUM') return 'text-amber-600';
    if (level === 'HIGH') return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <>
      <Sidebar currentPage="evaluation-matrix-vendor" onNavigate={onNavigate as any} />
      <div className="app-shell min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 pb-24">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/95 backdrop-blur-sm border-b-2 border-indigo-200/60 sticky top-0 z-10 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">
                  Evaluation Matrix – Vendor
                </h1>
                <p className="text-sm text-black/70 mt-0.5 font-medium">
                  Vendor proposal evaluation and assessment.
                </p>
              </div>
            </motion.div>
            {data && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-sm"
                >
                  {data.tenderMeta?.tenderId || data.tenderId}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-900 border border-purple-200 shadow-sm"
                >
                  {selectedDepartment || data.tenderMeta?.departmentName || data.department}
                </motion.span>
                {data.vendorName && (
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-900 border border-pink-200 shadow-sm"
                  >
                    {data.vendorName}
                  </motion.span>
                )}
              </motion.div>
            )}
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Filters */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-white border border-indigo-200/60 shadow-lg"
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-30 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 bottom-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-pink-100 opacity-40 blur-3xl pointer-events-none" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center gap-2 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg"
              >
                <Filter className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <p className="text-xs font-bold tracking-[0.3em] text-indigo-600 uppercase">
                  Filters
                </p>
                <h2 className="text-lg font-bold text-black">
                  Select Department, Tender, and Vendor
                </h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                  Department
                </label>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedTenderId(''); // Reset tender when department changes
                    setSelectedVendorName(''); // Reset vendor when department changes
                    setData(null); // Clear data when department changes
                    setIsUserInitiatedTenderSelection(false); // Reset flag when department changes
                    setIsUserInitiatedVendorSelection(false); // Reset vendor flag
                  }}
                  disabled={isLoadingDepartments}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-indigo-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
                >
                  {isLoadingDepartments ? (
                    <option>Loading departments...</option>
                  ) : departments.length === 0 ? (
                    <option>No departments available</option>
                  ) : (
                    <>
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.department} value={dept.department}>
                          {dept.department}
                        </option>
                      ))}
                    </>
                  )}
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                  Tender
                </label>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  value={selectedTenderId}
                  onChange={(e) => {
                    setSelectedTenderId(e.target.value);
                    setSelectedVendorName(''); // Reset vendor when tender changes
                    setIsUserInitiatedTenderSelection(true); // Mark as user-initiated selection
                    setIsUserInitiatedVendorSelection(false); // Reset vendor flag
                    setData(null); // Clear data when tender changes
                  }}
                  disabled={isLoadingTenders || !selectedDepartment || tenders.length === 0}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-indigo-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
                >
                  {isLoadingTenders ? (
                    <option>Loading tenders...</option>
                  ) : !selectedDepartment ? (
                    <option>Select a department first</option>
                  ) : tenders.length === 0 ? (
                    <option>No tenders available for this department</option>
                  ) : (
                    <>
                      <option value="">Select Tender</option>
                      {tenders.map((tender) => (
                        <option key={tender.tenderId} value={tender.tenderId}>
                          {tender.tenderName}
                        </option>
                      ))}
                    </>
                  )}
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-xs font-bold text-black mb-2 tracking-wide">
                  Vendor
                </label>
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  value={selectedVendorName}
                  onChange={(e) => {
                    setSelectedVendorName(e.target.value);
                    setIsUserInitiatedVendorSelection(true); // Mark as user-initiated selection
                    setData(null); // Clear data when vendor changes
                  }}
                  disabled={isLoadingVendors || !selectedDepartment || !selectedTenderId || vendors.length === 0}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-indigo-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
                >
                  {isLoadingVendors ? (
                    <option>Loading vendors...</option>
                  ) : !selectedDepartment || !selectedTenderId ? (
                    <option>Select department and tender first</option>
                  ) : vendors.length === 0 ? (
                    <option>No vendors available for this tender</option>
                  ) : (
                    <>
                      <option value="">Select Vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.vendorName} value={vendor.vendorName}>
                          {vendor.vendorName}
                        </option>
                      ))}
                    </>
                  )}
                </motion.select>
              </motion.div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg shadow-md"
              >
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </motion.div>
            )}
          </motion.section>

          {/* Loading state */}
          {isLoadingData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm font-semibold text-black">Loading evaluation data...</p>
              </div>
            </motion.div>
          )}

          {/* No data state */}
          {!isLoadingData && !data && selectedDepartment && selectedTenderId && selectedVendorName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm font-semibold text-black">
                  No evaluation data available for the selected tender.
                </p>
              </div>
            </motion.div>
          )}

          {/* Vendor Summary & Tender Meta */}
          {data && !isLoadingData && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="col-span-2"
                >
                  <motion.div
                    whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                    className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-5 shadow-md"
                  >
                    <div className="absolute -right-14 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-30 rounded-full blur-3xl" />
                    <div className="relative space-y-2">
                      <p className="text-xs font-bold tracking-[0.35em] text-indigo-600 uppercase">
                        Tender Overview
                      </p>
                      <h2 className="text-lg font-bold text-black">
                        {data.tenderMeta?.tenderTitle || data.tenderName}
                      </h2>
                      <p className="text-sm text-black/80 font-medium">
                        {data.tenderMeta?.sourceFileName} •{' '}
                        <span className="font-bold">
                          Version {data.tenderMeta?.documentVersion}
                        </span>{' '}
                        • Currency: {data.tenderMeta?.currency}
                      </p>
                      {data.vendorName && (
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          <p className="text-xs font-bold text-indigo-700 uppercase mb-1">
                            Vendor
                          </p>
                          <p className="text-sm font-semibold text-black">
                            {data.vendorName}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                    className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </motion.div>
                        <p className="text-xs font-bold text-black uppercase tracking-wide">
                          Completeness
                        </p>
                      </div>
                      <span className="text-xs font-bold text-black">
                        {data.completenessCheck?.overallStatus} •{' '}
                        {data.completenessCheck?.score ?? 0}/100
                      </span>
                    </div>
                    <p className="text-xs text-black/80 font-medium">
                      {data.completenessCheck?.remarks}
                    </p>
                  </motion.div>

                  {(data.evaluation_scores !== undefined ||
                    data.overallRecommendation?.overallScore !== undefined) && (
                    <motion.div
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                      className="rounded-2xl border border-purple-200 bg-white p-4 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <p className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                            Overall Score
                          </p>
                        </div>
                        <span className="text-lg font-extrabold text-purple-700">
                          {typeof data.evaluation_scores === 'string'
                            ? parseInt(data.evaluation_scores) || 0
                            : data.evaluation_scores ??
                              data.overallRecommendation?.overallScore ??
                              0}
                        </span>
                      </div>
                      {data.overallRecommendation?.summaryVerdict && (
                        <p className="text-xs text-purple-800 mt-1 font-medium">
                          Verdict:{' '}
                          {data.overallRecommendation.summaryVerdict.replace(/_/g, ' ')}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
            </motion.section>

            {/* Evaluation Dimensions */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {data && data.evaluation && Object.entries(data.evaluation).map(([key, block]: [string, any], index: number) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
                  className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-md space-y-2"
                >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Target className="w-4 h-4 text-indigo-600" />
                    </motion.div>
                    <p className="text-sm font-bold text-black capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black">
                      Score: {block.score ?? 0}
                    </span>
                    <span className={`text-xs font-semibold ${getVerdictColor(block.verdict)}`}>
                      • {block.verdict?.replace(/_/g, ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-black/80 font-medium">{block.summary}</p>
                
                {block.strengths && block.strengths.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="mt-2 pt-2 border-t border-emerald-200 bg-emerald-50/70 rounded-lg px-2 pb-2"
                  >
                    <p className="text-[11px] font-bold text-emerald-900 uppercase mb-1">
                      Strengths
                    </p>
                    <ul className="list-disc list-inside text-xs text-black space-y-1 font-medium">
                      {block.strengths.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {block.gaps && block.gaps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="mt-2 pt-2 border-t border-amber-200 bg-amber-50/70 rounded-lg px-2 pb-2"
                  >
                    <p className="text-[11px] font-bold text-amber-900 uppercase mb-1">
                      Gaps
                    </p>
                    <ul className="list-disc list-inside text-xs text-black space-y-1 font-medium">
                      {block.gaps.map((g: string, idx: number) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {block.keyPoints && block.keyPoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="mt-2 pt-2 border-t border-sky-200 bg-sky-50/70 rounded-lg px-2 pb-2"
                  >
                    <p className="text-[11px] font-bold text-sky-900 uppercase mb-1">
                      Key Points
                    </p>
                    <ul className="list-disc list-inside text-xs text-black space-y-1 font-medium">
                      {block.keyPoints.map((kp: string, idx: number) => (
                        <li key={idx}>{kp}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {block.keyRisks && block.keyRisks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="mt-2 pt-2 border-t border-red-200 bg-red-50/70 rounded-lg px-2 pb-2"
                  >
                    <p className="text-[11px] font-bold text-red-900 uppercase mb-1">
                      Key Risks
                    </p>
                    <ul className="list-disc list-inside text-xs text-black space-y-1 font-medium">
                      {block.keyRisks.map((kr: string, idx: number) => (
                        <li key={idx}>{kr}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {block.paymentTerms && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-black uppercase mb-1">
                      Payment Terms
                    </p>
                    <p className="text-xs text-black/80 font-medium">{block.paymentTerms}</p>
                  </div>
                )}

                {block.priceBasis && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-black uppercase mb-1">
                      Price Basis
                    </p>
                    <p className="text-xs text-black/80 font-medium">{block.priceBasis}</p>
                  </div>
                )}

                {block.keyDates && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-black uppercase mb-1">
                      Key Dates
                    </p>
                    <div className="text-xs text-black/80 space-y-1 font-medium">
                      {block.keyDates.maintenancePeriod && (
                        <p>Maintenance Period: {block.keyDates.maintenancePeriod}</p>
                      )}
                      {block.keyDates.projectStart && (
                        <p>Project Start: {block.keyDates.projectStart}</p>
                      )}
                      {block.keyDates.projectCompletion && (
                        <p>Project Completion: {block.keyDates.projectCompletion}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            </motion.section>

            {/* Completeness Check Details */}
            {data.completenessCheck && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-black uppercase mb-3">
                  Expected Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.expectedSections?.map((section, idx) => (
                    <div key={idx} className="text-xs text-black flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {section}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-emerald-900 uppercase mb-3">
                  Found Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.foundSections?.map((section, idx) => (
                    <div key={idx} className="text-xs text-emerald-900 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {section}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-amber-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-amber-900 uppercase mb-3">
                  Missing Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.missingSections && data.completenessCheck.missingSections.length > 0 ? (
                    data.completenessCheck.missingSections.map((section, idx) => (
                      <div key={idx} className="text-xs text-amber-900 flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {section}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-800 font-medium">No missing sections</p>
                  )}
                </div>
              </motion.div>
              </motion.section>
            )}

            {/* Document Structure */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <motion.div
                whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-md"
              >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 mb-4"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                </motion.div>
                <h3 className="text-sm font-bold text-black">
                  Document Structure
                </h3>
              </motion.div>
              <div className="space-y-3">
                {data.documentStructure?.sections?.map((s, idx) => (
                  <motion.div
                    key={s.sectionId || `section-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="rounded-xl border-2 border-indigo-200 bg-white px-3 py-3 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-black uppercase">
                        {s.sectionId} • {s.title}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border-2 border-indigo-300 font-bold">
                        Pages {s.pageRange?.[0]}–{s.pageRange?.[1]}
                      </span>
                    </div>
                    <p className="text-xs text-black/80 font-medium">{s.summary}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            </motion.section>

            {/* Risk Assessment & Issues */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-amber-200 bg-white p-5 shadow-md space-y-3"
              >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                </motion.div>
                <h3 className="text-sm font-bold text-black">
                  Risk Assessment – {data.riskAssessment?.overallRiskLevel}
                </h3>
              </div>
              <div className="space-y-2">
                {data.riskAssessment?.dimensions &&
                  Object.entries(data.riskAssessment.dimensions).map(
                    ([name, dim]: [string, any], idx: number) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + idx * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 shadow-sm"
                      >
                        <p className="text-xs font-bold text-black">
                          {name.replace(/([A-Z])/g, ' $1')} –{' '}
                          <span className={getRiskLevelColor(dim.level)}>
                            {dim.level}
                          </span>
                        </p>
                        <ul className="list-disc list-inside text-xs text-black mt-1 space-y-1 font-medium">
                          {dim.reasons?.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )
                  )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
              className="rounded-2xl border border-orange-200 bg-white p-5 shadow-md space-y-3"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </motion.div>
                <h3 className="text-sm font-bold text-black">
                  Issues &amp; Clarifications
                </h3>
              </div>
              <div className="space-y-2">
                {data.issuesAndClarifications?.clarificationQuestions?.map(
                  (q, idx: number) => (
                    <motion.div
                      key={q.id || `question-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + idx * 0.05 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 shadow-sm"
                    >
                      <p className="text-[11px] font-bold text-black uppercase">
                        {q.id} • {q.category}
                      </p>
                      <p className="text-sm text-black font-medium">{q.question}</p>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
            </motion.section>

            {/* Overall Recommendation */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-md space-y-3"
              >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Target className="w-4 h-4 text-indigo-600" />
                </motion.div>
                <h3 className="text-sm font-bold text-black">
                  Overall Recommendation
                </h3>
              </motion.div>
              <p className="text-sm text-black font-medium">
                {data.overallRecommendation?.narrativeSummary}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Strengths Box */}
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-emerald-900 uppercase mb-3">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                  {data.overallRecommendation?.keyStrengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Concerns Box */}
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-amber-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-amber-900 uppercase mb-3">
                  Concerns
                </p>
                <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                  {data.overallRecommendation?.keyConcerns?.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Recommended Actions Box */}
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-indigo-900 uppercase mb-3">
                  Recommended Actions
                </p>
                <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                  {data.overallRecommendation?.recommendedActionsBeforeBidding?.map(
                    (a: string, idx: number) => (
                      <li key={idx}>{a}</li>
                    )
                  )}
                </ul>
              </motion.div>
            </motion.div>

            {/* Points for Score */}
            {data.pointsForScore && data.pointsForScore.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                className="rounded-2xl border border-purple-200 bg-white p-4 shadow-md"
              >
                <p className="text-xs font-bold text-purple-900 uppercase mb-3">
                  Points for Score
                </p>
                <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                  {data.pointsForScore.map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.section>
          </>
          )}
        </main>
      </div>
    </>
  );
}

