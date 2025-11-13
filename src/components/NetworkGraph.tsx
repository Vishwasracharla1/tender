import { useState } from 'react';

interface Node {
  id: string;
  name: string;
  type: 'evaluator' | 'vendor';
  biasScore?: number;
}

interface Edge {
  source: string;
  target: string;
  strength: number;
  isSuspicious: boolean;
}

interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
}

export function NetworkGraph({ nodes, edges, onNodeClick }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const width = 600;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const evaluators = nodes.filter(n => n.type === 'evaluator');
  const vendors = nodes.filter(n => n.type === 'vendor');

  const nodePositions = new Map<string, { x: number; y: number }>();

  const evaluatorRadius = 180;
  evaluators.forEach((node, i) => {
    const angle = (i / evaluators.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(node.id, {
      x: centerX + evaluatorRadius * Math.cos(angle),
      y: centerY + evaluatorRadius * Math.sin(angle),
    });
  });

  const vendorRadius = 80;
  vendors.forEach((node, i) => {
    const angle = (i / vendors.length) * 2 * Math.PI - Math.PI / 2;
    nodePositions.set(node.id, {
      x: centerX + vendorRadius * Math.cos(angle),
      y: centerY + vendorRadius * Math.sin(angle),
    });
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Network Relationship Map
        </h2>
        <span className="text-xs text-gray-500">Evaluator-Vendor Analysis</span>
      </div>

      <svg width={width} height={height} className="mx-auto">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#9CA3AF" />
          </marker>
          <marker
            id="arrowhead-suspicious"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#EF4444" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const source = nodePositions.get(edge.source);
          const target = nodePositions.get(edge.target);
          if (!source || !target) return null;

          const isSuspicious = edge.isSuspicious;

          return (
            <line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={isSuspicious ? '#EF4444' : '#D1D5DB'}
              strokeWidth={isSuspicious ? 2 : Math.max(1, edge.strength * 3)}
              strokeOpacity={isSuspicious ? 0.8 : 0.4}
              markerEnd={isSuspicious ? 'url(#arrowhead-suspicious)' : 'url(#arrowhead)'}
            />
          );
        })}

        {nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isEvaluator = node.type === 'evaluator';
          const isHovered = hoveredNode === node.id;
          const nodeRadius = isHovered ? 14 : 12;

          const getNodeColor = () => {
            if (!isEvaluator) return '#10B981';
            if (!node.biasScore) return '#3B82F6';
            if (node.biasScore > 70) return '#EF4444';
            if (node.biasScore > 40) return '#F59E0B';
            return '#3B82F6';
          };

          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={getNodeColor()}
                stroke="white"
                strokeWidth="3"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick(node.id)}
              />

              {isHovered && (
                <g>
                  <rect
                    x={pos.x + 20}
                    y={pos.y - 25}
                    width="120"
                    height="50"
                    fill="white"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={pos.x + 80}
                    y={pos.y - 10}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-900"
                  >
                    {node.name}
                  </text>
                  <text
                    x={pos.x + 80}
                    y={pos.y + 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {isEvaluator ? 'Evaluator' : 'Vendor'}
                  </text>
                  {node.biasScore !== undefined && (
                    <text
                      x={pos.x + 80}
                      y={pos.y + 20}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-red-600"
                    >
                      Bias: {node.biasScore.toFixed(0)}
                    </text>
                  )}
                </g>
              )}

              <text
                x={pos.x}
                y={pos.y + (isEvaluator ? -25 : 30)}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700 pointer-events-none"
              >
                {node.name}
              </text>
            </g>
          );
        })}

        <circle
          cx={centerX}
          cy={centerY}
          r={50}
          fill="#F9FAFB"
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-medium fill-gray-500"
        >
          Analysis
        </text>
      </svg>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-gray-600">Evaluator</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
          <span className="text-gray-600">Vendor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-red-500"></div>
          <span className="text-gray-600">Suspicious Link</span>
        </div>
      </div>
    </div>
  );
}
