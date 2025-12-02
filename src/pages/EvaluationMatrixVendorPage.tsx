import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { AlertTriangle, CheckCircle2, FileText, Target, ShieldAlert, Building2, TrendingUp } from 'lucide-react';
import { saveVendorEvaluationSummary } from '../services/api';
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
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    // Read vendor evaluation response from localStorage (set by VendorIntakePage)
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
                
                // Prepare data for ingestion
                // Use tenderId and department from Vendor Intake, not from agent response
                const ingestionData = {
                  tenderName: vendorIntakeTenderName || parsedData.tenderName || parsedData.tenderMeta?.tenderTitle || '',
                  vendorName: vendorName, // Extracted with multiple fallbacks
                  tenderId: vendorIntakeTenderId || parsedData.tenderId || parsedData.tenderMeta?.tenderId || '',
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

  if (isLoading) {
    return (
      <>
        <Sidebar currentPage="evaluation-matrix-vendor" onNavigate={onNavigate as any} />
        <div className="app-shell min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-600">Loading evaluation data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <>
        <Sidebar currentPage="evaluation-matrix-vendor" onNavigate={onNavigate as any} />
        <div className="app-shell min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-600">No evaluation data available.</p>
          </div>
        </div>
      </>
    );
  }

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
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Evaluation Matrix – Vendor
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Vendor proposal evaluation and assessment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {data.tenderMeta?.tenderId || data.tenderId}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {data.tenderMeta?.departmentName || data.department}
              </span>
              {data.vendorName && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {data.vendorName}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Vendor Summary & Tender Meta */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-indigo-100 to-white p-5 shadow-sm">
                <div className="absolute -right-14 -top-10 w-40 h-40 bg-indigo-200/40 rounded-full blur-3xl" />
                <div className="relative space-y-2">
                  <p className="text-xs font-semibold tracking-[0.35em] text-indigo-700 uppercase">
                    Tender Overview
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {data.tenderMeta?.tenderTitle || data.tenderName}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {data.tenderMeta?.sourceFileName} •{' '}
                    <span className="font-medium">
                      Version {data.tenderMeta?.documentVersion}
                    </span>{' '}
                    • Currency: {data.tenderMeta?.currency}
                  </p>
                  {data.vendorName && (
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">
                        Vendor
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {data.vendorName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      Completeness
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {data.completenessCheck?.overallStatus} •{' '}
                    {data.completenessCheck?.score ?? 0}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {data.completenessCheck?.remarks}
                </p>
              </div>

              {(data.evaluation_scores !== undefined || data.overallRecommendation?.overallScore !== undefined) && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">
                        Overall Score
                      </p>
                    </div>
                    <span className="text-lg font-bold text-purple-700">
                      {typeof data.evaluation_scores === 'string' 
                        ? parseInt(data.evaluation_scores) || 0
                        : data.evaluation_scores ?? data.overallRecommendation?.overallScore ?? 0}
                    </span>
                  </div>
                  {data.overallRecommendation?.summaryVerdict && (
                    <p className="text-xs text-purple-700 mt-1">
                      Verdict: {data.overallRecommendation.summaryVerdict.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Evaluation Dimensions */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.evaluation && Object.entries(data.evaluation).map(([key, block]: [string, any]) => (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Score: {block.score ?? 0}
                    </span>
                    <span className={`text-xs font-semibold ${getVerdictColor(block.verdict)}`}>
                      • {block.verdict?.replace(/_/g, ' ') || 'N/A'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700">{block.summary}</p>
                
                {block.strengths && block.strengths.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase mb-1">
                      Strengths
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      {block.strengths.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {block.gaps && block.gaps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase mb-1">
                      Gaps
                    </p>
                    <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                      {block.gaps.map((g: string, idx: number) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {block.keyPoints && block.keyPoints.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-sky-700 uppercase mb-1">
                      Key Points
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      {block.keyPoints.map((kp: string, idx: number) => (
                        <li key={idx}>{kp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {block.keyRisks && block.keyRisks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-red-700 uppercase mb-1">
                      Key Risks
                    </p>
                    <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
                      {block.keyRisks.map((kr: string, idx: number) => (
                        <li key={idx}>{kr}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {block.paymentTerms && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Payment Terms
                    </p>
                    <p className="text-xs text-slate-700">{block.paymentTerms}</p>
                  </div>
                )}

                {block.priceBasis && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Price Basis
                    </p>
                    <p className="text-xs text-slate-700">{block.priceBasis}</p>
                  </div>
                )}

                {block.keyDates && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase mb-1">
                      Key Dates
                    </p>
                    <div className="text-xs text-slate-700 space-y-1">
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
              </div>
            ))}
          </section>

          {/* Completeness Check Details */}
          {data.completenessCheck && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-900 uppercase mb-3">
                  Expected Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.expectedSections?.map((section, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {section}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-emerald-900 uppercase mb-3">
                  Found Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.foundSections?.map((section, idx) => (
                    <div key={idx} className="text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {section}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-amber-900 uppercase mb-3">
                  Missing Sections
                </p>
                <div className="space-y-1">
                  {data.completenessCheck.missingSections && data.completenessCheck.missingSections.length > 0 ? (
                    data.completenessCheck.missingSections.map((section, idx) => (
                      <div key={idx} className="text-xs text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {section}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-700">No missing sections</p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Document Structure */}
          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Document Structure
                </h3>
              </div>
              <div className="space-y-3">
                {data.documentStructure?.sections?.map((s) => (
                  <div
                    key={s.sectionId}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700 uppercase">
                        {s.sectionId} • {s.title}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Pages {s.pageRange?.[0]}–{s.pageRange?.[1]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Risk Assessment & Issues */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Risk Assessment – {data.riskAssessment?.overallRiskLevel}
                </h3>
              </div>
              <div className="space-y-2">
                {data.riskAssessment?.dimensions &&
                  Object.entries(data.riskAssessment.dimensions).map(
                    ([name, dim]: [string, any]) => (
                      <div
                        key={name}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {name.replace(/([A-Z])/g, ' $1')} –{' '}
                          <span className={getRiskLevelColor(dim.level)}>
                            {dim.level}
                          </span>
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                          {dim.reasons?.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Issues &amp; Clarifications
                </h3>
              </div>
              <div className="space-y-2">
                {data.issuesAndClarifications?.clarificationQuestions?.map(
                  (q) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">
                        {q.id} • {q.category}
                      </p>
                      <p className="text-sm text-slate-800">{q.question}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Overall Recommendation */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-indigo-100 to-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Overall Recommendation
                </h3>
              </div>
              <p className="text-sm text-slate-800">
                {data.overallRecommendation?.narrativeSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strengths Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {data.overallRecommendation?.keyStrengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Concerns Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-3">
                  Concerns
                </p>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
                  {data.overallRecommendation?.keyConcerns?.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions Box */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-indigo-700 uppercase mb-3">
                  Recommended Actions
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {data.overallRecommendation?.recommendedActionsBeforeBidding?.map(
                    (a: string, idx: number) => (
                      <li key={idx}>{a}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Points for Score */}
            {data.pointsForScore && data.pointsForScore.length > 0 && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-purple-700 uppercase mb-3">
                  Points for Score
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {data.pointsForScore.map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

