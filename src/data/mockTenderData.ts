export interface TenderData {
  id: string;
  title: string;
  department: string;
  category: string;
  dateCreated: string;
  status: 'intake' | 'evaluation' | 'benchmark' | 'justification' | 'award' | 'completed';
  vendors: VendorData[];
  budget: number;
  estimatedValue: number;
  integrityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalies: AnomalyData[];
  validationStatus: 'passed' | 'warning' | 'failed';
  avgProcessingDays: number;
  complianceScore: number;
}

export interface VendorData {
  id: string;
  name: string;
  technicalScore: number;
  financialScore: number;
  esgScore: number;
  innovationScore: number;
  totalCost: number;
  reliability: number;
  riskLevel: 'low' | 'medium' | 'high';
  bidErrors: number;
  responseTime: number;
  pastPerformance: number;
}

export interface AnomalyData {
  type: 'price' | 'evaluator' | 'timeline' | 'bid_pattern' | 'scoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  status: 'open' | 'reviewing' | 'resolved';
}

export const MOCK_TENDERS: TenderData[] = [
  {
    id: 'TND-2025-001',
    title: 'Highway Expansion Al Qusais - Phase 2',
    department: 'Roads & Construction',
    category: 'WORKS',
    dateCreated: '2024-11-15',
    status: 'evaluation',
    budget: 12500000,
    estimatedValue: 11800000,
    integrityScore: 88,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 18,
    complianceScore: 94,
    vendors: [
      { id: 'v1', name: 'Al Futtaim Engineering', technicalScore: 92, financialScore: 88, esgScore: 85, innovationScore: 90, totalCost: 11750000, reliability: 96, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
      { id: 'v2', name: 'Arabtec Construction', technicalScore: 89, financialScore: 91, esgScore: 82, innovationScore: 87, totalCost: 11250000, reliability: 92, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 90 },
      { id: 'v3', name: 'CSCEC Middle East', technicalScore: 87, financialScore: 85, esgScore: 90, innovationScore: 88, totalCost: 12100000, reliability: 89, riskLevel: 'medium', bidErrors: 2, responseTime: 4, pastPerformance: 87 },
      { id: 'v4', name: 'Six Construct', technicalScore: 85, financialScore: 82, esgScore: 88, innovationScore: 92, totalCost: 11950000, reliability: 87, riskLevel: 'medium', bidErrors: 3, responseTime: 5, pastPerformance: 85 },
    ],
    anomalies: [
      { type: 'bid_pattern', severity: 'low', description: 'Six Construct bid submitted 2 hours before deadline', detectedAt: '2024-12-01', status: 'resolved' },
    ],
  },
  {
    id: 'TND-2025-002',
    title: 'Water Treatment Plant Upgrade - Khawaneej',
    department: 'Water Management',
    category: 'WORKS',
    dateCreated: '2024-12-01',
    status: 'benchmark',
    budget: 8750000,
    estimatedValue: 8200000,
    integrityScore: 92,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 22,
    complianceScore: 96,
    vendors: [
      { id: 'v5', name: 'Metito Utilities', technicalScore: 94, financialScore: 90, esgScore: 96, innovationScore: 91, totalCost: 8350000, reliability: 95, riskLevel: 'low', bidErrors: 0, responseTime: 1, pastPerformance: 96 },
      { id: 'v6', name: 'Veolia Water Technologies', technicalScore: 91, financialScore: 92, esgScore: 94, innovationScore: 89, totalCost: 8150000, reliability: 93, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
      { id: 'v7', name: 'Suez Water Technologies', technicalScore: 88, financialScore: 88, esgScore: 92, innovationScore: 87, totalCost: 8600000, reliability: 90, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 91 },
    ],
    anomalies: [],
  },
  {
    id: 'TND-2025-003',
    title: 'Smart City IT Infrastructure Integration',
    department: 'Administration',
    category: 'SERVICES',
    dateCreated: '2024-12-10',
    status: 'justification',
    budget: 4200000,
    estimatedValue: 3850000,
    integrityScore: 85,
    riskLevel: 'medium',
    validationStatus: 'warning',
    avgProcessingDays: 28,
    complianceScore: 88,
    vendors: [
      { id: 'v8', name: 'Cisco Systems MEA', technicalScore: 95, financialScore: 82, esgScore: 88, innovationScore: 96, totalCost: 4150000, reliability: 94, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 95 },
      { id: 'v9', name: 'Huawei Technologies', technicalScore: 93, financialScore: 91, esgScore: 80, innovationScore: 94, totalCost: 3650000, reliability: 88, riskLevel: 'medium', bidErrors: 2, responseTime: 6, pastPerformance: 86 },
      { id: 'v10', name: 'IBM Middle East', technicalScore: 90, financialScore: 85, esgScore: 92, innovationScore: 91, totalCost: 3980000, reliability: 91, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 92 },
    ],
    anomalies: [
      { type: 'price', severity: 'medium', description: 'Huawei bid 12.8% below market average, requires justification review', detectedAt: '2024-12-28', status: 'reviewing' },
      { type: 'timeline', severity: 'low', description: 'Evaluation phase exceeded target by 6 days', detectedAt: '2025-01-05', status: 'resolved' },
    ],
  },
  {
    id: 'TND-2025-004',
    title: 'Government Buildings HVAC Maintenance - Annual Contract',
    department: 'Maintenance',
    category: 'MAINTENANCE',
    dateCreated: '2024-12-15',
    status: 'award',
    budget: 2850000,
    estimatedValue: 2650000,
    integrityScore: 91,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 24,
    complianceScore: 95,
    vendors: [
      { id: 'v11', name: 'Emrill Services', technicalScore: 90, financialScore: 93, esgScore: 87, innovationScore: 84, totalCost: 2680000, reliability: 94, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 93 },
      { id: 'v12', name: 'Imdad Facilities Management', technicalScore: 88, financialScore: 94, esgScore: 85, innovationScore: 82, totalCost: 2590000, reliability: 91, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 90 },
    ],
    anomalies: [],
  },
  {
    id: 'TND-2025-005',
    title: 'Legal Advisory & Compliance Consulting Services',
    department: 'Legal Affairs',
    category: 'SERVICES',
    dateCreated: '2024-11-20',
    status: 'evaluation',
    budget: 1850000,
    estimatedValue: 1725000,
    integrityScore: 79,
    riskLevel: 'medium',
    validationStatus: 'warning',
    avgProcessingDays: 32,
    complianceScore: 82,
    vendors: [
      { id: 'v13', name: 'Al Tamimi & Company', technicalScore: 96, financialScore: 85, esgScore: 90, innovationScore: 87, totalCost: 1890000, reliability: 96, riskLevel: 'low', bidErrors: 0, responseTime: 1, pastPerformance: 97 },
      { id: 'v14', name: 'Baker McKenzie', technicalScore: 94, financialScore: 80, esgScore: 92, innovationScore: 85, totalCost: 1950000, reliability: 94, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 95 },
      { id: 'v15', name: 'Gulf Legal Associates', technicalScore: 88, financialScore: 92, esgScore: 84, innovationScore: 80, totalCost: 1650000, reliability: 85, riskLevel: 'medium', bidErrors: 3, responseTime: 8, pastPerformance: 82 },
    ],
    anomalies: [
      { type: 'evaluator', severity: 'high', description: 'Evaluator Ahmed Al-Rashid has professional connection with Gulf Legal Associates', detectedAt: '2025-01-08', status: 'reviewing' },
      { type: 'scoring', severity: 'medium', description: 'Variance in technical scores between evaluators exceeds 15 points', detectedAt: '2025-01-10', status: 'open' },
    ],
  },
  {
    id: 'TND-2025-006',
    title: 'Integrated Waste Collection & Recycling Services - 3 Year Contract',
    department: 'Waste Management',
    category: 'SERVICES',
    dateCreated: '2024-12-05',
    status: 'benchmark',
    budget: 15600000,
    estimatedValue: 14800000,
    integrityScore: 93,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 20,
    complianceScore: 97,
    vendors: [
      { id: 'v16', name: 'Bee\'ah Environmental Solutions', technicalScore: 93, financialScore: 91, esgScore: 98, innovationScore: 90, totalCost: 15100000, reliability: 95, riskLevel: 'low', bidErrors: 0, responseTime: 1, pastPerformance: 96 },
      { id: 'v17', name: 'Averda Waste Management', technicalScore: 90, financialScore: 93, esgScore: 95, innovationScore: 87, totalCost: 14650000, reliability: 92, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 93 },
    ],
    anomalies: [],
  },
  {
    id: 'TND-2025-007',
    title: 'Smart Parking System Implementation - Multi-Location',
    department: 'Parking Management',
    category: 'WORKS',
    dateCreated: '2024-11-25',
    status: 'evaluation',
    budget: 6800000,
    estimatedValue: 6350000,
    integrityScore: 72,
    riskLevel: 'high',
    validationStatus: 'warning',
    avgProcessingDays: 35,
    complianceScore: 75,
    vendors: [
      { id: 'v18', name: 'Siemens Mobility', technicalScore: 94, financialScore: 84, esgScore: 88, innovationScore: 95, totalCost: 6750000, reliability: 93, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
      { id: 'v19', name: 'Smart Parking Technologies', technicalScore: 88, financialScore: 91, esgScore: 82, innovationScore: 92, totalCost: 5950000, reliability: 82, riskLevel: 'high', bidErrors: 5, responseTime: 9, pastPerformance: 78 },
      { id: 'v20', name: 'ParkTech Solutions', technicalScore: 85, financialScore: 89, esgScore: 80, innovationScore: 88, totalCost: 6280000, reliability: 86, riskLevel: 'medium', bidErrors: 2, responseTime: 5, pastPerformance: 84 },
    ],
    anomalies: [
      { type: 'bid_pattern', severity: 'high', description: 'Smart Parking Technologies bid 12.4% below closest competitor', detectedAt: '2024-12-18', status: 'open' },
      { type: 'price', severity: 'critical', description: 'Unusual pricing pattern detected - equipment costs 40% below market rate', detectedAt: '2024-12-20', status: 'open' },
      { type: 'evaluator', severity: 'medium', description: 'Two evaluators showed consistent bias towards same vendor', detectedAt: '2025-01-05', status: 'reviewing' },
    ],
  },
  {
    id: 'TND-2025-008',
    title: 'Landscape Enhancement & Irrigation System - Public Parks',
    department: 'Landscape & Irrigation',
    category: 'WORKS',
    dateCreated: '2025-01-05',
    status: 'intake',
    budget: 3200000,
    estimatedValue: 3050000,
    integrityScore: 95,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 8,
    complianceScore: 98,
    vendors: [
      { id: 'v21', name: 'Desert Group Landscaping', technicalScore: 91, financialScore: 90, esgScore: 94, innovationScore: 87, totalCost: 3080000, reliability: 92, riskLevel: 'low', bidErrors: 0, responseTime: 1, pastPerformance: 93 },
      { id: 'v22', name: 'Green Emirates', technicalScore: 88, financialScore: 92, esgScore: 91, innovationScore: 85, totalCost: 2980000, reliability: 89, riskLevel: 'low', bidErrors: 1, responseTime: 2, pastPerformance: 90 },
    ],
    anomalies: [],
  },
  {
    id: 'TND-2025-009',
    title: 'Medical Equipment & Diagnostic Systems Procurement',
    department: 'Healthcare Management',
    category: 'GOODS',
    dateCreated: '2024-12-20',
    status: 'evaluation',
    budget: 9500000,
    estimatedValue: 9100000,
    integrityScore: 87,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 19,
    complianceScore: 92,
    vendors: [
      { id: 'v23', name: 'Siemens Healthineers', technicalScore: 96, financialScore: 85, esgScore: 90, innovationScore: 94, totalCost: 9350000, reliability: 96, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 97 },
      { id: 'v24', name: 'GE Healthcare Arabia', technicalScore: 93, financialScore: 88, esgScore: 88, innovationScore: 92, totalCost: 8950000, reliability: 94, riskLevel: 'low', bidErrors: 0, responseTime: 3, pastPerformance: 95 },
      { id: 'v25', name: 'Philips Healthcare', technicalScore: 91, financialScore: 86, esgScore: 91, innovationScore: 90, totalCost: 9180000, reliability: 92, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 93 },
    ],
    anomalies: [
      { type: 'timeline', severity: 'low', description: 'Technical evaluation delayed by 3 days due to additional testing requirements', detectedAt: '2025-01-08', status: 'resolved' },
    ],
  },
  {
    id: 'TND-2025-010',
    title: 'Electronic Toll Collection System Upgrade',
    department: 'Tolls Management',
    category: 'WORKS',
    dateCreated: '2024-11-10',
    status: 'benchmark',
    budget: 18500000,
    estimatedValue: 17200000,
    integrityScore: 65,
    riskLevel: 'high',
    validationStatus: 'failed',
    avgProcessingDays: 42,
    complianceScore: 68,
    vendors: [
      { id: 'v26', name: 'Kapsch TrafficCom', technicalScore: 92, financialScore: 88, esgScore: 85, innovationScore: 96, totalCost: 17850000, reliability: 93, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
      { id: 'v27', name: 'Thales Digital Solutions', technicalScore: 90, financialScore: 91, esgScore: 87, innovationScore: 93, totalCost: 17250000, reliability: 91, riskLevel: 'low', bidErrors: 1, responseTime: 3, pastPerformance: 92 },
      { id: 'v28', name: 'Toll Systems International', technicalScore: 78, financialScore: 95, esgScore: 72, innovationScore: 80, totalCost: 14950000, reliability: 72, riskLevel: 'high', bidErrors: 8, responseTime: 15, pastPerformance: 68 },
    ],
    anomalies: [
      { type: 'price', severity: 'critical', description: 'Toll Systems International bid 13.3% below closest competitor - red flag', detectedAt: '2024-12-01', status: 'open' },
      { type: 'bid_pattern', severity: 'critical', description: 'Multiple document inconsistencies and calculation errors in TSI bid', detectedAt: '2024-12-05', status: 'open' },
      { type: 'evaluator', severity: 'high', description: 'Evaluator scoring patterns show potential bias', detectedAt: '2024-12-15', status: 'reviewing' },
      { type: 'scoring', severity: 'high', description: 'Financial scores vary by 18 points between evaluators for same vendor', detectedAt: '2024-12-18', status: 'open' },
    ],
  },
  {
    id: 'TND-2025-011',
    title: 'HR Management System & Payroll Integration',
    department: 'HR',
    category: 'SERVICES',
    dateCreated: '2025-01-08',
    status: 'intake',
    budget: 2400000,
    estimatedValue: 2250000,
    integrityScore: 45,
    riskLevel: 'critical',
    validationStatus: 'failed',
    avgProcessingDays: 5,
    complianceScore: 42,
    vendors: [
      { id: 'v29', name: 'Oracle HCM Cloud', technicalScore: 94, financialScore: 82, esgScore: 88, innovationScore: 92, totalCost: 2380000, reliability: 95, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 96 },
      { id: 'v30', name: 'SAP SuccessFactors', technicalScore: 92, financialScore: 85, esgScore: 90, innovationScore: 90, totalCost: 2420000, reliability: 94, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 95 },
      { id: 'v31', name: 'Tech Solutions FZ', technicalScore: 72, financialScore: 96, esgScore: 65, innovationScore: 70, totalCost: 1850000, reliability: 58, riskLevel: 'high', bidErrors: 12, responseTime: 18, pastPerformance: 55 },
    ],
    anomalies: [
      { type: 'price', severity: 'critical', description: 'Tech Solutions FZ bid 23.6% below market - unrealistic pricing', detectedAt: '2025-01-09', status: 'open' },
      { type: 'bid_pattern', severity: 'critical', description: 'Numerous missing documents and incomplete technical specifications', detectedAt: '2025-01-09', status: 'open' },
      { type: 'evaluator', severity: 'critical', description: 'Potential conflict of interest detected with vendor relationship', detectedAt: '2025-01-10', status: 'open' },
    ],
  },
  {
    id: 'TND-2025-012',
    title: 'Public Safety Surveillance System Enhancement',
    department: 'City Violation / Enforcement',
    category: 'WORKS',
    dateCreated: '2024-12-12',
    status: 'justification',
    budget: 11200000,
    estimatedValue: 10500000,
    integrityScore: 89,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 26,
    complianceScore: 93,
    vendors: [
      { id: 'v32', name: 'Hikvision Middle East', technicalScore: 90, financialScore: 92, esgScore: 82, innovationScore: 89, totalCost: 10350000, reliability: 88, riskLevel: 'medium', bidErrors: 1, responseTime: 4, pastPerformance: 87 },
      { id: 'v33', name: 'Honeywell Security', technicalScore: 93, financialScore: 87, esgScore: 90, innovationScore: 91, totalCost: 10950000, reliability: 93, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
      { id: 'v34', name: 'Axis Communications', technicalScore: 91, financialScore: 89, esgScore: 88, innovationScore: 90, totalCost: 10680000, reliability: 91, riskLevel: 'low', bidErrors: 0, responseTime: 3, pastPerformance: 92 },
    ],
    anomalies: [],
  },
  {
    id: 'TND-2025-013',
    title: 'Citizen Services Digital Portal Development',
    department: 'Citizen-Centric Services',
    category: 'SERVICES',
    dateCreated: '2024-11-28',
    status: 'award',
    budget: 5600000,
    estimatedValue: 5200000,
    integrityScore: 94,
    riskLevel: 'low',
    validationStatus: 'passed',
    avgProcessingDays: 23,
    complianceScore: 96,
    vendors: [
      { id: 'v35', name: 'Etisalat Digital', technicalScore: 94, financialScore: 90, esgScore: 91, innovationScore: 95, totalCost: 5380000, reliability: 95, riskLevel: 'low', bidErrors: 0, responseTime: 1, pastPerformance: 96 },
      { id: 'v36', name: 'du Enterprise Solutions', technicalScore: 91, financialScore: 92, esgScore: 89, innovationScore: 92, totalCost: 5150000, reliability: 93, riskLevel: 'low', bidErrors: 0, responseTime: 2, pastPerformance: 94 },
    ],
    anomalies: [],
  },
];

export function getTenderById(tenderId: string): TenderData | undefined {
  return MOCK_TENDERS.find(t => t.id === tenderId);
}

export function getTendersByDepartment(department: string): TenderData[] {
  if (department === 'all') return MOCK_TENDERS;
  return MOCK_TENDERS.filter(t => t.department === department);
}

export function getTendersByCategory(category: string): TenderData[] {
  if (category === 'all') return MOCK_TENDERS;
  return MOCK_TENDERS.filter(t => t.category === category);
}

export function getTendersByStatus(status: string): TenderData[] {
  if (status === 'all') return MOCK_TENDERS;
  return MOCK_TENDERS.filter(t => t.status === status);
}

export function getFilteredTenders(department: string, category: string, status?: string): TenderData[] {
  return MOCK_TENDERS.filter(t => {
    if (department !== 'all' && t.department !== department) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (status && status !== 'all' && t.status !== status) return false;
    return true;
  });
}

export function calculateKPIsForTenders(tenders: TenderData[]) {
  if (tenders.length === 0) {
    return {
      avgTechnicalScore: 0,
      avgFinancialScore: 0,
      avgReliability: 0,
      totalBudget: 0,
      totalEstimatedValue: 0,
      avgSavings: 0,
      avgIntegrityScore: 0,
      criticalAnomalies: 0,
      avgProcessingDays: 0,
      avgComplianceScore: 0,
    };
  }

  const allVendors = tenders.flatMap(t => t.vendors);
  const allAnomalies = tenders.flatMap(t => t.anomalies);

  return {
    avgTechnicalScore: allVendors.reduce((sum, v) => sum + v.technicalScore, 0) / allVendors.length,
    avgFinancialScore: allVendors.reduce((sum, v) => sum + v.financialScore, 0) / allVendors.length,
    avgReliability: allVendors.reduce((sum, v) => sum + v.reliability, 0) / allVendors.length,
    totalBudget: tenders.reduce((sum, t) => sum + t.budget, 0),
    totalEstimatedValue: tenders.reduce((sum, t) => sum + t.estimatedValue, 0),
    avgSavings: tenders.reduce((sum, t) => sum + (t.budget - t.estimatedValue), 0) / tenders.length,
    avgIntegrityScore: tenders.reduce((sum, t) => sum + t.integrityScore, 0) / tenders.length,
    criticalAnomalies: allAnomalies.filter(a => a.severity === 'critical').length,
    avgProcessingDays: tenders.reduce((sum, t) => sum + t.avgProcessingDays, 0) / tenders.length,
    avgComplianceScore: tenders.reduce((sum, t) => sum + t.complianceScore, 0) / tenders.length,
  };
}

export function getAnomaliesByTender(tenderId: string): AnomalyData[] {
  const tender = getTenderById(tenderId);
  return tender?.anomalies || [];
}

export function getAllAnomalies(): AnomalyData[] {
  return MOCK_TENDERS.flatMap(t => t.anomalies);
}

export function getHighRiskTenders(): TenderData[] {
  return MOCK_TENDERS.filter(t => t.riskLevel === 'high' || t.riskLevel === 'critical');
}
