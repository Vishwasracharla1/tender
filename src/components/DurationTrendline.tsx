// import { TrendingUp, TrendingDown } from 'lucide-react';

// interface DurationData {
//   period: string;
//   avgDuration: number;
//   targetDuration: number;
//   variance: number;
// }

// interface DurationTrendlineProps {
//   data: DurationData[];
// }

// export function DurationTrendline({ data }: DurationTrendlineProps) {
//   const maxValue = Math.max(...data.map(d => Math.max(d.avgDuration, d.targetDuration)));
//   const minValue = Math.min(...data.map(d => Math.min(d.avgDuration, d.targetDuration)));
//   const range = maxValue - minValue;

//   const getYPosition = (value: number) => {
//     return 100 - ((value - minValue) / range) * 100;
//   };

//   const overallTrend = data.length > 1
//     ? data[data.length - 1].avgDuration - data[0].avgDuration
//     : 0;

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
//       <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//         <div className="flex items-center justify-between">
//           <h3 className="text-base font-semibold text-gray-900">
//             Evaluation Duration Trend
//           </h3>
//           <div className="flex items-center gap-2">
//             {overallTrend < 0 ? (
//               <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
//                 <TrendingDown className="w-3 h-3" />
//                 {Math.abs(overallTrend).toFixed(1)} days faster
//               </span>
//             ) : overallTrend > 0 ? (
//               <span className="flex items-center gap-1 text-xs font-medium text-red-600">
//                 <TrendingUp className="w-3 h-3" />
//                 {overallTrend.toFixed(1)} days slower
//               </span>
//             ) : (
//               <span className="text-xs font-medium text-gray-600">
//                 Stable
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="p-6">
//         <div className="relative h-64">
//           <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
//             <defs>
//               <linearGradient id="actualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
//                 <stop offset="0%" stopColor="rgb(37, 99, 235)" stopOpacity="0.2" />
//                 <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0" />
//               </linearGradient>
//             </defs>

//             {data.map((point, index) => {
//               if (index === 0) return null;
//               const prevPoint = data[index - 1];
//               const x1 = (index - 1) * (600 / (data.length - 1));
//               const x2 = index * (600 / (data.length - 1));
//               const y1 = getYPosition(prevPoint.avgDuration);
//               const y2 = getYPosition(point.avgDuration);

//               return (
//                 <line
//                   key={`actual-${index}`}
//                   x1={x1}
//                   y1={y1}
//                   x2={x2}
//                   y2={y2}
//                   stroke="rgb(37, 99, 235)"
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                 />
//               );
//             })}

//             {data.map((point, index) => {
//               if (index === 0) return null;
//               const prevPoint = data[index - 1];
//               const x1 = (index - 1) * (600 / (data.length - 1));
//               const x2 = index * (600 / (data.length - 1));
//               const y1 = getYPosition(prevPoint.targetDuration);
//               const y2 = getYPosition(point.targetDuration);

//               return (
//                 <line
//                   key={`target-${index}`}
//                   x1={x1}
//                   y1={y1}
//                   x2={x2}
//                   y2={y2}
//                   stroke="rgb(156, 163, 175)"
//                   strokeWidth="2"
//                   strokeDasharray="4 4"
//                 />
//               );
//             })}

//             {data.map((point, index) => {
//               const x = index * (600 / (data.length - 1));
//               const y = getYPosition(point.avgDuration);
//               return (
//                 <circle
//                   key={`dot-${index}`}
//                   cx={x}
//                   cy={y}
//                   r="5"
//                   fill="rgb(37, 99, 235)"
//                   stroke="white"
//                   strokeWidth="2"
//                 />
//               );
//             })}
//           </svg>

//           <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
//             {data.map((point, index) => (
//               <div key={index} className="text-xs text-gray-600 text-center">
//                 {point.period}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mt-6 grid grid-cols-3 gap-4">
//           {data.slice(-3).map((point, index) => (
//             <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
//               <div className="text-xs text-gray-600 mb-1">{point.period}</div>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-lg font-bold text-gray-900">
//                   {point.avgDuration}
//                 </span>
//                 <span className="text-xs text-gray-500">days</span>
//               </div>
//               <div className={`text-xs mt-1 ${point.variance < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                 {point.variance > 0 ? '+' : ''}{point.variance} vs target
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-6 pt-6 border-t border-gray-200">
//           <div className="flex items-center justify-center gap-6 text-xs">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-0.5 bg-blue-600"></div>
//               <span className="text-gray-600">Actual Duration</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-0.5 bg-gray-400 border-t-2 border-dashed border-gray-400"></div>
//               <span className="text-gray-600">Target Duration</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';

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

  const overallTrend = data.length > 1
    ? data[data.length - 1].avgDuration - data[0].avgDuration
    : 0;

  const getYPosition = (value: number) => {
    return 100 - ((value - minValue) / range) * 100;
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#f97316',
          width: 2,
          type: 'solid',
        },
        shadowStyle: {
          color: 'rgba(249, 115, 22, 0.1)',
        },
      },
      formatter: function(params: any) {
        let result = `<div style="padding: 8px 0;"><strong>${params[0].axisValue}</strong></div>`;
        params.forEach((param: any) => {
          const color = param.seriesName === 'Actual Duration' ? '#f97316' : '#3b82f6';
          result += `<div style="margin: 4px 0; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
            <span>${param.seriesName}: <strong>${param.value} days</strong></span>
          </div>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Actual Duration', 'Target Duration'],
      top: 10,
      right: 20,
      textStyle: {
        color: '#374151',
        fontSize: 12,
        fontWeight: 500,
      },
      itemGap: 20,
      itemWidth: 14,
      itemHeight: 14,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(point => point.period),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
          width: 1,
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
          fontWeight: 500,
        },
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
          width: 1,
        },
      },
      axisLabel: {
        formatter: '{value}',
        textStyle: {
          color: '#6b7280',
          fontSize: 11,
          fontWeight: 500,
        },
        margin: 8,
      },
    },
    series: [
      {
        name: 'Actual Duration',
        type: 'line',
        data: data.map(point => point.avgDuration),
        smooth: true,
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#f97316' },
              { offset: 1, color: '#fb923c' },
            ],
          },
          width: 4,
          shadowBlur: 8,
          shadowColor: 'rgba(249, 115, 22, 0.3)',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.05)' },
            ],
          },
        },
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#f97316',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 6,
          shadowColor: 'rgba(249, 115, 22, 0.4)',
        },
        emphasis: {
          itemStyle: {
            color: '#f97316',
            borderColor: '#fff',
            borderWidth: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(249, 115, 22, 0.6)',
          },
          lineStyle: {
            width: 5,
          },
        },
      },
      {
        name: 'Target Duration',
        type: 'line',
        data: data.map(point => point.targetDuration),
        smooth: true,
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#60a5fa' },
            ],
          },
          width: 3,
          type: 'dashed',
          dashOffset: 5,
          shadowBlur: 4,
          shadowColor: 'rgba(59, 130, 246, 0.2)',
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#3b82f6',
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 4,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
        },
        emphasis: {
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
          lineStyle: {
            width: 4,
          },
        },
      },
    ],
  };

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
          <ReactECharts option={option} />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {data.slice(-3).map((point, index) => (
            <div key={index} className="bg-gradient-to-br from-white via-blue-50/40 to-slate-50 rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{point.period}</div>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {point.avgDuration}
                </span>
                <span className="text-xs font-semibold text-slate-500">days</span>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                point.variance < 0 
                  ? 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200' 
                  : 'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
              }`}>
                {point.variance < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {point.variance > 0 ? '+' : ''}{point.variance} vs target
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
