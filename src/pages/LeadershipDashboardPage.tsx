import { useState, useMemo, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { KPIWidget } from '../components/KPIWidget';
import { KPIDetailModal } from '../components/KPIDetailModal';
import { IntegrityHeatmap } from '../components/IntegrityHeatmap';
import { DurationTrendline } from '../components/DurationTrendline';
import { ComplianceLeaderboard } from '../components/ComplianceLeaderboard';
import { LeadershipFooter } from '../components/LeadershipFooter';
import { Activity, Clock, Target, AlertTriangle, Filter, Users, TrendingUp, Award, ShieldAlert } from 'lucide-react';
import { MOCK_TENDERS, VendorData } from '../data/mockTenderData';
import { getActiveTendersData, ActiveTendersData, getAvgEvalDurationData, AvgEvalDurationData, getComplianceRateData, ComplianceRateData, getCriticalAlertsData, CriticalAlertsData, getIntegrityHeatmapData, HeatmapDataItem, getEvaluationDurationTrendData, EvaluationDurationTrendItem, getComplianceLeaderboardData, ComplianceLeaderboardItem, getVendorAnalyticsData, VendorAnalyticsData, getAvgBidValueData, AvgBidValueData, getTopPerformerData, TopPerformerData } from '../services/api';

interface LeadershipDashboardPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding') => void;
}

export function LeadershipDashboardPage({ onNavigate }: LeadershipDashboardPageProps) {
  const [tenderId] = useState('ALL-DEPARTMENTS');
  const [phase] = useState('Executive Overview');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [activeModal, setActiveModal] = useState<'tenders' | 'duration' | 'compliance' | 'alerts' | 'vendors' | 'avgBid' | 'topVendor' | 'riskVendors' | null>(null);
  const [activeTendersData, setActiveTendersData] = useState<ActiveTendersData | null>(null);
  const [isLoadingTenders, setIsLoadingTenders] = useState(true);
  const [tendersError, setTendersError] = useState<string | null>(null);
  const [avgEvalDurationData, setAvgEvalDurationData] = useState<AvgEvalDurationData | null>(null);
  const [isLoadingDuration, setIsLoadingDuration] = useState(true);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [complianceRateData, setComplianceRateData] = useState<ComplianceRateData | null>(null);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(true);
  const [complianceError, setComplianceError] = useState<string | null>(null);
  const [criticalAlertsData, setCriticalAlertsData] = useState<CriticalAlertsData | null>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(true);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [durationTrendData, setDurationTrendData] = useState<EvaluationDurationTrendItem[]>([]);
  const [isLoadingDurationTrend, setIsLoadingDurationTrend] = useState(true);
  const [durationTrendError, setDurationTrendError] = useState<string | null>(null);
  const [complianceLeaderboardData, setComplianceLeaderboardData] = useState<ComplianceLeaderboardItem[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [vendorAnalyticsData, setVendorAnalyticsData] = useState<VendorAnalyticsData | null>(null);
  const [isLoadingVendorAnalytics, setIsLoadingVendorAnalytics] = useState(true);
  const [vendorAnalyticsError, setVendorAnalyticsError] = useState<string | null>(null);
  const [avgBidValueData, setAvgBidValueData] = useState<AvgBidValueData | null>(null);
  const [isLoadingAvgBidValue, setIsLoadingAvgBidValue] = useState(true);
  const [avgBidValueError, setAvgBidValueError] = useState<string | null>(null);
  const [topPerformerData, setTopPerformerData] = useState<TopPerformerData | null>(null);
  const [isLoadingTopPerformer, setIsLoadingTopPerformer] = useState(true);
  const [topPerformerError, setTopPerformerError] = useState<string | null>(null);
  
  // Refs to prevent duplicate calls in React StrictMode
  const hasFetchedTendersRef = useRef(false);
  const hasFetchedDurationRef = useRef(false);
  const hasFetchedComplianceRef = useRef(false);
  const hasFetchedAlertsRef = useRef(false);
  const hasFetchedHeatmapRef = useRef(false);
  const hasFetchedDurationTrendRef = useRef(false);
  const hasFetchedLeaderboardRef = useRef(false);
  const hasFetchedVendorAnalyticsRef = useRef(false);

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

  // Transform heatmap API data to IntegrityHeatmap format
  const integrityData = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) {
      // Return empty array if no data, component will handle it
      return [];
    }

    return heatmapData
      .filter(item => item.integrityScore !== null && item.integrityScore !== undefined)
      .map(item => {
        const score = item.integrityScore || 0;
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        
        // Determine risk level based on integrity score
        if (score >= 80) {
          riskLevel = 'low';
        } else if (score >= 60) {
          riskLevel = 'medium';
        } else if (score >= 40) {
          riskLevel = 'high';
        } else {
          riskLevel = 'critical';
        }

        return {
          tenderId: item.tenderId || '',
          department: item.departmentName || '',
          integrityScore: Math.round(score),
          riskLevel,
          phase: item.phase || '',
        };
      });
  }, [heatmapData]);

  // Transform duration trend API data to DurationTrendline format
  // Aggregate by month if there are multiple records per month
  const durationData = useMemo(() => {
    if (!durationTrendData || durationTrendData.length === 0) {
      // Return empty array if no data, component will handle it
      return [];
    }

    // Group by month and calculate averages
    const monthMap = new Map<string, { actualDurations: number[]; targetDuration: number; fasterVsTargets: number[] }>();
    
    durationTrendData.forEach(item => {
      if (item.actualDuration === null || item.actualDuration === undefined) {
        return; // Skip null values
      }
      
      const month = item.month || '';
      if (!month) return;
      
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          actualDurations: [],
          targetDuration: item.targetDuration || 40,
          fasterVsTargets: [],
        });
      }
      
      const monthData = monthMap.get(month)!;
      monthData.actualDurations.push(item.actualDuration);
      if (item.fasterVsTarget !== null && item.fasterVsTarget !== undefined) {
        monthData.fasterVsTargets.push(item.fasterVsTarget);
      }
    });
    
    // Convert map to array and calculate averages
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const aggregated = Array.from(monthMap.entries())
      .map(([month, data]) => {
        const avgActualDuration = data.actualDurations.length > 0
          ? data.actualDurations.reduce((sum, val) => sum + val, 0) / data.actualDurations.length
          : 0;
        const avgFasterVsTarget = data.fasterVsTargets.length > 0
          ? data.fasterVsTargets.reduce((sum, val) => sum + val, 0) / data.fasterVsTargets.length
          : 0;
        
        return {
          period: month,
          avgDuration: Math.round(avgActualDuration * 10) / 10, // Round to 1 decimal
          targetDuration: data.targetDuration,
          variance: Math.round(avgFasterVsTarget * 10) / 10, // Round to 1 decimal
        };
      })
      .sort((a, b) => {
        // Sort by month order
        return months.indexOf(a.period) - months.indexOf(b.period);
      });
    
    return aggregated;
  }, [durationTrendData]);

  // Transform compliance leaderboard API data to ComplianceLeaderboard format
  const complianceData = useMemo(() => {
    if (!complianceLeaderboardData || complianceLeaderboardData.length === 0) {
      return [];
    }

    return complianceLeaderboardData.map((item, index) => {
      // Parse tendersFormatted (e.g., "27/28") to get compliantTenders and totalTenders
      const [compliantTenders, totalTenders] = item.tendersFormatted
        ? item.tendersFormatted.split('/').map(Number)
        : [0, 0];

      return {
        departmentName: item.departmentName || '',
        complianceScore: item.deptScore || 0,
        totalTenders: totalTenders || 0,
        compliantTenders: compliantTenders || 0,
        onTimeRate: item.onTimePercent || 0,
        policyAdherence: item.policyPercent || 0,
        riskMitigation: item.riskPercent || 0,
        rank: index + 1, // Rank is based on order (already sorted by deptScore DESC)
      };
    });
  }, [complianceLeaderboardData]);

  const handleExportInsights = () => {
    alert('Exporting executive insights report...');
  };

  const handleScheduleReview = () => {
    alert('Opening review scheduling dialog...');
  };

  // Fetch active tenders data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedTendersRef.current) {
      return;
    }
    hasFetchedTendersRef.current = true;

    const fetchActiveTenders = async () => {
      try {
        console.log('Starting to fetch active tenders data...');
        setIsLoadingTenders(true);
        setTendersError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        console.log('Token found, making API call...');
        
        const data = await getActiveTendersData();
        console.log('Active tenders data received:', data);
        setActiveTendersData(data);
      } catch (error) {
        console.error('Error fetching active tenders:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch active tenders data';
        setTendersError(errorMessage);
        console.error('Error details:', {
          message: errorMessage,
          error: error
        });
      } finally {
        setIsLoadingTenders(false);
      }
    };

    fetchActiveTenders();
  }, []);

  // Fetch average evaluation duration data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedDurationRef.current) {
      return;
    }
    hasFetchedDurationRef.current = true;

    const fetchAvgEvalDuration = async () => {
      try {
        console.log('Starting to fetch avg eval duration data...');
        setIsLoadingDuration(true);
        setDurationError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getAvgEvalDurationData();
        console.log('Avg eval duration data received:', data);
        setAvgEvalDurationData(data);
      } catch (error) {
        console.error('Error fetching avg eval duration:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch avg eval duration data';
        setDurationError(errorMessage);
      } finally {
        setIsLoadingDuration(false);
      }
    };

    fetchAvgEvalDuration();
  }, []);

  // Fetch compliance rate data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedComplianceRef.current) {
      return;
    }
    hasFetchedComplianceRef.current = true;

    const fetchComplianceRate = async () => {
      try {
        console.log('Starting to fetch compliance rate data...');
        setIsLoadingCompliance(true);
        setComplianceError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getComplianceRateData();
        console.log('Compliance rate data received:', data);
        setComplianceRateData(data);
      } catch (error) {
        console.error('Error fetching compliance rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch compliance rate data';
        setComplianceError(errorMessage);
      } finally {
        setIsLoadingCompliance(false);
      }
    };

    fetchComplianceRate();
  }, []);

  // Fetch critical alerts data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedAlertsRef.current) {
      return;
    }
    hasFetchedAlertsRef.current = true;

    const fetchCriticalAlerts = async () => {
      try {
        console.log('Starting to fetch critical alerts data...');
        setIsLoadingAlerts(true);
        setAlertsError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getCriticalAlertsData();
        console.log('Critical alerts data received:', data);
        setCriticalAlertsData(data);
      } catch (error) {
        console.error('Error fetching critical alerts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch critical alerts data';
        setAlertsError(errorMessage);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchCriticalAlerts();
  }, []);

  // Fetch integrity heatmap data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedHeatmapRef.current) {
      return;
    }
    hasFetchedHeatmapRef.current = true;

    const fetchHeatmapData = async () => {
      try {
        console.log('Starting to fetch integrity heatmap data...');
        setIsLoadingHeatmap(true);
        setHeatmapError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getIntegrityHeatmapData();
        console.log('Integrity heatmap data received:', data);
        setHeatmapData(data);
      } catch (error) {
        console.error('Error fetching integrity heatmap:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch integrity heatmap data';
        setHeatmapError(errorMessage);
      } finally {
        setIsLoadingHeatmap(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Fetch evaluation duration trend data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedDurationTrendRef.current) {
      return;
    }
    hasFetchedDurationTrendRef.current = true;

    const fetchDurationTrendData = async () => {
      try {
        console.log('Starting to fetch evaluation duration trend data...');
        setIsLoadingDurationTrend(true);
        setDurationTrendError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getEvaluationDurationTrendData();
        console.log('Evaluation duration trend data received:', data);
        setDurationTrendData(data);
      } catch (error) {
        console.error('Error fetching evaluation duration trend:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch evaluation duration trend data';
        setDurationTrendError(errorMessage);
      } finally {
        setIsLoadingDurationTrend(false);
      }
    };

    fetchDurationTrendData();
  }, []);

  // Fetch compliance leaderboard data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedLeaderboardRef.current) {
      return;
    }
    hasFetchedLeaderboardRef.current = true;

    const fetchLeaderboardData = async () => {
      try {
        console.log('Starting to fetch compliance leaderboard data...');
        setIsLoadingLeaderboard(true);
        setLeaderboardError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getComplianceLeaderboardData();
        console.log('Compliance leaderboard data received:', data);
        setComplianceLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching compliance leaderboard:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch compliance leaderboard data';
        setLeaderboardError(errorMessage);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Fetch vendor analytics data from API
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasFetchedVendorAnalyticsRef.current) {
      return;
    }
    hasFetchedVendorAnalyticsRef.current = true;

    const fetchVendorAnalytics = async () => {
      try {
        console.log('Starting to fetch vendor analytics data...');
        setIsLoadingVendorAnalytics(true);
        setVendorAnalyticsError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        const data = await getVendorAnalyticsData();
        console.log('Vendor analytics data received:', data);
        setVendorAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching vendor analytics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendor analytics data';
        setVendorAnalyticsError(errorMessage);
      } finally {
        setIsLoadingVendorAnalytics(false);
      }
    };

    fetchVendorAnalytics();
  }, []);

  // Fetch average bid value data from API
  useEffect(() => {
    const fetchAvgBidValue = async () => {
      try {
        console.log('Starting to fetch avg bid value data...');
        setIsLoadingAvgBidValue(true);
        setAvgBidValueError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        // Map filter values to API parameters
        const deptId = selectedDepartment !== 'all' ? selectedDepartment : undefined;
        const catId = selectedCategory !== 'all' ? selectedCategory : undefined;
        const status = selectedPhase !== 'all' ? selectedPhase : undefined;
        const riskLevel = selectedRiskLevel !== 'all' ? selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1) : undefined;
        
        const data = await getAvgBidValueData(deptId, catId, status, riskLevel);
        console.log('Avg bid value data received:', data);
        setAvgBidValueData(data);
      } catch (error) {
        console.error('Error fetching avg bid value:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch avg bid value data';
        setAvgBidValueError(errorMessage);
      } finally {
        setIsLoadingAvgBidValue(false);
      }
    };

    fetchAvgBidValue();
  }, [selectedDepartment, selectedCategory, selectedPhase, selectedRiskLevel]);

  // Fetch top performer data from API
  useEffect(() => {
    const fetchTopPerformer = async () => {
      try {
        console.log('Starting to fetch top performer data...');
        setIsLoadingTopPerformer(true);
        setTopPerformerError(null);
        
        // Check if token is available
        const token = import.meta.env.VITE_API_AUTHORIZATION_TOKEN;
        if (!token) {
          throw new Error('VITE_API_AUTHORIZATION_TOKEN is not set. Please create a .env file with your token.');
        }
        
        // Map filter values to API parameters
        const deptId = selectedDepartment !== 'all' ? selectedDepartment : undefined;
        const catId = selectedCategory !== 'all' ? selectedCategory : undefined;
        const status = selectedPhase !== 'all' ? selectedPhase : undefined;
        const riskLevel = selectedRiskLevel !== 'all' ? selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1) : undefined;
        
        const data = await getTopPerformerData(deptId, catId, status, riskLevel);
        console.log('Top performer data received:', data);
        setTopPerformerData(data);
      } catch (error) {
        console.error('Error fetching top performer:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch top performer data';
        setTopPerformerError(errorMessage);
      } finally {
        setIsLoadingTopPerformer(false);
      }
    };

    fetchTopPerformer();
  }, [selectedDepartment, selectedCategory, selectedPhase, selectedRiskLevel]);

  // Format total estimated value
  const formatTotalValue = (value: number | null | undefined): string => {
    if (!value) return 'AED 0';
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(2)}K`;
    }
    return `AED ${value.toFixed(2)}`;
  };

  // Format average time in system
  const formatAvgTime = (days: number | null | undefined): string => {
    if (!days && days !== 0) return '0 days';
    const rounded = Math.round(days);
    return `${rounded} day${rounded !== 1 ? 's' : ''}`;
  };

  // Format percentage
  const formatPercentage = (value: number | null | undefined): string => {
    if (!value && value !== 0) return '0%';
    return `${value.toFixed(1)}%`;
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

  // Use API data for vendor analytics, fallback to calculated values for missing fields
  const vendorAnalytics = useMemo(() => {
    // Use API data if available
    if (vendorAnalyticsData) {
      // Parse top3Vendors (comma-separated string) to get the first one
      const topVendorName = vendorAnalyticsData.top3Vendors 
        ? vendorAnalyticsData.top3Vendors.split(',')[0].trim()
        : 'N/A';

      return {
        totalVendors: vendorAnalyticsData.activeVendors || 0,
        avgBidValue: 0, // Not available in API, keeping 0 or could calculate from mock data
        topVendor: {
          name: topVendorName,
          avgReliability: 0, // Not available in API
          bids: 0,
          avgTechnical: 0,
          avgFinancial: 0,
          totalValue: 0,
          bidErrors: 0,
          tenders: [] as string[],
        },
        riskVendors: 0, // Not available in API
        tendersParticipated: vendorAnalyticsData.tendersParticipated || 0,
        totalBids: vendorAnalyticsData.totalBids || 0,
        avgBidsPerTender: vendorAnalyticsData.avgBidsPerTender || 0,
        categories: vendorAnalyticsData.categories || {},
        allVendors: [] as any[], // Empty array for API data
        allVendorStats: [] as any[], // Empty array for API data
      };
    }

    // Fallback to calculated values from mock data
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
      tendersParticipated: filteredTenders.length,
      totalBids: allVendors.length,
      avgBidsPerTender: filteredTenders.length > 0 ? allVendors.length / filteredTenders.length : 0,
      categories: {},
    };
  }, [filteredTenders, vendorAnalyticsData]);

  return (
    <>
      <Sidebar 
        currentPage="leadership" 
        onNavigate={onNavigate} 
      />
      <div className="app-shell min-h-screen bg-gray-50 pb-24">
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
              value={isLoadingTenders ? '...' : (activeTendersData?.active_tenders?.toString() || '0')}
              subtitle={tendersError ? 'Error loading data' : (activeTendersData ? 'Across all departments' : 'Loading...')}
              icon={Activity}
              trend={activeTendersData ? { value: '12%', isPositive: true } : undefined}
              onClick={() => setActiveModal('tenders')}
            />

            <KPIWidget
              title="Avg Eval Duration"
              value={isLoadingDuration ? '...' : (avgEvalDurationData ? formatAvgTime(avgEvalDurationData.avg_eval_duration) : '0 days')}
              subtitle={durationError ? 'Error loading data' : (avgEvalDurationData ? `${Math.round(avgEvalDurationData.time_saved_days || 0)} days under target` : 'Loading...')}
              icon={Clock}
              trend={avgEvalDurationData ? { value: `${Math.abs(avgEvalDurationData.faster_pct || 0).toFixed(0)}%`, isPositive: (avgEvalDurationData.faster_pct || 0) > 0 } : undefined}
              onClick={() => setActiveModal('duration')}
            />

            <KPIWidget
              title="Compliance Rate"
              value={isLoadingCompliance ? '...' : (complianceRateData ? `${complianceRateData.compliance_rate_pct.toFixed(1)}%` : '0%')}
              subtitle={complianceError ? 'Error loading data' : (complianceRateData ? `${complianceRateData.compliant_tenders} of ${complianceRateData.total_tenders} tenders compliant` : 'Loading...')}
              icon={Target}
              onClick={() => setActiveModal('compliance')}
            />

            <KPIWidget
              title="Critical Alerts"
              value={isLoadingAlerts ? '...' : (criticalAlertsData?.critical_alerts?.toString() || '0')}
              subtitle={alertsError ? 'Error loading data' : (criticalAlertsData ? 'Requires immediate attention' : 'Loading...')}
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
            <div className="grid grid-cols-3 gap-6">
            <KPIWidget
              title="Active Vendors"
              value={isLoadingVendorAnalytics ? '...' : vendorAnalytics.totalVendors.toString()}
              subtitle={vendorAnalyticsError ? 'Error loading data' : (vendorAnalyticsData ? `Across ${vendorAnalytics.tendersParticipated || filteredTenders.length} tender${(vendorAnalytics.tendersParticipated || filteredTenders.length) !== 1 ? 's' : ''}` : `Across ${filteredTenders.length} tender${filteredTenders.length !== 1 ? 's' : ''}`)}
              icon={Users}
              onClick={() => setActiveModal('vendors')}
            />

              <KPIWidget
                title="Avg Bid Value"
                value={isLoadingAvgBidValue ? '...' : (avgBidValueData?.avgBidValue ? formatTotalValue(avgBidValueData.avgBidValue) : 'AED 0.00M')}
                subtitle={avgBidValueError ? 'Error loading data' : (avgBidValueData ? 'Mean proposal amount' : 'Loading...')}
                icon={TrendingUp}
                onClick={() => setActiveModal('avgBid')}
              />

              <KPIWidget
                title="Top Performer"
                value={isLoadingTopPerformer ? '...' : (topPerformerData?.vendorName || 'N/A')}
                subtitle={topPerformerError ? 'Error loading data' : (topPerformerData ? `${topPerformerData.reliabilityScore?.toFixed(1) || '0.0'}% reliability` : 'Loading...')}
                icon={Award}
                onClick={() => setActiveModal('topVendor')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Integrity Score Heatmap</h2>
              {isLoadingHeatmap ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading heatmap data...</div>
                </div>
              ) : heatmapError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Error: {heatmapError}</div>
                </div>
              ) : (
                <IntegrityHeatmap data={filteredIntegrityData} />
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Evaluation Duration Trend</h2>
              {isLoadingDurationTrend ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading trend data...</div>
                </div>
              ) : durationTrendError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500">Error: {durationTrendError}</div>
                </div>
              ) : durationData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">No trend data available</div>
                </div>
              ) : (
                <DurationTrendline data={durationData} />
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Department Compliance Leaderboard</h2>
            {isLoadingLeaderboard ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading leaderboard data...</div>
              </div>
            ) : leaderboardError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {leaderboardError}</div>
              </div>
            ) : complianceData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No leaderboard data available</div>
              </div>
            ) : (
              <ComplianceLeaderboard data={filteredComplianceData} />
            )}
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
        mainValue={activeTendersData?.active_tenders?.toString() || '0'}
        details={activeTendersData ? [
          { 
            label: 'Intake Phase', 
            value: activeTendersData.intake_total.toString(), 
            description: `${activeTendersData.intake_pending_validation} pending validation, ${activeTendersData.intake_normalized} normalized` 
          },
          { 
            label: 'Evaluation Phase', 
            value: (activeTendersData.evaluation_scoring + activeTendersData.evaluation_review).toString(), 
            description: `${activeTendersData.evaluation_scoring} in scoring, ${activeTendersData.evaluation_review} in review` 
          },
          { 
            label: 'Benchmark Phase', 
            value: activeTendersData.benchmark_total.toString(), 
            description: `${activeTendersData.benchmark_market_analysis} market analysis, ${activeTendersData.benchmark_outlier_review} outlier review` 
          },
          { 
            label: 'Award Phase', 
            value: activeTendersData.award_total.toString(), 
            description: `${activeTendersData.award_final_approval} final approval, ${activeTendersData.award_contract_prep} contract prep` 
          },
          { 
            label: 'Justification Phase', 
            value: activeTendersData.justification_total.toString(), 
            description: 'Tenders in justification phase' 
          },
          { 
            label: 'Total Value', 
            value: formatTotalValue(activeTendersData.total_estimated_value), 
            description: 'Combined estimated value' 
          },
          { 
            label: 'Avg Time in System', 
            value: formatAvgTime(activeTendersData.avg_time_in_system), 
            description: 'From intake to current phase' 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'duration'}
        onClose={() => setActiveModal(null)}
        title="Avg Evaluation Duration"
        icon={Clock}
        mainValue={avgEvalDurationData ? formatAvgTime(avgEvalDurationData.avg_eval_duration) : '0 days'}
        details={avgEvalDurationData ? [
          { 
            label: 'Target Duration', 
            value: formatAvgTime(avgEvalDurationData.target_duration), 
            description: 'Organizational benchmark' 
          },
          { 
            label: 'Time Saved', 
            value: formatAvgTime(avgEvalDurationData.time_saved_days), 
            description: `${formatPercentage(avgEvalDurationData.faster_pct)} faster than target` 
          },
          { 
            label: 'Fastest Department', 
            value: avgEvalDurationData.fastest_department_name || 'N/A', 
            description: `${formatAvgTime(avgEvalDurationData.fastest_department_avg_days)} average` 
          },
          { 
            label: 'Slowest Department', 
            value: avgEvalDurationData.slowest_department_name || 'N/A', 
            description: `${formatAvgTime(avgEvalDurationData.slowest_department_avg_days)} average` 
          },
          { 
            label: 'Bottleneck Phase', 
            value: 'Evaluation', 
            description: `${formatAvgTime(avgEvalDurationData.bottleneck_phase_avg_days)} average` 
          },
          { 
            label: 'Tenders On-Time', 
            value: `${avgEvalDurationData.tenders_on_time || 0}/${avgEvalDurationData.active_tenders || 0}`, 
            description: `${avgEvalDurationData.active_tenders ? Math.round(((avgEvalDurationData.tenders_on_time || 0) / avgEvalDurationData.active_tenders) * 100) : 0}% within target timeframe` 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'compliance'}
        onClose={() => setActiveModal(null)}
        title="Compliance Rate"
        icon={Target}
        mainValue={complianceRateData ? `${complianceRateData.compliance_rate_pct.toFixed(1)}%` : '0%'}
        details={complianceRateData ? [
          { 
            label: 'Compliant Tenders', 
            value: `${complianceRateData.compliant_tenders}/${complianceRateData.total_tenders}`, 
            description: 'Meeting all policy requirements' 
          },
          { 
            label: 'Policy Adherence', 
            value: `${complianceRateData.policy_adherence_pct.toFixed(1)}%`, 
            description: 'Following tender procedures' 
          },
          { 
            label: 'Risk Mitigation', 
            value: `${complianceRateData.risk_mitigation_pct.toFixed(1)}%`, 
            description: 'Risks identified and managed' 
          },
          { 
            label: 'Documentation', 
            value: `${complianceRateData.documentation_pct.toFixed(1)}%`, 
            description: 'Complete required documentation' 
          },
          { 
            label: 'Timeline Compliance', 
            value: `${complianceRateData.timeline_compliance_pct.toFixed(1)}%`, 
            description: 'Meeting deadline requirements' 
          },
          { 
            label: 'Minor Issues', 
            value: `${complianceRateData.minor_issues || 0}`, 
            description: 'Non-critical compliance gaps' 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'alerts'}
        onClose={() => setActiveModal(null)}
        title="Critical Alerts"
        icon={AlertTriangle}
        mainValue={criticalAlertsData?.critical_alerts?.toString() || '0'}
        details={criticalAlertsData ? [
          ...(criticalAlertsData.critical_alert_list && criticalAlertsData.critical_alert_list.length > 0
            ? criticalAlertsData.critical_alert_list.map((alert, index) => ({
                label: alert.id || `Alert ${index + 1}`,
                value: alert.riskLevel || 'Critical',
                description: `${alert.riskAlertMessage || 'No message'} - Integrity score: ${alert.riskIntegrityScore?.toFixed(0) || 0}%`
              }))
            : []),
          { 
            label: 'Total High Risk', 
            value: criticalAlertsData.total_high_risk?.toString() || '0', 
            description: `Including ${criticalAlertsData.critical_alerts || 0} critical alerts` 
          },
          { 
            label: 'Resolved Today', 
            value: criticalAlertsData.resolved_today?.toString() || '0', 
            description: 'Alerts resolved today' 
          },
          { 
            label: 'Avg Resolution Time', 
            value: criticalAlertsData.avg_resolution_time ? `${criticalAlertsData.avg_resolution_time.toFixed(1)} days` : 'N/A', 
            description: 'For critical and high risk alerts' 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'vendors'}
        onClose={() => setActiveModal(null)}
        title="Active Vendors"
        icon={Users}
        mainValue={vendorAnalytics.totalVendors.toString()}
        details={[
          { label: 'Total Bids Submitted', value: (vendorAnalytics.totalBids || vendorAnalytics.allVendors?.length || 0).toString(), description: `Across ${vendorAnalytics.tendersParticipated || filteredTenders.length} tender${(vendorAnalytics.tendersParticipated || filteredTenders.length) !== 1 ? 's' : ''}` },
          { label: 'Avg Bids per Tender', value: vendorAnalytics.avgBidsPerTender ? vendorAnalytics.avgBidsPerTender.toFixed(1) : (filteredTenders.length > 0 && vendorAnalytics.allVendors ? (vendorAnalytics.allVendors.length / filteredTenders.length).toFixed(1) : '0'), description: 'Competition level indicator' },
          { label: 'Top 3 Active Vendors', value: vendorAnalyticsData?.top3Vendors || (vendorAnalytics.allVendorStats && vendorAnalytics.allVendorStats.length > 0 ? vendorAnalytics.allVendorStats.slice(0, 3).map((v: any) => v.name).join(', ') : 'N/A'), description: 'Most frequent bidders' },
          { label: 'Works Category', value: (vendorAnalytics.categories && 'WORKS' in vendorAnalytics.categories ? vendorAnalytics.categories['WORKS']?.toString() : null) || filteredTenders.filter(t => t.category === 'WORKS').length.toString(), description: `${(vendorAnalytics.categories && 'WORKS' in vendorAnalytics.categories ? vendorAnalytics.categories['WORKS'] : null) || filteredTenders.filter(t => t.category === 'WORKS').reduce((sum, t) => sum + (t.vendors?.length || 0), 0)} vendors` },
          { label: 'Services Category', value: (vendorAnalytics.categories && 'SERVICES' in vendorAnalytics.categories ? vendorAnalytics.categories['SERVICES']?.toString() : null) || filteredTenders.filter(t => t.category === 'SERVICES').length.toString(), description: `${(vendorAnalytics.categories && 'SERVICES' in vendorAnalytics.categories ? vendorAnalytics.categories['SERVICES'] : null) || filteredTenders.filter(t => t.category === 'SERVICES').reduce((sum, t) => sum + (t.vendors?.length || 0), 0)} vendors` },
          { label: 'Supplies Category', value: (vendorAnalytics.categories && 'SUPPLIES' in vendorAnalytics.categories ? vendorAnalytics.categories['SUPPLIES']?.toString() : null) || filteredTenders.filter(t => t.category === 'SUPPLIES').length.toString(), description: `${(vendorAnalytics.categories && 'SUPPLIES' in vendorAnalytics.categories ? vendorAnalytics.categories['SUPPLIES'] : null) || filteredTenders.filter(t => t.category === 'SUPPLIES').reduce((sum, t) => sum + (t.vendors?.length || 0), 0)} vendors` },
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'avgBid'}
        onClose={() => setActiveModal(null)}
        title="Average Bid Value"
        icon={TrendingUp}
        mainValue={avgBidValueData?.avgBidValue ? formatTotalValue(avgBidValueData.avgBidValue) : 'AED 0.00M'}
        details={avgBidValueData ? [
          { 
            label: 'Total Bid Value', 
            value: avgBidValueData.totalBidValue ? formatTotalValue(avgBidValueData.totalBidValue) : 'N/A', 
            description: 'Sum of all proposals' 
          },
          { 
            label: 'Highest Bid', 
            value: avgBidValueData.highestBidAmount ? formatTotalValue(avgBidValueData.highestBidAmount) : 'N/A', 
            description: avgBidValueData.highestBidVendor || 'N/A' 
          },
          { 
            label: 'Lowest Bid', 
            value: avgBidValueData.lowestBidAmount ? formatTotalValue(avgBidValueData.lowestBidAmount) : 'N/A', 
            description: avgBidValueData.lowestBidVendor || 'N/A' 
          },
          { 
            label: 'Bid Range Spread', 
            value: avgBidValueData.bidRangeSpreadPercent !== null ? `${avgBidValueData.bidRangeSpreadPercent.toFixed(1)}%` : 'N/A', 
            description: 'Price variance across vendors' 
          },
          { 
            label: 'Budget Alignment', 
            value: avgBidValueData.budgetAlignmentPercent !== null ? `${avgBidValueData.budgetAlignmentPercent.toFixed(1)}%` : 'N/A', 
            description: 'Avg bid vs estimated value' 
          },
          { 
            label: 'Competitive Tenders', 
            value: avgBidValueData.competitiveTenders !== null ? avgBidValueData.competitiveTenders.toString() : '0', 
            description: avgBidValueData.competitiveTenders !== null ? `Tenders with 3+ bidders` : 'No data available' 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'topVendor'}
        onClose={() => setActiveModal(null)}
        title="Top Performing Vendor"
        icon={Award}
        mainValue={topPerformerData?.vendorName || 'N/A'}
        details={topPerformerData ? [
          { 
            label: 'Reliability Score', 
            value: topPerformerData.reliabilityScore !== null ? `${topPerformerData.reliabilityScore.toFixed(1)}%` : 'N/A', 
            description: 'Past performance indicator' 
          },
          { 
            label: 'Total Bids', 
            value: topPerformerData.totalBids !== null ? topPerformerData.totalBids.toString() : '0', 
            description: 'Number of bids submitted' 
          },
          { 
            label: 'Average Rank', 
            value: topPerformerData.avgRank !== null ? topPerformerData.avgRank.toFixed(2) : 'N/A', 
            description: 'Average ranking position across tenders (lower is better)' 
          },
          { 
            label: 'Average Bid Value', 
            value: topPerformerData.avgBidValue !== null ? formatTotalValue(topPerformerData.avgBidValue) : 'N/A', 
            description: 'Mean proposal amount' 
          },
          { 
            label: 'Total Bid Value', 
            value: topPerformerData.totalBidValue !== null ? formatTotalValue(topPerformerData.totalBidValue) : 'N/A', 
            description: 'Combined proposal value' 
          },
          { 
            label: 'Bid Errors', 
            value: (topPerformerData.bidErrors || 0).toString(), 
            description: (topPerformerData.bidErrors || 0) === 0 ? 'Clean submission record' : 'Minor discrepancies found' 
          },
        ] : [
          { label: 'Loading...', value: '-', description: 'Fetching data from API' }
        ]}
      />

      <KPIDetailModal
        isOpen={activeModal === 'riskVendors'}
        onClose={() => setActiveModal(null)}
        title="Risk-Flagged Vendors"
        icon={ShieldAlert}
        mainValue={vendorAnalytics.riskVendors.toString()}
        details={[
          { label: 'High Risk Level', value: vendorAnalytics.allVendors && vendorAnalytics.allVendors.length > 0 ? vendorAnalytics.allVendors.filter(v => v.riskLevel === 'high').length.toString() : '0', description: 'Vendors flagged with high risk assessment' },
          { label: 'Multiple Bid Errors', value: vendorAnalytics.allVendorStats && vendorAnalytics.allVendorStats.length > 0 ? vendorAnalytics.allVendorStats.filter((v: any) => (v.bidErrors || 0) > 2).length.toString() : '0', description: 'More than 2 submission errors' },
          { label: 'Low Reliability (<80%)', value: vendorAnalytics.allVendorStats && vendorAnalytics.allVendorStats.length > 0 ? vendorAnalytics.allVendorStats.filter((v: any) => (v.avgReliability || 0) < 80).length.toString() : '0', description: 'Below acceptable performance threshold' },
          { label: 'Total Risk Incidents', value: vendorAnalytics.allVendors && vendorAnalytics.allVendors.length > 0 ? vendorAnalytics.allVendors.reduce((sum, v) => sum + (v.bidErrors || 0), 0).toString() : '0', description: 'Cumulative errors across all bids' },
          { label: 'Risk Mitigation', value: `${((1 - (vendorAnalytics.riskVendors / Math.max(vendorAnalytics.totalVendors, 1))) * 100).toFixed(1)}%`, description: 'Vendors with clean records' },
          { label: 'Watchlist Vendors', value: vendorAnalytics.allVendorStats && vendorAnalytics.allVendorStats.length > 0 ? vendorAnalytics.allVendorStats.filter((v: any) => (v.riskCount || 0) > 0 && (v.bidErrors || 0) > 0).map((v: any) => v.name).slice(0, 3).join(', ') || 'None' : 'None', description: 'Require additional monitoring' },
        ]}
      />
    </>
  );
}
