interface DataPoint {
  label: string;
  value: number;
}

interface VarianceRadarChartProps {
  data: DataPoint[];
}

export function VarianceRadarChart({ data }: VarianceRadarChartProps) {
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 40;
  const levels = 5;

  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = radius + 25;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const dataPoints = data.map((d, i) => getPoint(i, d.value));
  const pathData = dataPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Evaluator Variance Radar
      </h2>

      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {[...Array(levels)].map((_, i) => {
            const r = ((i + 1) / levels) * radius;
            const points = data
              .map((_, idx) => {
                const angle = angleStep * idx - Math.PI / 2;
                return `${center + r * Math.cos(angle)},${
                  center + r * Math.sin(angle)
                }`;
              })
              .join(' ');

            return (
              <g key={i}>
                <polygon
                  points={points}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {data.map((_, i) => {
            const start = { x: center, y: center };
            const end = getPoint(i, 100);
            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            );
          })}

          <path
            d={pathData}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10B981"
            strokeWidth="2"
          />

          {dataPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10B981"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {data.map((d, i) => {
            const labelPos = getLabelPoint(i);
            return (
              <text
                key={i}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex justify-center gap-4">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-xs text-gray-500">{d.label}</p>
            <p className="text-sm font-semibold text-gray-900">
              {d.value.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
