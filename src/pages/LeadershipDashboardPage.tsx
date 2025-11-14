import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { KPIDetailModal } from '../components/KPIDetailModal';
import { IntegrityHeatmap } from '../components/IntegrityHeatmap';
import { DurationTrendline } from '../components/DurationTrendline';
import { ComplianceLeaderboard } from '../components/ComplianceLeaderboard';
import { LeadershipFooter } from '../components/LeadershipFooter';
import { Activity, Clock, Target, AlertTriangle, Filter, Users, TrendingUp, Award, ShieldAlert } from 'lucide-react';
import { MOCK_TENDERS, VendorData } from '../data/mockTenderData';

interface LeadershipDashboardPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration') => void;
}

export function LeadershipDashboardPage({ onNavigate }: LeadershipDashboardPageProps) {
  const [tenderId] = useState('ALL-DEPARTMENTS');
  const [phase] = useState('Executive Overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [activeModal, setActiveModal] = useState<'tenders' | 'duration' | 'compliance' | 'alerts' | 'vendors' | 'avgBid' | 'topVendor' | 'riskVendors' | null>(null);

  const departments = [
    'all',
    'Legal Affairs',
    'HR',
    'Water Management',
    'Parking Management',
    'Waste Management',
    'Roads & Construction',
    'Maintenance',
    'Administration',
    'Procurement',
    'City Violation / Enforcement',
    'Tolls Management',
    'Citizen-Centric Services',
    'Landscape & Irrigation',
    'Healthcare Management'
  ];
  const categories = ['all', 'WORKS', 'SERVICES', 'SUPPLIES', 'CONSULTANCY'];
  const phases = ['all', 'intake', 'evaluation', 'benchmark', 'justification', 'award'];
  const riskLevels = ['all', 'low', 'medium', 'high', 'critical'];

  const integrityData = [
    { tenderId: 'TND-001', department: 'Procurement', integrityScore: 95, riskLevel: 'low' as const, phase: 'Award' },
    { tenderId: 'TND-002', department: 'Water Management', integrityScore: 88, riskLevel: 'low' as const, phase: 'Evaluation' },
    { tenderId: 'TND-003', department: 'Roads & Construction', integrityScore: 72, riskLevel: 'medium' as const, phase: 'Benchmark' },
    { tenderId: 'TND-004', department: 'Waste Management', integrityScore: 85, riskLevel: 'low' as const, phase: 'Evaluation' },
    { tenderId: 'TND-005', department: 'Procurement', integrityScore: 78, riskLevel: 'medium' as const, phase: 'Evaluation' },
    { tenderId: 'TND-006', department: 'Tolls Management', integrityScore: 65, riskLevel: 'high' as const, phase: 'Intake' },
    { tenderId: 'TND-007', department: 'Roads & Construction', integrityScore: 92, riskLevel: 'low' as const, phase: 'Award' },
    { tenderId: 'TND-008', department: 'Maintenance', integrityScore: 58, riskLevel: 'high' as const, phase: 'Intake' },
    { tenderId: 'TND-009', department: 'Procurement', integrityScore: 82, riskLevel: 'low' as const, phase: 'Benchmark' },
    { tenderId: 'TND-010', department: 'HR', integrityScore: 45, riskLevel: 'critical' as const, phase: 'Intake' },
    { tenderId: 'TND-011', department: 'Water Management', integrityScore: 88, riskLevel: 'low' as const, phase: 'Evaluation' },
    { tenderId: 'TND-012', department: 'Landscape & Irrigation', integrityScore: 91, riskLevel: 'low' as const, phase: 'Award' },
  ];

  const durationData = [
    { period: 'Jan', avgDuration: 45, targetDuration: 40, variance: 5 },
    { period: 'Feb', avgDuration: 42, targetDuration: 40, variance: 2 },
    { period: 'Mar', avgDuration: 38, targetDuration: 40, variance: -2 },
    { period: 'Apr', avgDuration: 35, targetDuration: 40, variance: -5 },
    { period: 'May', avgDuration: 33, targetDuration: 40, variance: -7 },
    { period: 'Jun', avgDuration: 31, targetDuration: 40, variance: -9 },
  ];

  const complianceData = [
    {
      departmentName: 'Water Management',
      complianceScore: 96.2,
      totalTenders: 28,
      compliantTenders: 27,
      onTimeRate: 96.4,
      policyAdherence: 98.2,
      riskMitigation: 94.0,
      rank: 1,
    },
    {
      departmentName: 'Procurement',
      complianceScore: 94.8,
      totalTenders: 32,
      compliantTenders: 30,
      onTimeRate: 93.8,
      policyAdherence: 96.5,
      riskMitigation: 94.1,
      rank: 2,
    },
    {
      departmentName: 'Roads & Construction',
      complianceScore: 92.3,
      totalTenders: 24,
      compliantTenders: 22,
      onTimeRate: 91.7,
      policyAdherence: 94.2,
      riskMitigation: 91.0,
      rank: 3,
    },
    {
      departmentName: 'Waste Management',
      complianceScore: 89.7,
      totalTenders: 19,
      compliantTenders: 17,
      onTimeRate: 89.5,
      policyAdherence: 91.8,
      riskMitigation: 87.8,
      rank: 4,
    },
    {
      departmentName: 'Landscape & Irrigation',
      complianceScore: 88.1,
      totalTenders: 16,
      compliantTenders: 14,
      onTimeRate: 87.5,
      policyAdherence: 90.3,
      riskMitigation: 86.5,
      rank: 5,
    },
    {
      departmentName: 'Citizen-Centric Services',
      complianceScore: 86.4,
      totalTenders: 22,
      compliantTenders: 19,
      onTimeRate: 86.4,
      policyAdherence: 88.9,
      riskMitigation: 84.0,
      rank: 6,
    },
    {
      departmentName: 'Tolls Management',
      complianceScore: 84.9,
      totalTenders: 11,
      compliantTenders: 9,
      onTimeRate: 81.8,
      policyAdherence: 87.3,
      riskMitigation: 85.6,
      rank: 7,
    },
    {
      departmentName: 'Maintenance',
      complianceScore: 83.2,
      totalTenders: 25,
      compliantTenders: 21,
      onTimeRate: 84.0,
      policyAdherence: 85.6,
      riskMitigation: 80.0,
      rank: 8,
    },
    {
      departmentName: 'Administration',
      complianceScore: 81.5,
      totalTenders: 14,
      compliantTenders: 11,
      onTimeRate: 78.6,
      policyAdherence: 84.2,
      riskMitigation: 81.7,
      rank: 9,
    },
    {
      departmentName: 'Parking Management',
      complianceScore: 79.8,
      totalTenders: 9,
      compliantTenders: 7,
      onTimeRate: 77.8,
      policyAdherence: 82.4,
      riskMitigation: 79.2,
      rank: 10,
    },
    {
      departmentName: 'Legal',
      complianceScore: 78.3,
      totalTenders: 8,
      compliantTenders: 6,
      onTimeRate: 75.0,
      policyAdherence: 81.5,
      riskMitigation: 78.5,
      rank: 11,
    },
    {
      departmentName: 'HR',
      complianceScore: 76.1,
      totalTenders: 12,
      compliantTenders: 9,
      onTimeRate: 75.0,
      policyAdherence: 79.8,
      riskMitigation: 73.5,
      rank: 12,
    },
    {
      departmentName: 'City Violation / Enforcement',
      complianceScore: 74.6,
      totalTenders: 7,
      compliantTenders: 5,
      onTimeRate: 71.4,
      policyAdherence: 77.9,
      riskMitigation: 74.5,
      rank: 13,
    },
  ];

  const handleExportInsights = () => {
    alert('Exporting executive insights report...');
  };

  const handleScheduleReview = () => {
    alert('Opening review scheduling dialog...');
  };

  const filteredIntegrityData = integrityData.filter(item => {
    if (selectedDepartment !== 'all' && item.department !== selectedDepartment) return false;
    if (selectedPhase !== 'all' && item.phase.toLowerCase() !== selectedPhase.toLowerCase()) return false;
    if (selectedRiskLevel !== 'all' && item.riskLevel !== selectedRiskLevel) return false;
    return true;
  });

  const filteredComplianceData = selectedDepartment !== 'all'
    ? complianceData.filter(dept => dept.departmentName === selectedDepartment)
    : complianceData;

  const filteredTenders = useMemo(() => {
    return MOCK_TENDERS.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && tender.category !== selectedCategory) return false;
      if (selectedPhase !== 'all' && tender.status !== selectedPhase) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory, selectedPhase]);

  const vendorAnalytics = useMemo(() => {
    const allVendors: Array<VendorData & { tenderId: string; tenderTitle: string; department: string; category: string }> = [];

    filteredTenders.forEach(tender => {
      tender.vendors.forEach(vendor => {
        allVendors.push({
          ...vendor,
          tenderId: tender.id,
          tenderTitle: tender.title,
          department: tender.department,
          category: tender.category,
        });
      });
    });

    const uniqueVendors = new Set(allVendors.map(v => v.name)).size;
    const avgBidValue = allVendors.length > 0
      ? allVendors.reduce((sum, v) => sum + v.totalCost, 0) / allVendors.length
      : 0;

    const vendorPerformance = allVendors.reduce((acc, vendor) => {
      if (!acc[vendor.name]) {
        acc[vendor.name] = {
          name: vendor.name,
          bids: 0,
          avgTechnical: 0,
          avgFinancial: 0,
          avgReliability: 0,
          totalValue: 0,
          riskCount: 0,
          bidErrors: 0,
          tenders: [] as string[],
        };
      }
      acc[vendor.name].bids += 1;
      acc[vendor.name].avgTechnical += vendor.technicalScore;
      acc[vendor.name].avgFinancial += vendor.financialScore;
      acc[vendor.name].avgReliability += vendor.reliability;
      acc[vendor.name].totalValue += vendor.totalCost;
      acc[vendor.name].riskCount += vendor.riskLevel === 'high' ? 1 : 0;
      acc[vendor.name].bidErrors += vendor.bidErrors;
      acc[vendor.name].tenders.push(vendor.tenderId);
      return acc;
    }, {} as Record<string, any>);

    const vendorStats = Object.values(vendorPerformance).map((v: any) => ({
      ...v,
      avgTechnical: v.avgTechnical / v.bids,
      avgFinancial: v.avgFinancial / v.bids,
      avgReliability: v.avgReliability / v.bids,
      avgBidValue: v.totalValue / v.bids,
    }));

    const topVendor = vendorStats.sort((a: any, b: any) => b.avgReliability - a.avgReliability)[0];
    const riskVendors = vendorStats.filter((v: any) => v.riskCount > 0 || v.bidErrors > 2).length;

    return {
      totalVendors: uniqueVendors,
      avgBidValue,
      topVendor,
      riskVendors,
      allVendorStats: vendorStats,
      allVendors,
    };
  }, [filteredTenders]);

  return (
    <>
      <Sidebar currentPage="leadership" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gray-50 pb-24 lg:pl-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Leadership Dashboard
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    GovernAI.Agent Active
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500">
                    Tender: <span className="font-medium text-gray-900">{tenderId}</span>
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">
                    Phase: <span className="font-medium text-gray-900">{phase}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg border border-blue-200">
                  Executive Access
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <KPIWidget
              title="Active Tenders"
              value="28"
              subtitle="Across all departments"
              icon={Activity}
              trend={{ value: '12%', isPositive: true }}
              onClick={() => setActiveModal('tenders')}
            />

            <KPIWidget
              title="Avg Eval Duration"
              value="31 days"
              subtitle="9 days under target"
              icon={Clock}
              trend={{ value: '22%', isPositive: true }}
              onClick={() => setActiveModal('duration')}
            />

            <KPIWidget
              title="Compliance Rate"
              value="87.3%"
              subtitle="69 of 79 tenders compliant"
              icon={Target}
              onClick={() => setActiveModal('compliance')}
            />

            <KPIWidget
              title="Critical Alerts"
              value="3"
              subtitle="Requires immediate attention"
              icon={AlertTriangle}
              onClick={() => setActiveModal('alerts')}
            />
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 mb-10 bg-gradient-to-br from-white via-sky-50 to-sky-100 border border-sky-100">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-br from-sky-200 to-blue-200 opacity-50 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 bottom-0 w-40 h-40 bg-gradient-to-tr from-cyan-100 to-slate-100 opacity-60 blur-3xl pointer-events-none" />

            <div className="relative flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-inner">
                <Filter className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.3em] text-indigo-500 uppercase">Filters</p>
                <h2 className="text-lg font-semibold text-slate-900">Personalize the Executive View</h2>
              </div>
            </div>

            <div className="relative grid grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Phase
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  {phases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase === 'all' ? 'All Phases' : phase.charAt(0).toUpperCase() + phase.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-2 tracking-wide">
                  Risk Level
                </label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white/90 border border-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                >
                  {riskLevels.map((level) => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-6">Vendor Analytics</h2>
            <div className="grid grid-cols-4 gap-6">
              <KPIWidget
                title="Active Vendors"
                value={vendorAnalytics.totalVendors.toString()}
                subtitle={`Across ${filteredTenders.length} tender${filteredTenders.length !== 1 ? 's' : ''}`}
                icon={Users}
                onClick={() => setActiveModal('vendors')}
              />

              <KPIWidget
                title="Avg Bid Value"
                value={`AED ${(vendorAnalytics.avgBidValue / 1000000).toFixed(2)}M`}
                subtitle="Mean proposal amount"
                icon={TrendingUp}
                onClick={() => setActiveModal('avgBid')}
              />

              <KPIWidget
                title="Top Performer"
                value={vendorAnalytics.topVendor?.name || 'N/A'}
                subtitle={vendorAnalytics.topVendor ? `${vendorAnalytics.topVendor.avgReliability.toFixed(1)}% reliability` : 'No data'}
                icon={Award}
                onClick={() => setActiveModal('topVendor')}
              />

              <KPIWidget
                title="Risk Vendors"
                value={vendorAnalytics.riskVendors.toString()}
                subtitle="Flagged for high risk or errors"
                icon={ShieldAlert}
                onClick={() => setActiveModal('riskVendors')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Integrity Score Heatmap</h2>
              <IntegrityHeatmap data={filteredIntegrityData} />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Evaluation Duration Trend</h2>
              <DurationTrendline data={durationData} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Department Compliance Leaderboard</h2>
            <ComplianceLeaderboard data={filteredComplianceData} />
          </div>
        </main>

        <LeadershipFooter
          onExportInsights={handleExportInsights}
          onScheduleReview={handleScheduleReview}
        />
      </div>

      <KPIDetailModal
        isOpen={activeModal === 'tenders'}
        onClose={() => setActiveModal(null)}
        title="Active Tenders"
        icon={Activity}
        mainValue="28"
        details={[
          { label: 'Intake Phase', value: '8', description: '5 pending validation, 3 normalized' },
          { label: 'Evaluation Phase', value: '12', description: '7 in scoring, 5 in review' },
          { label: 'Benchmark Phase', value: '5', description: '3 market analysis, 2 outlier review' },
          { label: 'Award Phase', value: '3', description: '2 final approval, 1 contract prep' },
          { label: 'Total Value', value: 'AED 45.2M', description: 'Combined estimated value' },
          { label: 'Avg Time in System', value: '18 days', description: 'From intake to current phase' },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'duration'}
        onClose={() => setActiveModal(null)}
        title="Avg Evaluation Duration"
        icon={Clock}
        mainValue="31 days"
        details={[
          { label: 'Target Duration', value: '40 days', description: 'Organizational benchmark' },
          { label: 'Time Saved', value: '9 days', description: '22% faster than target' },
          { label: 'Fastest Department', value: 'Water Mgmt', description: '24 days average' },
          { label: 'Slowest Department', value: 'HR', description: '42 days average' },
          { label: 'Bottleneck Phase', value: 'Evaluation', description: '14 days average' },
          { label: 'Tenders On-Time', value: '23/28', description: '82% within target timeframe' },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'compliance'}
        onClose={() => setActiveModal(null)}
        title="Compliance Rate"
        icon={Target}
        mainValue="87.3%"
        details={[
          { label: 'Compliant Tenders', value: '69/79', description: 'Meeting all policy requirements' },
          { label: 'Policy Adherence', value: '91.2%', description: 'Following tender procedures' },
          { label: 'Risk Mitigation', value: '84.5%', description: 'Risks identified and managed' },
          { label: 'Documentation', value: '89.8%', description: 'Complete required documentation' },
          { label: 'Timeline Compliance', value: '82.1%', description: 'Meeting deadline requirements' },
          { label: 'Minor Issues', value: '10', description: 'Non-critical compliance gaps' },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'alerts'}
        onClose={() => setActiveModal(null)}
        title="Critical Alerts"
        icon={AlertTriangle}
        mainValue="3"
        details={[
          { label: 'TND-010 (HR)', value: 'Critical', description: 'Integrity score 45% - immediate review required' },
          { label: 'TND-006 (Tolls)', value: 'High Risk', description: 'Evaluation delayed by 12 days' },
          { label: 'TND-008 (Maintenance)', value: 'High Risk', description: 'Missing compliance documentation' },
          { label: 'Total High Risk', value: '8', description: 'Including 3 critical alerts' },
          { label: 'Resolved Today', value: '2', description: 'Down from 5 critical alerts' },
          { label: 'Avg Resolution Time', value: '4.2 days', description: 'For critical alerts' },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'vendors'}
        onClose={() => setActiveModal(null)}
        title="Active Vendors"
        icon={Users}
        mainValue={vendorAnalytics.totalVendors.toString()}
        details={[
          { label: 'Total Bids Submitted', value: vendorAnalytics.allVendors.length.toString(), description: `Across ${filteredTenders.length} tender${filteredTenders.length !== 1 ? 's' : ''}` },
          { label: 'Avg Bids per Tender', value: filteredTenders.length > 0 ? (vendorAnalytics.allVendors.length / filteredTenders.length).toFixed(1) : '0', description: 'Competition level indicator' },
          { label: 'Top 3 Active Vendors', value: vendorAnalytics.allVendorStats.slice(0, 3).map((v: any) => v.name).join(', ') || 'N/A', description: 'Most frequent bidders' },
          { label: 'Works Category', value: filteredTenders.filter(t => t.category === 'WORKS').length.toString(), description: `${filteredTenders.filter(t => t.category === 'WORKS').reduce((sum, t) => sum + t.vendors.length, 0)} vendors` },
          { label: 'Services Category', value: filteredTenders.filter(t => t.category === 'SERVICES').length.toString(), description: `${filteredTenders.filter(t => t.category === 'SERVICES').reduce((sum, t) => sum + t.vendors.length, 0)} vendors` },
          { label: 'Supplies Category', value: filteredTenders.filter(t => t.category === 'SUPPLIES').length.toString(), description: `${filteredTenders.filter(t => t.category === 'SUPPLIES').reduce((sum, t) => sum + t.vendors.length, 0)} vendors` },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'avgBid'}
        onClose={() => setActiveModal(null)}
        title="Average Bid Value"
        icon={TrendingUp}
        mainValue={`AED ${(vendorAnalytics.avgBidValue / 1000000).toFixed(2)}M`}
        details={[
          { label: 'Total Bid Value', value: `AED ${(vendorAnalytics.allVendors.reduce((sum, v) => sum + v.totalCost, 0) / 1000000).toFixed(2)}M`, description: 'Sum of all proposals' },
          { label: 'Highest Bid', value: vendorAnalytics.allVendors.length > 0 ? `AED ${(Math.max(...vendorAnalytics.allVendors.map(v => v.totalCost)) / 1000000).toFixed(2)}M` : 'N/A', description: vendorAnalytics.allVendors.length > 0 ? vendorAnalytics.allVendors.sort((a, b) => b.totalCost - a.totalCost)[0].name : '' },
          { label: 'Lowest Bid', value: vendorAnalytics.allVendors.length > 0 ? `AED ${(Math.min(...vendorAnalytics.allVendors.map(v => v.totalCost)) / 1000000).toFixed(2)}M` : 'N/A', description: vendorAnalytics.allVendors.length > 0 ? vendorAnalytics.allVendors.sort((a, b) => a.totalCost - b.totalCost)[0].name : '' },
          { label: 'Bid Range Spread', value: vendorAnalytics.allVendors.length > 0 ? `${(((Math.max(...vendorAnalytics.allVendors.map(v => v.totalCost)) - Math.min(...vendorAnalytics.allVendors.map(v => v.totalCost))) / Math.min(...vendorAnalytics.allVendors.map(v => v.totalCost)) * 100)).toFixed(1)}%` : 'N/A', description: 'Price variance across vendors' },
          { label: 'Budget Alignment', value: filteredTenders.length > 0 ? `${((vendorAnalytics.avgBidValue / (filteredTenders.reduce((sum, t) => sum + t.estimatedValue, 0) / filteredTenders.length)) * 100).toFixed(1)}%` : 'N/A', description: 'Avg bid vs estimated value' },
          { label: 'Competitive Tenders', value: filteredTenders.filter(t => t.vendors.length >= 3).length.toString(), description: `${((filteredTenders.filter(t => t.vendors.length >= 3).length / Math.max(filteredTenders.length, 1)) * 100).toFixed(0)}% have 3+ bidders` },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'topVendor'}
        onClose={() => setActiveModal(null)}
        title="Top Performing Vendor"
        icon={Award}
        mainValue={vendorAnalytics.topVendor?.name || 'N/A'}
        details={vendorAnalytics.topVendor ? [
          { label: 'Reliability Score', value: `${vendorAnalytics.topVendor.avgReliability.toFixed(1)}%`, description: 'Past performance indicator' },
          { label: 'Total Bids', value: vendorAnalytics.topVendor.bids.toString(), description: `Active in ${vendorAnalytics.topVendor.tenders.length} tender${vendorAnalytics.topVendor.tenders.length !== 1 ? 's' : ''}` },
          { label: 'Avg Technical Score', value: `${vendorAnalytics.topVendor.avgTechnical.toFixed(1)}/100`, description: 'Quality of technical proposals' },
          { label: 'Avg Financial Score', value: `${vendorAnalytics.topVendor.avgFinancial.toFixed(1)}/100`, description: 'Pricing competitiveness' },
          { label: 'Total Bid Value', value: `AED ${(vendorAnalytics.topVendor.totalValue / 1000000).toFixed(2)}M`, description: 'Combined proposal value' },
          { label: 'Bid Errors', value: vendorAnalytics.topVendor.bidErrors.toString(), description: vendorAnalytics.topVendor.bidErrors === 0 ? 'Clean submission record' : 'Minor discrepancies found' },
        ] : [
          { label: 'No Data', value: 'N/A', description: 'No vendors in filtered selection' },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'riskVendors'}
        onClose={() => setActiveModal(null)}
        title="Risk-Flagged Vendors"
        icon={ShieldAlert}
        mainValue={vendorAnalytics.riskVendors.toString()}
        details={[
          { label: 'High Risk Level', value: vendorAnalytics.allVendors.filter(v => v.riskLevel === 'high').length.toString(), description: 'Vendors flagged with high risk assessment' },
          { label: 'Multiple Bid Errors', value: vendorAnalytics.allVendorStats.filter((v: any) => v.bidErrors > 2).length.toString(), description: 'More than 2 submission errors' },
          { label: 'Low Reliability (<80%)', value: vendorAnalytics.allVendorStats.filter((v: any) => v.avgReliability < 80).length.toString(), description: 'Below acceptable performance threshold' },
          { label: 'Total Risk Incidents', value: vendorAnalytics.allVendors.reduce((sum, v) => sum + v.bidErrors, 0).toString(), description: 'Cumulative errors across all bids' },
          { label: 'Risk Mitigation', value: `${((1 - (vendorAnalytics.riskVendors / Math.max(vendorAnalytics.totalVendors, 1))) * 100).toFixed(1)}%`, description: 'Vendors with clean records' },
          { label: 'Watchlist Vendors', value: vendorAnalytics.allVendorStats.filter((v: any) => v.riskCount > 0 && v.bidErrors > 0).map((v: any) => v.name).slice(0, 3).join(', ') || 'None', description: 'Require additional monitoring' },
        ]}
      />
    </>
  );
}
