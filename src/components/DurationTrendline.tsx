import { TrendingUp, TrendingDown } from 'lucide-react';

interface DurationData {
  period: string;
  avgDuration: number;
  targetDuration: number;
  variance: number;
}

interface DurationTrendlineProps {
  data: DurationData[];
}

export function DurationTrendline({ data }: DurationTrendlineProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.avgDuration, d.targetDuration)));
  const minValue = Math.min(...data.map(d => Math.min(d.avgDuration, d.targetDuration)));
  const range = maxValue - minValue;

  const getYPosition = (value: number) => {
    return 100 - ((value - minValue) / range) * 100;
  };

  const overallTrend = data.length > 1
    ? data[data.length - 1].avgDuration - data[0].avgDuration
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Evaluation Duration Trend
          </h3>
          <div className="flex items-center gap-2">
            {overallTrend < 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(overallTrend).toFixed(1)} days faster
              </span>
            ) : overallTrend > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                <TrendingUp className="w-3 h-3" />
                {overallTrend.toFixed(1)} days slower
              </span>
            ) : (
              <span className="text-xs font-medium text-gray-600">
                Stable
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(37, 99, 235)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {data.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = data[index - 1];
              const x1 = (index - 1) * (600 / (data.length - 1));
              const x2 = index * (600 / (data.length - 1));
              const y1 = getYPosition(prevPoint.avgDuration);
              const y2 = getYPosition(point.avgDuration);

              return (
                <line
                  key={`actual-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgb(37, 99, 235)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}

            {data.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = data[index - 1];
              const x1 = (index - 1) * (600 / (data.length - 1));
              const x2 = index * (600 / (data.length - 1));
              const y1 = getYPosition(prevPoint.targetDuration);
              const y2 = getYPosition(point.targetDuration);

              return (
                <line
                  key={`target-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgb(156, 163, 175)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}

            {data.map((point, index) => {
              const x = index * (600 / (data.length - 1));
              const y = getYPosition(point.avgDuration);
              return (
                <circle
                  key={`dot-${index}`}
                  cx={x}
                  cy={y}
                  r="5"
                  fill="rgb(37, 99, 235)"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {data.map((point, index) => (
              <div key={index} className="text-xs text-gray-600 text-center">
                {point.period}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {data.slice(-3).map((point, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">{point.period}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {point.avgDuration}
                </span>
                <span className="text-xs text-gray-500">days</span>
              </div>
              <div className={`text-xs mt-1 ${point.variance < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {point.variance > 0 ? '+' : ''}{point.variance} vs target
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-600"></div>
              <span className="text-gray-600">Actual Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gray-400 border-t-2 border-dashed border-gray-400"></div>
              <span className="text-gray-600">Target Duration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
