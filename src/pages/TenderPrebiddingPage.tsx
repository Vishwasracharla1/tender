import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { FileText, ListChecks, Filter } from 'lucide-react';
import {
  fetchEntityInstancesWithReferences,
  uploadFileToCDN,
  callQuestionnaireAgent,
  callPrebiddingDecisionAgent,
  postEntityInstances,
  updateEntityInstance,
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

interface SavedAddendum {
  sectionTitle: string;
  selected: boolean;
  text: string;
}

interface SavedVendorQuestion {
  questionId: number;
  sectionTitle: string;
  selected: boolean;
  suggestedGovernmentAnswer: string;
  vendorQuestion: string;
}

interface SavedPrebiddingData {
  tenderName: string;
  tenderId: string;
  department: string;
  addendums: SavedAddendum[];
  vendor_details: {
    [vendorName: string]: SavedVendorQuestion[];
  };
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
  const [savedPrebiddingData, setSavedPrebiddingData] = useState<SavedPrebiddingData | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const PREBIDDING_SCHEMA_ID = '692e8c47fd9c66658f22d73a';
  const SAVED_PREBIDDING_SCHEMA_ID = '692ec827fd9c66658f22d744';

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

  // Fetch saved prebidding data when tender is selected
  useEffect(() => {
    const fetchSavedData = async () => {
      if (selectedTenderId === 'all') {
        setSavedPrebiddingData(null);
        setAvailableVendors([]);
        setSelectedVendor('');
        setCheckedRecommendations({});
        setCheckedAnswers({});
        return;
      }

      try {
        console.log('📥 Fetching saved prebidding data for tender:', selectedTenderId);
        
        // Try both tenderId and id as filter keys
        let data: any[] = [];
        try {
          data = await fetchEntityInstancesWithReferences(
            SAVED_PREBIDDING_SCHEMA_ID,
            3000,
            'TIDB',
            { tenderId: selectedTenderId }
          );
        } catch (err) {
          // If tenderId filter fails, try with id
          console.log('⚠️ Trying with id filter instead of tenderId');
          data = await fetchEntityInstancesWithReferences(
            SAVED_PREBIDDING_SCHEMA_ID,
            3000,
            'TIDB',
            { id: selectedTenderId }
          );
        }

        // Find the matching tender data
        const savedData = data.find((item: any) => {
          const tenderId = item.tenderId || item.data?.tenderId || item.data?.tender_id || item.id || item.data?.id;
          return tenderId === selectedTenderId;
        });

        if (savedData) {
          const parsedData: SavedPrebiddingData = {
            tenderName: savedData.tenderName || savedData.data?.tenderName || '',
            tenderId: savedData.tenderId || savedData.data?.tenderId || selectedTenderId,
            department: savedData.department || savedData.data?.department || selectedDepartment,
            addendums: savedData.addendums || savedData.data?.addendums || [],
            vendor_details: savedData.vendor_details || savedData.data?.vendor_details || {},
          };

          setSavedPrebiddingData(parsedData);
          
          // Extract available vendors
          const vendors = Object.keys(parsedData.vendor_details || {});
          setAvailableVendors(vendors);
          
          // Auto-select first vendor if available
          if (vendors.length > 0 && !selectedVendor) {
            setSelectedVendor(vendors[0]);
          }
        } else {
          setSavedPrebiddingData(null);
          setAvailableVendors([]);
          setSelectedVendor('');
        }
      } catch (error) {
        console.error('❌ Error fetching saved prebidding data:', error);
        setSavedPrebiddingData(null);
        setAvailableVendors([]);
        setSelectedVendor('');
      }
    };

    fetchSavedData();
  }, [selectedTenderId, selectedDepartment]);


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

  // Update addendum checkboxes when saved data or recommendations change
  useEffect(() => {
    if (!savedPrebiddingData || !selectedTenderInstance || recommendationGroups.length === 0) {
      return;
    }

    const newCheckedRecommendations: Record<string, boolean> = {};
    savedPrebiddingData.addendums.forEach((addendum) => {
      if (addendum.selected) {
        // Find matching recommendation by section and text
        recommendationGroups.forEach((group) => {
          if (group.category === addendum.sectionTitle) {
            group.items.forEach((item, index) => {
              // Try exact match first, then partial match
              if (item === addendum.text || item.includes(addendum.text) || addendum.text.includes(item)) {
                const key = `${group.category}-${index}`;
                newCheckedRecommendations[key] = true;
              }
            });
          }
        });
      }
    });
    setCheckedRecommendations((prev) => ({ ...prev, ...newCheckedRecommendations }));
  }, [savedPrebiddingData, recommendationGroups, selectedTenderInstance]);

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

  // Load vendor questionnaire from saved data
  const loadVendorQuestionnaire = (vendorName: string) => {
    if (!savedPrebiddingData || !savedPrebiddingData.vendor_details[vendorName]) {
      setQuestionnaireResult(null);
      setCheckedAnswers({});
      return;
    }

    const vendorQuestions = savedPrebiddingData.vendor_details[vendorName];
    
    // Group questions by section
    const sectionsMap = new Map<string, QuestionnaireRow[]>();
    
    vendorQuestions.forEach((question) => {
      const sectionTitle = question.sectionTitle || 'General';
      if (!sectionsMap.has(sectionTitle)) {
        sectionsMap.set(sectionTitle, []);
      }
      sectionsMap.get(sectionTitle)!.push({
        id: question.questionId,
        vendorQuestion: question.vendorQuestion,
        suggestedGovernmentAnswer: question.suggestedGovernmentAnswer,
      });
    });

    // Convert to QuestionnaireResult format
    const sections: QuestionnaireSection[] = Array.from(sectionsMap.entries()).map(([sectionTitle, rows]) => ({
      sectionTitle,
      rows,
    }));

    const result: QuestionnaireResult = {
      title: `Questionnaire for ${vendorName}`,
      description: `Saved questionnaire responses for ${vendorName}`,
      sections,
    };

    setQuestionnaireResult(result);
    setQuestionnaireCompanyName(vendorName);
    setQuestionnaireDocumentName(null);

    // Update checkboxes based on saved data
    const newCheckedAnswers: Record<string, boolean> = {};
    vendorQuestions.forEach((question) => {
      if (question.selected) {
        const key = `ans-${question.sectionTitle}-${question.questionId}`;
        newCheckedAnswers[key] = true;
      }
    });
    setCheckedAnswers(newCheckedAnswers);
  };

  // Load vendor questionnaire when vendor is selected from saved data (only from dropdown, not from new upload)
  useEffect(() => {
    // Skip if this is from a fresh upload - when vendor matches current questionnaire company and we have a result
    if (selectedVendor && selectedVendor === questionnaireCompanyName && questionnaireResult) {
      console.log('⏭️ Skipping useEffect - questionnaire already set for fresh upload:', selectedVendor);
      return; // Don't interfere with fresh uploads
    }
    
    // Only proceed if vendor is selected
    if (!selectedVendor) return;
    
    if (savedPrebiddingData && savedPrebiddingData.vendor_details[selectedVendor]) {
      // Load saved questionnaire for this vendor
      console.log('📥 Loading saved questionnaire for vendor:', selectedVendor);
      loadVendorQuestionnaire(selectedVendor);
    } else {
      // If vendor is selected but no saved data, clear questionnaire only if it's a different vendor
      if (questionnaireCompanyName !== selectedVendor && questionnaireResult) {
        console.log('🧹 Clearing questionnaire - different vendor selected:', selectedVendor);
        setQuestionnaireResult(null);
        setCheckedAnswers({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVendor, savedPrebiddingData]);

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

      // Check if we have existing data for this tenderId
      // tenderId is the instance identifier (there's no separate instanceId)
      const hasExistingData = savedPrebiddingData && savedPrebiddingData.tenderId === selectedTenderId;
      
      console.log('🔍 Checking for existing data:', {
        hasSavedData: !!savedPrebiddingData,
        savedTenderId: savedPrebiddingData?.tenderId,
        selectedTenderId,
        hasExistingData,
      });
      
      // Merge with existing vendor_details if available
      const existingVendorDetails = savedPrebiddingData?.vendor_details || {};
      const updatedVendorDetails = {
        ...existingVendorDetails,
        [questionnaireCompanyName]: vendorAnswers,
      };

      // Merge addendums - preserve existing addendums (they should remain the same)
      // Only use current selection if there are no existing addendums
      const mergedAddendums = hasExistingData && savedPrebiddingData?.addendums?.length > 0
        ? savedPrebiddingData.addendums
        : (selectedAddendums.length > 0 ? selectedAddendums : []);

      const payload: any = {
        department: selectedDepartment !== 'all' ? selectedDepartment : (savedPrebiddingData?.department || ''),
        tenderId: selectedTenderId,
        tenderName: selectedTenderName || savedPrebiddingData?.tenderName || '',
        addendums: mergedAddendums,
        vendor_details: updatedVendorDetails,
      };

      // Before saving, check if data already exists for this tenderId by fetching
      // This ensures we use PUT if data exists, even if it wasn't loaded in state
      // tenderId IS the instance identifier (row identifier)
      let shouldUsePUT = hasExistingData;
      
      if (!hasExistingData && selectedTenderId !== 'all') {
        // Quick check: fetch to see if data exists for this tenderId
        try {
          const existingData = await fetchEntityInstancesWithReferences(
            SAVED_PREBIDDING_SCHEMA_ID,
            10,
            'TIDB',
            { tenderId: selectedTenderId }
          );
          
          const foundData = existingData.find((item: any) => {
            const tenderId = item.tenderId || item.data?.tenderId || item.data?.tender_id;
            return tenderId === selectedTenderId;
          });
          
          if (foundData) {
            shouldUsePUT = true;
            console.log('✅ Found existing data for tenderId, will use PUT:', { tenderId: selectedTenderId });
          }
        } catch (error) {
          console.warn('⚠️ Could not check for existing data, proceeding with save:', error);
        }
      }

      // If we have existing data, use PUT to update
      // tenderId in the payload will be used as the identifier to match the instance (row)
      if (shouldUsePUT) {
        console.log('📤 Updating existing prebidding data with PUT (tenderId is the identifier):', {
          hasExistingData,
          shouldUsePUT,
          tenderId: selectedTenderId,
          payload,
        });
        await updateEntityInstance('692ec827fd9c66658f22d744', payload);
      } else {
        // Otherwise, use POST to create new
        console.log('📤 Creating new prebidding data with POST:', {
          hasExistingData,
          shouldUsePUT,
          selectedTenderId,
          payload,
        });
        await postEntityInstances('692ec827fd9c66658f22d744', payload);
      }

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
      setQuestionnaireDocumentName(selectedFile.name);

      // 2) Call questionnaire agent with CDN URL
      // Note: Company name will be extracted from the API response description
      // For now, we pass a placeholder - the actual company name will be extracted from response
      try {
        const placeholderCompanyName = 'Company'; // Placeholder, will be replaced by extracted name
        const agentResponse = await callQuestionnaireAgent(placeholderCompanyName, [cdnUrl]);
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
          // Extract company name from description
          // Description format: "This document contains vendor queries submitted by {Company Name}, along with..."
          let extractedCompanyName = 'Cognizant'; // Default fallback
          
          // Helper function to extract company name from description text
          const extractCompanyFromDescription = (desc: string): string | null => {
            // Pattern: "submitted by Company Name, along with..."
            // Example: "submitted by Tyconz Technology Solutions, along with suggested..."
            // We want to extract just "Tyconz Technology Solutions"
            
            // Split by "submitted by" and take the part after it
            const parts = desc.split(/submitted by\s+/i);
            if (parts.length < 2) return null;
            
            const afterSubmitted = parts[1];
            
            // Now split by comma to get just the company name
            const companyPart = afterSubmitted.split(',')[0];
            
            // Also check for "along with" in case there's no comma
            const finalCompany = companyPart.split(/\s+along with/i)[0];
            
            const companyName = finalCompany.trim();
            
            // Validate: should not be empty and should not contain common sentence words
            if (companyName && 
                !companyName.toLowerCase().includes('along with') &&
                !companyName.toLowerCase().includes('suggested') &&
                companyName.length > 0 &&
                companyName.length < 100) { // Reasonable company name length
              return companyName;
            }
            
            return null;
          };
          
          // First try to extract from responseData.description
          if (responseData.description) {
            const companyName = extractCompanyFromDescription(responseData.description);
            if (companyName) {
              extractedCompanyName = companyName;
              console.log('📝 Extracted company name from responseData.description:', extractedCompanyName);
            }
          }
          
          // Also try to extract from parsed text description
          if (extractedCompanyName === 'Cognizant' && parsedText?.description) {
            const descText = typeof parsedText.description === 'string' 
              ? parsedText.description 
              : JSON.stringify(parsedText.description);
            const companyName = extractCompanyFromDescription(descText);
            if (companyName) {
              extractedCompanyName = companyName;
              console.log('📝 Extracted company name from parsedText.description:', extractedCompanyName);
            }
          }
          
          // Last resort: try to extract from the raw text response (in case description is nested)
          if (extractedCompanyName === 'Cognizant' && (agentResponse as any)?.text) {
            const textResponse = typeof (agentResponse as any).text === 'string'
              ? (agentResponse as any).text
              : JSON.stringify((agentResponse as any).text);
            
            // Try to find description in the text (could be JSON string)
            try {
              const jsonText = JSON.parse(textResponse);
              if (jsonText.description && typeof jsonText.description === 'string') {
                const companyName = extractCompanyFromDescription(jsonText.description);
                if (companyName) {
                  extractedCompanyName = companyName;
                  console.log('📝 Extracted company name from text response JSON description:', extractedCompanyName);
                }
              }
            } catch (e) {
              // If not JSON, try direct match on the text
              const companyName = extractCompanyFromDescription(textResponse);
              if (companyName) {
                extractedCompanyName = companyName;
                console.log('📝 Extracted company name from text response:', extractedCompanyName);
              }
            }
          }

          // Update company name state with extracted value FIRST
          setQuestionnaireCompanyName(extractedCompanyName);
          
          // Set questionnaire result BEFORE updating vendor selection to prevent useEffect from clearing it
          setQuestionnaireResult(responseData);
          setAgentStatus(null);
          
          // Auto-tick checkboxes for questions that were previously selected
          const newCheckedAnswers: Record<string, boolean> = {};
          
          // Check if there's saved data for this vendor
          if (savedPrebiddingData && savedPrebiddingData.vendor_details[extractedCompanyName]) {
            const savedQuestions = savedPrebiddingData.vendor_details[extractedCompanyName];
            
            // Match questions from new response with saved questions
            responseData.sections?.forEach((section) => {
              section.rows?.forEach((row) => {
                // Try to find matching saved question
                const savedQuestion = savedQuestions.find((sq) => {
                  // Match by questionId if available
                  if (sq.questionId && row.id && sq.questionId === row.id) {
                    return true;
                  }
                  // Match by question text (case-insensitive, trimmed)
                  const savedText = (sq.vendorQuestion || '').trim().toLowerCase();
                  const newText = (row.vendorQuestion || '').trim().toLowerCase();
                  if (savedText && newText && savedText === newText) {
                    return true;
                  }
                  // Partial match if question text contains key phrases
                  if (savedText && newText && (
                    savedText.includes(newText.substring(0, 20)) ||
                    newText.includes(savedText.substring(0, 20))
                  )) {
                    return true;
                  }
                  return false;
                });
                
                // If found and was selected, tick the checkbox
                if (savedQuestion && savedQuestion.selected) {
                  const key = `ans-${section.sectionTitle}-${row.id}`;
                  newCheckedAnswers[key] = true;
                }
              });
            });
          }
          
          setCheckedAnswers(newCheckedAnswers);
          
          // Update vendor list and selection AFTER questionnaire is set
          // Add vendor to available vendors if not already present
          if (extractedCompanyName && !availableVendors.includes(extractedCompanyName)) {
            setAvailableVendors((prev) => [...prev, extractedCompanyName]);
          }
          
          // Set selected vendor AFTER questionnaire result is set
          // This ensures the questionnaire displays for new vendors
          console.log('✅ Setting questionnaire for new vendor:', extractedCompanyName);
          setSelectedVendor(extractedCompanyName);
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

                  {/* Vendor Dropdown */}
                  {availableVendors.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Select Vendor
                      </label>
                      <select
                        value={selectedVendor}
                        onChange={(e) => {
                          const vendor = e.target.value;
                          setSelectedVendor(vendor);
                          loadVendorQuestionnaire(vendor);
                        }}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-colors"
                      >
                        <option value="">-- Select a vendor --</option>
                        {availableVendors.map((vendor) => (
                          <option key={vendor} value={vendor}>
                            {vendor}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                                        {row.suggestedGovernmentAnswer}
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


