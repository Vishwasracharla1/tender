import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import agentResponseData from '../data/agentResponseData.json';
import { ArrowLeft } from 'lucide-react';

interface CompanyDetailPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'evaluation-breakdown') => void;
}

export function CompanyDetailPage({ onNavigate }: CompanyDetailPageProps) {
  const { companyName } = useParams<{ companyName: string }>();
  const navigate = useNavigate();

  const data = agentResponseData as any[];
  const companyData = data.find(d => d['Company Name'] === companyName);

  if (!companyData) {
    return (
      <>
        <Sidebar currentPage="evaluation-breakdown" onNavigate={onNavigate} />
        <div className="app-shell min-h-screen bg-gray-50 pb-24">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Company Not Found</h2>
              <p className="text-slate-600 mb-6">The company "{companyName}" could not be found.</p>
              <button
                onClick={() => navigate('/evaluation-breakdown')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Evaluation Breakdown
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const companyColors: Record<string, string> = {
    'EDRAKY': '#3b82f6',
    'COGNIZANT': '#10b981',
    'KAAR': '#f59e0b',
    'SOLTIUS': '#8b5cf6',
    'TYCONZ': '#64748b'
  };

  const companyGradients: Record<string, { card: string; header: string; icon: string }> = {
    'EDRAKY': {
      card: 'bg-gradient-to-br from-blue-50 via-white to-indigo-100 border border-blue-100',
      header: 'bg-gradient-to-r from-blue-100 via-blue-50 to-indigo-100',
      icon: 'from-blue-500 to-indigo-600'
    },
    'COGNIZANT': {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-100',
      header: 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100',
      icon: 'from-emerald-500 to-teal-600'
    },
    'KAAR': {
      card: 'bg-gradient-to-br from-amber-50 via-white to-orange-100 border border-amber-100',
      header: 'bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100',
      icon: 'from-amber-500 to-orange-600'
    },
    'SOLTIUS': {
      card: 'bg-gradient-to-br from-purple-50 via-white to-violet-100 border border-purple-100',
      header: 'bg-gradient-to-r from-purple-100 via-purple-50 to-violet-100',
      icon: 'from-purple-500 to-violet-600'
    },
    'TYCONZ': {
      card: 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200',
      header: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100',
      icon: 'from-slate-500 to-slate-600'
    }
  };

  const subcategoryWeightages = (companyData['Subcategory Weightages'] || {}) as Record<string, any>;
  const subcategoryRatings = (companyData['Subcategory Ratings'] || {}) as Record<string, any>;
  
  // Get all categories (subcategories) that have non-null weights
  const categories = Object.keys(subcategoryWeightages).filter(key => subcategoryWeightages[key] !== null);

  const renderCategoryValue = (categoryName: string, value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400 italic">Not provided</span>;
    }

    // Handle object values (like Module Covered, Implementation Timeline, Partner Experience)
    // Display subcategories in small containers, 4 per row
    if (typeof value === 'object' && !Array.isArray(value)) {
      const entries = Object.entries(value).filter(([_, val]) => val !== null);
      const gradient = companyGradients[companyName || ''] || companyGradients['EDRAKY'];
      
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {entries.map(([key, val], index) => {
            const isYes = typeof val === 'string' && val.toLowerCase() === 'yes';
            const isNo = typeof val === 'string' && val.toLowerCase() === 'no';
            
            return (
              <div 
                key={key}
                className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3 hover:scale-105 transform transition-all duration-300 hover:border-slate-300"
                style={{ 
                  animation: `fadeInUp 0.5s ease ${index * 50}ms forwards`,
                  opacity: 0
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {key}
                  </span>
                  <div className="flex items-center">
                    {isYes ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        ✓ Yes
                      </span>
                    ) : isNo ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                        ✗ No
                      </span>
                    ) : typeof val === 'boolean' ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        val 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200'
                      }`}>
                        {val ? '✓ Yes' : '✗ No'}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        {String(val)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Handle string values (Yes/No)
    if (typeof value === 'string') {
      const isYes = value.toLowerCase() === 'yes';
      return (
        <span className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-300 hover:scale-110 ${
          isYes 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200'
        }`}>
          {isYes ? '✓ ' : '✗ '}{value}
        </span>
      );
    }

    // Handle numeric values
    if (typeof value === 'number') {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg border border-slate-300">
          <span className="text-lg font-bold text-slate-900">{value}</span>
        </div>
      );
    }

    return <span className="text-slate-900">{String(value)}</span>;
  };

  const getCategoryIcon = (categoryName: string) => {
    const nameLower = categoryName.toLowerCase();
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
    <>
      <Sidebar currentPage="evaluation-breakdown" onNavigate={onNavigate} />
      <div className="app-shell min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24">
        <header className="bg-gradient-to-r from-white via-slate-50 to-white border-b-2 border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/evaluation-breakdown')}
                  className="p-2.5 hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-200 rounded-lg transition-all duration-300 hover:scale-110 border border-slate-200"
                  title="Back to Evaluation Breakdown"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {companyName} - Detailed Analysis
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5 font-medium">
                    Category-wise Evaluation Breakdown
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="px-5 py-3 rounded-xl border-2 transform transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: `linear-gradient(135deg, ${companyColors[companyName || '']}15, ${companyColors[companyName || '']}25)`,
                    borderColor: companyColors[companyName || '']
                  }}
                >
                  <span className="text-sm font-semibold text-slate-700">Overall Rating: </span>
                  <span className="text-2xl font-bold" style={{ color: companyColors[companyName || ''] }}>
                    {companyData['Overall Rating']?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 gap-6">
            {categories.map((categoryName, index) => {
              const weight = subcategoryWeightages[categoryName];
              const weightPercent = (weight * 100).toFixed(0) + '%';
              const categoryValue = subcategoryRatings[categoryName];
              const gradient = companyGradients[companyName || ''] || companyGradients['EDRAKY'];

              return (
                <div
                  key={categoryName}
                  className={`${gradient.card} rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]`}
                  style={{ 
                    animation: `fadeInUp 0.6s ease ${index * 100}ms forwards`,
                    opacity: 0
                  }}
                >
                  <div className={`${gradient.header} px-6 py-4 border-b-2 border-slate-200/50 backdrop-blur-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient.icon} flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3`}>
                          <span className="text-xl">{getCategoryIcon(categoryName)}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                          {categoryName}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Weight:</span>
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-slate-100 rounded-lg border-2 border-indigo-300 transform transition-all duration-300 hover:scale-110">
                          <span className="text-sm font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                            {weightPercent}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-white via-slate-50/50 to-transparent">
                    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/80 rounded-xl p-5 border-2 border-slate-200/60">
                      {renderCategoryValue(categoryName, categoryValue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}

