import { useState, useMemo, useEffect } from 'react';
import { TabNavigation } from '../components/TabNavigation';
import { EvaluationMatrix } from '../components/EvaluationMatrix';
import { VarianceRadarChart } from '../components/VarianceRadarChart';
import { KPIWidget } from '../components/KPIWidget';
import { KPIDetailModal } from '../components/KPIDetailModal';
import { EvaluationFooter } from '../components/EvaluationFooter';
import { Sidebar } from '../components/Sidebar';
import { CalendarPicker } from '../components/CalendarPicker';
import { Target, TrendingDown, Clock, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';
import agentResponseData from '../data/agentResponseData.json';

type Category = 'technical' | 'financial' | 'esg' | 'innovation';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  category: Category;
}

interface Vendor {
  id: string;
  name: string;
}

interface Score {
  criterionId: string;
  vendorId: string;
  score: number;
  aiConfidence: number;
  isAiGenerated: boolean;
}

interface Tender {
  id: string;
  title: string;
  department: string;
  category: string;
  dateCreated: string;
  status: 'evaluation' | 'locked' | 'completed';
}

interface EvaluationMatrixPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'evaluation-breakdown' | 'tender-article' | 'tender-overview') => void;
}

export function EvaluationMatrixPage({ onNavigate }: EvaluationMatrixPageProps) {
  const [activeTab, setActiveTab] = useState<Category>('technical');
  const [isChair] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTender, setSelectedTender] = useState('TND-2025-001');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [openKPIModal, setOpenKPIModal] = useState<'weight' | 'variance' | 'time' | null>(null);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [companiesFromAgent, setCompaniesFromAgent] = useState<Vendor[]>([]);
  const [categoriesFromAgent, setCategoriesFromAgent] = useState<Array<{id: string, name: string}>>([]);

  // Function to extract data from static JSON file
  const useStaticData = () => {
    if (Array.isArray(agentResponseData) && agentResponseData.length > 0) {
      // Extract unique company names from new structure
      const companyNames = [...new Set(agentResponseData.map((item: any) => item['Company Name']).filter(Boolean))];
      const extractedVendors = companyNames.map((name: string, index: number) => ({
        id: `v${index + 1}`,
        name: name
      }));
      setCompaniesFromAgent(extractedVendors);
      
      // Extract subcategory names from Subcategory Weightages as criteria
      if (agentResponseData[0]?.['Subcategory Weightages']) {
        const weightages = agentResponseData[0]['Subcategory Weightages'] as Record<string, any>;
        const subcategoryNames = Object.keys(weightages).filter(
          key => weightages[key] !== null
        );
        const extractedCategories = subcategoryNames.map((catName: string, index: number) => ({
          id: `cat${index + 1}`,
          name: catName
        }));
        setCategoriesFromAgent(extractedCategories);
      }
    }
  };

  // Load static data on component mount
  useEffect(() => {
    useStaticData();
  }, []);

  const tenders: Tender[] = [
    { id: 'TND-2025-001', title: 'Municipal Building Renovation', department: 'Roads & Construction', category: 'WORKS', dateCreated: '2025-01-15', status: 'evaluation' },
    { id: 'TND-2025-002', title: 'Solar Panel Installation', department: 'Water Management', category: 'WORKS', dateCreated: '2025-02-01', status: 'evaluation' },
    { id: 'TND-2025-003', title: 'IT Equipment Procurement', department: 'Administration', category: 'SUPPLIES', dateCreated: '2025-02-10', status: 'evaluation' },
    { id: 'TND-2025-004', title: 'Healthcare Cleaning Services', department: 'Maintenance', category: 'SERVICES', dateCreated: '2025-02-15', status: 'completed' },
    { id: 'TND-2025-005', title: 'Legal Advisory Services', department: 'Legal', category: 'CONSULTANCY', dateCreated: '2025-03-01', status: 'evaluation' },
    { id: 'TND-2025-006', title: 'Waste Collection Services', department: 'Waste Management', category: 'SERVICES', dateCreated: '2025-03-05', status: 'locked' },
    { id: 'TND-2025-007', title: 'Parking System Upgrade', department: 'Parking Management', category: 'WORKS', dateCreated: '2025-03-10', status: 'evaluation' },
  ];

  // Call agent API when component mounts
  useEffect(() => {
    const callAgentAPI = async () => {
      try {
        setAgentLoading(true);
        setAgentError(null);

        const response = await fetch(
          'https://ig.gov-cloud.ai/agent-orchestration-framework-fastapi/agent/interact',
          {
            method: 'POST',
            headers: {
              'sec-ch-ua-platform': '"Windows"',
              'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKZTNYVjhSWHI0SzFWZmRWTjJ2ejFVMTZPWGRZaUFENWdEaDREc1RuNlRnIn0.eyJleHAiOjE3MjI0NTk5MDMsImlhdCI6MTcyMjQyMzkwMywianRpIjoiODJiZGE3ZDktNDJhYi00NGIxLTliNmMtMTkxMzk4ZmRmNzRlIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsidGVzdEN1c3RvbTEiLCJ0ZXN0Q3VzdG9tMiIsImFjY291bnQiXSwic3ViIjoiODliZWRhNzQtODU5Mi00NWZlLThmZGQtMWZkOWEzNWRjYTgzIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiSE9MQUNSQUNZIiwic2Vzc2lvbl9zdGF0ZSI6IjBkNzdmN2IzLTgxZDMtNDQzMi05NmZmLWE3YTg4NWRmZWExNCIsIm5hbWUiOiJkamRrIHRlc3QxIiwiZ2l2ZW5fbmFtZSI6ImRqZGsiLCJmYW1pbHlfbmFtZSI6InRlc3QxIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X2NmY2ZAZ2F0ZXN0YXV0b21hdGlvbi5jb20iLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF9jZmNmQGdhdGVzdGF1dG9tYXRpb24uY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtbWFzdGVyIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InRlc3RDdXN0b20xIjp7InJvbGVzIjpbInRlc3QyIiwidGVzdDMiLCJ0ZXN0MSJdfSwidGVzdEN1c3RvbTIiOnsicm9sZXMiOlsidGVzdDIiLCJ0ZXN0MyIsInRlc3QxIl19LCJIT0xBQ1JBQ1kiOnsicm9sZXMiOlsiSE9MQUNSQUNZX1VTRVIiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjBkNzdmN2IzLTgxZDMtNDQzMi05NmZmLWE3YTg4NWRmZWExNCIsInRlbmFudElkIjoiODliZWRhNzQtODU5Mi00NWZlLThmZGQtMWZkOWEzNWRjYTgzIiwicmVxdWVzdGVyVHlwZSI6IlRFTkFOVCJ9.g3gS5jWPo1iqn1Ytkk3ETiuN1D5RgqByBOd8u55EzxhmvuhoVIrJdUWZOBOaplB-5hzAk4dPQNRkDkgYFVaLCMRUihK9Y-tGgdBbPVZwaXkidaEHaoM81djNfVhY3J5KlOBNn2lH4Deh3lHVYvF7aO-KmL0ECBuaaltO9gqDc5xSzwy7U58sT-ONxL_yP-AUkB5CN2g6HMhxt2-cPFodbjSnNyeO00Ri7GastHfr8ZK-3zW25oDwshk87osAvWsfI6qcR3RwFRdXX_cwBEU0x9CRVVOsngGr4VbM3uFXpROM12tYHqrPIptEgKB4VVlGd-GUF-vSC7Sw5v1lEcOwdg',
              'Referer': 'http://localhost:5173/',
              'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
              'sec-ch-ua-mobile': '?0',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agentId: '019ab540-50cc-7e45-a383-487c653e49eb',
              query: 'tender_01',
              referenceId: '',
              sessionId: '',
              fileUrl: [
                'https://cdn.gov-cloud.ai//_ENC(nIw4FQRwLOQd0b8T2HcImBUJ5a9zjZEImv/UhJi8/+yUl7Ez+m0qAiCCaOJbNgi5)/CMS/94b90898-cb67-411c-896d-bb61fd06752e_$$_V1_PSD%20-%20SAP%20Implementation%20Program%20-%20Technical%20Evaluation%20Form%201.0_17-03-2020.pdf'
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAgentResponse(data);
        console.log('Agent API Response:', data);
        
        // Parse company names and categories from agent response
        try {
          // Extract JSON from text field (might be wrapped in markdown code blocks)
          let jsonText = data.text || '';
          
          // Remove markdown code block markers if present
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          // Parse the JSON array
          const parsedData = JSON.parse(jsonText);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Extract unique company names
            const companyNames = [...new Set(parsedData.map((item: any) => item.companyName).filter(Boolean))];
            const extractedVendors = companyNames.map((name: string, index: number) => ({
              id: `v${index + 1}`,
              name: name
            }));
            setCompaniesFromAgent(extractedVendors);
            
            // Extract unique category names from the first company (assuming all companies have same categories)
            if (parsedData[0]?.evaluationCategories) {
              const categories = parsedData[0].evaluationCategories.map((cat: any) => cat.category);
              const extractedCategories = categories.map((catName: string, index: number) => ({
                id: `cat${index + 1}`,
                name: catName
              }));
              setCategoriesFromAgent(extractedCategories);
            }
          }
        } catch (parseError) {
          console.error('Error parsing agent response:', parseError);
          // If API parsing fails, use the static JSON file
          useStaticData();
        }
      } catch (error) {
        console.error('Error calling agent API:', error);
        setAgentError(error instanceof Error ? error.message : 'Failed to call agent API');
      } finally {
        setAgentLoading(false);
      }
    };

    callAgentAPI();
  }, []);

  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (dateRange.start && tender.dateCreated < dateRange.start) return false;
      if (dateRange.end && tender.dateCreated > dateRange.end) return false;
      return true;
    });
  }, [selectedDepartment, dateRange]);

  const currentTender = tenders.find(t => t.id === selectedTender) || tenders[0];
  const [isLocked, setIsLocked] = useState(currentTender.status === 'locked' || currentTender.status === 'completed');

  const tabs = [
    { id: 'technical', label: 'Technical' },
    { id: 'financial', label: 'Financial' },
    { id: 'esg', label: 'ESG' },
    { id: 'innovation', label: 'Innovation' },
  ];

  const allTenderData = {
    'TND-2025-001': {
      criteria: [
        { id: '1', name: 'Technical Expertise', weight: 30, category: 'technical' as Category },
        { id: '2', name: 'Implementation Methodology', weight: 25, category: 'technical' as Category },
        { id: '3', name: 'Resource Availability', weight: 20, category: 'technical' as Category },
        { id: '4', name: 'Quality Assurance', weight: 15, category: 'technical' as Category },
        { id: '5', name: 'Technology Stack', weight: 10, category: 'technical' as Category },
        { id: '6', name: 'Pricing Structure', weight: 40, category: 'financial' as Category },
        { id: '7', name: 'Payment Terms', weight: 25, category: 'financial' as Category },
        { id: '8', name: 'Cost Breakdown', weight: 20, category: 'financial' as Category },
        { id: '9', name: 'Financial Stability', weight: 15, category: 'financial' as Category },
        { id: '10', name: 'Carbon Footprint', weight: 35, category: 'esg' as Category },
        { id: '11', name: 'Labor Practices', weight: 30, category: 'esg' as Category },
        { id: '12', name: 'Community Impact', weight: 20, category: 'esg' as Category },
        { id: '13', name: 'Sustainability Certifications', weight: 15, category: 'esg' as Category },
        { id: '14', name: 'Novel Approach', weight: 40, category: 'innovation' as Category },
        { id: '15', name: 'R&D Investment', weight: 30, category: 'innovation' as Category },
        { id: '16', name: 'Technology Innovation', weight: 30, category: 'innovation' as Category },
      ],
      vendors: [
        { id: 'v1', name: 'Acme Corp' },
        { id: 'v2', name: 'BuildTech Ltd' },
        { id: 'v3', name: 'Global Supplies' },
        { id: 'v4', name: 'TechCon Industries' },
      ]
    },
    'TND-2025-002': {
      criteria: [
        { id: '1', name: 'Solar Technology Expertise', weight: 35, category: 'technical' as Category },
        { id: '2', name: 'Installation Track Record', weight: 30, category: 'technical' as Category },
        { id: '3', name: 'Warranty Coverage', weight: 20, category: 'technical' as Category },
        { id: '4', name: 'Maintenance Support', weight: 15, category: 'technical' as Category },
        { id: '6', name: 'Total Cost per kW', weight: 45, category: 'financial' as Category },
        { id: '7', name: 'Payment Schedule', weight: 30, category: 'financial' as Category },
        { id: '9', name: 'Financial Stability', weight: 25, category: 'financial' as Category },
        { id: '10', name: 'Renewable Energy Impact', weight: 40, category: 'esg' as Category },
        { id: '11', name: 'Local Employment', weight: 35, category: 'esg' as Category },
        { id: '13', name: 'Environmental Certifications', weight: 25, category: 'esg' as Category },
        { id: '14', name: 'Smart Grid Integration', weight: 50, category: 'innovation' as Category },
        { id: '16', name: 'Monitoring Technology', weight: 50, category: 'innovation' as Category },
      ],
      vendors: [
        { id: 'v5', name: 'SolarTech UAE' },
        { id: 'v6', name: 'GreenEnergy Solutions' },
        { id: 'v7', name: 'Sunpower International' },
      ]
    },
    'TND-2025-003': {
      criteria: [
        { id: '1', name: 'Hardware Quality', weight: 35, category: 'technical' as Category },
        { id: '2', name: 'Support & Warranty', weight: 25, category: 'technical' as Category },
        { id: '3', name: 'Delivery Timeframe', weight: 25, category: 'technical' as Category },
        { id: '5', name: 'Compatibility', weight: 15, category: 'technical' as Category },
        { id: '6', name: 'Unit Pricing', weight: 50, category: 'financial' as Category },
        { id: '7', name: 'Bulk Discounts', weight: 30, category: 'financial' as Category },
        { id: '9', name: 'Vendor Reliability', weight: 20, category: 'financial' as Category },
        { id: '10', name: 'Energy Efficiency', weight: 40, category: 'esg' as Category },
        { id: '12', name: 'E-Waste Management', weight: 35, category: 'esg' as Category },
        { id: '13', name: 'Recycling Programs', weight: 25, category: 'esg' as Category },
        { id: '16', name: 'Latest Technology', weight: 100, category: 'innovation' as Category },
      ],
      vendors: [
        { id: 'v8', name: 'TechSupply Co' },
        { id: 'v9', name: 'Office Solutions Ltd' },
        { id: 'v10', name: 'IT Hardware Group' },
      ]
    },
  };

  const currentTenderData = allTenderData[selectedTender as keyof typeof allTenderData] || allTenderData['TND-2025-001'];
  
  // Use company names from agent response if available, otherwise use default
  const vendors = companiesFromAgent.length > 0 ? companiesFromAgent : currentTenderData.vendors;
  
  // Use category names from agent response if available, otherwise use default criteria
  const allCriteria = useMemo(() => {
    if (categoriesFromAgent.length > 0 && agentResponseData.length > 0) {
      // Get weights from first company's Subcategory Weightages
      const firstCompany = agentResponseData[0];
      const subcategoryWeightages = (firstCompany['Subcategory Weightages'] || {}) as Record<string, any>;
      
      // Map agent categories to criteria with weights from data
      return categoriesFromAgent.map((cat) => {
        // Get weight from Subcategory Weightages (convert to percentage)
        const weight = subcategoryWeightages[cat.name] ? (subcategoryWeightages[cat.name] * 100) : 10;
        
        // Map category to appropriate tab category
        let category: Category = 'technical';
        const nameLower = cat.name.toLowerCase();
        if (nameLower.includes('financial') || nameLower.includes('pricing') || nameLower.includes('cost') || nameLower.includes('payment')) {
          category = 'financial';
        } else if (nameLower.includes('esg') || nameLower.includes('environmental') || nameLower.includes('sustainability') || nameLower.includes('reference')) {
          category = 'esg';
        } else if (nameLower.includes('innovation') || nameLower.includes('custom') || nameLower.includes('ricef')) {
          category = 'innovation';
        } else {
          // Default to technical for module, implementation, partner experience, etc.
          category = 'technical';
        }
        
        return {
          id: cat.id,
          name: cat.name,
          weight: weight,
          category: category
        };
      });
    }
    return currentTenderData.criteria;
  }, [categoriesFromAgent, currentTenderData.criteria]);

  const [scores, setScores] = useState<Score[]>(() => {
    return allCriteria.flatMap((criterion) =>
      vendors.map((vendor) => ({
        criterionId: criterion.id,
        vendorId: vendor.id,
        score: Math.random() * 60 + 30,
        aiConfidence: Math.random() * 0.3 + 0.7,
        isAiGenerated: Math.random() > 0.3,
      }))
    );
  });

  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>(
    allCriteria.reduce((acc, c) => ({ ...acc, [c.id]: c.weight }), {})
  );

  useEffect(() => {
    setScores(
      allCriteria.flatMap((criterion) =>
        vendors.map((vendor) => ({
          criterionId: criterion.id,
          vendorId: vendor.id,
          score: Math.random() * 60 + 30,
          aiConfidence: Math.random() * 0.3 + 0.7,
          isAiGenerated: Math.random() > 0.3,
        }))
      )
    );
    setCriteriaWeights(
      allCriteria.reduce((acc, c) => ({ ...acc, [c.id]: c.weight }), {})
    );
    setIsLocked(currentTender.status === 'locked' || currentTender.status === 'completed');
  }, [selectedTender]);

  const activeCriteria = allCriteria
    .filter((c) => c.category === activeTab)
    .map((c) => ({ ...c, weight: criteriaWeights[c.id] || c.weight }));

  const handleWeightChange = (criterionId: string, weight: number) => {
    setCriteriaWeights((prev) => ({ ...prev, [criterionId]: weight }));
  };

  const handleScoreChange = (
    criterionId: string,
    vendorId: string,
    score: number
  ) => {
    setScores((prev) =>
      prev.map((s) =>
        s.criterionId === criterionId && s.vendorId === vendorId
          ? { ...s, score, isAiGenerated: false, aiConfidence: 1 }
          : s
      )
    );
  };

  const handleLockMatrix = () => {
    setIsLocked(true);
  };

  const handleSendToBenchmarking = () => {
    onNavigate('benchmark');
  };

  const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0);
  const weightAlignment = Math.abs(100 - totalWeight) <= 5 ? 98 : 75;

  const varianceData = [
    { label: 'Tech', value: 85 },
    { label: 'Financial', value: 72 },
    { label: 'ESG', value: 68 },
    { label: 'Innovation', value: 91 },
  ];

  return (
    <>
      <Sidebar currentPage="evaluation" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Evaluation Matrix
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                EvalAI.Agent Active
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                Evaluation Phase
              </span>
            </div>
          </div>

          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as Category)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_20px_45px_rgba(59,130,246,0.12)] overflow-hidden p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">Filters</h2>
              <p className="text-xs text-blue-600 mt-0.5">Personalize the Executive View</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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

            <div>
              <CalendarPicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onDateChange={(start, end) => setDateRange({ start, end })}
                label="Date Range"
              />
            </div>
          </div>

          {(selectedDepartment !== 'all' || dateRange.start) && (
            <div className="mt-5 pt-5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-blue-700">
                Showing tender: {currentTender.title}
              </span>
              {selectedDepartment !== 'all' && (
                <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full border border-blue-300 shadow-sm">
                  {selectedDepartment}
                </span>
              )}
              <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-300 shadow-sm">
                {currentTender.category}
              </span>
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border shadow-sm ${
                currentTender.status === 'evaluation' ? 'text-blue-700 bg-blue-100 border-blue-300' :
                currentTender.status === 'locked' ? 'text-orange-700 bg-orange-100 border-orange-300' :
                'text-gray-700 bg-gray-100 border-gray-300'
              }`}>
                {currentTender.status}
              </span>
              <button
                onClick={() => {
                  setSelectedDepartment('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="min-w-0">
            <KPIWidget
              title="Weight Alignment"
              value={`${weightAlignment}%`}
              subtitle={`Target: 100% (Current: ${totalWeight.toFixed(0)}%)`}
              icon={Target}
              trend={{ value: '5%', isPositive: true }}
              onClick={() => setOpenKPIModal('weight')}
            />
          </div>

          <div className="min-w-0">
            <KPIWidget
              title="Evaluator Variance"
              value="0.18"
              subtitle="Lower is better"
              icon={TrendingDown}
              trend={{ value: '12%', isPositive: true }}
              onClick={() => setOpenKPIModal('variance')}
            />
          </div>

          <div className="min-w-0">
            <KPIWidget
              title="Processing Time Saved"
              value="127 min"
              subtitle="AI-assisted evaluation"
              icon={Clock}
              trend={{ value: '23%', isPositive: true }}
              onClick={() => setOpenKPIModal('time')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0 overflow-hidden">
            <EvaluationMatrix
              criteria={activeCriteria}
              vendors={vendors}
              scores={scores.filter((s) =>
                activeCriteria.some((c) => c.id === s.criterionId)
              )}
              isLocked={isLocked}
              onWeightChange={handleWeightChange}
              onScoreChange={handleScoreChange}
              onCriterionClick={() => onNavigate('evaluation-breakdown')}
            />
          </div>

          <div className="min-w-0 overflow-hidden">
            <VarianceRadarChart data={varianceData} />
          </div>
        </div>
      </main>

      <EvaluationFooter
        tenderId={selectedTender}
        phase="Evaluation"
        isLocked={isLocked}
        isChair={isChair}
        onLockMatrix={handleLockMatrix}
        onSendToBenchmarking={handleSendToBenchmarking}
      />

      <KPIDetailModal
        isOpen={openKPIModal === 'weight'}
        onClose={() => setOpenKPIModal(null)}
        title="Weight Alignment"
        icon={Target}
        mainValue={`${weightAlignment}%`}
        details={[
          {
            label: 'Current Total Weight',
            value: `${totalWeight.toFixed(1)}%`,
            description: 'Sum of all criterion weights in the current category'
          },
          {
            label: 'Target Weight',
            value: '100%',
            description: 'Required total to ensure balanced evaluation'
          },
          {
            label: 'Deviation',
            value: `${Math.abs(100 - totalWeight).toFixed(1)}%`,
            description: 'Difference from target - should be close to 0%'
          },
          {
            label: 'Status',
            value: Math.abs(100 - totalWeight) <= 5 ? 'Aligned' : 'Needs Adjustment',
            description: Math.abs(100 - totalWeight) <= 5
              ? 'Weights are properly balanced within acceptable range (±5%)'
              : 'Please adjust criterion weights to reach 100% total'
          },
          {
            label: 'Active Category',
            value: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
            description: 'Current evaluation category being reviewed'
          },
          {
            label: 'Criteria Count',
            value: activeCriteria.length,
            description: 'Number of criteria in this category'
          }
        ]}
      />

      <KPIDetailModal
        isOpen={openKPIModal === 'variance'}
        onClose={() => setOpenKPIModal(null)}
        title="Evaluator Variance"
        icon={TrendingDown}
        mainValue="0.18"
        details={[
          {
            label: 'Variance Score',
            value: '0.18',
            description: 'Standard deviation of scores across all evaluators'
          },
          {
            label: 'Interpretation',
            value: 'Low Variance',
            description: 'Evaluators are showing good agreement in their scoring'
          },
          {
            label: 'Acceptable Range',
            value: '0.00 - 0.30',
            description: 'Variance below 0.30 indicates consistent evaluation'
          },
          {
            label: 'Agreement Level',
            value: '82%',
            description: 'Percentage of criteria where evaluators agree within 10 points'
          },
          {
            label: 'Outlier Scores',
            value: '3',
            description: 'Number of scores that deviate significantly from the mean'
          },
          {
            label: 'Trend vs Last Week',
            value: '↓ 12%',
            description: 'Variance decreased, indicating improving evaluator alignment'
          }
        ]}
      />

      <KPIDetailModal
        isOpen={openKPIModal === 'time'}
        onClose={() => setOpenKPIModal(null)}
        title="Processing Time Saved"
        icon={Clock}
        mainValue="127 min"
        details={[
          {
            label: 'Time Saved',
            value: '127 minutes',
            description: 'Total time saved through AI-assisted evaluation'
          },
          {
            label: 'Manual Evaluation Time',
            value: '185 minutes',
            description: 'Estimated time for fully manual evaluation'
          },
          {
            label: 'AI-Assisted Time',
            value: '58 minutes',
            description: 'Actual time spent with AI suggestions'
          },
          {
            label: 'Efficiency Gain',
            value: '69%',
            description: 'Percentage reduction in evaluation time'
          },
          {
            label: 'AI-Generated Scores',
            value: `${scores.filter(s => s.isAiGenerated).length}`,
            description: 'Number of scores auto-generated by AI'
          },
          {
            label: 'Manual Overrides',
            value: `${scores.filter(s => !s.isAiGenerated).length}`,
            description: 'Scores manually adjusted by evaluators'
          },
          {
            label: 'Trend vs Last Week',
            value: '↑ 23%',
            description: 'Time savings increased as AI learns from patterns'
          }
        ]}
      />
      </div>
    </>
  );
}
