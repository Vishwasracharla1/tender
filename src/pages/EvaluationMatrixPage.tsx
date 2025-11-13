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
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark') => void;
}

export function EvaluationMatrixPage({ onNavigate }: EvaluationMatrixPageProps) {
  const [activeTab, setActiveTab] = useState<Category>('technical');
  const [isChair] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTender, setSelectedTender] = useState('TND-2025-001');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [openKPIModal, setOpenKPIModal] = useState<'weight' | 'variance' | 'time' | null>(null);

  const tenders: Tender[] = [
    { id: 'TND-2025-001', title: 'Municipal Building Renovation', department: 'Roads & Construction', category: 'WORKS', dateCreated: '2025-01-15', status: 'evaluation' },
    { id: 'TND-2025-002', title: 'Solar Panel Installation', department: 'Water Management', category: 'WORKS', dateCreated: '2025-02-01', status: 'evaluation' },
    { id: 'TND-2025-003', title: 'IT Equipment Procurement', department: 'Administration', category: 'SUPPLIES', dateCreated: '2025-02-10', status: 'evaluation' },
    { id: 'TND-2025-004', title: 'Healthcare Cleaning Services', department: 'Maintenance', category: 'SERVICES', dateCreated: '2025-02-15', status: 'completed' },
    { id: 'TND-2025-005', title: 'Legal Advisory Services', department: 'Legal', category: 'CONSULTANCY', dateCreated: '2025-03-01', status: 'evaluation' },
    { id: 'TND-2025-006', title: 'Waste Collection Services', department: 'Waste Management', category: 'SERVICES', dateCreated: '2025-03-05', status: 'locked' },
    { id: 'TND-2025-007', title: 'Parking System Upgrade', department: 'Parking Management', category: 'WORKS', dateCreated: '2025-03-10', status: 'evaluation' },
  ];

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
  const allCriteria = currentTenderData.criteria;
  const vendors = currentTenderData.vendors;

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
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Tender
              </label>
              <select
                value={selectedTender}
                onChange={(e) => setSelectedTender(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-600">
                Showing tender: {currentTender.title}
              </span>
              {selectedDepartment !== 'all' && (
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                  {selectedDepartment}
                </span>
              )}
              <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                {currentTender.category}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                currentTender.status === 'evaluation' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                currentTender.status === 'locked' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                'text-gray-700 bg-gray-50 border-gray-200'
              }`}>
                {currentTender.status}
              </span>
              <button
                onClick={() => {
                  setSelectedDepartment('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="ml-auto text-xs text-gray-600 hover:text-gray-900 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <KPIWidget
            title="Weight Alignment"
            value={`${weightAlignment}%`}
            subtitle={`Target: 100% (Current: ${totalWeight.toFixed(0)}%)`}
            icon={Target}
            trend={{ value: '5%', isPositive: true }}
            onClick={() => setOpenKPIModal('weight')}
          />

          <KPIWidget
            title="Evaluator Variance"
            value="0.18"
            subtitle="Lower is better"
            icon={TrendingDown}
            trend={{ value: '12%', isPositive: true }}
            onClick={() => setOpenKPIModal('variance')}
          />

          <KPIWidget
            title="Processing Time Saved"
            value="127 min"
            subtitle="AI-assisted evaluation"
            icon={Clock}
            trend={{ value: '23%', isPositive: true }}
            onClick={() => setOpenKPIModal('time')}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <EvaluationMatrix
              criteria={activeCriteria}
              vendors={vendors}
              scores={scores.filter((s) =>
                activeCriteria.some((c) => c.id === s.criterionId)
              )}
              isLocked={isLocked}
              onWeightChange={handleWeightChange}
              onScoreChange={handleScoreChange}
            />
          </div>

          <div>
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
