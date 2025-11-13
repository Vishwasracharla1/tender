import { useState } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DrillDownLevel {
  name: string;
  value: number;
  trend: number;
  children?: DrillDownLevel[];
  details?: {
    active: number;
    completed: number;
    pending: number;
    avgValue: string;
  };
}

interface DrillDownChartProps {
  title: string;
  data: DrillDownLevel[];
  type: 'tenders' | 'value' | 'vendors';
}

export function DrillDownChart({ title, data, type }: DrillDownChartProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const renderItem = (item: DrillDownLevel, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);
    const indent = level * 24;

    return (
      <div key={item.name}>
        <div
          className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
            level > 0 ? 'border-l-2 border-gray-200' : ''
          }`}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => hasChildren && toggleExpand(item.name)}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasChildren && (
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
            {!hasChildren && <div className="w-4" />}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${level === 0 ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                  {item.name}
                </span>
                {level === 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {hasChildren ? `${item.children?.length} sub-items` : 'No breakdown'}
                  </span>
                )}
              </div>

              {item.details && isExpanded && (
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span>Active: <span className="font-semibold text-blue-600">{item.details.active}</span></span>
                  <span>Completed: <span className="font-semibold text-green-600">{item.details.completed}</span></span>
                  <span>Pending: <span className="font-semibold text-orange-600">{item.details.pending}</span></span>
                  <span>Avg Value: <span className="font-semibold text-gray-900">{item.details.avgValue}</span></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderTrendIcon(item.trend)}
              <span
                className={`text-xs font-semibold ${
                  item.trend > 0
                    ? 'text-green-600'
                    : item.trend < 0
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                {item.trend > 0 ? '+' : ''}{item.trend}%
              </span>
            </div>

            <div className="text-right min-w-[100px]">
              <div className={`text-sm font-bold ${level === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                {type === 'value' && 'AED '}
                {item.value.toLocaleString()}
                {type === 'vendors' && ' vendors'}
                {type === 'tenders' && ' tenders'}
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Click to expand and view details
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">
              {type === 'value' && 'AED '}
              {totalValue.toLocaleString()}
              {type === 'vendors' && ' vendors'}
              {type === 'tenders' && ' tenders'}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {data.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
