import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TenderIntegrity {
  tenderId: string;
  department: string;
  integrityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  phase: string;
}

interface IntegrityHeatmapProps {
  data: TenderIntegrity[];
}

export function IntegrityHeatmap({ data }: IntegrityHeatmapProps) {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-emerald-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'high':
        return 'bg-orange-600';
      case 'critical':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const departments = [...new Set(data.map(d => d.department))];
  const tenders = [...new Set(data.map(d => d.tenderId))];

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Integrity Index Heatmap</h3>
          <span className="text-xs text-gray-300">{data.length} tenders tracked</span>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${tenders.length}, 140px)` }}>
              <div className="text-xs font-semibold text-gray-600 py-3 px-4 bg-gray-200 rounded-t-md">
                Department
              </div>
              {tenders.map((tender) => (
                <div key={tender} className="text-xs font-semibold text-gray-600 py-3 px-4 bg-gray-200 rounded-t-md text-center">
                  {tender}
                </div>
              ))}

              {departments.map((dept) => (
                <React.Fragment key={`dept-${dept}`}>
                  <div className="text-sm font-medium text-gray-900 py-3 px-4 bg-gray-100 border-b-2">{dept}</div>
                  {tenders.map((tender) => {
                    const item = data.find(d => d.department === dept && d.tenderId === tender);
                    if (!item) {
                      return (
                        <div key={`${dept}-${tender}`} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <span className="text-xs text-gray-400">N/A</span>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={`${dept}-${tender}`}
                        className={`border rounded-lg p-4 transition-transform transform hover:scale-105 hover:shadow-xl ${getRiskColor(item.riskLevel)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            {item.integrityScore}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${getRiskBadgeColor(item.riskLevel)}`}></span>
                        </div>
                        <div className="text-xs opacity-75 capitalize">
                          {item.phase}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
              <span className="text-gray-600">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-gray-600">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span className="text-gray-600">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-600">Critical Risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
