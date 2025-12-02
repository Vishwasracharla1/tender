import { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FileSearch, AlertTriangle, CheckCircle2, FileText, ListTree, Target, ShieldAlert } from 'lucide-react';

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
  const [data, setData] = useState<AgentResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read agent responses from localStorage
    try {
      const storedResponses = localStorage.getItem('agentResponses');
      if (storedResponses) {
        const agentResponses: any[] = JSON.parse(storedResponses);
        
        // Merge agent responses - if multiple agents, combine their data
        // For now, use the first agent's response, or merge if structure allows
        let mergedData: AgentResponseData = {};
        
        if (agentResponses.length > 0) {
          // Use the first agent response as primary
          const primaryResponse = agentResponses[0];
          
          // Helper function to find categories in any structure
          const findCategories = (obj: any, path: string = ''): any[] | null => {
            if (!obj || typeof obj !== 'object') return null;
            
            // Check if this object has categories array
            if (Array.isArray(obj.categories)) {
              return obj.categories;
            }
            if (Array.isArray(obj.category)) {
              return obj.category;
            }
            
            // Recursively search in nested objects
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value && typeof value === 'object') {
                  const found = findCategories(value, `${path}.${key}`);
                  if (found) return found;
                }
              }
            }
            
            return null;
          };
          
          // Helper function to normalize category field names
          const normalizeCategory = (cat: any): any => {
            return {
              category_name: cat.category_name || cat.ionTitle || cat.name || cat.title || 'Unnamed Category',
              category_description: cat.category_description || cat.text || cat.description || '',
              weight_percent: cat.weight_percent || cat.weight || null,
              subcategories: cat.subcategories ? cat.subcategories.map((sub: any) => ({
                subcategory_name: sub.subcategory_name || sub.name || sub.title || 'Unnamed Subcategory',
                subcategory_description: sub.subcategory_description || sub.text || sub.description || '',
                weight_percent: sub.weight_percent || sub.weight || null,
                scoring_scale: sub.scoring_scale || null,
                scoring_criteria: sub.scoring_criteria || [],
              })) : [],
            };
          };
          
          // Helper function to extract data from response
          const extractData = (response: any): AgentResponseData => {
            let extracted: any = {};
            
            // Check if response has the expected structure directly
            if (response.tenderMeta || response.evaluation || response.evaluationMatrix || response.categories) {
              extracted = response;
            }
            // Check if nested under 'data'
            else if (response.data) {
              if (response.data.tenderMeta || response.data.evaluation || response.data.evaluationMatrix || response.data.categories) {
                extracted = response.data;
              }
            }
            // Check if nested under 'text' (JSON string)
            else if (response.text && typeof response.text === 'string') {
              try {
                const parsed = JSON.parse(response.text);
                if (parsed.tenderMeta || parsed.evaluation || parsed.evaluationMatrix || parsed.categories) {
                  extracted = parsed;
                }
              } catch (e) {
                // Try to extract JSON from text
                const jsonMatch = response.text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.tenderMeta || parsed.evaluation || parsed.evaluationMatrix || parsed.categories) {
                      extracted = parsed;
                    }
                  } catch (e2) {
                    // Ignore
                  }
                }
              }
            }
            // Try to use the response directly
            else {
              extracted = response;
            }
            
            // Search for categories if not found in standard location
            if (!extracted.evaluationMatrix?.categories && !extracted.categories) {
              const foundCategories = findCategories(extracted);
              if (foundCategories) {
                if (!extracted.evaluationMatrix) {
                  extracted.evaluationMatrix = {};
                }
                extracted.evaluationMatrix.categories = foundCategories;
              }
            }
            
            // Normalize categories if found
            if (extracted.evaluationMatrix?.categories) {
              extracted.evaluationMatrix.categories = extracted.evaluationMatrix.categories.map(normalizeCategory);
            } else if (extracted.categories) {
              extracted.evaluationMatrix = {
                categories: extracted.categories.map(normalizeCategory),
              };
            }
            
            return extracted;
          };
          
          mergedData = extractData(primaryResponse);
          
          // If there's a second agent response, merge complementary data
          if (agentResponses.length > 1 && agentResponses[1]) {
            const secondaryResponse = agentResponses[1];
            const secondaryData = extractData(secondaryResponse);
            
            // Merge fields that might be missing in primary
            mergedData = {
              ...mergedData,
              ...secondaryData,
              // Prefer primary for conflicts, but merge arrays where appropriate
              evaluation: mergedData.evaluation || secondaryData.evaluation,
              evaluationMatrix: mergedData.evaluationMatrix || secondaryData.evaluationMatrix,
            };
            
            // If evaluationMatrix exists in both, try to merge categories
            if (mergedData.evaluationMatrix && secondaryData.evaluationMatrix) {
              const primaryCategories = mergedData.evaluationMatrix.categories || [];
              const secondaryCategories = secondaryData.evaluationMatrix.categories || [];
              
              // Merge categories - avoid duplicates by category_name
              const categoryMap = new Map();
              primaryCategories.forEach((cat: any) => {
                if (cat.category_name) {
                  categoryMap.set(cat.category_name, cat);
                }
              });
              secondaryCategories.forEach((cat: any) => {
                if (cat.category_name && !categoryMap.has(cat.category_name)) {
                  categoryMap.set(cat.category_name, cat);
                }
              });
              
              mergedData.evaluationMatrix = {
                ...mergedData.evaluationMatrix,
                categories: Array.from(categoryMap.values()),
              };
            }
          }
          
          // Final check - search for categories in the raw response if still not found
          if (!mergedData.evaluationMatrix?.categories || mergedData.evaluationMatrix.categories.length === 0) {
            const foundCategories = findCategories(primaryResponse);
            if (foundCategories && foundCategories.length > 0) {
              if (!mergedData.evaluationMatrix) {
                mergedData.evaluationMatrix = {};
              }
              mergedData.evaluationMatrix.categories = foundCategories.map(normalizeCategory);
            }
          }
          
          // Debug logging
          console.log('📊 Raw agent response:', primaryResponse);
          console.log('📊 Parsed agent data:', mergedData);
          console.log('📋 Evaluation Matrix:', mergedData.evaluationMatrix);
          console.log('📁 Categories:', mergedData.evaluationMatrix?.categories);
          console.log('📁 Categories count:', mergedData.evaluationMatrix?.categories?.length || 0);
        }
        
        setData(mergedData);
      } else {
        // No agent responses found - show empty state or error
        console.warn('No agent responses found in localStorage');
        setData({});
      }
    } catch (error) {
      console.error('Error parsing agent responses:', error);
      setData({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <>
        <Sidebar currentPage="evaluation-gov-tender" onNavigate={onNavigate as any} />
        <div className="app-shell min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-600">Loading agent response data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <>
        <Sidebar currentPage="evaluation-gov-tender" onNavigate={onNavigate as any} />
        <div className="app-shell min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-600">No agent response data available. Please go back and save the prebidding selections.</p>
          </div>
        </div>
      </>
    );
  }

  // At this point, data is guaranteed to be non-null
  const agentData = data;

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
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {agentData.tenderMeta?.tenderId}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {agentData.tenderMeta?.departmentName}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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
                    {agentData.tenderMeta?.tenderTitle}
                  </h2>
                  <p className="text-sm text-slate-700">
                    {agentData.tenderMeta?.sourceFileName} •{' '}
                    <span className="font-medium">
                      Version {agentData.tenderMeta?.documentVersion}
                    </span>{' '}
                    • Currency: {agentData.tenderMeta?.currency}
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
                    {agentData.completenessCheck?.overallStatus} •{' '}
                    {agentData.completenessCheck?.score ?? 0}/100
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {agentData.completenessCheck?.remarks}
                </p>
              </div>
            </div>
          </section>

          {/* Evaluation dimensions – move to top */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {agentData.evaluation && (
              <>
                {Object.entries(agentData.evaluation).map(([key, block]: any) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-sky-600" />
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Score: {block.score ?? 0} • {block.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{block.summary}</p>
                    {block.strengths && block.strengths.length > 0 && (
                      <div className="mt-1">
                        <p className="text-[11px] font-semibold text-emerald-700 uppercase mb-1">
                          Strengths
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                          {block.strengths.map((s: string) => (
                            <li key={s}>{s}</li>
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
                          {block.gaps.map((g: string) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </section>

          {/* Evaluation matrix categories – second */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Evaluation Matrix – Categories
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentData.evaluationMatrix?.categories && agentData.evaluationMatrix.categories.length > 0 ? (
                agentData.evaluationMatrix.categories.map((cat: any, index: number) => {
                  // Handle both normalized and original field names
                  const categoryName = cat.category_name || cat.ionTitle || cat.name || cat.title || 'Unnamed Category';
                  const categoryDesc = cat.category_description || cat.text || cat.description || '';
                  
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
                            const subName = sub.subcategory_name || sub.name || sub.title || 'Unnamed Subcategory';
                            const subDesc = sub.subcategory_description || sub.text || sub.description || '';
                            
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
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-sm text-slate-500">
                    No evaluation matrix categories found in agent response.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Check console for agent response structure. Raw response logged above.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Document structure – now full width, with missing sections below */}
          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Document Structure
                </h3>
              </div>
              <div className="space-y-3">
                {agentData.documentStructure?.sections?.map((s) => (
                  <div
                    key={s.sectionId}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-700 uppercase">
                        {s.sectionId} • {s.title}
                      </p>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        Pages {s.pageRange?.[0]}–{s.pageRange?.[1]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{s.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing key sections moved below as horizontal pill row */}
            {agentData.documentStructure?.missingKeySections &&
              agentData.documentStructure.missingKeySections.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 shadow-sm flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 mr-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800 uppercase">
                      Missing Key Sections
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agentData.documentStructure.missingKeySections.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-amber-700 border border-amber-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </section>

          {/* Risk & issues – after document structure */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Risk Assessment – {agentData.riskAssessment?.overallRiskLevel}
                </h3>
              </div>
              <div className="space-y-2">
                {agentData.riskAssessment?.dimensions &&
                  Object.entries(agentData.riskAssessment.dimensions).map(
                    ([name, dim]: any) => (
                      <div
                        key={name}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {name.replace(/([A-Z])/g, ' $1')} – {dim.level}
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                          {dim.reasons?.map((r: string) => (
                            <li key={r}>{r}</li>
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
                {agentData.issuesAndClarifications?.clarificationQuestions?.map(
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

          {/* Overall recommendation */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Overall Recommendation
                </h3>
              </div>
              <p className="text-sm text-slate-800">
                {agentData.overallRecommendation?.narrativeSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strengths Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {agentData.overallRecommendation?.keyStrengths?.map((s: string) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Concerns Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-amber-700 uppercase mb-3">
                  Concerns
                </p>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1.5">
                  {agentData.overallRecommendation?.keyConcerns?.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions Box */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-sky-700 uppercase mb-3">
                  Recommended Actions
                </p>
                <ul className="list-disc list-inside text-xs text-slate-800 space-y-1.5">
                  {agentData.overallRecommendation?.recommendedActionsBeforeBidding?.map(
                    (a: string) => (
                      <li key={a}>{a}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}



