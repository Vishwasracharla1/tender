import { TrendingUp, TrendingDown, AlertCircle, Check, X } from 'lucide-react';

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
  const getDeviationColor = (deviation: number) => {
    if (Math.abs(deviation) < 5) return 'text-gray-900';
    if (Math.abs(deviation) < 15) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
            <Check className="w-3 h-3" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-full border border-yellow-200">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">
          Comparative Analysis
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Vendor
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Quoted
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Market
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Deviation
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 transition-colors ${
                  row.isOutlier ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">
                    {row.item}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">{row.vendor}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    ${row.quotedPrice.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-600">
                    ${row.marketMedian.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {row.deviation > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : row.deviation < 0 ? (
                      <TrendingDown className="w-4 h-4 text-emerald-600" />
                    ) : null}
                    <span className={`text-sm font-medium ${getDeviationColor(row.deviation)}`}>
                      {row.deviation > 0 ? '+' : ''}
                      {row.deviation.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.isOutlier ? getStatusBadge(row.flagStatus) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.isOutlier && row.flagStatus === 'pending' && (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onFlagAction(row.id, 'accept')}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onFlagAction(row.id, 'reject')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
