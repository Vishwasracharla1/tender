import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import agentResponseData from '../data/agentResponseData.json';

const OverallComparisonChart = ({ data }: { data: any[] }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current, undefined, {
        renderer: 'canvas',
      });
    }

    if (!data || data.length === 0) {
      chartRef.current?.clear();
      return;
    }

    const companies = data.map(d => d.company);
    const scores = data.map(d => d['Weighted Score'] || 0);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const item = items[0];
          return `
            <div style="padding: 4px;">
              <div><strong>${item.axisValueLabel}</strong></div>
              <div style="margin-top: 4px;">
                <span style="display:inline-block;width:10px;height:10px;background-color:${item.color};border-radius:2px;margin-right:5px;"></span>
                Weighted Score: ${typeof item.value === 'number' ? item.value.toFixed(2) : item.value}
              </div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
      },
      grid: {
        left: 60,
        right: 30,
        top: 20,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: companies,
        axisLabel: {
          interval: 0,
          rotate: -45,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Score',
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          formatter: '{value}',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
          },
        },
      },
      series: [
        {
          name: 'Weighted Score',
          type: 'bar',
          data: scores,
          barWidth: '60%',
          itemStyle: {
            color: '#3b82f6',
            borderRadius: [4, 4, 4, 4],
          },
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => (typeof p.value === 'number' ? p.value.toFixed(2) : ''),
            fontSize: 11,
          },
          emphasis: {
            focus: 'series',
          },
        },
      ],
      animationDuration: 400,
    };

    chartRef.current.setOption(option);

    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-xl font-semibold mb-2">Overall Comparison</div>
      <div ref={ref} className="w-full h-[300px] rounded-xl" />
    </div>
  );
};

const DetailedMetricsChart = ({ data }: { data: any[] }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current, undefined, {
        renderer: 'canvas',
      });
    }

    if (!data || data.length === 0) {
      chartRef.current?.clear();
      return;
    }

    const metrics = [
      { key: 'Module Coverage', label: 'Module Coverage', color: '#3b82f6' },
      { key: 'SAP Partner (MENA)', label: 'SAP Partner (MENA)', color: '#10b981' },
      { key: 'Gov Implementations', label: 'Gov Implementations', color: '#ef4444' },
      { key: 'S/4 HANA Experience', label: 'S/4 HANA Experience', color: '#f59e0b' },
      { key: 'GCC Experience', label: 'GCC Experience', color: '#8b5cf6' },
    ];

    const companies = data.map(d => d.company);

    // Build one series per metric
    const series: echarts.SeriesOption[] = metrics.map((metric, metricIdx) => {
      const dataArr = companies.map((_, companyIdx) => {
        const company = data[companyIdx];
        return company ? (company[metric.key] || 0) : 0;
      });

      return {
        name: metric.label,
        type: 'bar',
        data: dataArr,
        barWidth: '15%',
        itemStyle: {
          color: metric.color,
          borderRadius: [4, 4, 4, 4],
        },
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => (typeof p.value === 'number' && p.value !== 0 ? p.value.toFixed(1) : ''),
          fontSize: 11,
        },
        emphasis: {
          focus: 'series',
        },
      } as echarts.SeriesOption;
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const items = Array.isArray(params) ? params : [params];
          const companyLabel = items[0]?.axisValueLabel ?? '';
          let tooltipContent = `<div><strong>${companyLabel}</strong></div>`;
          
          items.forEach((item: any) => {
            if (item.value && item.value !== 0) {
              tooltipContent += `<div style="margin-top: 4px;">
                <span style="display:inline-block;width:10px;height:10px;background-color:${item.color};border-radius:2px;margin-right:5px;"></span>
                ${item.seriesName}: ${typeof item.value === 'number' ? item.value.toFixed(1) : item.value}/10
              </div>`;
            }
          });
          
          return `<div style="padding: 4px;">${tooltipContent}</div>`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: '#333',
        },
      },
      legend: {
        top: 8,
        type: 'scroll',
        selectedMode: 'multiple',
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        left: 80,
        right: 45,
        top: 48,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: companies,
        axisLabel: {
          interval: 0,
          rotate: -45,
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Score (0-10)',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0,
        max: 10,
        axisLabel: {
          formatter: '{value}',
          fontSize: 11,
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0',
          },
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
          },
        },
      },
      series,
      animationDuration: 400,
    };

    chartRef.current.setOption(option);

    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-xl font-semibold mb-2">Detailed Metrics Comparison</div>
      <div ref={ref} className="w-full h-[52vh] rounded-xl" />
    </div>
  );
};

export const EvaluationBreakdown = () => {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('Module Coverage');

  // Use data from agentResponseData.json
  const data = agentResponseData as any[];

  const companies = data.map(d => d.companyName);
  const companyColors: Record<string, string> = {
    'EDRAKY': '#3b82f6',
    'COGNIZANT': '#10b981',
    'KAAR': '#f59e0b',
    'SOLTIUS': '#8b5cf6',
    'TYCONZ': '#ec4899'
  };

  // Calculate weighted scores
  const calculateWeightedScore = (company: string) => {
    const companyData = data.find(d => d.companyName === company);
    if (!companyData) return '0.00';
    let totalScore = 0;
    
    companyData.evaluationCategories.forEach((cat: any) => {
      cat.subCategories.forEach((sub: any) => {
        if (sub.weight && typeof sub.rating === 'number') {
          totalScore += sub.weight * sub.rating;
        }
      });
    });
    
    return totalScore.toFixed(2);
  };

  // Prepare comparison data
  const comparisonData = companies.map(company => {
    const companyData = data.find(d => d.companyName === company);
    if (!companyData) return null;
    const moduleCoverage = companyData.evaluationCategories
      .find((cat: any) => cat.category === 'Module Coverage')
      ?.subCategories.find((sub: any) => sub.name === 'Module Covered')?.rating || 0;
    
    const partnerExp = companyData.evaluationCategories
      .find((cat: any) => cat.category === 'Partner Experience & Capability')?.subCategories || [];
    
    // Extract SAP Partner rating - convert string ratings to numbers
    const sapPartnerSub = partnerExp.find((s: any) => s.name === 'SAP Partner Type & Age – MENA');
    let sapPartnerRating = 0;
    if (sapPartnerSub?.rating) {
      if (typeof sapPartnerSub.rating === 'number') {
        sapPartnerRating = sapPartnerSub.rating;
      } else if (typeof sapPartnerSub.rating === 'string') {
        // Convert partner type to numeric rating
        const ratingStr = sapPartnerSub.rating.toLowerCase();
        if (ratingStr.includes('platinum')) sapPartnerRating = 10;
        else if (ratingStr.includes('gold')) sapPartnerRating = 7;
        else if (ratingStr.includes('silver')) sapPartnerRating = 5;
        else sapPartnerRating = 3;
      }
    }
    
    // Extract Gov Implementations - check for Yes/No or numeric
    const govImplSub = partnerExp.find((s: any) => s.name.includes('Government') || s.name.includes('Public Service'));
    let govImplRating = 0;
    if (govImplSub?.rating) {
      if (typeof govImplSub.rating === 'number') {
        govImplRating = govImplSub.rating;
      } else if (typeof govImplSub.rating === 'string' && govImplSub.rating.toLowerCase() === 'yes') {
        govImplRating = 10;
      }
    }
    
    // Extract S/4 HANA Experience
    const s4hanaSub = partnerExp.find((s: any) => s.name.includes('S/4 HANA'));
    let s4hanaRating = 0;
    if (s4hanaSub?.rating) {
      if (typeof s4hanaSub.rating === 'number') {
        s4hanaRating = s4hanaSub.rating;
      } else if (typeof s4hanaSub.rating === 'string' && s4hanaSub.rating.toLowerCase() === 'yes') {
        s4hanaRating = 10;
      }
    }
    
    // Extract GCC Experience
    const gccSub = partnerExp.find((s: any) => s.name === 'GCC Experience');
    let gccRating = 0;
    if (gccSub?.rating) {
      if (typeof gccSub.rating === 'number') {
        gccRating = gccSub.rating;
      } else if (typeof gccSub.rating === 'string' && gccSub.rating.toLowerCase() === 'yes') {
        gccRating = 10;
      }
    }
    
    return {
      company,
      'Module Coverage': typeof moduleCoverage === 'number' ? moduleCoverage : 0,
      'SAP Partner (MENA)': sapPartnerRating,
      'Gov Implementations': govImplRating,
      'S/4 HANA Experience': s4hanaRating,
      'GCC Experience': gccRating,
      'Weighted Score': parseFloat(calculateWeightedScore(company))
    };
  }).filter(Boolean) as any[];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">RAK Tender Evaluation Dashboard</h1>
          <p className="text-slate-600">Tender ID: RAK_01 | SAP S/4 HANA Implementation</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {companies.map(company => (
            <div 
              key={company}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all hover:scale-105"
              style={{ borderTop: `4px solid ${companyColors[company]}` }}
              onClick={() => setSelectedCompany(company)}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4">{company}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Weighted Score</span>
                  <span className="text-2xl font-bold" style={{ color: companyColors[company] }}>
                    {calculateWeightedScore(company)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Module Coverage</span>
                  <span className="text-lg font-semibold text-slate-700">
                    {comparisonData.find(c => c.company === company)?.['Module Coverage']}/10
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="mb-8">
          {/* Bar Chart */}
          <OverallComparisonChart data={comparisonData} />
        </div>

        {/* Detailed Metrics Comparison - ECharts */}
        <DetailedMetricsChart data={comparisonData} />

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Evaluation Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-4 text-slate-700 font-semibold">Criteria</th>
                  <th className="text-center p-4 text-slate-700 font-semibold">Weight</th>
                  {companies.map(company => (
                    <th key={company} className="text-center p-4 font-semibold" style={{ color: companyColors[company] }}>
                      {company}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">Module Coverage</td>
                  <td className="text-center p-4 text-slate-600">35%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 font-semibold" style={{ color: companyColors[company] }}>
                      {comparisonData.find(c => c.company === company)?.['Module Coverage']}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 text-slate-700">SAP Partner (MENA)</td>
                  <td className="text-center p-4 text-slate-600">15%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 text-slate-700">
                      {comparisonData.find(c => c.company === company)?.['SAP Partner (MENA)']}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="p-4 text-slate-700">Government Implementations</td>
                  <td className="text-center p-4 text-slate-600">20%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 text-slate-700">
                      {comparisonData.find(c => c.company === company)?.['Gov Implementations']}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 text-slate-700">S/4 HANA Experience</td>
                  <td className="text-center p-4 text-slate-600">10%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 text-slate-700">
                      {comparisonData.find(c => c.company === company)?.['S/4 HANA Experience']}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td className="p-4 text-slate-700">GCC Experience</td>
                  <td className="text-center p-4 text-slate-600">5%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 text-slate-700">
                      {comparisonData.find(c => c.company === company)?.['GCC Experience']}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-t-2 border-slate-200 bg-slate-100">
                  <td className="p-4 font-bold text-slate-800">Total Weighted Score</td>
                  <td className="text-center p-4 font-bold text-slate-800">100%</td>
                  {companies.map(company => (
                    <td key={company} className="text-center p-4 text-xl font-bold" style={{ color: companyColors[company] }}>
                      {calculateWeightedScore(company)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
              <h3 className="font-bold text-amber-900 mb-2">🏆 Highest Module Coverage</h3>
              <p className="text-amber-800">KAAR leads with 9.5/10 in module coverage</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-900 mb-2">💼 Overall Leader</h3>
              <p className="text-blue-800">KAAR has the highest weighted score at {calculateWeightedScore('KAAR')}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-900 mb-2">🌍 Strong GCC Presence</h3>
              <p className="text-green-800">KAAR demonstrates strongest GCC experience (10/10)</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-900 mb-2">⚙️ S/4 HANA Expertise</h3>
              <p className="text-purple-800">Three vendors (COGNIZANT, KAAR, SOLTIUS) score perfect 10/10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

