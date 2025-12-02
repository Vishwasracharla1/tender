import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle, Calendar, FileDown, Search, TrendingUp, Users, Zap, ArrowRight, Shield, Target, Settings, BarChart3 } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TenderQueriesUI, TenderQueriesData } from '../components/TenderQueriesUI';
import {
  fetchEvaluationRecommendationInstances,
  JustificationInstanceItem,
  callEvaluationRecommendationAgent,
  callGovernmentQueriesAgent,
} from '../services/api';

interface EvaluationRecommendationPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding' | 'evaluation-breakdown' | 'evaluation-recommendation') => void;
}

// Helper to extract table rows from markdown-like tables
const parseMarkdownTable = (section: string): string[][] => {
  const lines = section
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|'));

  if (lines.length <= 2) return [];

  // Skip header and separator
  const dataLines = lines.slice(2);

  return dataLines
    .map(line => {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      return cells;
    })
    .filter(row => row.length > 0 && row.some(cell => cell.length > 0));
};

// Helper to safely extract a section between two markers
const extractSection = (text: string, startMarker: string, endMarker?: string): string => {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';

  const fromStart = text.slice(startIndex + startMarker.length);

  if (!endMarker) return fromStart;

  const endIndex = fromStart.indexOf(endMarker);
  if (endIndex === -1) return fromStart;

  return fromStart.slice(0, endIndex);
};

const RFPAddendumViewer = () => {
  const [activeTab, setActiveTab] = useState('scopeGap');
  const [expandedGap, setExpandedGap] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [justificationInstances, setJustificationInstances] = useState<JustificationInstanceItem[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track whether we have any recommendations/results to show
  const [hasResults, setHasResults] = useState(false);
  const [gaps, setGaps] = useState<Array<{
    id: number;
    title: string;
    icon: JSX.Element;
    color: string;
    bgColor: string;
    borderColor: string;
    observation: string;
    conclusion: string;
    action: string;
  }>>([]);

  // Fetch evaluation recommendation instances from API
  useEffect(() => {
    const loadInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const instances = await fetchEvaluationRecommendationInstances(1000);
        setJustificationInstances(instances);
      } catch (error) {
        console.error('Failed to fetch evaluation recommendation instances:', error);
        setJustificationInstances([]);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    loadInstances();
  }, []);

  // Extract unique company names from API instances
  const companyNames = useMemo(() => {
    const companies = new Set<string>();
    justificationInstances.forEach(instance => {
      // Try different possible field names for company name
      const companyName = instance.companyName || instance.company_name || instance.company || '';
      if (companyName && typeof companyName === 'string' && companyName.trim()) {
        const trimmedName = companyName.trim();
        // Filter out "main company" (case-insensitive)
        if (trimmedName.toLowerCase() !== 'main company') {
          companies.add(trimmedName);
        }
      }
    });
    return Array.from(companies).sort();
  }, [justificationInstances]);

  // Set default company on mount
  useEffect(() => {
    if (!selectedCompany && companyNames.length > 0) {
      setSelectedCompany(companyNames[0]);
    }
  }, [companyNames, selectedCompany]);

  // Get documents with no company name
  const documentsWithNoCompany = useMemo(() => {
    return justificationInstances.filter(instance => {
      const companyName = instance.companyName || instance.company_name || instance.company || '';
      return !companyName || companyName.trim() === '';
    });
  }, [justificationInstances]);

  // Get CDN URLs for 2 common (no-company) documents first, then selected company documents
  const getCdnUrlsForCompany = useMemo(() => {
    const commonUrls: string[] = [];
    const companyUrls: string[] = [];

    // 1) Add up to 2 documents with no company name (common docs) FIRST
    const noCompanyDocs = documentsWithNoCompany.slice(0, 2);
    noCompanyDocs.forEach(instance => {
      let cdnUrl = instance.cdnUrl || instance.cdnurl || instance.fileUrl || '';

      if (!cdnUrl && instance.cdnUrls) {
        if (Array.isArray(instance.cdnUrls)) {
          cdnUrl = instance.cdnUrls[0] || '';
        } else if (typeof instance.cdnUrls === 'string') {
          cdnUrl = instance.cdnUrls;
        }
      }

      if (!cdnUrl && instance.fileUrls) {
        if (Array.isArray(instance.fileUrls)) {
          cdnUrl = instance.fileUrls[0] || '';
        } else if (typeof instance.fileUrls === 'string') {
          cdnUrl = instance.fileUrls;
        }
      }

      if (cdnUrl && typeof cdnUrl === 'string' && cdnUrl.trim()) {
        commonUrls.push(cdnUrl.trim());
      }
    });

    // 2) Then add CDN URLs for selected company-specific documents
    if (selectedCompany && selectedCompany !== 'all') {
      justificationInstances.forEach(instance => {
        const companyName = instance.companyName || instance.company_name || instance.company || '';
        if (companyName && companyName.trim() === selectedCompany) {
          let cdnUrl = instance.cdnUrl || instance.cdnurl || instance.fileUrl || '';

          if (!cdnUrl && instance.cdnUrls) {
            if (Array.isArray(instance.cdnUrls)) {
              cdnUrl = instance.cdnUrls[0] || '';
            } else if (typeof instance.cdnUrls === 'string') {
              cdnUrl = instance.cdnUrls;
            }
          }

          if (!cdnUrl && instance.fileUrls) {
            if (Array.isArray(instance.fileUrls)) {
              cdnUrl = instance.fileUrls[0] || '';
            } else if (typeof instance.fileUrls === 'string') {
              cdnUrl = instance.fileUrls;
            }
          }

          if (cdnUrl && typeof cdnUrl === 'string' && cdnUrl.trim()) {
            companyUrls.push(cdnUrl.trim());
          }
        }
      });
    }

    return [...commonUrls, ...companyUrls];
  }, [selectedCompany, justificationInstances, documentsWithNoCompany]);

  // Build agent query
  const buildAgentQuery = (company: string): string => {
    if (company === 'all') {
      return 'TenderId: RAK_01, Company Name: All';
    } else {
      return `TenderId: RAK_01, Company Name: ${company}`;
    }
  };

  // Handle submit to agent
  const handleSubmit = async () => {
    if (!selectedCompany) {
      console.warn('Please select a company first.');
      return;
    }

    setIsSubmitting(true);
    // Reset previous results while new recommendations are being generated
    setHasResults(false);
    setGaps([]);
    setAmendments([]);
    setQueries([]);
    setGovQueriesData(null);
    try {
      const query = buildAgentQuery(selectedCompany);
      const cdnUrls = getCdnUrlsForCompany;

      // Fire Government Queries agent (map JSON/string response into UI)
      callGovernmentQueriesAgent(query, cdnUrls)
        .then((govResponse) => {
          console.log('Government Queries Agent response:', govResponse);

          // Government agent sends JSON string in "text" field, e.g.:
          // { "tenderId": "...", "companyName": "...", "queries": [...] }
          const rawGov =
            (govResponse as any)?.data?.text ||
            (govResponse as any)?.text ||
            (govResponse as any)?.msg;

          if (!rawGov) return;

          let parsed: any = null;
          if (typeof rawGov === 'string') {
            try {
              parsed = JSON.parse(rawGov);
            } catch (e) {
              console.error('Failed to parse Government Queries JSON text:', e);
            }
          } else if (typeof rawGov === 'object') {
            parsed = rawGov;
          }

          if (parsed && parsed.tenderId && parsed.companyName && Array.isArray(parsed.queries)) {
            setGovQueriesData(parsed as TenderQueriesData);
            setHasResults(true);
          }
        })
        .catch((govError) => {
          console.error('Error calling Government Queries Agent:', govError);
        });

      console.log('Submitting to evaluation recommendation agent:', {
        query,
        company: selectedCompany,
        cdnUrlCount: cdnUrls.length,
        cdnUrls
      });

      const response = await callEvaluationRecommendationAgent(query, cdnUrls);

      console.log('Agent response:', response);

      // If agent already returns structured JSON with partA/partB, use it directly
      if (response.data && typeof response.data === 'object' && (response.data as any).partA && (response.data as any).partB) {
        applyJsonRecommendation(response.data);
        setHasResults(true);
        return;
      }

      // Parse response and update gaps/amendments/queries
      if (response.data || response.text || response.msg) {
        const rawText = response.data?.text || response.text || response.msg || JSON.stringify(response);
        console.log('Agent response text:', rawText);

        // If text starts with ```json or json, try to parse JSON from it
        if (typeof rawText === 'string') {
          const trimmed = rawText.trim();

          let jsonString: string | null = null;
          if (trimmed.toLowerCase().startsWith('```json')) {
            // Strip ```json and trailing ``` if present
            jsonString = trimmed.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          } else if (trimmed.toLowerCase().startsWith('json')) {
            jsonString = trimmed.slice(4).trim();
          }

          if (jsonString) {
            try {
              const jsonData = JSON.parse(jsonString);
              console.log('Parsed JSON recommendation from agent text field');
              if (jsonData.partA && jsonData.partB) {
                applyJsonRecommendation(jsonData);
                setHasResults(true);
                return;
              }
            } catch (e) {
              console.error('Failed to parse JSON from agent text field:', e);
            }
          }
        }

        const responseText = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);

        // --- Part A: Gaps ---
        let partASection = extractSection(
          responseText,
          '## PART A: Scope Gap Analysis',
          '---'
        );

        // Fallback: if the marker is missing, use full response text
        if (!partASection || !partASection.trim()) {
          partASection = responseText;
        }

        if (partASection) {
          const parsedGaps: Array<{ title: string; observation: string; conclusion: string; action: string }> = [];

          // Newer format: "### Gap 1: Title" + "**Observation:**" lines
          const hashStyleRegex = /###\s*Gap\s+(\d+):\s*([^\n]+)\n([\s\S]*?)(?=\n###\s*Gap|\n##\s*PART B|\n---|$)/gi;
          let match: RegExpExecArray | null;
          while ((match = hashStyleRegex.exec(partASection)) !== null) {
            const block = match[3] as string;
            const observationMatch = block.match(/\*\*Observation:\*\*\s*(.+)/i);
            const conclusionMatch = block.match(/\*\*Conclusion:\*\*\s*(.+)/i);
            const actionMatch = block.match(/\*\*Recommended Action:\*\*\s*(.+)/i);

            parsedGaps.push({
              title: match[2].trim(),
              observation: observationMatch ? observationMatch[1].trim() : '',
              conclusion: conclusionMatch ? conclusionMatch[1].trim() : '',
              action: actionMatch ? actionMatch[1].trim() : '',
            });
          }

          // Backward‑compat format: "**Gap 1: Title**" with "- **Observation:**" bullets
          if (parsedGaps.length === 0) {
            const starStyleRegex = /\*\*Gap\s+(\d+):\s*([^*]+)\*\*([\s\S]*?)(?=\n\*\*Gap|\n---|\n###\s*Part B|$)/gi;
            while ((match = starStyleRegex.exec(partASection)) !== null) {
              const block = match[3] as string;
              const observationMatch = block.match(/- \*\*Observation:\*\*\s*(.+)/i);
              const conclusionMatch = block.match(/- \*\*Conclusion:\*\*\s*(.+)/i);
              const actionMatch = block.match(/- \*\*Recommended Action:\*\*\s*(.+)/i);

              parsedGaps.push({
                title: match[2].trim(),
                observation: observationMatch ? observationMatch[1].trim() : '',
                conclusion: conclusionMatch ? conclusionMatch[1].trim() : '',
                action: actionMatch ? actionMatch[1].trim() : '',
              });
            }
          }

          if (parsedGaps.length > 0) {
            const updatedGaps = parsedGaps.map((parsed, index) => {
              const style = getGapStyle(index);
              return {
                id: index + 1,
                title: parsed.title,
                observation: parsed.observation,
                conclusion: parsed.conclusion,
                action: parsed.action,
                icon: style.icon,
                color: style.color,
                bgColor: style.bgColor,
                borderColor: style.borderColor,
              };
            });
            setGaps(updatedGaps);
          } else {
            // If no gaps parsed, clear existing to reflect empty response
            setGaps([]);
          }
        }

        // --- Part B: General Amendments ---
        const amendmentsSection = extractSection(
          responseText,
          '### General Amendments',
          '---'
        );

        if (amendmentsSection) {
          const rows = parseMarkdownTable(amendmentsSection);
          if (rows.length > 0) {
            const mappedAmendments = rows.map(row => {
              const [clause, original, amended, reason] = row;
              return {
                clause: clause || '',
                original: original || '',
                amended: amended || '',
                reason: reason || '',
                impact: 'High',
              };
            });
            setAmendments(mappedAmendments);
          }
        }

        // --- Query-Response Matrix ---
        const queriesSection = extractSection(
          responseText,
          '### Query-Response Matrix',
          '---'
        );

        if (queriesSection) {
          const rows = parseMarkdownTable(queriesSection);
          if (rows.length > 0) {
            const mappedQueries = rows.map(row => {
              const [no, queryText, ref, responseCell, actionCell] = row;
              return {
                no: Number(no) || 0,
                query: queryText || '',
                ref: ref || '',
                response: responseCell || '',
                action: actionCell || '',
                status: 'Resolved',
              };
            });
            setQueries(mappedQueries);
            setHasResults(true);
          }
        }

        // --- Key Dates ---
        const keyDatesSection = extractSection(
          responseText,
          '### Key Dates',
          '---'
        );

        if (keyDatesSection) {
          const rows = parseMarkdownTable(keyDatesSection);
          if (rows.length > 0) {
            const [oldDates, newDates] = rows[0];
            setKeyDates({
              oldDates: oldDates || keyDates.oldDates,
              newDates: newDates || keyDates.newDates,
            });
          }
        }

        // --- Annexures ---
        const annexuresSection = extractSection(
          responseText,
          '### List of New Annexures',
          '---'
        );

        if (annexuresSection) {
          const lines = annexuresSection
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('- '));

          if (lines.length > 0) {
            const parsedAnnexures = lines.map(line => line.replace(/^-+\s*/, '').trim());
            setAnnexures(parsedAnnexures);
          }
        }
      }
    } catch (error) {
      console.error('Error calling evaluation recommendation agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [amendments, setAmendments] = useState<
    Array<{ clause: string; original: string; amended: string; reason: string; impact: string }>
  >([]);

  const [queries, setQueries] = useState<
    Array<{ no: number; query: string; ref: string; response: string; action: string; status: string }>
  >([]);

  const [keyDates, setKeyDates] = useState({
    oldDates: '[Insert Old Dates]',
    newDates: '[Insert New Dates]',
  });

  const [annexures, setAnnexures] = useState<string[]>([
    'Detailed Training Plan',
    'List of KPIs and Measurement Methodology',
  ]);

  // Government queries data (for Government Queries tab)
  const [govQueriesData, setGovQueriesData] = useState<TenderQueriesData | null>(null);

  // Helper to assign consistent styles/icons for gaps
  const getGapStyle = (index: number) => {
    const styles = [
      {
        icon: <Zap className="w-6 h-6" />,
        color: 'from-indigo-500 to-purple-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
      },
      {
        icon: <Users className="w-6 h-6" />,
        color: 'from-sky-500 to-blue-600',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-200',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
      },
      {
        icon: <Target className="w-6 h-6" />,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
      },
      {
        icon: <Settings className="w-6 h-6" />,
        color: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
      },
      {
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
      },
    ];

    if (index < styles.length) {
      return styles[index];
    }
    // Cycle through styles for gaps beyond 6
    return styles[index % styles.length];
  };

  // Apply structured JSON recommendation into UI state (for JSON agent responses)
  const applyJsonRecommendation = (data: any) => {
    if (!data) return;

    // --- Part A: Gaps from JSON ---
    if (data.partA && Array.isArray(data.partA.gaps)) {
      const parsedGaps = data.partA.gaps as Array<{
        gapId?: string;
        topic?: string;
        observation?: string;
        conclusion?: string;
        recommendedAction?: string;
      }>;

      const updatedGaps = parsedGaps.map((g, index) => {
        const style = getGapStyle(index);
        return {
          id: index + 1,
          title: g.topic || `Gap ${index + 1}`,
          observation: g.observation || '',
          conclusion: g.conclusion || '',
          action: g.recommendedAction || '',
          icon: style.icon,
          color: style.color,
          bgColor: style.bgColor,
          borderColor: style.borderColor,
        };
      });
      setGaps(updatedGaps);
    }

    // --- Part B: General Amendments ---
    if (data.partB && Array.isArray(data.partB.generalAmendments)) {
      const parsedAmendments = (data.partB.generalAmendments as Array<{
        clauseReference?: string;
        originalText?: string;
        amendedText?: string;
        reasonForChange?: string;
      }>).map(a => ({
        clause: a.clauseReference || '',
        original: a.originalText || '',
        amended: a.amendedText || '',
        reason: a.reasonForChange || '',
        impact: 'High',
      }));
      setAmendments(parsedAmendments);
    }

    // --- Query-Response Matrix ---
    if (data.partB && Array.isArray(data.partB.queryResponseMatrix)) {
      const parsedQueries = (data.partB.queryResponseMatrix as Array<{
        serialNo?: number;
        vendorQueryParaphrased?: string;
        rfpReference?: string;
        agentResponse?: string;
        actionTaken?: string;
      }>).map(q => ({
        no: q.serialNo || 0,
        query: q.vendorQueryParaphrased || '',
        ref: q.rfpReference || '',
        response: q.agentResponse || '',
        action: q.actionTaken || '',
        status: 'Resolved',
      }));
      setQueries(parsedQueries);
    }

    // --- Key Dates ---
    if (data.partB && Array.isArray(data.partB.keyDates) && data.partB.keyDates.length > 0) {
      const kd = data.partB.keyDates[0] as { oldDate?: string; newDate?: string };
      setKeyDates({
        oldDates: kd.oldDate || keyDates.oldDates,
        newDates: kd.newDate || keyDates.newDates,
      });
    }

    // --- Annexures ---
    if (data.partB && Array.isArray(data.partB.newAnnexures)) {
      const parsedAnnexures = (data.partB.newAnnexures as Array<string>).length
        ? (data.partB.newAnnexures as Array<string>)
        : ['None required for this Addendum'];
      setAnnexures(parsedAnnexures);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Hero Header */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <FileText className="w-6 h-6 text-sky-600" />
                </div>
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-semibold tracking-tight">RFP ADDENDUM</h1>
                    <span className="bg-white text-sky-600 px-2 py-0.5 rounded-full text-xs font-semibold">NO. 1</span>
                  </div>
                  <p className="text-sm text-blue-50 font-medium mb-1">
                    Corporate Performance Management System
                  </p>
                </div>
              </div>
              <div className="bg-amber-400 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm shadow-md transform hover:scale-105 transition-transform">
                OFFICIAL DOCUMENT
              </div>
            </div>
            
            <div className="mt-4 bg-white bg-opacity-90 backdrop-blur-sm border border-white border-opacity-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-semibold text-sm mb-0.5">⚠️ Effectivity Clause</p>
                  <p className="text-gray-700 text-xs">This addendum forms an integral part of the RFP and must be acknowledged by all bidders.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Selection Dropdown */}
        <div className="mb-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Company Name
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                }}
                disabled={isLoadingInstances}
                className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm transition-all duration-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isLoadingInstances ? 'Loading...' : 'Select Company'}
                </option>
                <option value="all">All</option>
                {companyNames.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
                {!isLoadingInstances && companyNames.length === 0 && (
                  <option value="" disabled>No companies available</option>
                )}
              </select>
            </div>
            <div>
              <button
                onClick={handleSubmit}
                disabled={!selectedCompany || isLoadingInstances || isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
          <div className="flex bg-gradient-to-r from-gray-50 to-sky-50">
            <button
              onClick={() => setActiveTab('scopeGap')}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'scopeGap' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Scope Gap Analysis
              </span>
              {activeTab === 'scopeGap' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('amendments')}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'amendments' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FileDown className="w-4 h-4" />
                Official Response
              </span>
              {activeTab === 'amendments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('govQueries')}
              className={`flex-1 px-4 py-3 font-semibold text-sm transition-all relative ${
                activeTab === 'govQueries' ? 'text-sky-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Government Queries
              </span>
              {activeTab === 'govQueries' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Part A: Scope Gap Analysis */}
            {activeTab === 'scopeGap' && (
              !hasResults ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <Search className="w-8 h-8 text-sky-500 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">
                    Select a company and click Submit to generate scope gap recommendations.
                  </p>
                </div>
              ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <AlertCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Internal Scope Gap Analysis</h2>
                    <p className="text-sm text-gray-600 font-normal mt-1">Identified ambiguities requiring clarification</p>
                  </div>
                </motion.div>
                
                <div className="grid gap-5">
                  {gaps.map((gap, idx) => (
                    <motion.div 
                      key={gap.id} 
                      className={`group relative overflow-hidden rounded-xl border-2 ${gap.borderColor} bg-white shadow-md transition-all duration-300 cursor-pointer`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      whileHover={{
                        borderColor: '#3b82f6',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
                      }}
                      onClick={() => setExpandedGap(expandedGap === gap.id ? null : gap.id)}
                    >
                      <div 
                        className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${gap.color}`}
                      />
                      <motion.div
                        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0"
                        style={{ background: `linear-gradient(to right, ${gap.color.includes('indigo') ? '#6366f1' : gap.color.includes('sky') ? '#0ea5e9' : gap.color.includes('emerald') ? '#10b981' : gap.color.includes('amber') ? '#f59e0b' : gap.color.includes('rose') ? '#f43f5e' : '#8b5cf6'})` }}
                        whileHover={{ opacity: 1, scaleX: 1 }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      
                      <div className="p-5 pl-7">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div 
                              className={`bg-gradient-to-br ${gap.color} p-3 rounded-xl text-white shadow-lg`}
                            >
                              {gap.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span 
                                  className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${gap.color} text-white px-3 py-1 rounded-full shadow-sm`}
                                >
                                  Gap #{gap.id}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900">{gap.title}</h3>
                              </div>
                            </div>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedGap === gap.id ? 90 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </motion.div>
                        </div>
                        
                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedGap === gap.id ? 'auto' : 0,
                            opacity: expandedGap === gap.id ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          {expandedGap === gap.id && (
                            <motion.div 
                              className="space-y-4 mt-4"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <motion.div 
                                className={`${gap.bgColor} border-2 ${gap.borderColor} p-4 rounded-xl transition-all duration-300`}
                                whileHover={{ borderColor: '#3b82f6' }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div 
                                    className="w-2 h-2 bg-blue-500 rounded-full"
                                  />
                                  <p className="font-bold text-gray-900 text-xs uppercase tracking-wide">Observation</p>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed font-normal">{gap.observation}</p>
                              </motion.div>
                              
                              <motion.div 
                                className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl transition-all duration-300"
                                whileHover={{ borderColor: '#f59e0b' }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div 
                                    className="w-2 h-2 bg-amber-500 rounded-full"
                                  />
                                  <p className="font-bold text-gray-900 text-xs uppercase tracking-wide">Conclusion</p>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed font-normal">{gap.conclusion}</p>
                              </motion.div>
                              
                              <motion.div 
                                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-xl transition-all duration-300"
                                whileHover={{ borderColor: '#22c55e' }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  </motion.div>
                                  <p className="font-bold text-green-900 text-xs uppercase tracking-wide">Recommended Action</p>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed font-semibold">{gap.action}</p>
                              </motion.div>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              )
            )}

            {/* Part B: Official Response */}
            {activeTab === 'amendments' && (
              !hasResults ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <FileDown className="w-8 h-8 text-sky-500 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">
                    Select a company and click Submit to view the official response draft.
                  </p>
                </div>
              ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* General Amendments */}
                <div>
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div 
                      className="bg-gradient-to-r from-sky-500 to-blue-600 p-3 rounded-xl shadow-lg"
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FileDown className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">General Amendments</h2>
                      <p className="text-sm text-gray-600 font-normal mt-1">Critical scope fixes and clarifications</p>
                    </div>
                  </motion.div>
                  
                  <div className="space-y-4">
                    {amendments.map((amendment, idx) => (
                      <motion.div 
                        key={idx} 
                        className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-md transition-all duration-300 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        whileHover={{
                          borderColor: '#3b82f6',
                          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
                        }}
                      >
                        <motion.div
                          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-400 opacity-0"
                          whileHover={{ opacity: 1, scaleX: 1 }}
                          initial={{ opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="bg-gradient-to-br from-blue-500 to-sky-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg"
                            >
                              §{amendment.clause}
                            </div>
                            <span 
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                amendment.impact === 'High' ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                              }`}
                            >
                              {amendment.impact} Impact
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <motion.div 
                            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 transition-all duration-300"
                            whileHover={{ borderColor: '#ef4444' }}
                          >
                            <p className="text-xs font-bold text-red-700 uppercase mb-2 tracking-wide">❌ Original Text</p>
                            <p className="text-gray-700 text-sm font-normal leading-relaxed">{amendment.original}</p>
                          </motion.div>
                          <motion.div 
                            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 transition-all duration-300"
                            whileHover={{ borderColor: '#22c55e' }}
                          >
                            <p className="text-xs font-bold text-green-700 uppercase mb-2 tracking-wide">✓ Amended Text</p>
                            <p className="text-gray-800 font-semibold text-sm leading-relaxed">{amendment.amended}</p>
                          </motion.div>
                        </div>
                        
                        <motion.div 
                          className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border-2 border-blue-200 transition-all duration-300"
                          whileHover={{ borderColor: '#3b82f6' }}
                        >
                          <p className="text-xs font-bold text-blue-700 uppercase mb-2 tracking-wide">Reason for Change</p>
                          <p className="text-gray-800 text-sm font-normal leading-relaxed">{amendment.reason}</p>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Query-Response Matrix */}
                <div>
                  <motion.div 
                    className="flex items-center gap-3 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  > 
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-sky-600 p-3 rounded-xl shadow-lg"
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Search className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Query-Response Matrix</h2>
                      <p className="text-sm text-gray-600 font-normal mt-1">Vendor queries and official clarifications</p>
                    </div>
                  </motion.div>
                  
                  <div className="space-y-4">
                    {queries.map((query, idx) => (
                      <motion.div 
                        key={query.no} 
                        className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-md transition-all duration-300 relative overflow-hidden group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.4 }}
                        whileHover={{
                          scale: 1.02,
                          borderColor: '#3b82f6',
                          boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
                        }}
                      >
                        <motion.div
                          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-400 opacity-0"
                          whileHover={{ opacity: 1, scaleX: 1 }}
                          initial={{ opacity: 0, scaleX: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        <div className="flex items-start gap-4">
                          <div 
                            className="bg-gradient-to-br from-blue-500 to-sky-600 text-white rounded-xl w-12 h-12 flex items-center justify-center font-bold text-base shadow-lg flex-shrink-0"
                          >
                            {query.no}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Vendor Query</span>
                              <span 
                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border-2 border-green-300"
                              >
                                ✓ {query.status}
                              </span>
                            </div>
                            <p className="text-gray-900 font-bold text-base mb-2 leading-relaxed">{query.query}</p>
                            <span 
                              className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold mb-4 border border-blue-200"
                            >
                              Reference: §{query.ref}
                            </span>
                            
                            <motion.div 
                              className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-xl mb-3 transition-all duration-300"
                            >
                              <p className="text-xs font-bold text-green-800 uppercase mb-2 tracking-wide">Official Response</p>
                              <p className="text-sm text-gray-800 leading-relaxed font-normal">{query.response}</p>
                            </motion.div>
                            
                            <motion.div 
                              className="flex items-center gap-2"
                              whileHover={{ x: 5 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </motion.div>
                              <span className="text-sm font-semibold text-gray-800">{query.action}</span>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Additional Sections */}
                <div className="grid md:grid-cols-2 gap-5">
                  <motion.div 
                    className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-md transition-all duration-300 relative overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: '#3b82f6',
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 opacity-0"
                      whileHover={{ opacity: 1, scaleX: 1 }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Calendar className="w-5 h-5 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-800">Key Dates</h3>
                    </div>
                    <div className="space-y-3">
                      <motion.div 
                        className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 transition-all duration-300"
                        whileHover={{ borderColor: '#64748b' }}
                      >
                        <p className="text-xs font-bold text-gray-600 uppercase mb-2 tracking-wide">Previous Timeline</p>
                        <p className="font-mono text-sm text-gray-700 font-normal">{keyDates.oldDates}</p>
                      </motion.div>
                      <motion.div 
                        className="bg-green-50 rounded-xl p-4 border-2 border-green-400 transition-all duration-300"
                        whileHover={{ borderColor: '#22c55e' }}
                      >
                        <p className="text-xs font-bold text-green-700 uppercase mb-2 tracking-wide">✓ Updated Timeline</p>
                        <p className="font-mono text-sm font-bold text-green-700">{keyDates.newDates}</p>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-md transition-all duration-300 relative overflow-hidden"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: '#3b82f6',
                      boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 opacity-0"
                      whileHover={{ opacity: 1, scaleX: 1 }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <FileText className="w-5 h-5 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-800">New Annexures</h3>
                    </div>
                    <ul className="space-y-3">
                      {annexures.map((item, index) => (
                        <motion.li 
                          key={index} 
                          className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border-2 border-blue-200 transition-all duration-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                          whileHover={{ 
                            x: 5, 
                            borderColor: '#3b82f6',
                            backgroundColor: '#dbeafe'
                          }}
                        >
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          </motion.div>
                          <span className="text-sm text-gray-800 font-semibold">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
              )
            )}

            {/* Government Queries */}
            {activeTab === 'govQueries' && (
              !hasResults || !govQueriesData ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <FileText className="w-8 h-8 text-sky-500 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">
                    Select a company and click Submit to see government queries and responses.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <TenderQueriesUI data={govQueriesData} />
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl shadow-md p-4 border border-sky-200">
          <div className="flex items-start gap-3">
            <div className="bg-sky-500 p-2 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Important Notice</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                This addendum is intended to clarify the scope and expectations outlined in the original RFP and to ensure that all bidders have a clear understanding of the requirements. Please ensure that your proposals reflect these clarifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function EvaluationRecommendationPage({ onNavigate }: EvaluationRecommendationPageProps) {
  return (
    <>
      <Sidebar currentPage="evaluation" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <RFPAddendumViewer />
      </div>
    </>
  );
}

