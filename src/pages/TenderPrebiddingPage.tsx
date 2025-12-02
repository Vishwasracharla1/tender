import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FileText, ListChecks, Filter } from 'lucide-react';
import {
  fetchEntityInstancesWithReferences,
  uploadFileToCDN,
  callQuestionnaireAgent,
  callPrebiddingDecisionAgent,
  postEntityInstances,
  type EntityInstance,
  type FileUploadResponse,
} from '../services/api';

interface TenderPrebiddingPageProps {
  onNavigate: (page: string) => void;
}

type PrebiddingTab = 'ADDENDUM' | 'QUESTIONNAIRE';

interface QuestionnaireRow {
  id: number | string;
  vendorQuestion: string;
  suggestedGovernmentAnswer: string;
  addendum?: string;
}

interface QuestionnaireSection {
  sectionTitle: string;
  rows: QuestionnaireRow[];
}

interface QuestionnaireResult {
  title: string;
  description?: string;
  sections: QuestionnaireSection[];
}

export function TenderPrebiddingPage({ onNavigate }: TenderPrebiddingPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTenderId, setSelectedTenderId] = useState('all');
  const [activeTab, setActiveTab] = useState<PrebiddingTab>('ADDENDUM');
  const [tenders, setTenders] = useState<EntityInstance[]>([]);
  const [checkedRecommendations, setCheckedRecommendations] = useState<Record<string, boolean>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>({});
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [questionnaireResult, setQuestionnaireResult] = useState<QuestionnaireResult | null>(null);
  const [questionnaireCompanyName, setQuestionnaireCompanyName] = useState<string>('Cognizant');
  const [questionnaireDocumentName, setQuestionnaireDocumentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const PREBIDDING_SCHEMA_ID = '692e8c47fd9c66658f22d73a';

  // Load prebidding tenders on mount
  useEffect(() => {
    const loadTenders = async () => {
      try {
        const data = await fetchEntityInstancesWithReferences(PREBIDDING_SCHEMA_ID, 3000, 'TIDB');
        setTenders(data);
      } catch (error) {
        console.error('❌ Error loading prebidding tenders:', error);
      }
    };

    loadTenders();
  }, []);

  // Compute available departments from loaded instances
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();

    tenders.forEach((instance) => {
      const dept =
        (instance.departmentName as string) ||
        (instance.department as string) ||
        (instance.data?.departmentName as string) ||
        (instance.data?.department as string);
      if (dept) {
        set.add(dept);
      }
    });

    return ['all', ...Array.from(set).sort()];
  }, [tenders]);

  // Compute available tenders (id + display name) for the selected department
  const tenderOptions = useMemo(() => {
    const map = new Map<string, string>(); // tenderId -> name

    tenders.forEach((instance) => {
      const dept =
        (instance.departmentName as string) ||
        (instance.department as string) ||
        (instance.data?.departmentName as string) ||
        (instance.data?.department as string);

      const tenderId =
        (instance.tenderId as string) ||
        (instance.data?.tenderId as string) ||
        (instance.data?.tender_id as string);

      if (!tenderId) return;

      const tenderName =
        (instance.tenderName as string) ||
        (instance.tender_title as string) ||
        (instance.data?.tenderName as string) ||
        (instance.data?.tender_title as string) ||
        (instance.data?.tender_name as string) ||
        tenderId;

      if (selectedDepartment !== 'all' && dept !== selectedDepartment) {
        return;
      }

      if (!map.has(tenderId)) {
        map.set(tenderId, tenderName);
      }
    });

    const options = Array.from(map.entries()).map(([id, name]) => ({
      id,
      name,
    }));

    return [{ id: 'all', name: 'All Tenders' }, ...options];
  }, [tenders, selectedDepartment]);

  const selectedTenderName = useMemo(() => {
    const opt = tenderOptions.find((o) => o.id === selectedTenderId);
    return opt?.name || '';
  }, [tenderOptions, selectedTenderId]);

  // Selected tender instance & recommendations
  const selectedTenderInstance = useMemo(() => {
    if (selectedTenderId === 'all') return null;

    return (
      tenders.find((instance) => {
        const tenderId =
          (instance.tenderId as string) ||
          (instance.data?.tenderId as string) ||
          (instance.data?.tender_id as string);
        return tenderId === selectedTenderId;
      }) || null
    );
  }, [tenders, selectedTenderId]);

  // Safely extract recommendations object from a tender instance,
  // handling different shapes the API might return.
  const extractRecommendations = (instance: EntityInstance | null): Record<string, any> | null => {
    if (!instance) return null;

    const anyInstance: any = instance;

    // Direct property
    if (anyInstance.recommendations && typeof anyInstance.recommendations === 'object') {
      return anyInstance.recommendations;
    }

    // From ai_response_output.gapAnalysisAgent.recommendations (shape from your sample)
    if (
      anyInstance.ai_response_output &&
      anyInstance.ai_response_output.gapAnalysisAgent &&
      anyInstance.ai_response_output.gapAnalysisAgent.recommendations
    ) {
      return anyInstance.ai_response_output.gapAnalysisAgent.recommendations;
    }

    // Sometimes wrapped under data
    const data = anyInstance.data;
    if (data) {
      if (
        !Array.isArray(data) &&
        typeof data === 'object' &&
        data.ai_response_output?.gapAnalysisAgent?.recommendations
      ) {
        return data.ai_response_output.gapAnalysisAgent.recommendations;
      }

      if (Array.isArray(data)) {
        const withRecs = data.find(
          (item: any) =>
            item &&
            typeof item === 'object' &&
            item.ai_response_output?.gapAnalysisAgent?.recommendations
        );
        if (withRecs) {
          return withRecs.ai_response_output.gapAnalysisAgent.recommendations;
        }
      }
    }

    return null;
  };

  const recommendationGroups = useMemo(() => {
    const container = extractRecommendations(selectedTenderInstance);
    if (!container || typeof container !== 'object') return [];

    return Object.entries(container).map(([category, value]) => ({
      category,
      items: Array.isArray(value) ? (value as string[]) : [],
    }));
  }, [selectedTenderInstance]);

  const toggleRecommendation = (key: string) => {
    setCheckedRecommendations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getTenderCdnUrlForSelected = (): string | null => {
    if (!selectedTenderId) return null;

    const instance = (tenders as any[]).find((t) => {
      const tid =
        t.tenderId ||
        t.id ||
        t.data?.tenderId ||
        t.data?.tender_id;
      return tid === selectedTenderId;
    });
    if (!instance) {
      console.warn('⚠️ No matching tender instance for selectedTenderId', { selectedTenderId });
      return null;
    }

    const anyInst: any = instance;
    const candidates: Array<string | undefined> = [
      anyInst.cdn_url,
      anyInst.cdnurl,
      anyInst.cdnUrl,
      anyInst.fileUrl,
      anyInst.url,
      anyInst.meta?.fileUrl,
      anyInst.meta?.cdn_url,
      anyInst.meta?.cdnurl,
      anyInst.data?.cdn_url,
      anyInst.data?.cdnurl,
      anyInst.data?.fileUrl,
      anyInst.data?.url,
      Array.isArray(anyInst.meta?.fileUrls) ? anyInst.meta.fileUrls[0] : undefined,
      Array.isArray(anyInst.data?.fileUrls) ? anyInst.data.fileUrls[0] : undefined,
      Array.isArray(anyInst.data?.meta?.fileUrls) ? anyInst.data.meta.fileUrls[0] : undefined,
      Array.isArray(anyInst.ai_response_output?.meta?.fileUrls) ? anyInst.ai_response_output.meta.fileUrls[0] : undefined,
      Array.isArray(anyInst.data?.ai_response_output?.meta?.fileUrls) ? anyInst.data.ai_response_output.meta.fileUrls[0] : undefined,
    ];

    const found = candidates.find((c) => typeof c === 'string' && c.length > 0);
    if (!found) {
      console.warn('⚠️ No CDN URL found on tender instance', { instance });
      return null;
    }
    return found;
  };

  const canOpenQuestionnaire = selectedDepartment !== 'all' && selectedTenderId !== 'all';

  const handlePersistSelections = async () => {
    try {
      const selectedAddendums: any[] = [];
      recommendationGroups.forEach((group) => {
        group.items.forEach((text, index) => {
          const key = `${group.category}-${index}`;
          if (checkedRecommendations[key]) {
            selectedAddendums.push({
              sectionTitle: group.category,
              text,
              selected: true,
            });
          }
        });
      });

      const vendorAnswers: any[] = [];
      if (questionnaireResult?.sections) {
        questionnaireResult.sections.forEach((section) => {
          section.rows.forEach((row) => {
            const key = `ans-${section.sectionTitle}-${row.id}`;
            if (checkedAnswers[key]) {
              vendorAnswers.push({
                questionId: row.id,
                sectionTitle: section.sectionTitle,
                vendorQuestion: row.vendorQuestion,
                suggestedGovernmentAnswer: row.suggestedGovernmentAnswer,
                selected: true,
              });
            }
          });
        });
      }

      // Combined JSON for agent payload: addendums + selected answers
      const agentAddedPayload = {
        added: [
          ...selectedAddendums,
          ...vendorAnswers,
        ],
      };

      console.log('🧩 Agent added payload (for agent call):', agentAddedPayload);

      const payload = {
        department: selectedDepartment,
        tenderId: selectedTenderId,
        tenderName: selectedTenderName,
        addendums: selectedAddendums,
        vendor_details: {
          [questionnaireCompanyName]: vendorAnswers,
        },
      };

      console.log('📤 Persisting prebidding selections to schema:', payload);
      await postEntityInstances('692ec827fd9c66658f22d744', payload);

      // Call both Prebidding Decision Agents in parallel with combined payload and tender CDN URL (if available)
      const tenderCdnUrl = getTenderCdnUrlForSelected();
      const fileUrls = tenderCdnUrl ? [tenderCdnUrl] : [];

      const agentCalls = [
        callPrebiddingDecisionAgent(agentAddedPayload, fileUrls), // primary agent (default id)
        callPrebiddingDecisionAgent(
          agentAddedPayload,
          fileUrls,
          '019ade08-66ae-7680-8ffe-cd98055329b3' // secondary agent
        ),
      ];

      const agentResults = await Promise.allSettled(agentCalls);
      
      // Extract successful agent responses (keep both raw and parsed)
      const agentResponses: any[] = [];
      const rawAgentResponses: any[] = [];
      
      agentResults.forEach((result, index) => {
        const label = index === 0 ? 'primary' : 'secondary';
        if (result.status === 'fulfilled') {
          console.log(`🤖 Prebidding decision agent (${label}) response:`, result.value);
          
          // Store raw response for schema
          rawAgentResponses.push(result.value);
          
          // Extract the actual response data - handle different response formats
          let responseData = result.value;
          if ((result.value as any)?.text) {
            try {
              responseData = typeof (result.value as any).text === 'string' 
                ? JSON.parse((result.value as any).text) 
                : (result.value as any).text;
            } catch (e) {
              // If parsing fails, try to extract JSON from text
              const textVal = (result.value as any).text as string;
              const jsonMatch = textVal.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                responseData = JSON.parse(jsonMatch[0]);
              }
            }
          } else if ((result.value as any)?.data) {
            responseData = (result.value as any).data;
          }
          agentResponses.push(responseData);
        } else {
          console.error(`❌ Failed to call ${label} Prebidding Decision Agent:`, result.reason);
        }
      });

      // Store agent responses in localStorage for the evaluation page
      if (agentResponses.length > 0) {
        localStorage.setItem('agentResponses', JSON.stringify(agentResponses));
        localStorage.setItem('agentResponsesTimestamp', Date.now().toString());
      }

      // Save agent responses to schema with agent_output_matrix_structure
      if (rawAgentResponses.length > 0 && selectedDepartment !== 'all' && selectedTenderId !== 'all') {
        try {
          const agentOutputMatrixStructure: any = {};
          
          // Helper function to extract content from text field
          const extractTextContent = (response: any): any => {
            // If response has a text field, extract and parse it
            if (response?.text) {
              try {
                // Try to parse as JSON if it's a string
                if (typeof response.text === 'string') {
                  return JSON.parse(response.text);
                }
                // If it's already an object, return it directly
                return response.text;
              } catch (e) {
                // If parsing fails, try to extract JSON from text
                const textVal = response.text as string;
                const jsonMatch = textVal.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    return JSON.parse(jsonMatch[0]);
                  } catch (e2) {
                    // If still fails, return the text as-is
                    return response.text;
                  }
                }
                // Return text as-is if no JSON found
                return response.text;
              }
            }
            // If no text field, return the response as-is
            return response;
          };
          
          // Add first agent response (extract from text field)
          if (rawAgentResponses[0]) {
            agentOutputMatrixStructure.agentresponse1 = extractTextContent(rawAgentResponses[0]);
          }
          
          // Add second agent response if available (extract from text field)
          if (rawAgentResponses[1]) {
            agentOutputMatrixStructure.agentresponse2 = extractTextContent(rawAgentResponses[1]);
          }

          const matrixPayload = {
            agent_output_matrix_structure: agentOutputMatrixStructure,
            tenderName: selectedTenderName,
            tenderId: selectedTenderId,
            after_addendum: true,
            department: selectedDepartment,
            timestamp: new Date().toISOString(),
          };

          console.log('📤 Saving agent responses to matrix structure schema:', matrixPayload);
          await postEntityInstances('692eadfffd9c66658f22d73e', matrixPayload);
          console.log('✅ Agent responses saved to schema successfully');
        } catch (schemaError: any) {
          console.error('❌ Failed to save agent responses to schema:', schemaError);
          // Don't block the flow if schema save fails
        }
      }

      alert('Prebidding selections saved to schema.');
      
      // Redirect to evaluation-gov-tender page after all agents respond
      onNavigate('evaluation-gov-tender');
    } catch (error: any) {
      console.error('❌ Failed to persist prebidding selections:', error);
      alert(error?.message || 'Failed to save selections to schema.');
    }
  };

  const handleSaveQuestionnaire = async () => {
    if (!selectedFile || isUploading) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      setAgentStatus(null);

      // 1) Upload to CDN using content service helper
      const response: FileUploadResponse = await uploadFileToCDN(
        selectedFile,
        'cdsHealthRecordSample'
      );

      const cdnUrl =
        (response as any).cdn_url ||
        (response as any).cdnurl ||
        (response as any).url;

      // store basic meta for display
      setQuestionnaireCompanyName('Cognizant');
      setQuestionnaireDocumentName(selectedFile.name);

      // 2) Call questionnaire agent with CDN URL
      try {
        const companyName = 'Cognizant'; // TODO: make this dynamic if needed
        const agentResponse = await callQuestionnaireAgent(companyName, [cdnUrl]);
        console.log('Questionnaire agent response:', agentResponse);

        // Parse structured text from agent response (similar to FileUpload.tsx)
        let parsedText: any = {};
        if ((agentResponse as any)?.text) {
          try {
            parsedText =
              typeof (agentResponse as any).text === 'string'
                ? JSON.parse((agentResponse as any).text)
                : (agentResponse as any).text;
          } catch (e) {
            const textVal = (agentResponse as any).text as string;
            const jsonMatch = textVal.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedText = JSON.parse(jsonMatch[0]);
            }
          }
        }

        const responseData: QuestionnaireResult | null =
          (parsedText && parsedText.sections) ? (parsedText as QuestionnaireResult) :
          (agentResponse as any).data?.sections ? ((agentResponse as any).data as QuestionnaireResult) :
          null;

        if (responseData) {
          setQuestionnaireResult(responseData);
          setAgentStatus(null);
        } else {
          setAgentStatus('Agent responded but no structured questionnaire data was found.');
        }
      } catch (agentError: any) {
        console.error('❌ Error calling questionnaire agent:', agentError);
        setAgentStatus(`Failed to notify agent: ${agentError?.message || 'Unknown error'}`);
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsQuestionnaireOpen(false);
    } catch (error: any) {
      console.error('❌ Error uploading questionnaire document:', error);
      setUploadError(error?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Sidebar currentPage="tender-prebidding" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Tender Prebidding
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage addendums and bidder questionnaires before submission.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-sky-700 bg-sky-50 rounded-full border border-sky-200">
                  Pre-bidding Phase
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Filters - same style as leadership dashboard */}
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
                  Personalize the Prebidding View
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
                    const value = e.target.value;
                    setSelectedDepartment(value);
                    // Reset tender selection when department changes
                    setSelectedTenderId('all');
                  }}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Tender Name
                </label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                  disabled={tenderOptions.length <= 1}
                >
                  {tenderOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section className="bg-white rounded-2xl shadow-md border border-slate-200">
            <div className="border-b border-slate-200 px-4 pt-4">
              <div className="inline-flex rounded-xl bg-slate-50 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('ADDENDUM')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'ADDENDUM'
                      ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  ADDENDUM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!canOpenQuestionnaire) {
                      alert('Please select both Department and Tender Name, and review addendums before proceeding to Questionnaire.');
                      return;
                    }
                    setActiveTab('QUESTIONNAIRE');
                  }}
                  disabled={!canOpenQuestionnaire}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'QUESTIONNAIRE'
                      ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  } ${!canOpenQuestionnaire ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ListChecks className="w-4 h-4" />
                  QUESTIONNAIRE
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'ADDENDUM' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        Prebidding Recommendations
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Review and tick the recommendations that should be included as addendums
                        for the selected tender.
                      </p>
                    </div>
                  </div>

                  {selectedTenderId === 'all' && (
                    <p className="text-sm text-slate-500">
                      Select a tender from the filter above to view its recommendations.
                    </p>
                  )}

                  {selectedTenderId !== 'all' && recommendationGroups.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No recommendations were found for this tender.
                    </p>
                  )}

                  {selectedTenderId !== 'all' && recommendationGroups.length > 0 && (
                    <>
                      <div className="space-y-4">
                        {recommendationGroups.map((group) => (
                          <div
                            key={group.category}
                            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                          >
                            <h3 className="text-xs font-bold tracking-wide text-slate-900 uppercase mb-2">
                              {group.category}
                            </h3>
                            <div className="space-y-2">
                              {group.items.map((item, index) => {
                                const key = `${group.category}-${index}`;
                                const checked = !!checkedRecommendations[key];
                                return (
                                  <label
                                    key={key}
                                    className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2.5 text-[13px] text-slate-700 cursor-pointer hover:border-sky-300 hover:shadow-sm transition-all duration-150"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-1 h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500 focus:ring-offset-1"
                                      checked={checked}
                                      onChange={() => toggleRecommendation(key)}
                                    />
                                    <span className="leading-snug font-medium text-slate-800">
                                      {item}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-semibold shadow-md hover:bg-sky-700 hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!canOpenQuestionnaire}
                          onClick={() => {
                            if (!canOpenQuestionnaire) {
                              alert('Please ensure both Department and Tender Name are selected before proceeding.');
                              return;
                            }
                            setActiveTab('QUESTIONNAIRE');
                          }}
                        >
                          Next: Configure Questionnaire
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "QUESTIONNAIRE" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-slate-900">
                      Bidder Questionnaire
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsQuestionnaireOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 text-white text-sm font-semibold shadow-md hover:bg-sky-700 hover:shadow-lg transition-all duration-150"
                    >
                      <ListChecks className="w-4 h-4" />
                      Add Questionnaire
                    </button>
                  </div>

                  {isQuestionnaireOpen && (
                    <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">
                          Upload Document
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setIsQuestionnaireOpen(false);
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-slate-600">
                          Upload any supporting document (PDF, Word, Excel, images, etc.) to capture bidder questions or responses.
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) =>
                            setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
                          }
                          className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-xs text-slate-500">
                            Selected: <span className="font-medium">{selectedFile.name}</span>
                          </p>
                        )}
                        {uploadError && (
                          <p className="text-xs text-rose-600">
                            {uploadError}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveQuestionnaire}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold shadow-sm hover:bg-sky-700 disabled:opacity-50"
                          disabled={!selectedFile || isUploading}
                        >
                          {isUploading ? 'Uploading...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}

                  {isUploading && !questionnaireResult && (
                    <div className="max-w-2xl mx-auto">
                      <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-4 py-3">
                        Analyzing uploaded document with AI, please wait...
                      </p>
                    </div>
                  )}

                  {agentStatus && !isUploading && (
                    <div className="max-w-2xl mx-auto">
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
                        {agentStatus}
                      </p>
                    </div>
                  )}

                  {questionnaireResult && (
                    <div className="space-y-6 max-w-6xl mx-auto">
                      {/* Header card with company, document, description */}
                      <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-5 shadow-sm">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-200/40 rounded-full blur-2xl" />
                        <div className="relative space-y-2">
                          <p className="text-xs font-semibold tracking-[0.35em] text-sky-700 uppercase">
                            Bidder Questionnaire Summary
                          </p>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {questionnaireCompanyName}
                          </h3>
                          {questionnaireDocumentName && (
                            <p className="text-sm font-medium text-slate-700">
                              Document: <span className="font-semibold">{questionnaireDocumentName}</span>
                            </p>
                          )}
                          <p className="text-sm text-slate-600">
                            {questionnaireResult.description}
                          </p>
                        </div>
                      </div>

                      {/* Sections and questions */}
                      {questionnaireResult.sections?.map((section) => (
                        <div
                          key={section.sectionTitle}
                          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-sky-50 to-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                              {section.rows?.length || 0}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                              {section.sectionTitle}
                            </h4>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {section.rows?.map((row) => {
                              const key = `ans-${section.sectionTitle}-${row.id}`;
                              const answered = !!checkedAnswers[key];
                              const toggleAnswer = () =>
                                setCheckedAnswers((prev) => ({
                                  ...prev,
                                  [key]: !answered,
                                }));

                              return (
                                <div
                                  key={row.id}
                                  className="p-4 space-y-3 bg-white hover:bg-slate-50/80 transition-colors"
                                >
                                  {/* Question box */}
                                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                                    <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1">
                                      Question #{row.id}
                                    </p>
                                    <p className="text-sm font-medium text-slate-900">
                                      {row.vendorQuestion}
                                    </p>
                                  </div>
                                  {/* Answer box with checkbox (clickable whole card) */}
                                  <div
                                    className="rounded-xl border border-sky-100 bg-white px-3 py-3 shadow-sm flex items-start gap-3 cursor-pointer hover:border-sky-300"
                                    onClick={toggleAnswer}
                                  >
                                    <div className="mt-1">
                                      <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                                        checked={answered}
                                        readOnly
                                      />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <p className="text-[11px] font-semibold text-sky-700 uppercase">
                                        Suggested Answer
                                      </p>
                                      <p className="text-sm text-slate-800">
                                        {questionnaireCompanyName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-600 text-white text-sm font-semibold shadow-md hover:bg-sky-700 hover:shadow-lg transition-all duration-150"
                          onClick={handlePersistSelections}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}


