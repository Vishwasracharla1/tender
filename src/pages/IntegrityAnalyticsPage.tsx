import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { EnhancedNetworkGraph } from '../components/EnhancedNetworkGraph';
import { IntegrityAlertList } from '../components/IntegrityAlertList';
import { IntegrityFooter } from '../components/IntegrityFooter';
import { FlaggedEvaluatorsList } from '../components/FlaggedEvaluatorsList';
import { CalendarPicker } from '../components/CalendarPicker';
import { ShieldAlert, TrendingUp, CheckCircle, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';
import { fetchIntegrityAnalyticsInstances, IntegrityAnalyticsInstanceItem, callIntegrityAnalyticsAgent, INTEGRITY_ANALYTICS_AGENT_ID_2 } from '../services/api';
// Agent-driven Integrity Analytics JSON
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import integrityAnalyticsAgent from '../../integrity-analytics-agent.json';

type NetworkNode = {
  id: string;
  name: string;
  type: 'evaluator' | 'vendor';
  biasScore?: number;
  department?: string;
};

type NetworkEdge = {
  source: string;
  target: string;
  strength: number;
  isSuspicious: boolean;
};

type DepartmentNetwork = {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
};

const buildNetworkDataFromAgent = (networkGraph: any): Record<string, DepartmentNetwork> | null => {
  if (!networkGraph) return null;

  const nodeIndex = new Map<string, any>();
  (networkGraph.nodes || []).forEach((n: any) => {
    if (n && n.id) {
      nodeIndex.set(n.id, n);
    }
  });

  const edgeIndex = new Map<string, any>();
  (networkGraph.edges || []).forEach((e: any) => {
    if (e && e.source && e.target) {
      edgeIndex.set(`${e.source}->${e.target}`, e);
    }
  });

  const result: Record<string, DepartmentNetwork> = {};
  const deptData = networkGraph.departmentData || {};

  Object.entries(deptData).forEach(([deptName, value]) => {
    const deptValue = value as any;
    const nodeIds: string[] = deptValue.nodes || [];
    const deptNodes: NetworkNode[] = nodeIds.map((id) => {
      const raw = nodeIndex.get(id);
      if (!raw) {
        return { id, name: id, type: 'vendor' };
      }
      return {
        id: raw.id,
        name: raw.name,
        type: (raw.type || 'vendor') as 'evaluator' | 'vendor',
        biasScore: raw.biasScore,
        department: raw.department,
      };
    });

    const rawEdges: any[] = deptValue.edges || [];
    const deptEdges: NetworkEdge[] = rawEdges.map((e) => {
      const key = `${e.source}->${e.target}`;
      const full = edgeIndex.get(key) || {};
      return {
        source: e.source,
        target: e.target,
        strength: full.strength ?? 0.4,
        isSuspicious: full.isSuspicious ?? false,
      };
    });

    result[deptName] = {
      nodes: deptNodes,
      edges: deptEdges,
    };
  });

  return result;
};

interface IntegrityAnalyticsPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership') => void;
}

interface Tender {
  id: string;
  title: string;
  department: string;
  category: string;
  dateCreated: string;
}

export function IntegrityAnalyticsPage({ onNavigate }: IntegrityAnalyticsPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTender, setSelectedTender] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [integrityAnalyticsInstances, setIntegrityAnalyticsInstances] = useState<IntegrityAnalyticsInstanceItem[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [agentAnalytics, setAgentAnalytics] = useState<any>(null);
  const [agent2Analytics, setAgent2Analytics] = useState<any>(null);

  // Data from agent JSON (fallback, already in dashboard-friendly shape)
  const defaultAnalytics = (integrityAnalyticsAgent as any).integrityAnalytics;
  
  // Merge analytics: use agent 1 for most data, agent 2 for network graph and AI insights
  const analytics = useMemo(() => {
    const baseAnalytics = agentAnalytics || defaultAnalytics;
    const agent2Data = agent2Analytics;
    
    console.log('Merging analytics:', {
      hasAgent1: !!agentAnalytics,
      hasAgent2: !!agent2Data,
      agent2NetworkGraph: agent2Data?.networkGraph,
      agent2AiCausalAnalysis: agent2Data?.aiCausalAnalysis
    });
    
    // If we have agent 2 data, merge network graph and AI insights from it
    if (agent2Data) {
      const merged = {
        ...baseAnalytics,
        networkGraph: agent2Data.networkGraph || baseAnalytics?.networkGraph,
        aiCausalAnalysis: agent2Data.aiCausalAnalysis || baseAnalytics?.aiCausalAnalysis
      };
      console.log('Merged analytics:', {
        hasNetworkGraph: !!merged.networkGraph,
        hasAiCausalAnalysis: !!merged.aiCausalAnalysis,
        networkGraphNodes: merged.networkGraph?.nodes?.length,
        aiCausalAnalysisRootCauses: merged.aiCausalAnalysis?.rootCauses?.length
      });
      return merged;
    }
    
    return baseAnalytics;
  }, [agentAnalytics, agent2Analytics, defaultAnalytics]);

  // Fetch integrity analytics instances from API
  useEffect(() => {
    const loadInstances = async () => {
      setIsLoadingInstances(true);
      try {
        const instances = await fetchIntegrityAnalyticsInstances(1000);
        setIntegrityAnalyticsInstances(instances);
      } catch (error) {
        console.error('Failed to fetch integrity analytics instances:', error);
        // Fallback to empty array on error
        setIntegrityAnalyticsInstances([]);
      } finally {
        setIsLoadingInstances(false);
      }
    };

    loadInstances();
  }, []);

  // Extract unique company names from API instances
  const companyNames = useMemo(() => {
    const companies = new Set<string>();
    integrityAnalyticsInstances.forEach(instance => {
      // Try different possible field names for company name
      const companyName = instance.companyName || instance.company_name || instance.company || '';
      if (companyName && typeof companyName === 'string' && companyName.trim()) {
        companies.add(companyName.trim());
      }
    });
    return Array.from(companies).sort();
  }, [integrityAnalyticsInstances]);

  // Set default company on mount
  useEffect(() => {
    if (!selectedCompany && companyNames.length > 0) {
      setSelectedCompany(companyNames[0]);
    }
  }, [companyNames, selectedCompany]);

  // Extract CDN URLs from selected company instances and common URLs
  const getCdnUrlsForCompany = useMemo(() => {
    const companyUrls: string[] = [];
    const commonUrls: string[] = [];
    
    if (!selectedCompany || selectedCompany === 'all') {
      return [];
    }
    
    // Helper function to extract URLs from an instance
    const extractUrlsFromInstance = (instance: IntegrityAnalyticsInstanceItem): string[] => {
      const urls: string[] = [];
      
      // Try different possible field names for CDN URL
      let cdnUrl = instance.cdnUrl || instance.cdnurl || instance.fileUrl || '';
      
      // Handle array of URLs
      if (instance.cdnUrls) {
        if (Array.isArray(instance.cdnUrls)) {
          urls.push(...instance.cdnUrls.filter((url: any) => url && typeof url === 'string'));
        } else if (typeof instance.cdnUrls === 'string') {
          urls.push(instance.cdnUrls);
        }
      }
      
      // Handle fileUrls array
      if (instance.fileUrls) {
        if (Array.isArray(instance.fileUrls)) {
          urls.push(...instance.fileUrls.filter((url: any) => url && typeof url === 'string'));
        } else if (typeof instance.fileUrls === 'string') {
          urls.push(instance.fileUrls);
        }
      }
      
      // Add single URL if found
      if (cdnUrl && typeof cdnUrl === 'string' && cdnUrl.trim()) {
        urls.push(cdnUrl.trim());
      }
      
      return urls;
    };
    
    // Process all instances
    integrityAnalyticsInstances.forEach(instance => {
      const companyName = instance.companyName || instance.company_name || instance.company || '';
      const companyNameTrimmed = companyName && typeof companyName === 'string' ? companyName.trim() : '';
      
      // Check if this instance belongs to the selected company
      if (companyNameTrimmed === selectedCompany) {
        // Extract company-specific URLs
        const urls = extractUrlsFromInstance(instance);
        companyUrls.push(...urls);
      } else if (!companyNameTrimmed || companyNameTrimmed === '') {
        // This is a common URL (no company name associated)
        const urls = extractUrlsFromInstance(instance);
        commonUrls.push(...urls);
      }
    });
    
    // Combine company URLs and common URLs, remove duplicates
    const allUrls = [...companyUrls, ...commonUrls];
    return Array.from(new Set(allUrls));
  }, [selectedCompany, integrityAnalyticsInstances]);

  // Build query based on company selection
  const buildAgentQuery = (company: string): string => {
    if (company === 'all') {
      return 'TenderId: RAK_01, Company name : all';
    }
    return `TenderId: RAK_01, Company name : ${company}`;
  };

  // Parse agent response and extract integrity analytics data
  const parseAgentResponse = (response: any): any => {
    try {
      console.log('Parsing agent response:', response);
      
      // Step 1: Extract the text field which contains the JSON string
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response?.text) {
        responseText = response.text;
      } else if (response?.data?.text) {
        responseText = response.data.text;
      } else if (response?.data) {
        responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      } else {
        responseText = JSON.stringify(response);
      }

      console.log('Extracted response text:', responseText);

      // Step 2: Parse the JSON string
      let parsedData: any = null;
      try {
        // If responseText is a JSON string, parse it
        if (typeof responseText === 'string') {
          // Try to parse as JSON
          try {
            parsedData = JSON.parse(responseText);
          } catch (parseError) {
            // If direct parse fails, try to extract JSON from the string
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[0]);
            } else {
              throw parseError;
            }
          }
        } else {
          parsedData = responseText;
        }
      } catch (e) {
        console.error('Failed to parse JSON from response text:', e);
        return null;
      }

      console.log('Parsed data:', parsedData);

      // Step 3: Extract the data structure
      // The response might be:
      // 1. Direct: { networkGraph: {...}, aiCausalAnalysis: {...} }
      // 2. Wrapped: { integrityAnalytics: { networkGraph: {...}, aiCausalAnalysis: {...} } }
      
      if (parsedData?.integrityAnalytics) {
        // Case 2: Wrapped in integrityAnalytics
        console.log('Found integrityAnalytics wrapper');
        return parsedData.integrityAnalytics;
      } else if (parsedData?.networkGraph || parsedData?.aiCausalAnalysis) {
        // Case 1: Direct structure with networkGraph or aiCausalAnalysis
        console.log('Found direct networkGraph/aiCausalAnalysis structure');
        return parsedData;
      } else if (parsedData) {
        // Try to return as-is if it has any structure
        console.log('Returning parsed data as-is');
        return parsedData;
      }

      console.warn('Could not find expected data structure in parsed response');
      return null;
    } catch (error) {
      console.error('Error parsing agent response:', error);
      return null;
    }
  };

  // Handle submit button click to call both agents
  const handleSubmit = async () => {
    if (!selectedCompany) {
      return;
    }

    setIsLoadingAgent(true);
    try {
      const query = buildAgentQuery(selectedCompany);
      const cdnUrls = getCdnUrlsForCompany;
      
      console.log('Calling both integrity analytics agents:', {
        query,
        company: selectedCompany,
        totalFileCount: cdnUrls.length,
        fileUrls: cdnUrls
      });

      // Call both agents in parallel
      const [response1, response2] = await Promise.all([
        callIntegrityAnalyticsAgent(query, cdnUrls), // First agent (default)
        callIntegrityAnalyticsAgent(query, cdnUrls, 'gaian@123', INTEGRITY_ANALYTICS_AGENT_ID_2) // Second agent
      ]);
      
      console.log('Agent 1 response:', response1);
      console.log('Agent 2 response:', response2);
      
      // Parse responses and update analytics separately
      const parsedAnalytics1 = parseAgentResponse(response1);
      const parsedAnalytics2 = parseAgentResponse(response2);
      
      // Store agent 1 data (for KPIs, alerts, flagged evaluators, etc.)
      if (parsedAnalytics1) {
        setAgentAnalytics(parsedAnalytics1);
        console.log('Stored analytics from Agent 1');
      } else {
        console.warn('Could not parse Agent 1 response');
      }
      
      // Store agent 2 data (for network graph and AI insights)
      if (parsedAnalytics2) {
        setAgent2Analytics(parsedAnalytics2);
        console.log('Stored analytics from Agent 2 (network graph & AI insights)');
        
        // Log network graph and AI insights from agent 2
        if (parsedAnalytics2.networkGraph) {
          console.log('Agent 2 Network Graph:', parsedAnalytics2.networkGraph);
        }
        if (parsedAnalytics2.aiCausalAnalysis) {
          console.log('Agent 2 AI Causal Analysis:', parsedAnalytics2.aiCausalAnalysis);
        }
      } else {
        console.warn('Could not parse Agent 2 response');
      }
      
      if (!parsedAnalytics1 && !parsedAnalytics2) {
        console.warn('Could not parse either agent response, using default data');
      }
    } catch (error) {
      console.error('Error calling integrity analytics agents:', error);
      alert('Failed to fetch integrity analytics data. Please try again.');
    } finally {
      setIsLoadingAgent(false);
    }
  };

  const tenders: Tender[] = [
    {
      id: analytics?.footer?.tenderId || 'Tender_01',
      title: analytics?.metadata?.pageTitle || 'Integrity Analytics',
      department: analytics?.integrityAlerts?.[0]?.department || 'Public Services Department',
      category: analytics?.integrityAlerts?.[0]?.category || 'SERVICES',
      dateCreated: analytics?.metadata?.lastUpdated || '2025-11-26'
    }
  ];

  const agentNetworkGraph = (analytics as any)?.networkGraph;
  console.log('Building network data from:', {
    hasNetworkGraph: !!agentNetworkGraph,
    nodes: agentNetworkGraph?.nodes?.length,
    edges: agentNetworkGraph?.edges?.length,
    departments: Object.keys(agentNetworkGraph?.departmentData || {}).length,
    networkGraph: agentNetworkGraph
  });
  
  const agentNetworkData = buildNetworkDataFromAgent(agentNetworkGraph);
  console.log('Built network data:', {
    hasData: !!agentNetworkData,
    departments: agentNetworkData ? Object.keys(agentNetworkData).length : 0,
    networkData: agentNetworkData
  });

  const allNetworkData: Record<string, DepartmentNetwork> =
    agentNetworkData || {};

  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && tender.category !== selectedCategory) return false;
      if (dateRange.start && tender.dateCreated < dateRange.start) return false;
      if (dateRange.end && tender.dateCreated > dateRange.end) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory, dateRange]);

  const currentDepartmentData = useMemo(() => {
    const deptKeys = Object.keys(allNetworkData);
    const defaultDeptKey = deptKeys[0];
    if (!defaultDeptKey) {
      return { nodes: [], edges: [] } as DepartmentNetwork;
    }
    if (selectedDepartment === 'all') {
      return allNetworkData[defaultDeptKey];
    }
    return allNetworkData[selectedDepartment] || allNetworkData[defaultDeptKey];
  }, [selectedDepartment, allNetworkData]);

  const networkNodes = currentDepartmentData.nodes;
  const networkEdges = currentDepartmentData.edges;

  // Flagged evaluators from agent JSON (fallback to empty array)
  const allFlaggedEvaluators =
    (analytics?.flaggedEvaluators as any[]) || [];

  const flaggedEvaluators = useMemo(() => {
    return allFlaggedEvaluators.filter(evaluator => {
      if (selectedDepartment !== 'all' && evaluator.department !== selectedDepartment) return false;
      return true;
    });
  }, [selectedDepartment]);


  // Map agent integrityAlerts to the structure used by the UI
  const allAlerts = useMemo(
    () =>
      (analytics?.integrityAlerts as any[])?.map((alert) => ({
        id: alert.id,
        type: alert.type as 'collusion' | 'bias' | 'anomaly',
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        title: alert.title,
        description: alert.description,
        confidenceScore: alert.confidenceScore ?? 0,
        entitiesInvolved: (alert.entitiesInvolved || []).map(
          (e: any) => e.entityName || e
        ),
        status: 'open' as const,
        detectedAt: alert.detectedAt,
        department: alert.department,
        category: alert.category,
        tenderId: analytics?.footer?.tenderId || 'Tender_01',
      })) || [],
    [analytics]
  );

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      if (selectedDepartment !== 'all' && alert.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && alert.category !== selectedCategory) return false;
      if (selectedTender !== 'all' && alert.tenderId !== selectedTender) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory, selectedTender, allAlerts]);

  const [alerts, setAlerts] = useState(filteredAlerts);

  useMemo(() => {
    setAlerts(filteredAlerts);
  }, [filteredAlerts]);

  const handleNodeClick = (nodeId: string) => {
    const node = networkNodes.find(n => n.id === nodeId);
    if (node) {
      alert(`Clicked: ${node.name} (${node.type})`);
    }
  };

  const handleMarkCleared = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'cleared' as const } : alert
      )
    );
  };

  const handleEscalate = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: 'escalated' as const } : alert
      )
    );
  };

  const handleEscalateAll = () => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.status === 'open' ? { ...alert, status: 'escalated' as const } : alert
      )
    );
  };

  const handleClearAll = () => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.status === 'open' ? { ...alert, status: 'cleared' as const } : alert
      )
    );
  };

  const openAlerts = alerts.filter(a => a.status === 'open');
  const totalAlerts = alerts.length;
  const resolvedAlerts = alerts.filter(a => a.status !== 'open').length;
  const resolutionRate = totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0;

  const evaluatorBiasScores = networkNodes
    .filter(n => n.type === 'evaluator' && n.biasScore !== undefined)
    .map(n => n.biasScore || 0);
  const avgBiasScore =
    evaluatorBiasScores.reduce((sum, score) => sum + score, 0) /
    (evaluatorBiasScores.length || 1);

  // KPI values from agent JSON with safe fallbacks
  const avgBiasFromJson = analytics?.kpiWidgets?.avgBiasScore?.value;
  const kpiAvgBiasValue = avgBiasFromJson ?? avgBiasScore;
  const kpiAvgBiasSubtitle =
    analytics?.kpiWidgets?.avgBiasScore?.subtitle || 'Per evaluator';

  const maxCollusionProbabilityFromJson =
    analytics?.kpiWidgets?.highestDetected ?? 0.0;
  const maxCollusionProbability =
    maxCollusionProbabilityFromJson || 0.0;

  const collusionValueFromJson =
    analytics?.kpiWidgets?.collusionProbability?.value;
  const kpiCollusionValue =
    collusionValueFromJson ?? maxCollusionProbability * 100;
  const kpiCollusionSubtitle =
    analytics?.kpiWidgets?.collusionProbability?.subtitle ||
    'Highest detected';

  const resolutionValueFromJson =
    analytics?.kpiWidgets?.resolutionRate?.value;
  const kpiResolutionValue = resolutionValueFromJson ?? resolutionRate;
  const kpiResolutionSubtitle =
    analytics?.kpiWidgets?.resolutionRate?.subtitle ||
    `${resolvedAlerts}/${totalAlerts} alerts closed`;

  return (
    <>
      <Sidebar currentPage="integrity" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {analytics?.metadata?.pageTitle || 'Integrity Analytics'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {analytics?.metadata?.subtitle || 'IntegrityBot.Agent Active'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
                  {analytics?.metadata?.statusBadge || 'Integrity Review'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters Container - Commented Out */}
          {/* <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_20px_45px_rgba(59,130,246,0.12)] overflow-hidden p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Filters</h2>
                <p className="text-xs text-blue-600 mt-0.5">Personalize the Integrity View</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
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
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300"
                >
                  <option value="all">All Categories</option>
                  <option value="WORKS">Works & Construction</option>
                  <option value="SERVICES">Services</option>
                  <option value="SUPPLIES">Supplies</option>
                  <option value="CONSULTANCY">Consultancy</option>
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
                  <option value="all">All Tenders</option>
                  {filteredTenders.map((tender) => (
                    <option key={tender.id} value={tender.id}>
                      {tender.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <CalendarPicker
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onDateChange={(start, end) => setDateRange({ start, end })}
                  label="Date Range"
                />
              </div>
            </div>

            {(selectedDepartment !== 'all' || selectedCategory !== 'all' || selectedTender !== 'all') && (
              <div className="mt-5 pt-5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-blue-700">
                  Showing {filteredAlerts.length} alerts for:
                </span>
                {selectedDepartment !== 'all' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-300 shadow-sm">
                    {selectedDepartment}
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-300 shadow-sm">
                    {selectedCategory}
                  </span>
                )}
                {selectedTender !== 'all' && (
                  <span className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full border border-purple-300 shadow-sm">
                    {selectedTender}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedCategory('all');
                    setSelectedTender('all');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div> */}

          {/* Company Selection and Submit Section */}
          <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_20px_45px_rgba(59,130,246,0.12)] overflow-hidden p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Generate Analytics</h2>
                <p className="text-xs text-blue-600 mt-0.5">Select company and generate integrity analytics</p>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-md">
                <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">
                  Company Name
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  disabled={isLoadingInstances}
                  className="w-full px-4 py-2.5 text-sm border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={!selectedCompany || isLoadingInstances || isLoadingAgent}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                  {isLoadingAgent ? 'Loading Analytics...' : 'Submit'}
                </button>
              </div>
              {selectedCompany && (
                <div className="flex-1 text-xs text-blue-600">
                  <p className="mt-2">
                    {isLoadingAgent 
                      ? 'Fetching integrity analytics data from agent...' 
                      : `Ready to generate analytics for: ${selectedCompany}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <KPIWidget
              title="Avg Bias Score"
              value={kpiAvgBiasValue.toFixed(2)}
              subtitle={kpiAvgBiasSubtitle}
              icon={TrendingUp}
              trend={{ value: '8%', isPositive: false }}
            />

            <KPIWidget
              title="Collusion Probability"
              value={`${kpiCollusionValue.toFixed(0)}%`}
              subtitle={kpiCollusionSubtitle}
              icon={ShieldAlert}
            />

            <KPIWidget
              title="Resolution Rate"
              value={`${kpiResolutionValue.toFixed(0)}%`}
              subtitle={kpiResolutionSubtitle}
              icon={CheckCircle}
              trend={{ value: '15%', isPositive: true }}
            />
          </div>

          <div className="mb-8">
            <EnhancedNetworkGraph
              nodes={networkNodes}
              edges={networkEdges}
              onNodeClick={handleNodeClick}
              aiCausalAnalysis={analytics?.aiCausalAnalysis}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 items-stretch">
            <div className="flex">
              <IntegrityAlertList
                alerts={alerts}
                onMarkCleared={handleMarkCleared}
                onEscalate={handleEscalate}
              />
            </div>
            <div className="flex">
              <FlaggedEvaluatorsList evaluators={flaggedEvaluators} />
            </div>
          </div>
        </main>

        <IntegrityFooter
          tenderId={analytics?.footer?.tenderId || (selectedTender !== 'all' ? selectedTender : 'ALL-TENDERS')}
          phase={analytics?.footer?.phase || 'Integrity Review'}
          openAlertCount={analytics?.footer?.openAlertCount ?? openAlerts.length}
          onEscalateAll={handleEscalateAll}
          onClearAll={handleClearAll}
        />
      </div>
    </>
  );
}
