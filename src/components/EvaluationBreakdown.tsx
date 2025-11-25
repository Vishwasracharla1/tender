import { useNavigate } from 'react-router-dom';
import agentResponseData from '../data/agentResponseData.json';

export const EvaluationBreakdown = () => {
  const navigate = useNavigate();

  // Use data from agentResponseData.json
  const data = agentResponseData as any[];

  const companies = data.map(d => d['Company Name']);
  const companyColors: Record<string, string> = {
    'EDRAKY': '#3b82f6',
    'COGNIZANT': '#10b981',
    'KAAR': '#f59e0b',
    'SOLTIUS': '#8b5cf6',
    'TYCONZ': '#64748b'
  };

  const companyGradients: Record<string, { card: string; iconBg: string; titleColor: string; valueColor: string; border: string; shadow: string }> = {
    'EDRAKY': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-indigo-100',
      iconBg: 'from-blue-500 to-indigo-600',
      titleColor: 'text-blue-700',
      valueColor: 'text-blue-900',
      border: 'border-blue-100',
      shadow: 'shadow-[0_18px_40px_rgba(59,130,246,0.15)]'
    },
    'COGNIZANT': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-100',
      iconBg: 'from-emerald-500 to-teal-500',
      titleColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
      border: 'border-emerald-100',
      shadow: 'shadow-[0_18px_40px_rgba(5,150,105,0.15)]'
    },
    'KAAR': {
      card: 'bg-gradient-to-br from-amber-50 via-white to-orange-100',
      iconBg: 'from-amber-500 to-orange-500',
      titleColor: 'text-amber-700',
      valueColor: 'text-amber-900',
      border: 'border-amber-100',
      shadow: 'shadow-[0_18px_40px_rgba(245,158,11,0.15)]'
    },
    'SOLTIUS': {
      card: 'bg-gradient-to-br from-purple-50 via-white to-violet-100',
      iconBg: 'from-purple-500 to-violet-600',
      titleColor: 'text-purple-700',
      valueColor: 'text-purple-900',
      border: 'border-purple-100',
      shadow: 'shadow-[0_18px_40px_rgba(139,92,246,0.15)]'
    },
    'TYCONZ': {
      card: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
      iconBg: 'from-slate-500 to-slate-600',
      titleColor: 'text-slate-700',
      valueColor: 'text-slate-900',
      border: 'border-slate-200',
      shadow: 'shadow-[0_18px_40px_rgba(71,85,105,0.15)]'
    }
  };

  // Get all criteria from Subcategory Weightages (same as Evaluation Matrix)
  const getAllCriteria = () => {
    if (data.length === 0) return [];
    const firstCompany = data[0];
    const subcategoryWeightages = (firstCompany['Subcategory Weightages'] || {}) as Record<string, any>;
    return Object.keys(subcategoryWeightages).filter(key => subcategoryWeightages[key] !== null);
  };

  const allCriteriaList = getAllCriteria();

  // Function to calculate score for a specific criterion
  const calculateCriterionScore = (criterionName: string, companyName: string): number => {
    const companyData = data.find(d => d['Company Name'] === companyName);
    if (!companyData) return 0;

    const subcategoryRatings = (companyData['Subcategory Ratings'] || {}) as Record<string, any>;
    const rating = subcategoryRatings[criterionName];

    if (rating === undefined || rating === null) return 0;

    // Handle objects (Module Covered, Implementation Timeline, Partner Experience)
    if (typeof rating === 'object' && rating !== null && !Array.isArray(rating)) {
      // For Module Covered, count Yes values
      if (criterionName === 'Module Covered') {
        const moduleData = rating as Record<string, any>;
        const yesCount = Object.values(moduleData).filter((v: any) => v === 'Yes').length;
        const totalCount = Object.keys(moduleData).filter(k => moduleData[k] !== null).length;
        return totalCount > 0 ? (yesCount / totalCount) * 10 : 0;
      }
      
      // For Implementation Timeline / Consultants
      if (criterionName === 'Implementation Timeline / Consultants') {
        const implData = rating as Record<string, any>;
        const manMonths = implData['Number of Man Months Considered'] || 0;
        const onshore = implData['Number of Consultants (Onshore)'] || 0;
        const offshore = implData['Number of Consultants (Offshore)'] || 0;
        const arabic = implData['Number of Arabic Consultants (On shore)'] || 0;
        const avgExp = implData['Average experience of consultants'] || 0;
        
        const manMonthsScore = Math.min(10, (manMonths / 300) * 10);
        const consultantScore = Math.min(10, ((onshore + offshore) / 30) * 10);
        const arabicScore = Math.min(10, (arabic / 15) * 10);
        const expScore = Math.min(10, (avgExp / 10) * 10);
        
        return (manMonthsScore * 0.3 + consultantScore * 0.3 + arabicScore * 0.2 + expScore * 0.2);
      }
      
      // For Partner Experience
      if (criterionName === 'Partner Experience') {
        const partnerData = rating as Record<string, any>;
        const implementations = partnerData['Number of SAP Implementations'] || 0;
        const s4hana = partnerData['SAP S/4HANA experience'] || 0;
        const gcc = partnerData['GCC Experience'];
        const partnerType = partnerData['SAP Partner Type & Age'] || '';
        
        let partnerTypeScore = 0;
        if (typeof partnerType === 'string') {
          const typeLower = partnerType.toLowerCase();
          if (typeLower.includes('platinum')) partnerTypeScore = 10;
          else if (typeLower.includes('gold')) partnerTypeScore = 7;
          else if (typeLower.includes('silver')) partnerTypeScore = 5;
          else partnerTypeScore = 3;
        }
        
        const implScore = Math.min(10, (implementations / 50) * 10);
        const s4hanaScore = Math.min(10, (s4hana / 200) * 10);
        const gccScore = typeof gcc === 'string' && gcc.toLowerCase() === 'yes' ? 10 : 
                        typeof gcc === 'number' ? Math.min(10, (gcc / 10) * 10) : 0;
        
        return (partnerTypeScore * 0.3 + implScore * 0.2 + s4hanaScore * 0.3 + gccScore * 0.2);
      }
    }

    // Handle string values (Yes/No)
    if (typeof rating === 'string') {
      if (rating.toLowerCase() === 'yes') return 10;
      if (rating.toLowerCase() === 'no') return 0;
      return 0;
    }

    // Handle numeric values
    if (typeof rating === 'number') {
      // For RICEF, scale: 0-150 -> 0-10
      if (criterionName === 'Custom Objects Considered (RICEF)') {
        return Math.min(10, (rating / 150) * 10);
      }
      
      // For Project Duration, inverse scale: shorter is better
      if (criterionName === 'Project Duration') {
        return Math.max(0, Math.min(10, (12 / rating) * 10));
      }
      
      // For Reference count, scale: 0-50 -> 0-10
      if (criterionName.includes('Reference') && !criterionName.includes('GCC') && !criterionName.includes('Non-GCC')) {
        return Math.min(10, (rating / 50) * 10);
      }
      
      // Default: scale to 0-10
      return Math.min(10, Math.max(0, rating / 10));
    }

    return 0;
  };

  // Calculate weighted scores
  const calculateWeightedScore = (company: string) => {
    const companyData = data.find(d => d['Company Name'] === company);
    if (!companyData) return '0.00';
    
    // Use Overall Rating from the new structure
    return companyData['Overall Rating']?.toFixed(2) || '0.00';
  };

  // Prepare comparison data with all criteria
  const comparisonData = companies.map(company => {
    const companyData = data.find(d => d['Company Name'] === company);
    if (!companyData) return null;
    
    const result: any = { company };
    
    // Calculate score for each criterion
    allCriteriaList.forEach(criterionName => {
      result[criterionName] = calculateCriterionScore(criterionName, company);
    });
    
    result['Weighted Score'] = parseFloat(calculateWeightedScore(company));
    return result;
  }).filter(Boolean) as any[];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {companies.map(company => {
            const gradient = companyGradients[company] || companyGradients['EDRAKY'];
            return (
              <div 
                key={company}
                className={`${gradient.card} ${gradient.border} border rounded-xl ${gradient.shadow} p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                onClick={() => navigate(`/company/${encodeURIComponent(company)}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient.iconBg} flex items-center justify-center`}>
                    <span className="text-white text-xl font-bold">{company.charAt(0)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className={`text-lg font-bold ${gradient.titleColor} mb-2`}>{company}</h3>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-semibold ${gradient.titleColor} uppercase tracking-wide`}>
                      Weighted Score
                    </span>
                    <span className={`text-3xl font-bold ${gradient.valueColor}`}>
                      {calculateWeightedScore(company)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Evaluation Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-300">
                  <th className="text-left p-3 text-slate-700 font-bold text-xs uppercase tracking-wider">Criteria</th>
                  <th className="text-center p-3 text-slate-700 font-bold text-xs uppercase tracking-wider w-20">Weight</th>
                  {companies.map(company => (
                    <th key={company} className="text-center p-3 font-bold text-xs uppercase tracking-wider" style={{ color: companyColors[company] }}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{company}</span>
                        <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: companyColors[company], opacity: 0.3 }}></div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allCriteriaList.map((criterionName, idx) => {
                  // Get weight from JSON, convert to percentage
                  const firstCompany = data[0];
                  const subcategoryWeightages = (firstCompany['Subcategory Weightages'] || {}) as Record<string, any>;
                  const weightValue = subcategoryWeightages[criterionName] || 0;
                  const weightPercent = (weightValue * 100).toFixed(0) + '%';
                  
                  // Get icon based on criterion name
                  const getIcon = (name: string) => {
                    const nameLower = name.toLowerCase();
                    if (nameLower.includes('module')) return '📦';
                    if (nameLower.includes('migration')) return '🔄';
                    if (nameLower.includes('organizational') || nameLower.includes('change')) return '👥';
                    if (nameLower.includes('support')) return '🛟';
                    if (nameLower.includes('duration') || nameLower.includes('project')) return '⏱️';
                    if (nameLower.includes('timeline') || nameLower.includes('consultant')) return '📅';
                    if (nameLower.includes('partner') || nameLower.includes('experience')) return '🤝';
                    if (nameLower.includes('reference')) return '🏛️';
                    if (nameLower.includes('ricef') || nameLower.includes('custom')) return '⚙️';
                    return '📋';
                  };
                  
                  return (
                    <tr key={criterionName} className={`hover:bg-slate-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getIcon(criterionName)}</span>
                          <span className="font-semibold text-sm text-slate-800">{criterionName}</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-md border border-indigo-200">
                          <span className="text-xs font-bold text-indigo-700">{weightPercent}</span>
                        </div>
                      </td>
                      {companies.map(company => {
                        const companyScore = comparisonData.find(c => c.company === company)?.[criterionName] || 0;
                        const roundedScore = Math.round(companyScore * 10) / 10;
                        const companyScorePercentage = (companyScore / 10) * 100;
                        const companyScoreColor = companyScorePercentage >= 80 ? 'from-emerald-500 to-teal-500' : 
                                                 companyScorePercentage >= 60 ? 'from-blue-500 to-cyan-500' : 
                                                 companyScorePercentage >= 40 ? 'from-amber-500 to-orange-500' : 
                                                 'from-rose-500 to-red-500';
                        
                        return (
                          <td key={company} className="text-center p-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-bold" style={{ color: companyColors[company] }}>
                                {roundedScore}/10
                              </span>
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full bg-gradient-to-r ${companyScoreColor} transition-all duration-500 shadow-sm`}
                                  style={{ width: `${companyScorePercentage}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-inner">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="font-bold text-sm text-slate-800">Total Weighted Score</span>
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-slate-600 to-slate-700 rounded-md">
                      <span className="text-xs font-bold text-white">100%</span>
                    </div>
                  </td>
                  {companies.map(company => {
                    const totalScore = parseFloat(calculateWeightedScore(company));
                    return (
                      <td key={company} className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg font-bold" style={{ color: companyColors[company] }}>
                            {totalScore.toFixed(2)}
                          </span>
                          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r rounded-full transition-all duration-500 shadow-sm"
                              style={{ 
                                width: `${Math.min((totalScore / 300) * 100, 100)}%`,
                                background: `linear-gradient(to right, ${companyColors[company]}, ${companyColors[company]}dd)`
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
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



