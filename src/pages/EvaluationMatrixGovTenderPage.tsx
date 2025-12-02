import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { FileSearch, AlertTriangle, CheckCircle2, FileText, ListTree, Target, ShieldAlert, Filter, Loader2 } from 'lucide-react';
import {
  fetchEvaluationMatrixDepartments,
  fetchEvaluationMatrixTenders,
  fetchEvaluationMatrixData,
  type EvaluationMatrixDepartment,
  type EvaluationMatrixTender,
  type EvaluationMatrixData,
} from '../services/api';

interface EvaluationMatrixGovTenderPageProps {
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
  ) => void;
}

// Type definition for agent response data structure
interface AgentResponseData {
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
  completenessCheck?: {
    overallStatus?: string;
    score?: number;
    remarks?: string;
    expectedSections?: string[];
    foundSections?: string[];
    missingSections?: string[];
  };
  evaluation?: Record<string, {
    score?: number;
    verdict?: string;
    summary?: string;
    strengths?: string[];
    gaps?: string[];
    keyPoints?: string[];
    ambiguities?: string[];
    referencedSections?: string[];
    keyRisks?: string[];
    paymentTerms?: string;
    priceBasis?: string;
    keyDates?: {
      projectStart?: string | null;
      projectCompletion?: string | null;
      maintenancePeriod?: string;
    };
  }>;
  evaluationMatrix?: {
    categories?: Array<{
      category_name?: string;
      category_description?: string;
      weight_percent?: number | null;
      subcategories?: Array<{
        subcategory_name?: string;
        subcategory_description?: string;
        weight_percent?: number | null;
        scoring_scale?: string | null;
        scoring_criteria?: any[];
      }>;
    }>;
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
  riskAssessment?: {
    overallRiskLevel?: string;
    dimensions?: Record<string, {
      level?: string;
      reasons?: string[];
    }>;
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
}

export function EvaluationMatrixGovTenderPage({
  onNavigate,
}: EvaluationMatrixGovTenderPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [departments, setDepartments] = useState<EvaluationMatrixDepartment[]>([]);
  const [tenders, setTenders] = useState<EvaluationMatrixTender[]>([]);
  const [data, setData] = useState<AgentResponseData | null>(null);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserInitiatedTenderSelection, setIsUserInitiatedTenderSelection] = useState(false);
  const [hasUrlParams, setHasUrlParams] = useState(false); // Track if we came from redirect with URL params

  // Load departments on mount and check URL params for auto-fill
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setError(null);
        const depts = await fetchEvaluationMatrixDepartments();
        setDepartments(depts);
        
        // Check URL params for auto-fill (only on initial load)
        const urlDepartment = searchParams.get('department');
        const urlTenderId = searchParams.get('tenderId');
        
        // If we have URL params, we came from a redirect - should auto-fetch
        if (urlDepartment || urlTenderId) {
          setHasUrlParams(true);
        }
        
        if (urlDepartment && depts.some(d => d.department === urlDepartment)) {
          // Auto-fill department from URL
          setSelectedDepartment(urlDepartment);
        } else if (depts.length > 0) {
          // Default to first department if no URL param
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

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
        const tenderList = await fetchEvaluationMatrixTenders(selectedDepartment);
        setTenders(tenderList);
        
        // Check URL params for auto-fill tender
        const urlTenderId = searchParams.get('tenderId');
        
        const urlTenderIdFromParams = searchParams.get('tenderId');
        
        if (urlTenderIdFromParams && tenderList.some(t => t.tenderId === urlTenderIdFromParams)) {
          // Auto-fill tender from URL
          setSelectedTenderId(urlTenderIdFromParams);
          // If we have URL params, allow auto-fetch (will be handled by hasUrlParams flag)
          // If no URL params, prevent auto-fetch
          if (!hasUrlParams) {
            setIsUserInitiatedTenderSelection(false);
          }
        } else if (tenderList.length > 0) {
          // Default to first tender if no URL param
          setSelectedTenderId(tenderList[0].tenderId);
          setIsUserInitiatedTenderSelection(false); // Mark as auto-selected
        } else {
          setSelectedTenderId('');
          setData(null);
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
  }, [selectedDepartment, searchParams]);

  // Load evaluation data when both department and tender are selected
  // Auto-fetch if we came from redirect (has URL params), otherwise only fetch on user selection
  useEffect(() => {
    const loadEvaluationData = async () => {
      if (!selectedDepartment || !selectedTenderId) {
        setData(null);
        return;
      }
      
      // Check if we have URL params (came from redirect)
      const urlDepartment = searchParams.get('department');
      const urlTenderId = searchParams.get('tenderId');
      const hasUrlParamsForFetch = !!(urlDepartment || urlTenderId);
      
      // Auto-fetch if we came from redirect (has URL params), otherwise only fetch on user selection
      if (!hasUrlParamsForFetch && !isUserInitiatedTenderSelection) {
        return;
      }

      try {
        setIsLoadingData(true);
        setError(null);
        const evaluationData = await fetchEvaluationMatrixData(selectedDepartment, selectedTenderId);
        
        if (!evaluationData) {
          setData(null);
          setIsLoadingData(false);
          return;
        }

        // Extract data from agent_output_matrix_structure
        // Handle both cases: data directly in response or nested under 'text' property
        let extractedData: AgentResponseData = {};
        
        const agentResponse2Raw = evaluationData.agent_output_matrix_structure?.agentresponse2;
        const agentResponse1Raw = evaluationData.agent_output_matrix_structure?.agentresponse1;

        // Helper function to get the actual data, whether it's directly in response or under 'text'
        const getResponseData = (response: any): any => {
          if (!response) return null;
          
          // Check if data is nested under 'text' property (Landscape & Irrigation case)
          if (response.text && typeof response.text === 'object') {
            return response.text;
          }
          // If 'text' is a string, try to parse it as JSON
          if (response.text && typeof response.text === 'string') {
            try {
              return JSON.parse(response.text);
            } catch (e) {
              // Try to extract JSON from text
              const jsonMatch = response.text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  return JSON.parse(jsonMatch[0]);
                } catch (e2) {
                  console.warn('Failed to parse text as JSON:', e2);
                }
              }
            }
          }
          
          // Data is directly in response (Legal case)
          return response;
        };

        const agentResponse2 = getResponseData(agentResponse2Raw);
        const agentResponse1 = getResponseData(agentResponse1Raw);

        if (agentResponse2) {
          // Extract tenderMeta
          if (agentResponse2.tenderMeta) {
            extractedData.tenderMeta = agentResponse2.tenderMeta;
          }

          // Extract completenessCheck
          if (agentResponse2.completenessCheck) {
            extractedData.completenessCheck = agentResponse2.completenessCheck;
          }

          // Extract evaluation
          if (agentResponse2.evaluation) {
            extractedData.evaluation = agentResponse2.evaluation;
          }

          // Extract documentStructure
          if (agentResponse2.documentStructure) {
            extractedData.documentStructure = agentResponse2.documentStructure;
          }

          // Extract riskAssessment
          if (agentResponse2.riskAssessment) {
            extractedData.riskAssessment = agentResponse2.riskAssessment;
          }

          // Extract issuesAndClarifications
          if (agentResponse2.issuesAndClarifications) {
            extractedData.issuesAndClarifications = agentResponse2.issuesAndClarifications;
          }

          // Extract overallRecommendation
          if (agentResponse2.overallRecommendation) {
            extractedData.overallRecommendation = agentResponse2.overallRecommendation;
          }
        }

        // Extract evaluationMatrix from agentResponse1
        // After getResponseData, the data should be directly accessible
        if (agentResponse1?.evaluation_matrix) {
          extractedData.evaluationMatrix = agentResponse1.evaluation_matrix;
        } else if (agentResponse1Raw?.evaluation_matrix) {
          // Fallback: check raw response for direct evaluation_matrix (Legal case)
          extractedData.evaluationMatrix = agentResponse1Raw.evaluation_matrix;
        }

        // Override tenderId and department from the main response if available
        if (evaluationData.tenderId && !extractedData.tenderMeta?.tenderId) {
          if (!extractedData.tenderMeta) {
            extractedData.tenderMeta = {};
          }
          extractedData.tenderMeta.tenderId = evaluationData.tenderId;
        }
        if (evaluationData.tenderName && !extractedData.tenderMeta?.tenderTitle) {
          if (!extractedData.tenderMeta) {
            extractedData.tenderMeta = {};
          }
          extractedData.tenderMeta.tenderTitle = evaluationData.tenderName;
        }
        if (evaluationData.department && !extractedData.tenderMeta?.departmentName) {
          if (!extractedData.tenderMeta) {
            extractedData.tenderMeta = {};
          }
          extractedData.tenderMeta.departmentName = evaluationData.department;
        }

        console.log('📊 Raw evaluation data from API:', evaluationData);
        console.log('📊 Agent Response 1 Raw:', agentResponse1Raw);
        console.log('📊 Agent Response 2 Raw:', agentResponse2Raw);
        console.log('📊 Agent Response 1 Processed:', agentResponse1);
        console.log('📊 Agent Response 2 Processed:', agentResponse2);
        console.log('📊 Extracted evaluation data:', extractedData);
        setData(extractedData);
      } catch (err: any) {
        console.error('Error loading evaluation data:', err);
        setError(err.message || 'Failed to load evaluation data');
        setData(null);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadEvaluationData();
  }, [selectedDepartment, selectedTenderId, isUserInitiatedTenderSelection, searchParams]);

  const selectedTender = tenders.find(t => t.tenderId === selectedTenderId);

  return (
    <>
      <Sidebar currentPage="evaluation-gov-tender" onNavigate={onNavigate as any} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-md">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Evaluation Matrix – Government Tender
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Structured assessment generated from RFP document analysis.
                </p>
              </div>
            </div>
            {selectedTender && (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  {selectedTender.tenderId}
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedDepartment}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Filters */}
          <section className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white via-sky-50 to-sky-100 border border-sky-100">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-sky-200 to-blue-200 opacity-50 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 bottom-0 w-40 h-40 bg-gradient-to-tr from-cyan-100 to-slate-100 opacity-60 blur-3xl pointer-events-none" />

            <div className="relative flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-inner">
                <Filter className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-indigo-500 uppercase">
                  Filters
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Select Department and Tender
                </h2>
              </div>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedTenderId(''); // Reset tender when department changes
                    setData(null); // Clear data when department changes
                    setIsUserInitiatedTenderSelection(false); // Reset flag when department changes
                  }}
                  disabled={isLoadingDepartments}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDepartments ? (
                    <option>Loading departments...</option>
                  ) : departments.length === 0 ? (
                    <option>No departments available</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.department} value={dept.department}>
                        {dept.department}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Tender
                </label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => {
                    setSelectedTenderId(e.target.value);
                    setIsUserInitiatedTenderSelection(true); // Mark as user-initiated selection
                    setData(null); // Clear data when tender changes
                  }}
                  disabled={isLoadingTenders || !selectedDepartment || tenders.length === 0}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingTenders ? (
                    <option>Loading tenders...</option>
                  ) : !selectedDepartment ? (
                    <option>Select a department first</option>
                  ) : tenders.length === 0 ? (
                    <option>No tenders available for this department</option>
                  ) : (
                    tenders.map((tender) => (
                      <option key={tender.tenderId} value={tender.tenderId}>
                        {tender.tenderName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {error && (
              <div className="relative mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </section>

          {/* Loading state */}
          {isLoadingData && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-600">Loading evaluation data...</p>
              </div>
            </div>
          )}

          {/* No data state */}
          {!isLoadingData && !data && selectedDepartment && selectedTenderId && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No evaluation data found for the selected department and tender.</p>
              </div>
            </div>
          )}

          {/* Evaluation Data */}
          {!isLoadingData && data && Object.keys(data).length > 0 && (
            <>
              {/* Tender meta & completeness */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm">
                    <div className="absolute -right-14 -top-10 w-40 h-40 bg-sky-200/40 rounded-full blur-3xl" />
                    <div className="relative space-y-2">
                      <p className="text-xs font-semibold tracking-[0.35em] text-sky-700 uppercase">
                        Tender Overview
                      </p>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {data.tenderMeta?.tenderTitle || selectedTender?.tenderName || 'N/A'}
                      </h2>
                      <p className="text-sm text-slate-700">
                        {data.tenderMeta?.sourceFileName || 'N/A'} •{' '}
                        <span className="font-medium">
                          Version {data.tenderMeta?.documentVersion || 'N/A'}
                        </span>{' '}
                        • Currency: {data.tenderMeta?.currency || 'N/A'}
                      </p>
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
                        {data.completenessCheck?.overallStatus || 'N/A'} •{' '}
                        {data.completenessCheck?.score ?? 0}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {data.completenessCheck?.remarks || 'No remarks available.'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Evaluation dimensions */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.evaluation && Object.entries(data.evaluation).map(([key, block]: [string, any]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-600" />
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Score: {block.score ?? 0} • {block.verdict || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{block.summary || 'No summary available.'}</p>
                    {block.strengths && block.strengths.length > 0 && (
                      <div className="mt-1">
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
                      <div className="mt-1">
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
                    {block.keyRisks && block.keyRisks.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] font-semibold text-red-700 uppercase mb-1">
                          Key Risks
                        </p>
                        <ul className="list-disc list-inside text-xs text-red-800 space-y-1">
                          {block.keyRisks.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* Evaluation matrix categories */}
              {data.evaluationMatrix?.categories && data.evaluationMatrix.categories.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <ListTree className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Evaluation Matrix – Categories
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.evaluationMatrix.categories.map((cat: any, index: number) => {
                      const categoryName = cat.category_name || 'Unnamed Category';
                      const categoryDesc = cat.category_description || '';
                      
                      return (
                        <div
                          key={categoryName || `category-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {categoryName}
                              </p>
                              {categoryDesc && (
                                <p className="text-xs text-slate-600 mt-1">
                                  {categoryDesc}
                                </p>
                              )}
                            </div>
                          </div>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div className="space-y-2">
                              {cat.subcategories.map((sub: any, subIndex: number) => {
                                const subName = sub.subcategory_name || 'Unnamed Subcategory';
                                const subDesc = sub.subcategory_description || '';
                                
                                return (
                                  <div
                                    key={subName || `subcategory-${subIndex}`}
                                    className="rounded-lg bg-white border border-slate-200 px-3 py-2"
                                  >
                                    <p className="text-xs font-semibold text-slate-800">
                                      {subName}
                                    </p>
                                    {subDesc && (
                                      <p className="text-xs text-slate-600 mt-0.5">
                                        {subDesc}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Document structure */}
              {data.documentStructure && (
                <section className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Document Structure
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {data.documentStructure.sections?.map((s, idx) => (
                        <div
                          key={s.sectionId || `section-${idx}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold text-slate-700 uppercase">
                              {s.sectionId || 'N/A'} • {s.title || 'N/A'}
                            </p>
                            {s.pageRange && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                Pages {s.pageRange[0]}–{s.pageRange[1]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700">{s.summary || 'No summary available.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {data.documentStructure.missingKeySections &&
                    data.documentStructure.missingKeySections.length > 0 && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 mr-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-800 uppercase">
                            Missing Key Sections
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.documentStructure.missingKeySections.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-amber-700 border border-amber-200"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </section>
              )}

              {/* Risk & issues */}
              {data.riskAssessment && (
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Risk Assessment – {data.riskAssessment.overallRiskLevel || 'N/A'}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {data.riskAssessment.dimensions &&
                        Object.entries(data.riskAssessment.dimensions).map(
                          ([name, dim]: [string, any]) => (
                            <div
                              key={name}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <p className="text-xs font-semibold text-slate-800">
                                {name.replace(/([A-Z])/g, ' $1').trim()} – {dim.level || 'N/A'}
                              </p>
                              {dim.reasons && dim.reasons.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                                  {dim.reasons.map((r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  {data.issuesAndClarifications && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900">
                          Issues &amp; Clarifications
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {data.issuesAndClarifications.clarificationQuestions?.map(
                          (q, idx) => (
                            <div
                              key={q.id || `question-${idx}`}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                                {q.id || 'N/A'} • {q.category || 'N/A'}
                              </p>
                              <p className="text-sm text-slate-800">{q.question || 'No question available.'}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Overall recommendation */}
              {data.overallRecommendation && (
                <section className="space-y-4">
                  <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-sky-700" />
                      <h3 className="text-sm font-semibold text-slate-900">
                        Overall Recommendation
                      </h3>
                    </div>
                    <p className="text-sm text-slate-800">
                      {data.overallRecommendation.narrativeSummary || 'No summary available.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.overallRecommendation.keyStrengths &&
                      data.overallRecommendation.keyStrengths.length > 0 && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                          <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">
                            Strengths
                          </p>
                          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                            {data.overallRecommendation.keyStrengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {data.overallRecommendation.keyConcerns &&
                      data.overallRecommendation.keyConcerns.length > 0 && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                          <p className="text-xs font-semibold text-amber-700 uppercase mb-3">
                            Concerns
                          </p>
                          <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
                            {data.overallRecommendation.keyConcerns.map((c: string, idx: number) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {data.overallRecommendation.recommendedActionsBeforeBidding &&
                      data.overallRecommendation.recommendedActionsBeforeBidding.length > 0 && (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm">
                          <p className="text-xs font-semibold text-sky-700 uppercase mb-3">
                            Recommended Actions
                          </p>
                          <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                            {data.overallRecommendation.recommendedActionsBeforeBidding.map(
                              (a: string, idx: number) => (
                                <li key={idx}>{a}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
