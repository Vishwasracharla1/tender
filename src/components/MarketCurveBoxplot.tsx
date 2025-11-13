interface BoxplotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
  vendorPrices: { vendor: string; price: number; isOutlier: boolean }[];
}

interface MarketCurveBoxplotProps {
  data: BoxplotData[];
  onOutlierClick: (category: string, price: number) => void;
}

export function MarketCurveBoxplot({ data, onOutlierClick }: MarketCurveBoxplotProps) {
  const chartHeight = 400;
  const chartWidth = 600;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const allValues = data.flatMap(d => [d.min, d.max, ...d.outliers]);
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);
  const valueRange = globalMax - globalMin;

  const yScale = (value: number) => {
    return padding.top + plotHeight - ((value - globalMin) / valueRange) * plotHeight;
  };

  const categoryWidth = plotWidth / data.length;
  const boxWidth = Math.min(categoryWidth * 0.5, 60);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Market Price Distribution
        </h2>
        <span className="text-xs text-gray-500">Box Plot Analysis</span>
      </div>

      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F3F4F6" strokeWidth="1"/>
          </pattern>
        </defs>

        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          fill="url(#grid)"
        />

        {data.map((item, index) => {
          const centerX = padding.left + categoryWidth * index + categoryWidth / 2;

          const minY = yScale(item.min);
          const q1Y = yScale(item.q1);
          const medianY = yScale(item.median);
          const q3Y = yScale(item.q3);
          const maxY = yScale(item.max);

          return (
            <g key={index}>
              <line
                x1={centerX}
                y1={minY}
                x2={centerX}
                y2={maxY}
                stroke="#9CA3AF"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              <line
                x1={centerX - 8}
                y1={minY}
                x2={centerX + 8}
                y2={minY}
                stroke="#6B7280"
                strokeWidth="2"
              />

              <line
                x1={centerX - 8}
                y1={maxY}
                x2={centerX + 8}
                y2={maxY}
                stroke="#6B7280"
                strokeWidth="2"
              />

              <rect
                x={centerX - boxWidth / 2}
                y={q3Y}
                width={boxWidth}
                height={q1Y - q3Y}
                fill="#ECFDF5"
                stroke="#10B981"
                strokeWidth="2"
                rx="2"
              />

              <line
                x1={centerX - boxWidth / 2}
                y1={medianY}
                x2={centerX + boxWidth / 2}
                y2={medianY}
                stroke="#059669"
                strokeWidth="2.5"
              />

              {item.outliers.map((outlier, oIndex) => (
                <circle
                  key={oIndex}
                  cx={centerX + (Math.random() - 0.5) * 20}
                  cy={yScale(outlier)}
                  r="4"
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-6 transition-all"
                  onClick={() => onOutlierClick(item.category, outlier)}
                />
              ))}

              {item.vendorPrices.map((vp, vIndex) => {
                if (!vp.isOutlier) {
                  return (
                    <circle
                      key={`vendor-${vIndex}`}
                      cx={centerX + (Math.random() - 0.5) * 15}
                      cy={yScale(vp.price)}
                      r="3"
                      fill="#10B981"
                      opacity="0.6"
                    />
                  );
                }
                return null;
              })}

              <text
                x={centerX}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-700"
              >
                {item.category}
              </text>
            </g>
          );
        })}

        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = globalMin + valueRange * ratio;
            const y = yScale(value);

            return (
              <g key={ratio}>
                <line
                  x1={padding.left - 5}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke="#6B7280"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-600"
                >
                  ${value.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-600 rounded"></div>
          <span className="text-gray-600">IQR Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-700"></div>
          <span className="text-gray-600">Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
          <span className="text-gray-600">Outliers</span>
        </div>
      </div>
    </div>
  );
}
