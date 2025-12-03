import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
          // Don't auto-fetch - wait for user to select or URL params
          setIsUserInitiatedTenderSelection(false);
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
      
      // Always fetch when both department and tender are selected
      // The isUserInitiatedTenderSelection flag is just for tracking, not blocking
      // This ensures data loads when filters change

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
      <div className="app-shell min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 pb-24">
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
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl p-6 bg-white border border-indigo-200/50 shadow-lg"
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
                  Select Department and Tender
                </h2>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
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
                    setData(null); // Clear data when department changes
                    setIsUserInitiatedTenderSelection(false); // Reset flag when department changes
                    setError(null); // Clear any errors
                  }}
                  disabled={isLoadingDepartments}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-white border border-indigo-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
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
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
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
                    setIsUserInitiatedTenderSelection(true); // Mark as user-initiated selection
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
                    tenders.map((tender) => (
                      <option key={tender.tenderId} value={tender.tenderId}>
                        {tender.tenderName}
                      </option>
                    ))
                  )}
                </motion.select>
              </motion.div>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-md"
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
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm font-semibold text-black">Loading evaluation data...</p>
              </div>
            </motion.div>
          )}

          {/* No data state */}
          {!isLoadingData && !data && selectedDepartment && selectedTenderId && (
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
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                </motion.div>
                <p className="text-sm font-semibold text-black">No evaluation data found for the selected department and tender.</p>
              </div>
            </motion.div>
          )}

          {/* Evaluation Data */}
          {!isLoadingData && data && Object.keys(data).length > 0 && (
            <>
              {/* Tender meta & completeness */}
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
                    whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}
                    className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white p-5 shadow-md"
                  >
                    <div className="absolute -right-14 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-200 to-purple-200 opacity-30 rounded-full blur-3xl" />
                    <div className="relative space-y-2">
                      <p className="text-xs font-bold tracking-[0.35em] text-indigo-600 uppercase">
                        Tender Overview
                      </p>
                      <h2 className="text-lg font-bold text-black">
                        {data.tenderMeta?.tenderTitle || selectedTender?.tenderName || 'N/A'}
                      </h2>
                      <p className="text-sm text-black/80 font-medium">
                        {data.tenderMeta?.sourceFileName || 'N/A'} •{' '}
                        <span className="font-bold">
                          Version {data.tenderMeta?.documentVersion || 'N/A'}
                        </span>{' '}
                        • Currency: {data.tenderMeta?.currency || 'N/A'}
                      </p>
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
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
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
                        {data.completenessCheck?.overallStatus || 'N/A'} •{' '}
                        {data.completenessCheck?.score ?? 0}/100
                      </span>
                    </div>
                    <p className="text-xs text-black/80 font-medium">
                      {data.completenessCheck?.remarks || 'No remarks available.'}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.section>

              {/* Evaluation dimensions */}
              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {data.evaluation && Object.entries(data.evaluation).map(([key, block]: [string, any], index: number) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 15px 35px rgba(0,0,0,0.08)" }}
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
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-black">
                        Score: {block.score ?? 0} • {block.verdict || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-black/80 font-medium">{block.summary || 'No summary available.'}</p>
                    {block.strengths && block.strengths.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="mt-2 p-2 rounded-lg bg-emerald-50 border-2 border-emerald-200"
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
                        className="mt-2 p-2 rounded-lg bg-amber-50 border-2 border-amber-200"
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
                    {block.keyRisks && block.keyRisks.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="mt-2 p-2 rounded-lg bg-red-50 border-2 border-red-200"
                      >
                        <p className="text-[11px] font-bold text-red-900 uppercase mb-1">
                          Key Risks
                        </p>
                        <ul className="list-disc list-inside text-xs text-black space-y-1 font-medium">
                          {block.keyRisks.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.section>

              {/* Evaluation matrix categories */}
              {data.evaluationMatrix?.categories && data.evaluationMatrix.categories.length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-md space-y-4"
                >
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <ListTree className="w-4 h-4 text-indigo-600" />
                    </motion.div>
                    <h3 className="text-sm font-bold text-black">
                      Evaluation Matrix – Categories
                    </h3>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.evaluationMatrix.categories.map((cat: any, index: number) => {
                      const categoryName = cat.category_name || 'Unnamed Category';
                      const categoryDesc = cat.category_description || '';
                      
                      return (
                        <motion.div
                          key={categoryName || `category-${index}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                          className="rounded-xl border border-indigo-200 bg-white p-4 space-y-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-black">
                                {categoryName}
                              </p>
                              {categoryDesc && (
                                <p className="text-xs text-black/70 mt-1 font-medium">
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
                                  <motion.div
                                    key={subName || `subcategory-${subIndex}`}
                                    whileHover={{ scale: 1.02 }}
                                    className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 shadow-sm"
                                  >
                                    <p className="text-xs font-bold text-black">
                                      {subName}
                                    </p>
                                    {subDesc && (
                                      <p className="text-xs text-black/70 mt-0.5 font-medium">
                                        {subDesc}
                                      </p>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {/* Document structure */}
              {data.documentStructure && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.01, boxShadow: '0 15px 35px rgba(0,0,0,0.15)' }}
                    className="rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-lg"
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
                      {data.documentStructure.sections?.map((s, idx) => (
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
                              {s.sectionId || 'N/A'} • {s.title || 'N/A'}
                            </p>
                            {s.pageRange && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border-2 border-indigo-300 font-bold">
                                Pages {s.pageRange[0]}–{s.pageRange[1]}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-black/80 font-medium">
                            {s.summary || 'No summary available.'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {data.documentStructure.missingKeySections &&
                    data.documentStructure.missingKeySections.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 shadow-lg flex flex-wrap items-center gap-2"
                      >
                        <div className="flex items-center gap-2 mr-1">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </motion.div>
                          <span className="text-xs font-bold text-black uppercase">
                            Missing Key Sections
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {data.documentStructure.missingKeySections.map((m, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white text-black border-2 border-amber-300 shadow-md"
                            >
                              {m}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </motion.section>
              )}

              {/* Risk & issues */}
              {data.riskAssessment && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.01, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                    className="rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-lg space-y-3"
                  >
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                      </motion.div>
                      <h3 className="text-sm font-bold text-black">
                        Risk Assessment – {data.riskAssessment.overallRiskLevel || 'N/A'}
                      </h3>
                    </motion.div>
                    <div className="space-y-2">
                      {data.riskAssessment.dimensions &&
                        Object.entries(data.riskAssessment.dimensions).map(
                          ([name, dim]: [string, any], idx: number) => (
                            <motion.div
                              key={name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.0 + idx * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 shadow-md"
                            >
                              <p className="text-xs font-bold text-black">
                                {name.replace(/([A-Z])/g, ' $1').trim()} – {dim.level || 'N/A'}
                              </p>
                              {dim.reasons && dim.reasons.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-black mt-1 space-y-1 font-medium">
                                  {dim.reasons.map((r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              )}
                            </motion.div>
                          )
                        )}
                    </div>
                  </motion.div>

                  {data.issuesAndClarifications && (
                    <motion.div 
                      whileHover={{ scale: 1.01, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                      className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-lg space-y-3"
                    >
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        </motion.div>
                        <h3 className="text-sm font-bold text-black">
                          Issues &amp; Clarifications
                        </h3>
                      </motion.div>
                      <div className="space-y-2">
                        {data.issuesAndClarifications.clarificationQuestions?.map(
                          (q, idx) => (
                            <motion.div
                              key={q.id || `question-${idx}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.1 + idx * 0.05 }}
                              whileHover={{ scale: 1.02, x: -5 }}
                              className="rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-2 shadow-md"
                            >
                              <p className="text-[11px] font-bold text-black uppercase">
                                {q.id || 'N/A'} • {q.category || 'N/A'}
                              </p>
                              <p className="text-sm text-black font-medium">{q.question || 'No question available.'}</p>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.section>
              )}

              {/* Overall recommendation */}
              {data.overallRecommendation && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.01, boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                    className="rounded-2xl border-2 border-indigo-300 bg-white p-5 shadow-lg space-y-3"
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
                      {data.overallRecommendation.narrativeSummary || 'No summary available.'}
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {data.overallRecommendation.keyStrengths &&
                      data.overallRecommendation.keyStrengths.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4 }}
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-lg"
                        >
                          <p className="text-xs font-bold text-emerald-900 uppercase mb-3">
                            Strengths
                          </p>
                          <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                            {data.overallRecommendation.keyStrengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                    {data.overallRecommendation.keyConcerns &&
                      data.overallRecommendation.keyConcerns.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 }}
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-lg"
                        >
                          <p className="text-xs font-bold text-amber-900 uppercase mb-3">
                            Concerns
                          </p>
                          <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                            {data.overallRecommendation.keyConcerns.map((c: string, idx: number) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                    {data.overallRecommendation.recommendedActionsBeforeBidding &&
                      data.overallRecommendation.recommendedActionsBeforeBidding.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.6 }}
                          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                          className="rounded-2xl border-2 border-indigo-300 bg-white p-4 shadow-lg"
                        >
                          <p className="text-xs font-bold text-indigo-900 uppercase mb-3">
                            Recommended Actions
                          </p>
                          <ul className="list-disc list-inside text-xs text-black space-y-1.5 font-medium">
                            {data.overallRecommendation.recommendedActionsBeforeBidding.map(
                              (a: string, idx: number) => (
                                <li key={idx}>{a}</li>
                              )
                            )}
                          </ul>
                        </motion.div>
                      )}
                  </motion.div>
                </motion.section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
