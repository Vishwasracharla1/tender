import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { EnhancedNetworkGraph } from '../components/EnhancedNetworkGraph';
import { IntegrityAlertList } from '../components/IntegrityAlertList';
import { IntegrityFooter } from '../components/IntegrityFooter';
import { FlaggedEvaluatorsList } from '../components/FlaggedEvaluatorsList';
import { CalendarPicker } from '../components/CalendarPicker';
import { ShieldAlert, TrendingUp, CheckCircle, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';

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

  const tenders: Tender[] = [
    { id: 'TND-2025-001', title: 'Municipal Building Renovation', department: 'Roads & Construction', category: 'WORKS', dateCreated: '2025-01-15' },
    { id: 'TND-2025-002', title: 'Solar Panel Installation', department: 'Water Management', category: 'WORKS', dateCreated: '2025-02-01' },
    { id: 'TND-2025-003', title: 'IT Equipment Procurement', department: 'Administration', category: 'SUPPLIES', dateCreated: '2025-02-10' },
    { id: 'TND-2025-004', title: 'Healthcare Cleaning Services', department: 'Maintenance', category: 'SERVICES', dateCreated: '2025-02-15' },
    { id: 'TND-2025-005', title: 'Legal Advisory Services', department: 'Legal', category: 'CONSULTANCY', dateCreated: '2025-03-01' },
    { id: 'TND-2025-006', title: 'Waste Collection Services', department: 'Waste Management', category: 'SERVICES', dateCreated: '2025-03-05' },
    { id: 'TND-2025-007', title: 'Parking System Upgrade', department: 'Parking Management', category: 'WORKS', dateCreated: '2025-03-10' },
    { id: 'TND-2025-008', title: 'HR Recruitment Platform', department: 'HR', category: 'SERVICES', dateCreated: '2025-03-15' },
  ];

  const allNetworkData = {
    'Roads & Construction': {
      nodes: [
        { id: 'e1', name: 'Sarah Chen', type: 'evaluator' as const, biasScore: 15, department: 'Roads & Construction' },
        { id: 'e2', name: 'Michael Ross', type: 'evaluator' as const, biasScore: 78, department: 'Roads & Construction' },
        { id: 'e3', name: 'Emily Davis', type: 'evaluator' as const, biasScore: 22, department: 'Roads & Construction' },
        { id: 'e4', name: 'James Wilson', type: 'evaluator' as const, biasScore: 45, department: 'Roads & Construction' },
        { id: 'v1', name: 'Acme Corp', type: 'vendor' as const },
        { id: 'v2', name: 'BuildTech Ltd', type: 'vendor' as const },
        { id: 'v3', name: 'Global Supplies', type: 'vendor' as const },
        { id: 'v4', name: 'TechCon Solutions', type: 'vendor' as const },
      ],
      edges: [
        { source: 'e1', target: 'v1', strength: 0.3, isSuspicious: false },
        { source: 'e1', target: 'v2', strength: 0.4, isSuspicious: false },
        { source: 'e2', target: 'v2', strength: 0.9, isSuspicious: true },
        { source: 'e3', target: 'v1', strength: 0.5, isSuspicious: false },
        { source: 'e4', target: 'v3', strength: 0.8, isSuspicious: true },
      ]
    },
    'Water Management': {
      nodes: [
        { id: 'e5', name: 'Omar Al-Rashid', type: 'evaluator' as const, biasScore: 32, department: 'Water Management' },
        { id: 'e6', name: 'Fatima Hassan', type: 'evaluator' as const, biasScore: 18, department: 'Water Management' },
        { id: 'e7', name: 'Ahmed Khalil', type: 'evaluator' as const, biasScore: 55, department: 'Water Management' },
        { id: 'v5', name: 'AquaTech Solutions', type: 'vendor' as const },
        { id: 'v6', name: 'HydroWorks Inc', type: 'vendor' as const },
        { id: 'v7', name: 'WaterCo International', type: 'vendor' as const },
      ],
      edges: [
        { source: 'e5', target: 'v5', strength: 0.4, isSuspicious: false },
        { source: 'e5', target: 'v6', strength: 0.6, isSuspicious: false },
        { source: 'e6', target: 'v7', strength: 0.3, isSuspicious: false },
        { source: 'e7', target: 'v5', strength: 0.85, isSuspicious: true },
      ]
    },
    'Administration': {
      nodes: [
        { id: 'e8', name: 'Lisa Wang', type: 'evaluator' as const, biasScore: 25, department: 'Administration' },
        { id: 'e9', name: 'David Martinez', type: 'evaluator' as const, biasScore: 12, department: 'Administration' },
        { id: 'v8', name: 'TechSupply Co', type: 'vendor' as const },
        { id: 'v9', name: 'Office Solutions Ltd', type: 'vendor' as const },
        { id: 'v10', name: 'IT Hardware Group', type: 'vendor' as const },
      ],
      edges: [
        { source: 'e8', target: 'v8', strength: 0.5, isSuspicious: false },
        { source: 'e9', target: 'v9', strength: 0.4, isSuspicious: false },
        { source: 'e8', target: 'v10', strength: 0.3, isSuspicious: false },
      ]
    },
    'Maintenance': {
      nodes: [
        { id: 'e10', name: 'John Stevens', type: 'evaluator' as const, biasScore: 41, department: 'Maintenance' },
        { id: 'e11', name: 'Maria Garcia', type: 'evaluator' as const, biasScore: 67, department: 'Maintenance' },
        { id: 'v11', name: 'CleanPro Services', type: 'vendor' as const },
        { id: 'v12', name: 'FacilityMasters', type: 'vendor' as const },
      ],
      edges: [
        { source: 'e10', target: 'v11', strength: 0.6, isSuspicious: false },
        { source: 'e11', target: 'v12', strength: 0.88, isSuspicious: true },
      ]
    },
    'Legal': {
      nodes: [
        { id: 'e12', name: 'Noor Al-Said', type: 'evaluator' as const, biasScore: 19, department: 'Legal' },
        { id: 'e13', name: 'Mohammed Rashid', type: 'evaluator' as const, biasScore: 28, department: 'Legal' },
        { id: 'v13', name: 'Legal Advisors LLC', type: 'vendor' as const },
        { id: 'v14', name: 'Law Consultants Group', type: 'vendor' as const },
      ],
      edges: [
        { source: 'e12', target: 'v13', strength: 0.5, isSuspicious: false },
        { source: 'e13', target: 'v14', strength: 0.4, isSuspicious: false },
      ]
    },
  };

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
    if (selectedDepartment === 'all') {
      return allNetworkData['Roads & Construction'];
    }
    return allNetworkData[selectedDepartment as keyof typeof allNetworkData] || allNetworkData['Roads & Construction'];
  }, [selectedDepartment]);

  const networkNodes = currentDepartmentData.nodes;
  const networkEdges = currentDepartmentData.edges;

  const allFlaggedEvaluators = [
    {
      id: 'e2',
      name: 'Michael Ross',
      department: 'Roads & Construction',
      biasScore: 78,
      alertCount: 2,
      reason: 'Consistently scores BuildTech Ltd 25-30% higher than peer evaluators across all tender categories.',
    },
    {
      id: 'e4',
      name: 'James Wilson',
      department: 'Roads & Construction',
      biasScore: 45,
      alertCount: 2,
      reason: 'Shows significant variance in ESG scoring and favoritism towards Global Supplies in financial criteria.',
    },
    {
      id: 'e7',
      name: 'Ahmed Khalil',
      department: 'Water Management',
      biasScore: 55,
      alertCount: 1,
      reason: 'Demonstrates 85% correlation in scoring patterns with AquaTech Solutions across multiple tenders.',
    },
    {
      id: 'e11',
      name: 'Maria Garcia',
      department: 'Maintenance',
      biasScore: 67,
      alertCount: 1,
      reason: 'Elevated bias score of 67/100 with documented favoritism towards FacilityMasters in service evaluations.',
    },
    {
      id: 'e10',
      name: 'John Stevens',
      department: 'Maintenance',
      biasScore: 41,
      alertCount: 0,
      reason: 'Moderate bias detected in vendor selection patterns, currently under monitoring.',
    },
  ];

  const flaggedEvaluators = useMemo(() => {
    return allFlaggedEvaluators.filter(evaluator => {
      if (selectedDepartment !== 'all' && evaluator.department !== selectedDepartment) return false;
      return true;
    });
  }, [selectedDepartment]);


  const allAlerts = useMemo(() => ([
    {
      id: '1',
      type: 'collusion' as const,
      severity: 'critical' as const,
      title: 'Suspicious Evaluator-Vendor Pattern',
      description: 'Michael Ross consistently scores BuildTech Ltd 25-30% higher than other evaluators across all categories.',
      confidenceScore: 0.92,
      entitiesInvolved: ['Michael Ross', 'BuildTech Ltd'],
      status: 'open' as const,
      detectedAt: new Date().toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
    {
      id: '2',
      type: 'bias' as const,
      severity: 'high' as const,
      title: 'Evaluator Bias Score Threshold Exceeded',
      description: 'Michael Ross shows a bias score of 78/100, significantly favoring BuildTech Ltd in technical and innovation categories.',
      confidenceScore: 0.87,
      entitiesInvolved: ['Michael Ross'],
      status: 'open' as const,
      detectedAt: new Date(Date.now() - 300000).toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
    {
      id: '3',
      type: 'collusion' as const,
      severity: 'high' as const,
      title: 'Vendor Favoritism Detected',
      description: 'James Wilson consistently underscores competing vendors while awarding maximum points to Global Supplies.',
      confidenceScore: 0.81,
      entitiesInvolved: ['James Wilson', 'Global Supplies'],
      status: 'open' as const,
      detectedAt: new Date(Date.now() - 600000).toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
    {
      id: '4',
      type: 'anomaly' as const,
      severity: 'medium' as const,
      title: 'Scoring Variance Anomaly',
      description: 'James Wilson\'s ESG scores show 3x higher variance compared to peer evaluators.',
      confidenceScore: 0.73,
      entitiesInvolved: ['James Wilson'],
      status: 'open' as const,
      detectedAt: new Date(Date.now() - 900000).toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
    {
      id: '5',
      type: 'collusion' as const,
      severity: 'critical' as const,
      title: 'Suspicious Relationship Pattern',
      description: 'Ahmed Khalil shows 85% correlation in scoring patterns with AquaTech Solutions across 6 tenders.',
      confidenceScore: 0.89,
      entitiesInvolved: ['Ahmed Khalil', 'AquaTech Solutions'],
      status: 'open' as const,
      detectedAt: new Date(Date.now() - 1200000).toISOString(),
      department: 'Water Management',
      category: 'WORKS',
      tenderId: 'TND-2025-002',
    },
    {
      id: '6',
      type: 'bias' as const,
      severity: 'high' as const,
      title: 'Evaluator Bias Score Elevated',
      description: 'Maria Garcia demonstrates bias score of 67/100 favoring FacilityMasters in service evaluations.',
      confidenceScore: 0.84,
      entitiesInvolved: ['Maria Garcia'],
      status: 'open' as const,
      detectedAt: new Date(Date.now() - 1500000).toISOString(),
      department: 'Maintenance',
      category: 'SERVICES',
      tenderId: 'TND-2025-004',
    },
    {
      id: '7',
      type: 'bias' as const,
      severity: 'low' as const,
      title: 'Minor Scoring Pattern',
      description: 'Sarah Chen shows slight preference for local vendors, though within acceptable variance thresholds.',
      confidenceScore: 0.64,
      entitiesInvolved: ['Sarah Chen'],
      status: 'cleared' as const,
      detectedAt: new Date(Date.now() - 1800000).toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
    {
      id: '8',
      type: 'anomaly' as const,
      severity: 'low' as const,
      title: 'Temporal Scoring Drift',
      description: 'Emily Davis\'s scoring strictness decreased by 12% over the evaluation period.',
      confidenceScore: 0.58,
      entitiesInvolved: ['Emily Davis'],
      status: 'cleared' as const,
      detectedAt: new Date(Date.now() - 2400000).toISOString(),
      department: 'Roads & Construction',
      category: 'WORKS',
      tenderId: 'TND-2025-001',
    },
  ]), []);

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
  const avgBiasScore = evaluatorBiasScores.reduce((sum, score) => sum + score, 0) / evaluatorBiasScores.length;

  const maxCollusionProbability = 0.92;

  return (
    <>
      <Sidebar currentPage="integrity" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Integrity Analytics
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  IntegrityBot.Agent Active
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
                  Integrity Review
                </span>
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

            <div className="grid grid-cols-4 gap-4">
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
                  <option value="SERVICES">Services</option>
                  <option value="SUPPLIES">Supplies</option>
                  <option value="CONSULTANCY">Consultancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tender
                </label>
                <select
                  value={selectedTender}
                  onChange={(e) => setSelectedTender(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  Showing {filteredAlerts.length} alerts for:
                </span>
                {selectedDepartment !== 'all' && (
                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                    {selectedDepartment}
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    {selectedCategory}
                  </span>
                )}
                {selectedTender !== 'all' && (
                  <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-200">
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
                  className="ml-auto text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <KPIWidget
              title="Avg Bias Score"
              value={avgBiasScore.toFixed(1)}
              subtitle="Per evaluator"
              icon={TrendingUp}
              trend={{ value: '8%', isPositive: false }}
            />

            <KPIWidget
              title="Collusion Probability"
              value={`${(maxCollusionProbability * 100).toFixed(0)}%`}
              subtitle="Highest detected"
              icon={ShieldAlert}
            />

            <KPIWidget
              title="Resolution Rate"
              value={`${resolutionRate.toFixed(0)}%`}
              subtitle={`${resolvedAlerts}/${totalAlerts} alerts closed`}
              icon={CheckCircle}
              trend={{ value: '15%', isPositive: true }}
            />
          </div>

          <div className="mb-8">
            <EnhancedNetworkGraph
              nodes={networkNodes}
              edges={networkEdges}
              onNodeClick={handleNodeClick}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <IntegrityAlertList
                alerts={alerts}
                onMarkCleared={handleMarkCleared}
                onEscalate={handleEscalate}
              />
            </div>
          </div>

          <FlaggedEvaluatorsList evaluators={flaggedEvaluators} />
        </main>

        <IntegrityFooter
          tenderId={selectedTender !== 'all' ? selectedTender : 'ALL-TENDERS'}
          phase="Integrity Review"
          openAlertCount={openAlerts.length}
          onEscalateAll={handleEscalateAll}
          onClearAll={handleClearAll}
        />
      </div>
    </>
  );
}
