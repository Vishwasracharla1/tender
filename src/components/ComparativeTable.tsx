import { TrendingUp, TrendingDown, AlertCircle, Check, X, Table2 } from 'lucide-react';
import { useState } from 'react';

interface TableRow {
  id: string;
  item: string;
  vendor: string;
  quotedPrice: number;
  marketMedian: number;
  deviation: number;
  isOutlier: boolean;
  flagStatus: 'pending' | 'accepted' | 'rejected';
}

interface ComparativeTableProps {
  data: TableRow[];
  onFlagAction: (id: string, action: 'accept' | 'reject') => void;
}

export function ComparativeTable({ data, onFlagAction }: ComparativeTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getDeviationColor = (deviation: number) => {
    const absDev = Math.abs(deviation);
    if (absDev < 5) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (absDev < 15) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const getDeviationBadge = (deviation: number) => {
    const absDev = Math.abs(deviation);
    const colors = getDeviationColor(deviation);
    const isPositive = deviation > 0;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${colors.text} ${colors.bg} ${colors.border} shadow-sm`}>
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        {isPositive ? '↑' : '↓'} {Math.abs(deviation).toFixed(1)}%
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-300 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-300 shadow-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-300 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-inner">
            <Table2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Comparative Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{data.length} items analyzed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-200">
            {data.filter(r => r.isOutlier).length} Outliers
          </span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-2 border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quoted
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Market
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Deviation
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const isHovered = hoveredRow === row.id;
              const isOutlierRow = row.isOutlier;
              
              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`
                    transition-all duration-200
                    ${isHovered ? 'bg-gradient-to-r from-indigo-50/50 via-white to-transparent shadow-sm' : ''}
                    ${isOutlierRow && !isHovered ? 'bg-gradient-to-r from-red-50/30 via-white to-transparent' : ''}
                    ${!isOutlierRow && !isHovered ? 'bg-white' : ''}
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isOutlierRow && (
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {row.item}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">{row.vendor}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-gray-900">
                      ${row.quotedPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-gray-600">
                      ${row.marketMedian.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {getDeviationBadge(row.deviation)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.isOutlier ? getStatusBadge(row.flagStatus) : (
                      <span className="text-xs text-gray-400 font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {row.isOutlier && row.flagStatus === 'pending' && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onFlagAction(row.id, 'accept')}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onFlagAction(row.id, 'reject')}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {row.isOutlier && row.flagStatus !== 'pending' && (
                      <span className="text-xs text-gray-400 font-medium">-</span>
                    )}
                    {!row.isOutlier && (
                      <span className="text-xs text-gray-400 font-medium">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
