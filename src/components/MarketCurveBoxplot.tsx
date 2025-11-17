import { useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

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
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredOutlier, setHoveredOutlier] = useState<{ category: string; price: number; x: number; y: number } | null>(null);
  
  const chartHeight = 450;
  const chartWidth = 700;
  const padding = { top: 50, right: 50, bottom: 70, left: 90 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const allValues = data.flatMap(d => [d.min, d.max, ...d.outliers]);
  const globalMin = Math.min(...allValues);
  const globalMax = Math.max(...allValues);
  const valueRange = globalMax - globalMin;

  // Add some padding to the range for better visualization
  const paddedMin = globalMin - valueRange * 0.05;
  const paddedMax = globalMax + valueRange * 0.05;
  const paddedRange = paddedMax - paddedMin;

  const yScale = (value: number) => {
    return padding.top + plotHeight - ((value - paddedMin) / paddedRange) * plotHeight;
  };

  const categoryWidth = plotWidth / data.length;
  const boxWidth = Math.min(categoryWidth * 0.6, 80);

  // Generate Y-axis tick values
  const generateYTicks = () => {
    const ticks = [];
    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const value = paddedMin + (paddedRange * i) / numTicks;
      ticks.push(value);
    }
    return ticks;
  };

  const yTicks = generateYTicks();

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-slate-50 shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden h-full flex flex-col max-h-[600px]">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-inner">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Market Price Distribution
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Box Plot Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Price Trends</span>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          <defs>
            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="boxBorderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
            </pattern>
          </defs>

          {/* Background grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#grid)"
            className="opacity-50"
          />
          
          {/* Y-axis background gradient */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#linearGradient)"
            opacity="0.03"
          />
          <defs>
            <linearGradient id="linearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

        {/* Y-axis line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="#6B7280"
          strokeWidth="2"
        />

        {/* X-axis line */}
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="#6B7280"
          strokeWidth="2"
        />

        {/* Y-axis ticks and labels */}
        {yTicks.map((value, index) => {
          const y = yScale(value);
          return (
            <g key={`y-tick-${index}`}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#6B7280"
                strokeWidth="1.5"
              />
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + plotWidth}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <text
                x={padding.left - 12}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                ${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </text>
            </g>
          );
        })}

        {/* Box plots */}
        {data.map((item, index) => {
          const centerX = padding.left + categoryWidth * index + categoryWidth / 2;
          const isHovered = hoveredCategory === item.category;

          const minY = yScale(item.min);
          const q1Y = yScale(item.q1);
          const medianY = yScale(item.median);
          const q3Y = yScale(item.q3);
          const maxY = yScale(item.max);

          return (
            <g 
              key={index}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="cursor-pointer"
            >
              {/* Whisker line */}
              <line
                x1={centerX}
                y1={minY}
                x2={centerX}
                y2={maxY}
                stroke={isHovered ? "#3B82F6" : "#9CA3AF"}
                strokeWidth={isHovered ? "2" : "1.5"}
                strokeDasharray={isHovered ? "0" : "3,3"}
                opacity={isHovered ? "1" : "0.7"}
                className="transition-all duration-200"
              />

              {/* Min whisker cap */}
              <line
                x1={centerX - 10}
                y1={minY}
                x2={centerX + 10}
                y2={minY}
                stroke={isHovered ? "#3B82F6" : "#6B7280"}
                strokeWidth={isHovered ? "2.5" : "2"}
                className="transition-all duration-200"
              />

              {/* Max whisker cap */}
              <line
                x1={centerX - 10}
                y1={maxY}
                x2={centerX + 10}
                y2={maxY}
                stroke={isHovered ? "#3B82F6" : "#6B7280"}
                strokeWidth={isHovered ? "2.5" : "2"}
                className="transition-all duration-200"
              />

              {/* IQR Box with gradient */}
              <rect
                x={centerX - boxWidth / 2}
                y={q3Y}
                width={boxWidth}
                height={q1Y - q3Y}
                fill={isHovered ? "url(#boxGradient)" : "#ECFDF5"}
                stroke={isHovered ? "url(#boxBorderGradient)" : "#10B981"}
                strokeWidth={isHovered ? "2.5" : "2"}
                rx="4"
                filter={isHovered ? "url(#shadow)" : "none"}
                className="transition-all duration-200"
              />

              {/* Median line */}
              <line
                x1={centerX - boxWidth / 2}
                y1={medianY}
                x2={centerX + boxWidth / 2}
                y2={medianY}
                stroke={isHovered ? "#059669" : "#047857"}
                strokeWidth={isHovered ? "3.5" : "3"}
                className="transition-all duration-200"
              />

              {/* Q1 line (subtle) */}
              <line
                x1={centerX - boxWidth / 2 - 2}
                y1={q1Y}
                x2={centerX + boxWidth / 2 + 2}
                y2={q1Y}
                stroke="#10B981"
                strokeWidth="1"
                opacity="0.4"
                strokeDasharray="2,2"
              />

              {/* Q3 line (subtle) */}
              <line
                x1={centerX - boxWidth / 2 - 2}
                y1={q3Y}
                x2={centerX + boxWidth / 2 + 2}
                y2={q3Y}
                stroke="#10B981"
                strokeWidth="1"
                opacity="0.4"
                strokeDasharray="2,2"
              />

              {/* Outliers */}
              {item.outliers.map((outlier, oIndex) => {
                const outlierX = centerX + (Math.random() - 0.5) * 25;
                const outlierY = yScale(outlier);
                const isOutlierHovered = hoveredOutlier?.category === item.category && hoveredOutlier?.price === outlier;
                
                return (
                  <g key={`outlier-${oIndex}`}>
                    <circle
                      cx={outlierX}
                      cy={outlierY}
                      r={isOutlierHovered ? "6" : "5"}
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth={isOutlierHovered ? "3" : "2"}
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      onClick={() => onOutlierClick(item.category, outlier)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredOutlier({ 
                          category: item.category, 
                          price: outlier,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredOutlier(null)}
                      filter="url(#shadow)"
                    />
                    {isOutlierHovered && (
                      <text
                        x={outlierX}
                        y={outlierY - 12}
                        textAnchor="middle"
                        className="text-[10px] fill-red-600 font-semibold"
                      >
                        ${outlier.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Vendor prices (non-outliers) */}
              {item.vendorPrices.map((vp, vIndex) => {
                if (!vp.isOutlier) {
                  return (
                    <circle
                      key={`vendor-${vIndex}`}
                      cx={centerX + (Math.random() - 0.5) * 20}
                      cy={yScale(vp.price)}
                      r="3"
                      fill="#10B981"
                      opacity={isHovered ? "0.8" : "0.5"}
                      className="transition-all duration-200"
                    />
                  );
                }
                return null;
              })}

              {/* Category label */}
              <text
                x={centerX}
                y={chartHeight - padding.bottom + 25}
                textAnchor="middle"
                className={`text-sm fill-gray-700 font-semibold transition-all duration-200 ${isHovered ? 'fill-blue-700' : ''}`}
              >
                {item.category}
              </text>

              {/* Hover info box */}
              {isHovered && (
                <g>
                  <rect
                    x={centerX - 60}
                    y={padding.top + 10}
                    width="120"
                    height="80"
                    fill="white"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    rx="8"
                    filter="url(#shadow)"
                    opacity="0.95"
                  />
                  <text
                    x={centerX}
                    y={padding.top + 30}
                    textAnchor="middle"
                    className="text-xs fill-gray-900 font-bold"
                  >
                    {item.category}
                  </text>
                  <text
                    x={centerX}
                    y={padding.top + 48}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-600"
                  >
                    Median: ${item.median.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </text>
                  <text
                    x={centerX}
                    y={padding.top + 62}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-600"
                  >
                    IQR: ${item.q1.toLocaleString('en-US', { maximumFractionDigits: 0 })} - ${item.q3.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </text>
                  <text
                    x={centerX}
                    y={padding.top + 76}
                    textAnchor="middle"
                    className="text-[10px] fill-red-600 font-semibold"
                  >
                    {item.outliers.length} Outlier{item.outliers.length !== 1 ? 's' : ''}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Y-axis label */}
        <text
          x={padding.left - 50}
          y={padding.top + plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${padding.left - 50} ${padding.top + plotHeight / 2})`}
          className="text-sm fill-gray-700 font-semibold"
        >
          Price ($)
        </text>
      </svg>
      </div>

      {/* Enhanced Legend */}
      <div className="px-6 pb-6 pt-4 border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-700 rounded shadow-sm"></div>
            <span className="text-xs font-semibold text-emerald-700">IQR Range</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <div className="w-8 h-1 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded shadow-sm"></div>
            <span className="text-xs font-semibold text-emerald-700">Median</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 border-2 border-white rounded-full shadow-md"></div>
            <span className="text-xs font-semibold text-red-700">Outliers</span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <div className="w-3 h-3 bg-emerald-500 rounded-full opacity-60"></div>
            <span className="text-xs font-semibold text-emerald-700">Vendor Prices</span>
          </div>
        </div>
      </div>
    </div>
  );
}
