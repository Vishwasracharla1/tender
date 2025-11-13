import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { SimulationControlPanel } from '../components/SimulationControlPanel';
import { ScenarioOutcomesTable } from '../components/ScenarioOutcomesTable';
import { ScenarioComparisonChart } from '../components/ScenarioComparisonChart';
import { AwardSimulationFooter } from '../components/AwardSimulationFooter';
import { AwardSimulationKPIModal } from '../components/AwardSimulationKPIModal';
import { Award, Percent, CheckCircle, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';
import { getTenderById, MOCK_TENDERS } from '../data/mockTenderData';

interface AwardSimulationPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership') => void;
}

export function AwardSimulationPage({ onNavigate }: AwardSimulationPageProps) {
  const [tenderId, setTenderId] = useState('TND-2025-001');
  const [hasPermission] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('Best Value Scenario');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [kpiModal, setKpiModal] = useState<{
    isOpen: boolean;
    type: 'value' | 'reliability' | 'savings';
  }>({
    isOpen: false,
    type: 'value',
  });

  const filteredTenders = useMemo(() => {
    return MOCK_TENDERS.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && tender.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory]);

  const currentTender = useMemo(() => getTenderById(tenderId), [tenderId]);

  const [weights, setWeights] = useState({
    technical: 35,
    financial: 25,
    esg: 20,
    innovation: 20,
  });

  const [excludedVendors, setExcludedVendors] = useState<string[]>([]);

  const vendors = [
    { id: 'v1', name: 'Acme Corp' },
    { id: 'v2', name: 'BuildTech Ltd' },
    { id: 'v3', name: 'Global Supplies' },
    { id: 'v4', name: 'TechCon Solutions' },
  ];

  const handleWeightChange = (category: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [category]: value }));
  };

  const handleToggleVendorExclusion = (vendorId: string) => {
    setExcludedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const bestValueResults = [
    {
      vendorId: 'v1',
      vendorName: 'Acme Corp',
      rank: 1,
      weightedScore: 88.5,
      totalCost: 2850000,
      valueScore: 92,
      riskAssessment: 18,
      recommendationStrength: 95,
    },
    {
      vendorId: 'v2',
      vendorName: 'BuildTech Ltd',
      rank: 2,
      weightedScore: 85.2,
      totalCost: 2650000,
      valueScore: 88,
      riskAssessment: 45,
      recommendationStrength: 78,
    },
    {
      vendorId: 'v3',
      vendorName: 'Global Supplies',
      rank: 3,
      weightedScore: 82.8,
      totalCost: 3100000,
      valueScore: 85,
      riskAssessment: 25,
      recommendationStrength: 72,
    },
    {
      vendorId: 'v4',
      vendorName: 'TechCon Solutions',
      rank: 4,
      weightedScore: 79.4,
      totalCost: 2900000,
      valueScore: 80,
      riskAssessment: 32,
      recommendationStrength: 65,
    },
  ];

  const lowestCostResults = [
    {
      vendorId: 'v2',
      vendorName: 'BuildTech Ltd',
      rank: 1,
      weightedScore: 85.2,
      totalCost: 2650000,
      valueScore: 88,
      riskAssessment: 45,
      recommendationStrength: 82,
    },
    {
      vendorId: 'v1',
      vendorName: 'Acme Corp',
      rank: 2,
      weightedScore: 88.5,
      totalCost: 2850000,
      valueScore: 92,
      riskAssessment: 18,
      recommendationStrength: 85,
    },
    {
      vendorId: 'v4',
      vendorName: 'TechCon Solutions',
      rank: 3,
      weightedScore: 79.4,
      totalCost: 2900000,
      valueScore: 80,
      riskAssessment: 32,
      recommendationStrength: 68,
    },
    {
      vendorId: 'v3',
      vendorName: 'Global Supplies',
      rank: 4,
      weightedScore: 82.8,
      totalCost: 3100000,
      valueScore: 85,
      riskAssessment: 25,
      recommendationStrength: 70,
    },
  ];

  const riskAdjustedResults = [
    {
      vendorId: 'v1',
      vendorName: 'Acme Corp',
      rank: 1,
      weightedScore: 88.5,
      totalCost: 2850000,
      valueScore: 92,
      riskAssessment: 18,
      recommendationStrength: 98,
    },
    {
      vendorId: 'v3',
      vendorName: 'Global Supplies',
      rank: 2,
      weightedScore: 82.8,
      totalCost: 3100000,
      valueScore: 85,
      riskAssessment: 25,
      recommendationStrength: 88,
    },
    {
      vendorId: 'v4',
      vendorName: 'TechCon Solutions',
      rank: 3,
      weightedScore: 79.4,
      totalCost: 2900000,
      valueScore: 80,
      riskAssessment: 32,
      recommendationStrength: 75,
    },
    {
      vendorId: 'v2',
      vendorName: 'BuildTech Ltd',
      rank: 4,
      weightedScore: 85.2,
      totalCost: 2650000,
      valueScore: 88,
      riskAssessment: 45,
      recommendationStrength: 62,
    },
  ];

  const scenarios = [
    {
      name: 'Best Value Scenario',
      type: 'best_value' as const,
      topVendor: 'Acme Corp',
      score: 88.5,
      cost: 2850000,
      valueIndex: 92,
      risk: 18,
    },
    {
      name: 'Lowest Cost Scenario',
      type: 'lowest_cost' as const,
      topVendor: 'BuildTech Ltd',
      score: 85.2,
      cost: 2650000,
      valueIndex: 88,
      risk: 45,
    },
    {
      name: 'Risk-Adjusted Scenario',
      type: 'risk_adjusted' as const,
      topVendor: 'Acme Corp',
      score: 88.5,
      cost: 2850000,
      valueIndex: 92,
      risk: 18,
    },
  ];

  const handleSelectWinner = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor.name);
    }
  };

  const handleRecommendAward = () => {
    if (!hasPermission) {
      alert('You must be an Evaluation Chair to recommend an award.');
      return;
    }
    alert(`Award recommendation submitted for ${selectedVendor} based on ${selectedScenario}`);
  };

  const handleGenerateReport = () => {
    if (!hasPermission) {
      alert('You must be an Evaluation Chair to generate the final report.');
      return;
    }
    alert('Generating comprehensive final award report...');
  };

  const kpiModalData = {
    value: {
      topVendor: 'Acme Corp',
      index: 92,
      ranking: [
        { vendor: 'Acme Corp', score: 92, cost: 2850000, rank: 1 },
        { vendor: 'BuildTech Ltd', score: 88, cost: 2650000, rank: 2 },
        { vendor: 'Global Supplies', score: 85, cost: 3100000, rank: 3 },
        { vendor: 'TechCon Solutions', score: 80, cost: 2900000, rank: 4 },
      ],
      components: [
        { name: 'Technical Quality', weight: 35, score: 88 },
        { name: 'Financial Stability', weight: 25, score: 95 },
        { name: 'ESG Compliance', weight: 20, score: 90 },
        { name: 'Innovation', weight: 20, score: 94 },
      ],
      historical: [
        { period: 'Q1 2024', index: 85 },
        { period: 'Q2 2024', index: 88 },
        { period: 'Q3 2024', index: 92 },
      ],
    },
    reliability: {
      overall: 94.5,
      byVendor: [
        { vendor: 'Acme Corp', score: 96, history: '15 years, 120+ projects', issues: 0 },
        { vendor: 'BuildTech Ltd', score: 92, history: '10 years, 85+ projects', issues: 2 },
        { vendor: 'Global Supplies', score: 89, history: '8 years, 65+ projects', issues: 3 },
        { vendor: 'TechCon Solutions', score: 85, history: '12 years, 95+ projects', issues: 5 },
      ],
      factors: [
        { factor: 'On-Time Delivery', weight: 30, status: 'excellent' as const },
        { factor: 'Quality Standards', weight: 25, status: 'excellent' as const },
        { factor: 'Budget Adherence', weight: 20, status: 'good' as const },
        { factor: 'Communication', weight: 15, status: 'good' as const },
        { factor: 'Risk Management', weight: 10, status: 'excellent' as const },
      ],
      prediction: [
        { vendor: 'Acme Corp', successRate: 96, confidence: 95 },
        { vendor: 'BuildTech Ltd', successRate: 92, confidence: 88 },
        { vendor: 'Global Supplies', successRate: 89, confidence: 82 },
        { vendor: 'TechCon Solutions', successRate: 85, confidence: 78 },
      ],
    },
    savings: {
      percentage: 15.2,
      amount: 450000,
      marketAverage: 3100000,
      selectedBid: 2650000,
      breakdown: [
        { category: 'Materials', saving: 180000, percentage: 40 },
        { category: 'Labor', saving: 135000, percentage: 30 },
        { category: 'Equipment', saving: 90000, percentage: 20 },
        { category: 'Overhead', saving: 45000, percentage: 10 },
      ],
      comparison: [
        { vendor: 'BuildTech Ltd', bid: 2650000, saving: 450000, savingPct: 15.2 },
        { vendor: 'Acme Corp', bid: 2850000, saving: 250000, savingPct: 8.1 },
        { vendor: 'TechCon Solutions', bid: 2900000, saving: 200000, savingPct: 6.5 },
        { vendor: 'Global Supplies', bid: 3100000, saving: 0, savingPct: 0 },
      ],
    },
  };

  return (
    <>
      <Sidebar currentPage="award" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Award Simulation
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  ScenarioSim.Agent Active
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasPermission ? (
                  <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                    Evaluation Chair
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
                    View Only
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Categories</option>
                  <option value="WORKS">Works & Construction</option>
                  <option value="GOODS">Goods & Equipment</option>
                  <option value="SERVICES">Services & Consulting</option>
                  <option value="MAINTENANCE">Maintenance & Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tender
                </label>
                <select
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {filteredTenders.map((tender) => (
                    <option key={tender.id} value={tender.id}>
                      {tender.id} - {tender.title}
                    </option>
                  ))}
                  {filteredTenders.length === 0 && (
                    <option value="">No tenders match filters</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div onClick={() => setKpiModal({ isOpen: true, type: 'value' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Best Value Index"
                value="92"
                subtitle="Acme Corp • Click for details"
                icon={Award}
                trend={{ value: '8%', isPositive: true }}
              />
            </div>

            <div onClick={() => setKpiModal({ isOpen: true, type: 'reliability' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Predicted Reliability"
                value="94.5%"
                subtitle="Historical data • Click for details"
                icon={CheckCircle}
                trend={{ value: '3%', isPositive: true }}
              />
            </div>

            <div onClick={() => setKpiModal({ isOpen: true, type: 'savings' })} className="cursor-pointer transition-transform hover:scale-105">
              <KPIWidget
                title="Cost Saving"
                value="15.2%"
                subtitle="vs. market • Click for details"
                icon={Percent}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-1">
              <SimulationControlPanel
                weights={weights}
                onWeightChange={handleWeightChange}
                excludedVendors={excludedVendors}
                onToggleVendorExclusion={handleToggleVendorExclusion}
                availableVendors={vendors}
              />
            </div>

            <div className="col-span-2">
              <ScenarioComparisonChart scenarios={scenarios} />
            </div>
          </div>

          <div className="space-y-6">
            <ScenarioOutcomesTable
              scenarioName="Best Value Scenario"
              scenarioType="best_value"
              results={bestValueResults}
              onSelectWinner={handleSelectWinner}
            />

            <ScenarioOutcomesTable
              scenarioName="Lowest Cost Scenario"
              scenarioType="lowest_cost"
              results={lowestCostResults}
              onSelectWinner={handleSelectWinner}
            />

            <ScenarioOutcomesTable
              scenarioName="Risk-Adjusted Scenario"
              scenarioType="risk_adjusted"
              results={riskAdjustedResults}
              onSelectWinner={handleSelectWinner}
            />
          </div>
        </main>

        <AwardSimulationFooter
          tenderId={tenderId}
          phase="Award Simulation"
          selectedScenario={selectedScenario}
          selectedVendor={selectedVendor}
          onRecommendAward={handleRecommendAward}
          onGenerateReport={handleGenerateReport}
          hasPermission={hasPermission}
        />

        <AwardSimulationKPIModal
          isOpen={kpiModal.isOpen}
          onClose={() => setKpiModal(prev => ({ ...prev, isOpen: false }))}
          kpiType={kpiModal.type}
          data={kpiModalData}
        />
      </div>
    </>
  );
}
