import { useState } from 'react';

interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

interface MarketDistributionData {
  marketDistribution?: {
    categoryStats?: { [category: string]: BoxplotStats };
  };
}

interface MarketCurveBoxplotProps {
  data?: { [category: string]: BoxplotStats } | MarketDistributionData;
  onOutlierClick?: (category: string, price: number) => void;
}

// Helper function to format category names
const formatCategoryName = (category: string): string => {
  // Handle camelCase category names from agent response
  if (category === 'DevelopmentConfig') return 'Development & Config';
  if (category === 'TestingUAT') return 'Testing & UAT';
  if (category === 'SupportWarranty') return 'Support & Warranty';
  // If already formatted, return as is
  return category;
};

// Type guard to check if data has marketDistribution structure
const hasMarketDistribution = (data: any): data is MarketDistributionData => {
  return data && typeof data === 'object' && 'marketDistribution' in data;
};

export function MarketCurveBoxplot({ data, onOutlierClick }: MarketCurveBoxplotProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Extract categoryStats from nested structure or use data directly
  let categoryStats: { [category: string]: BoxplotStats } = {};
  
  if (data) {
    // Check if data has nested marketDistribution structure
    if (hasMarketDistribution(data) && data.marketDistribution?.categoryStats) {
      categoryStats = data.marketDistribution.categoryStats;
    } 
    // Check if data is already the categoryStats object
    else if (!hasMarketDistribution(data)) {
      categoryStats = data as { [category: string]: BoxplotStats };
    }
  }

  // Format category names and ensure outliers array exists
  const plotData: { [category: string]: BoxplotStats } = {};
  Object.entries(categoryStats).forEach(([key, stats]) => {
    const formattedName = formatCategoryName(key);
    plotData[formattedName] = {
      min: stats.min || 0,
      q1: stats.q1 || 0,
      median: stats.median || 0,
      q3: stats.q3 || 0,
      max: stats.max || 0,
      outliers: Array.isArray(stats.outliers) ? stats.outliers : [] // Ensure outliers array always exists
    };
  });
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const categories = Object.keys(plotData);
  
  // Calculate min/max including outliers - handle empty arrays properly
  const allValues: number[] = [];
  categories.forEach(cat => {
    allValues.push(plotData[cat].min, plotData[cat].max);
    if (plotData[cat].outliers && plotData[cat].outliers.length > 0) {
      allValues.push(...plotData[cat].outliers);
    }
  });
  
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 0;
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const range = maxValue - minValue || 1; // Avoid division by zero
  const padding = range * 0.1;
  const formatCurrency = (value: number) => `₹${(value/1000).toFixed(0)}K`;

  if (!data || Object.keys(plotData).length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
      <style>{`
        .box-hover {
          transition: all 0.2s ease;
        }
        
        .box-hover:hover {
          opacity: 0.9;
        }
        
        .whisker-line {
          transition: all 0.2s ease;
        }
        
        .outlier-dot {
          cursor: pointer;
          pointer-events: all;
        }
      `}</style>
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Market Distribution Box Plot
          </h1>
          <p className="text-gray-600">Interactive Statistical Analysis</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
          <svg width="100%" height="550" viewBox="0 0 900 550" className="overflow-visible">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor: '#000000', stopOpacity: 0.1}} />
                <stop offset="100%" style={{stopColor: '#000000', stopOpacity: 0.05}} />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5, 6].map(i => {
              const y = 50 + (i * 60);
              const value = (maxValue + padding) - (i * (maxValue + padding - minValue + padding) / 6);
              return (
                <g key={i} style={{opacity: 0.6}}>
                  <line x1="60" y1={y} x2="850" y2={y} 
                        stroke="url(#gridGradient)" strokeWidth="1"/>
                  <text x="50" y={y + 4} fontSize="11" fill="#4b5563" textAnchor="end" fontWeight="500">
                    {(value/1000).toFixed(0)}K
                  </text>
                </g>
              );
            })}
            
            {/* Axes */}
            <line x1="60" y1="50" x2="60" y2="410" stroke="#6b7280" strokeWidth="2"/>
            <line x1="60" y1="410" x2="850" y2="410" stroke="#6b7280" strokeWidth="2"/>
            
            {/* Y-axis label */}
            <text x="20" y="230" fontSize="13" fill="#374151" fontWeight="600" 
                  textAnchor="middle" transform="rotate(-90 20 230)">
              Cost (₹)
            </text>
            
            {/* Box plots */}
            {categories.map((category, idx) => {
              const stats = plotData[category];
              const x = 120 + (idx * 120);
              const boxWidth = 60;
              const isHovered = hoveredCategory === idx;
              
              const scale = (val: number) => {
                const normalized = (val - (minValue - padding)) / ((maxValue + padding) - (minValue - padding));
                return 410 - (normalized * 360);
              };
              
              const minY = scale(stats.min);
              const q1Y = scale(stats.q1);
              const medianY = scale(stats.median);
              const q3Y = scale(stats.q3);
              const maxY = scale(stats.max);
              
              // Calculate box height: Q3 is at top (smaller Y), Q1 is at bottom (larger Y)
              // In SVG, Y increases downward, so q3Y < q1Y when q3 > q1 in value
              const boxHeight = Math.abs(q1Y - q3Y);
              // Ensure minimum visible box height when Q1 = Q3
              const minBoxHeight = 8;
              const finalBoxHeight = boxHeight < minBoxHeight ? minBoxHeight : boxHeight;
              
              // Position box at Q3 (top of box)
              const adjustedQ3Y = q3Y;
              const adjustedQ1Y = q1Y;
              
              return (
                <g key={category}>
                  {/* Upper whisker */}
                  <line 
                    x1={x + boxWidth/2} y1={maxY} 
                    x2={x + boxWidth/2} y2={adjustedQ3Y} 
                    stroke={isHovered ? colors[idx] : '#9ca3af'}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="whisker-line"
                    onMouseEnter={() => {
                      setHoveredCategory(idx);
                      setHoveredElement('max');
                    }}
                    onMouseLeave={() => {
                      setHoveredCategory(null);
                      setHoveredElement(null);
                    }}
                  />
                  
                  {/* Lower whisker */}
                  <line 
                    x1={x + boxWidth/2} y1={adjustedQ1Y} 
                    x2={x + boxWidth/2} y2={minY} 
                    stroke={isHovered ? colors[idx] : '#9ca3af'}
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="whisker-line"
                    onMouseEnter={() => {
                      setHoveredCategory(idx);
                      setHoveredElement('min');
                    }}
                    onMouseLeave={() => {
                      setHoveredCategory(null);
                      setHoveredElement(null);
                    }}
                  />
                  
                  {/* Min cap */}
                  <line 
                    x1={x + boxWidth/3} y1={minY} 
                    x2={x + 2*boxWidth/3} y2={minY} 
                    stroke={isHovered && hoveredElement === 'min' ? colors[idx] : '#9ca3af'}
                    strokeWidth={isHovered && hoveredElement === 'min' ? "3" : "2"}
                  />
                  
                  {/* Max cap */}
                  <line 
                    x1={x + boxWidth/3} y1={maxY} 
                    x2={x + 2*boxWidth/3} y2={maxY} 
                    stroke={isHovered && hoveredElement === 'max' ? colors[idx] : '#9ca3af'}
                    strokeWidth={isHovered && hoveredElement === 'max' ? "3" : "2"}
                  />
                  
                  {/* Box */}
                  <rect 
                    x={x} y={adjustedQ3Y} 
                    width={boxWidth} height={finalBoxHeight}
                    fill={colors[idx]} 
                    fillOpacity={isHovered ? "0.9" : "0.7"}
                    stroke={isHovered ? colors[idx] : colors[idx]}
                    strokeWidth="1.5"
                    rx="4"
                    className="box-hover"
                    style={{
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredCategory(idx)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  
                  {/* Median line */}
                  <line 
                    x1={x + 2} y1={medianY} 
                    x2={x + boxWidth - 2} y2={medianY}
                    stroke={isHovered ? '#ffffff' : '#1f2937'}
                    strokeWidth="2.5"
                    onMouseEnter={() => {
                      setHoveredCategory(idx);
                      setHoveredElement('median');
                    }}
                    onMouseLeave={() => {
                      setHoveredCategory(null);
                      setHoveredElement(null);
                    }}
                  />
                  
                  {/* Outliers */}
                  {stats.outliers && stats.outliers.map((outlier: number, oidx: number) => {
                    const outlierY = scale(outlier);
                    return (
                      <circle 
                        key={oidx} 
                        cx={x + boxWidth/2} 
                        cy={outlierY} 
                        r="5"
                        fill={colors[idx]} 
                        stroke="#ffffff" 
                        strokeWidth="1.5"
                        className="outlier-dot"
                        onClick={() => onOutlierClick && onOutlierClick(category, outlier)}
                      />
                    );
                  })}
                  
                  {/* Category label */}
                  <text 
                    x={x + boxWidth/2} y="430" 
                    fontSize="11" 
                    fill={isHovered ? colors[idx] : '#374151'}
                    textAnchor="middle" 
                    fontWeight={isHovered ? "700" : "500"}
                  >
                    {category.split(' & ')[0]}
                  </text>
                  {category.includes(' & ') && (
                    <text 
                      x={x + boxWidth/2} y="443" 
                      fontSize="11" 
                      fill={isHovered ? colors[idx] : '#374151'}
                      textAnchor="middle" 
                      fontWeight={isHovered ? "700" : "500"}
                    >
                      {category.split(' & ')[1]}
                    </text>
                  )}
                  
                  {/* Tooltip */}
                  {isHovered && (
                    <g className="tooltip">
                      <rect 
                        x={x - 50} y={adjustedQ3Y - 130}
                        width="160" height="115"
                        fill="#1e293b" 
                        stroke={colors[idx]}
                        strokeWidth="2"
                        rx="8"
                        style={{
                          filter: `drop-shadow(0 10px 30px ${colors[idx]}60)`
                        }}
                      />
                      <text x={x + 30} y={adjustedQ3Y - 110} fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="700">
                        {category}
                      </text>
                      <text x={x - 35} y={adjustedQ3Y - 90} fontSize="10" fill="#94a3b8" fontWeight="500">
                        Max: <tspan fill={colors[idx]} fontWeight="700">{formatCurrency(stats.max)}</tspan>
                      </text>
                      <text x={x - 35} y={adjustedQ3Y - 75} fontSize="10" fill="#94a3b8" fontWeight="500">
                        Q3: <tspan fill={colors[idx]} fontWeight="700">{formatCurrency(stats.q3)}</tspan>
                      </text>
                      <text x={x - 35} y={adjustedQ3Y - 60} fontSize="10" fill="#94a3b8" fontWeight="500">
                        Median: <tspan fill={colors[idx]} fontWeight="700">{formatCurrency(stats.median)}</tspan>
                      </text>
                      <text x={x - 35} y={adjustedQ3Y - 45} fontSize="10" fill="#94a3b8" fontWeight="500">
                        Q1: <tspan fill={colors[idx]} fontWeight="700">{formatCurrency(stats.q1)}</tspan>
                      </text>
                      <text x={x - 35} y={adjustedQ3Y - 30} fontSize="10" fill="#94a3b8" fontWeight="500">
                        Min: <tspan fill={colors[idx]} fontWeight="700">{formatCurrency(stats.min)}</tspan>
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          {categories.map((category, idx) => (
            <div 
              key={category} 
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all cursor-pointer"
              onMouseEnter={() => setHoveredCategory(idx)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                transform: hoveredCategory === idx ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div 
                className="w-4 h-4 rounded" 
                style={{
                  backgroundColor: colors[idx],
                  boxShadow: hoveredCategory === idx ? `0 0 20px ${colors[idx]}` : 'none'
                }}
              ></div>
              <span className="text-sm text-gray-700 font-medium">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
