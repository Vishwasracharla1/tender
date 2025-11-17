import { useState, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { MarketCurveBoxplot } from '../components/MarketCurveBoxplot';
import { ComparativeTable } from '../components/ComparativeTable';
import { InsightsFeed } from '../components/InsightsFeed';
import { BenchmarkFooter } from '../components/BenchmarkFooter';
import { CalendarPicker } from '../components/CalendarPicker';
import { TrendingDown, AlertTriangle, Target, Filter } from 'lucide-react';
import { RAK_DEPARTMENTS } from '../data/departments';

interface Tender {
  id: string;
  title: string;
  department: string;
  category: string;
  dateCreated: string;
}

interface BenchmarkDashboardPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark') => void;
}

export function BenchmarkDashboardPage({ onNavigate }: BenchmarkDashboardPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTender, setSelectedTender] = useState('TND-2025-001');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [isApproved, setIsApproved] = useState(false);

  const tenders: Tender[] = [
    { id: 'TND-2025-001', title: 'Municipal Building Renovation', department: 'Roads & Construction', category: 'WORKS', dateCreated: '2025-01-15' },
    { id: 'TND-2025-002', title: 'Solar Panel Installation', department: 'Water Management', category: 'WORKS', dateCreated: '2025-02-01' },
    { id: 'TND-2025-003', title: 'IT Equipment Procurement', department: 'Administration', category: 'SUPPLIES', dateCreated: '2025-02-10' },
    { id: 'TND-2025-004', title: 'Healthcare Cleaning Services', department: 'Maintenance', category: 'SERVICES', dateCreated: '2025-02-15' },
    { id: 'TND-2025-005', title: 'Legal Advisory Services', department: 'Legal', category: 'CONSULTANCY', dateCreated: '2025-03-01' },
  ];

  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
      if (selectedDepartment !== 'all' && tender.department !== selectedDepartment) return false;
      if (selectedCategory !== 'all' && tender.category !== selectedCategory) return false;
      if (dateRange.start && tender.dateCreated < dateRange.start) return false;
      if (dateRange.end && tender.dateCreated > dateRange.end) return false;
      return true;
    });
  }, [selectedDepartment, selectedCategory, dateRange]);

  const currentTender = tenders.find(t => t.id === selectedTender) || tenders[0];

  const allBenchmarkData = {
    'TND-2025-001': {
      boxplot: [
        {
          category: 'Steel',
          min: 1200,
          q1: 1450,
          median: 1600,
          q3: 1750,
          max: 2000,
          outliers: [2500, 2800, 900],
          vendorPrices: [
            { vendor: 'Acme', price: 1550, isOutlier: false },
            { vendor: 'BuildTech', price: 2500, isOutlier: true },
            { vendor: 'Global', price: 1620, isOutlier: false },
            { vendor: 'TechCon', price: 900, isOutlier: true },
          ],
        },
        {
          category: 'Cement',
          min: 800,
          q1: 950,
          median: 1100,
          q3: 1250,
          max: 1400,
          outliers: [1800, 650],
          vendorPrices: [
            { vendor: 'Acme', price: 1050, isOutlier: false },
            { vendor: 'BuildTech', price: 1150, isOutlier: false },
            { vendor: 'Global', price: 1800, isOutlier: true },
            { vendor: 'TechCon', price: 1100, isOutlier: false },
          ],
        },
        {
          category: 'Labor',
          min: 2500,
          q1: 2800,
          median: 3200,
          q3: 3500,
          max: 4000,
          outliers: [5000, 2000],
          vendorPrices: [
            { vendor: 'Acme', price: 3100, isOutlier: false },
            { vendor: 'BuildTech', price: 3300, isOutlier: false },
            { vendor: 'Global', price: 2000, isOutlier: true },
            { vendor: 'TechCon', price: 3250, isOutlier: false },
          ],
        },
        {
          category: 'Equipment',
          min: 5000,
          q1: 6000,
          median: 7500,
          q3: 9000,
          max: 10500,
          outliers: [13000, 4000],
          vendorPrices: [
            { vendor: 'Acme', price: 7200, isOutlier: false },
            { vendor: 'BuildTech', price: 8500, isOutlier: false },
            { vendor: 'Global', price: 7800, isOutlier: false },
            { vendor: 'TechCon', price: 13000, isOutlier: true },
          ],
        },
      ],
      accuracy: 94.2,
      dataPoints: 847,
    },
    'TND-2025-002': {
      boxplot: [
        {
          category: 'Solar Panels',
          min: 850,
          q1: 950,
          median: 1100,
          q3: 1250,
          max: 1400,
          outliers: [1800, 700],
          vendorPrices: [
            { vendor: 'SolarTech', price: 1050, isOutlier: false },
            { vendor: 'GreenEnergy', price: 1180, isOutlier: false },
            { vendor: 'Sunpower', price: 1800, isOutlier: true },
          ],
        },
        {
          category: 'Inverters',
          min: 200,
          q1: 250,
          median: 300,
          q3: 350,
          max: 400,
          outliers: [500, 150],
          vendorPrices: [
            { vendor: 'SolarTech', price: 280, isOutlier: false },
            { vendor: 'GreenEnergy', price: 320, isOutlier: false },
            { vendor: 'Sunpower', price: 500, isOutlier: true },
          ],
        },
        {
          category: 'Installation',
          min: 3000,
          q1: 3500,
          median: 4200,
          q3: 4800,
          max: 5500,
          outliers: [6500, 2500],
          vendorPrices: [
            { vendor: 'SolarTech', price: 4100, isOutlier: false },
            { vendor: 'GreenEnergy', price: 4400, isOutlier: false },
            { vendor: 'Sunpower', price: 2500, isOutlier: true },
          ],
        },
      ],
      accuracy: 91.5,
      dataPoints: 412,
    },
    'TND-2025-003': {
      boxplot: [
        {
          category: 'Laptops',
          min: 800,
          q1: 950,
          median: 1200,
          q3: 1450,
          max: 1600,
          outliers: [2000, 650],
          vendorPrices: [
            { vendor: 'TechSupply', price: 1150, isOutlier: false },
            { vendor: 'Office Solutions', price: 1280, isOutlier: false },
            { vendor: 'IT Hardware', price: 2000, isOutlier: true },
          ],
        },
        {
          category: 'Monitors',
          min: 200,
          q1: 250,
          median: 320,
          q3: 400,
          max: 480,
          outliers: [550, 150],
          vendorPrices: [
            { vendor: 'TechSupply', price: 310, isOutlier: false },
            { vendor: 'Office Solutions', price: 350, isOutlier: false },
            { vendor: 'IT Hardware', price: 330, isOutlier: false },
          ],
        },
        {
          category: 'Accessories',
          min: 50,
          q1: 75,
          median: 100,
          q3: 125,
          max: 150,
          outliers: [200, 30],
          vendorPrices: [
            { vendor: 'TechSupply', price: 95, isOutlier: false },
            { vendor: 'Office Solutions', price: 110, isOutlier: false },
            { vendor: 'IT Hardware', price: 30, isOutlier: true },
          ],
        },
      ],
      accuracy: 96.8,
      dataPoints: 1234,
    },
  };

  const currentBenchmarkData = allBenchmarkData[selectedTender as keyof typeof allBenchmarkData] || allBenchmarkData['TND-2025-001'];
  const boxplotData = currentBenchmarkData.boxplot;

  const [tableData, setTableData] = useState([
    {
      id: '1',
      item: 'Structural Steel (Grade A)',
      vendor: 'BuildTech Ltd',
      quotedPrice: 2500,
      marketMedian: 1600,
      deviation: 56.3,
      isOutlier: true,
      flagStatus: 'pending' as const,
    },
    {
      id: '2',
      item: 'Structural Steel (Grade A)',
      vendor: 'TechCon Industries',
      quotedPrice: 900,
      marketMedian: 1600,
      deviation: -43.8,
      isOutlier: true,
      flagStatus: 'pending' as const,
    },
    {
      id: '3',
      item: 'Portland Cement',
      vendor: 'Global Supplies',
      quotedPrice: 1800,
      marketMedian: 1100,
      deviation: 63.6,
      isOutlier: true,
      flagStatus: 'pending' as const,
    },
    {
      id: '4',
      item: 'Skilled Labor (Hourly)',
      vendor: 'Global Supplies',
      quotedPrice: 2000,
      marketMedian: 3200,
      deviation: -37.5,
      isOutlier: true,
      flagStatus: 'pending' as const,
    },
    {
      id: '5',
      item: 'Heavy Equipment Rental',
      vendor: 'TechCon Industries',
      quotedPrice: 13000,
      marketMedian: 7500,
      deviation: 73.3,
      isOutlier: true,
      flagStatus: 'pending' as const,
    },
    {
      id: '6',
      item: 'Structural Steel (Grade A)',
      vendor: 'Acme Corp',
      quotedPrice: 1550,
      marketMedian: 1600,
      deviation: -3.1,
      isOutlier: false,
      flagStatus: 'pending' as const,
    },
    {
      id: '7',
      item: 'Portland Cement',
      vendor: 'Acme Corp',
      quotedPrice: 1050,
      marketMedian: 1100,
      deviation: -4.5,
      isOutlier: false,
      flagStatus: 'pending' as const,
    },
  ]);

  const [insights, setInsights] = useState([
    {
      id: '1',
      type: 'anomaly' as const,
      severity: 'critical' as const,
      title: 'Extreme Price Variance Detected',
      description: 'TechCon Industries quoted 73% above market median for Heavy Equipment Rental. Historical data shows this vendor typically prices within 10% of market rates.',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: '2',
      type: 'anomaly' as const,
      severity: 'warning' as const,
      title: 'Unusually Low Labor Cost',
      description: 'Global Supplies labor rate is 37.5% below market median. Verify vendor capacity and quality standards.',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false,
    },
    {
      id: '3',
      type: 'trend' as const,
      severity: 'info' as const,
      title: 'Steel Prices Trending Upward',
      description: 'Market data shows a 12% increase in structural steel prices over the past 30 days. Current quotes are aligned with this trend.',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      isRead: false,
    },
    {
      id: '4',
      type: 'recommendation' as const,
      severity: 'info' as const,
      title: 'Benchmark Data Refreshed',
      description: 'Market benchmarks updated with 847 new data points from 23 recent tenders. Accuracy score improved to 94.2%.',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      isRead: true,
    },
  ]);

  const handleOutlierClick = (category: string, price: number) => {
    alert(`Outlier clicked: ${category} - $${price}`);
  };

  const handleFlagAction = (id: string, action: 'accept' | 'reject') => {
    setTableData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, flagStatus: action === 'accept' ? 'accepted' : 'rejected' } : row
      )
    );
  };

  const handleMarkAsRead = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, isRead: true } : insight
      )
    );
  };

  const handleApproveBenchmarks = () => {
    setIsApproved(true);
  };

  const handleRecompute = () => {
    alert('Recomputing benchmarks with latest market data...');
  };

  const outlierCount = tableData.filter((row) => row.isOutlier).length;
  const avgDeviation = tableData
    .filter((row) => row.isOutlier)
    .reduce((sum, row) => sum + Math.abs(row.deviation), 0) / outlierCount;

  return (
    <>
      <Sidebar currentPage="benchmark" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Benchmark Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  TenderIQ.Agent Active
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-200">
                  Benchmarking Phase
                </span>
              </div>
            </div>
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
                <p className="text-xs text-blue-600 mt-0.5">Personalize the Benchmark View</p>
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

            {(selectedDepartment !== 'all' || selectedCategory !== 'all' || dateRange.start) && (
              <div className="mt-5 pt-5 border-t border-blue-200/50 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-blue-700">
                  Showing benchmark for: {currentTender.title}
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
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedCategory('all');
                    setDateRange({ start: '', end: '' });
                  }}
                  className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <KPIWidget
              title="Avg Price Deviation"
              value={`${avgDeviation.toFixed(1)}%`}
              subtitle="For outliers only"
              icon={TrendingDown}
              trend={{ value: '5%', isPositive: true }}
            />

            <KPIWidget
              title="Outlier Count"
              value={outlierCount}
              subtitle={`Out of ${tableData.length} items`}
              icon={AlertTriangle}
            />

            <KPIWidget
              title="Benchmark Accuracy"
              value={`${currentBenchmarkData.accuracy}%`}
              subtitle={`Based on ${currentBenchmarkData.dataPoints} data points`}
              icon={Target}
              trend={{ value: '3%', isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6 items-stretch">
            <div className="col-span-2 flex">
              <MarketCurveBoxplot
                data={boxplotData}
                onOutlierClick={handleOutlierClick}
              />
            </div>

            <div className="flex">
              <InsightsFeed
                insights={insights}
                onMarkAsRead={handleMarkAsRead}
              />
            </div>
          </div>

          <div>
            <ComparativeTable
              data={tableData}
              onFlagAction={handleFlagAction}
            />
          </div>
        </main>

        <BenchmarkFooter
          tenderId={selectedTender}
          phase="Benchmarking"
          isApproved={isApproved}
          onApproveBenchmarks={handleApproveBenchmarks}
          onRecompute={handleRecompute}
        />
      </div>
    </>
  );
}
