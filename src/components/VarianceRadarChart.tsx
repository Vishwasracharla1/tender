// interface DataPoint {
//   label: string;
//   value: number;
// }

// interface VarianceRadarChartProps {
//   data: DataPoint[];
// }

// export function VarianceRadarChart({ data }: VarianceRadarChartProps) {
//   const size = 280;
//   const center = size / 2;
//   const radius = size / 2 - 40;
//   const levels = 5;

//   const angleStep = (2 * Math.PI) / data.length;

//   const getPoint = (index: number, value: number) => {
//     const angle = angleStep * index - Math.PI / 2;
//     const r = (value / 100) * radius;
//     return {
//       x: center + r * Math.cos(angle),
//       y: center + r * Math.sin(angle),
//     };
//   };

//   const getLabelPoint = (index: number) => {
//     const angle = angleStep * index - Math.PI / 2;
//     const r = radius + 25;
//     return {
//       x: center + r * Math.cos(angle),
//       y: center + r * Math.sin(angle),
//     };
//   };

//   const dataPoints = data.map((d, i) => getPoint(i, d.value));
//   const pathData = dataPoints
//     .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
//     .join(' ') + ' Z';

//   return (
//     <div className="bg-white border border-gray-200 rounded-lg p-6">
//       <h2 className="text-base font-semibold text-gray-900 mb-4">
//         Evaluator Variance Radar
//       </h2>

//       <div className="flex justify-center">
//         <svg width={size} height={size} className="overflow-visible">
//           {[...Array(levels)].map((_, i) => {
//             const r = ((i + 1) / levels) * radius;
//             const points = data
//               .map((_, idx) => {
//                 const angle = angleStep * idx - Math.PI / 2;
//                 return `${center + r * Math.cos(angle)},${
//                   center + r * Math.sin(angle)
//                 }`;
//               })
//               .join(' ');

//             return (
//               <g key={i}>
//                 <polygon
//                   points={points}
//                   fill="none"
//                   stroke="#E5E7EB"
//                   strokeWidth="1"
//                 />
//               </g>
//             );
//           })}

//           {data.map((_, i) => {
//             const start = { x: center, y: center };
//             const end = getPoint(i, 100);
//             return (
//               <line
//                 key={i}
//                 x1={start.x}
//                 y1={start.y}
//                 x2={end.x}
//                 y2={end.y}
//                 stroke="#E5E7EB"
//                 strokeWidth="1"
//               />
//             );
//           })}

//           <path
//             d={pathData}
//             fill="rgba(16, 185, 129, 0.2)"
//             stroke="#10B981"
//             strokeWidth="2"
//           />

//           {dataPoints.map((point, i) => (
//             <circle
//               key={i}
//               cx={point.x}
//               cy={point.y}
//               r="4"
//               fill="#10B981"
//               stroke="white"
//               strokeWidth="2"
//             />
//           ))}

//           {data.map((d, i) => {
//             const labelPos = getLabelPoint(i);
//             return (
//               <text
//                 key={i}
//                 x={labelPos.x}
//                 y={labelPos.y}
//                 textAnchor="middle"
//                 dominantBaseline="middle"
//                 className="text-xs font-medium fill-gray-700"
//               >
//                 {d.label}
//               </text>
//             );
//           })}
//         </svg>
//       </div>

//       <div className="mt-4 flex justify-center gap-4">
//         {data.map((d, i) => (
//           <div key={i} className="text-center">
//             <p className="text-xs text-gray-500">{d.label}</p>
//             <p className="text-sm font-semibold text-gray-900">
//               {d.value.toFixed(1)}%
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Radar as RadarIcon } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
}

interface VarianceRadarChartProps {
  data: DataPoint[];
}

export function VarianceRadarChart({ data }: VarianceRadarChartProps) {
  const formatted = data.map((d) => ({
    subject: d.label,
    A: d.value,
  }));

  const getValueBg = (value: number) => {
    if (value >= 85) return 'bg-gradient-to-br from-emerald-50 via-white to-teal-100 border-emerald-200';
    if (value >= 70) return 'bg-gradient-to-br from-blue-50 via-white to-cyan-100 border-blue-200';
    if (value >= 60) return 'bg-gradient-to-br from-amber-50 via-white to-orange-100 border-amber-200';
    return 'bg-gradient-to-br from-rose-50 via-white to-red-100 border-rose-200';
  };

  const getValueText = (value: number) => {
    if (value >= 85) return 'text-emerald-700';
    if (value >= 70) return 'text-blue-700';
    if (value >= 60) return 'text-amber-700';
    return 'text-rose-700';
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] overflow-hidden w-full max-w-full">
      <div className="relative px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-inner flex-shrink-0">
            <RadarIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              Evaluator Variance Radar
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">Variance across categories</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="w-full h-80 mb-6 min-h-0">
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formatted}>
              <PolarGrid 
                stroke="#E5E7EB" 
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ 
                  fill: "#475569", 
                  fontSize: 13, 
                  fontWeight: 600,
                  fontFamily: 'system-ui'
                }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                stroke="#CBD5E1"
                tick={{ fill: "#64748B", fontSize: 11 }}
              />

              <Tooltip
                wrapperStyle={{
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                contentStyle={{
                  fontSize: "13px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
                  backdropFilter: "blur(10px)",
                  fontWeight: 600,
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
              />

              <Radar
                name="Evaluator Score"
                dataKey="A"
                stroke="url(#radarGradient)"
                fill="url(#radarGradient)"
                fillOpacity={0.3}
                strokeWidth={3}
                animationDuration={1200}
                animationEasing="ease-out"
                dot={{ fill: "#10B981", r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                  <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {data.map((d, i) => (
            <div 
              key={i} 
              className={`rounded-xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md min-w-0 ${getValueBg(d.value)}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 truncate">
                {d.label}
              </p>
              <p className={`text-xl font-bold ${getValueText(d.value)}`}>
                {d.value.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
