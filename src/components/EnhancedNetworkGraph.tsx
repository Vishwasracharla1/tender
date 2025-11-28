import { useState, useRef, useEffect } from 'react';
import { AlertCircle, TrendingUp, Brain, Users, Zap, Info, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  type: 'evaluator' | 'vendor';
  biasScore?: number;
  department?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Edge {
  source: string;
  target: string;
  strength: number;
  isSuspicious: boolean;
  interactionCount?: number;
  tenderHistory?: string[];
}

interface CausalInsight {
  type: 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  confidence: number;
  affectedNodes: string[];
}

interface AICausalAnalysis {
  summary?: string;
  rootCauses?: Array<{
    id: string;
    type: string;
    description: string;
    confidence: number;
    impactScore?: number;
    relatedAlerts?: string[];
    primaryEntities?: string[];
  }>;
  mitigationActions?: Array<{
    id: string;
    title: string;
    description: string;
    owner?: string;
    dueDate?: string;
    priority?: string;
    status?: string;
  }>;
}

interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (nodeId: string) => void;
  aiCausalAnalysis?: AICausalAnalysis;
}

export function EnhancedNetworkGraph({ nodes, edges, onNodeClick, aiCausalAnalysis }: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  const width = 700;
  const height = 550;
  const centerX = width / 2;
  const centerY = height / 2;

  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const evaluators = nodes.filter(n => n.type === 'evaluator');
    const vendors = nodes.filter(n => n.type === 'vendor');

    const positions = new Map<string, { x: number; y: number }>();

    const evaluatorRadius = 200;
    evaluators.forEach((node, i) => {
      const angle = (i / evaluators.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(node.id, {
        x: node.fx ?? centerX + evaluatorRadius * Math.cos(angle),
        y: node.fy ?? centerY + evaluatorRadius * Math.sin(angle),
      });
    });

    const vendorRadius = 100;
    vendors.forEach((node, i) => {
      const angle = (i / vendors.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(node.id, {
        x: node.fx ?? centerX + vendorRadius * Math.cos(angle),
        y: node.fy ?? centerY + vendorRadius * Math.sin(angle),
      });
    });

    setNodePositions(positions);
  }, [nodes, centerX, centerY]);

  const evaluators = nodes.filter(n => n.type === 'evaluator');
  const vendors = nodes.filter(n => n.type === 'vendor');

  const generateCausalInsights = (): CausalInsight[] => {
    // If AI Causal Analysis data is provided, use it
    if (aiCausalAnalysis?.rootCauses && aiCausalAnalysis.rootCauses.length > 0) {
      return aiCausalAnalysis.rootCauses.map((cause) => {
        // Map root cause types to insight types
        let insightType: 'warning' | 'info' | 'critical' = 'info';
        if (cause.type === 'evaluator_bias' || cause.type === 'vendor_favoritism') {
          insightType = cause.confidence > 0.85 ? 'critical' : 'warning';
        }

        // Find affected node IDs from primary entities
        const affectedNodes: string[] = [];
        cause.primaryEntities?.forEach((entityName) => {
          const node = nodes.find(n => n.name === entityName);
          if (node) {
            affectedNodes.push(node.id);
          }
        });

        return {
          type: insightType,
          title: cause.type === 'evaluator_bias' ? 'Evaluator Bias Detected' :
                 cause.type === 'vendor_favoritism' ? 'Vendor Favoritism Pattern' :
                 'Integrity Risk Pattern',
          description: cause.description,
          confidence: Math.round(cause.confidence * 100),
          affectedNodes: affectedNodes.length > 0 ? affectedNodes : []
        };
      });
    }

    // Fallback to generated insights if no AI data
    const insights: CausalInsight[] = [];

    const suspiciousEdges = edges.filter(e => e.isSuspicious);

    suspiciousEdges.forEach(edge => {
      const evaluator = nodes.find(n => n.id === edge.source);
      const vendor = nodes.find(n => n.id === edge.target);

      if (evaluator && vendor) {
        if (edge.strength > 0.8) {
          insights.push({
            type: 'critical',
            title: 'High-Frequency Bias Pattern Detected',
            description: `${evaluator.name} shows consistent preference for ${vendor.name} across ${edge.interactionCount || 5} tenders. Scores are ${((edge.strength - 0.5) * 100).toFixed(0)}% higher than peer average.`,
            confidence: 92,
            affectedNodes: [edge.source, edge.target]
          });
        }

        if (evaluator.biasScore && evaluator.biasScore > 60) {
          insights.push({
            type: 'warning',
            title: 'Evaluator Consistency Anomaly',
            description: `${evaluator.name} demonstrates scoring patterns that deviate significantly from committee consensus. Potential cognitive bias or external influence detected.`,
            confidence: 87,
            affectedNodes: [edge.source]
          });
        }
      }
    });

    const highBiasEvaluators = evaluators.filter(e => e.biasScore && e.biasScore > 50);
    if (highBiasEvaluators.length > 1) {
      insights.push({
        type: 'warning',
        title: 'Multiple Evaluators Flagged',
        description: `${highBiasEvaluators.length} evaluators show elevated bias scores. This may indicate systemic issues in evaluation criteria or training requirements.`,
        confidence: 78,
        affectedNodes: highBiasEvaluators.map(e => e.id)
      });
    }

    const vendorConnections = new Map<string, number>();
    edges.forEach(edge => {
      const count = vendorConnections.get(edge.target) || 0;
      vendorConnections.set(edge.target, count + 1);
    });

    vendorConnections.forEach((count, vendorId) => {
      if (count > evaluators.length * 0.7) {
        const vendor = nodes.find(n => n.id === vendorId);
        if (vendor) {
          insights.push({
            type: 'info',
            title: 'Vendor Concentration Pattern',
            description: `${vendor.name} is evaluated by ${((count / evaluators.length) * 100).toFixed(0)}% of evaluators. High exposure may indicate market dominance or bid frequency.`,
            confidence: 85,
            affectedNodes: [vendorId]
          });
        }
      }
    });

    return insights;
  };

  const causalInsights = generateCausalInsights();

  const getEdgeKey = (source: string, target: string) => `${source}-${target}`;

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    onNodeClick(nodeId);
  };

  const getConnectedNodes = (nodeId: string): string[] => {
    const connected = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === nodeId) connected.add(edge.target);
      if (edge.target === nodeId) connected.add(edge.source);
    });
    return Array.from(connected);
  };

  const connectedNodes = selectedNode ? getConnectedNodes(selectedNode) : [];

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>, nodeId?: string) => {
    if (nodeId) {
      setDraggedNode(nodeId);
    } else if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNode) {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions(prev => {
        const newPositions = new Map(prev);
        newPositions.set(draggedNode, { x, y });
        return newPositions;
      });
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev / 1.2));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNodePositions(new Map());
  };

  const handleFitView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Network Relationship Map
          </h2>
          <p className="text-xs text-gray-500 mt-1">AI-Powered Interactive Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Brain className="w-4 h-4" />
            {showInsights ? 'Hide' : 'Show'} AI Insights
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Total Evaluators Card */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-100 border border-blue-200 rounded-lg p-4 shadow-[0_8px_20px_rgba(59,130,246,0.12)] hover:shadow-[0_12px_28px_rgba(59,130,246,0.18)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Evaluators</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mb-1">{evaluators.length}</p>
          <p className="text-xs font-medium text-blue-600 mt-0.5">
            {evaluators.filter(e => e.biasScore && e.biasScore > 50).length} flagged
          </p>
        </div>

        {/* Relationships Card */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-violet-100 border border-purple-200 rounded-lg p-4 shadow-[0_8px_20px_rgba(147,51,234,0.12)] hover:shadow-[0_12px_28px_rgba(147,51,234,0.18)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Relationships</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mb-1">{edges.length}</p>
          <p className="text-xs font-medium text-purple-600 mt-0.5">
            {edges.filter(e => e.isSuspicious).length} suspicious
          </p>
        </div>

        {/* Avg Bias Score Card */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-100 border border-emerald-200 rounded-lg p-4 shadow-[0_8px_20px_rgba(5,150,105,0.12)] hover:shadow-[0_12px_28px_rgba(5,150,105,0.18)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Avg Bias Score</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mb-1">
            {evaluators.length > 0 
              ? (evaluators.reduce((sum, e) => sum + (e.biasScore || 0), 0) / evaluators.length).toFixed(1)
              : '0.0'}
          </p>
          <p className="text-xs font-medium text-emerald-600 mt-0.5">Department average</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleFitView}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Fit View"
          >
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="mx-auto border border-gray-200 rounded-lg bg-gray-50 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleMouseDown(e)}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
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
            <marker
              id="arrowhead-selected"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {edges.map((edge, i) => {
              const source = nodePositions.get(edge.source);
              const target = nodePositions.get(edge.target);
              if (!source || !target) return null;

              const edgeKey = getEdgeKey(edge.source, edge.target);
              const isHovered = hoveredEdge === edgeKey;
              const isConnectedToSelected = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);
              const isSuspicious = edge.isSuspicious;

              const strokeColor = isConnectedToSelected ? '#3B82F6' : isSuspicious ? '#EF4444' : '#D1D5DB';
              const strokeWidth = isHovered ? 4 : isSuspicious ? 3 : Math.max(1.5, edge.strength * 3);
              const strokeOpacity = isConnectedToSelected ? 0.9 : isSuspicious ? 0.8 : 0.5;

              return (
                <g key={i}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    markerEnd={isConnectedToSelected ? 'url(#arrowhead-selected)' : isSuspicious ? 'url(#arrowhead-suspicious)' : 'url(#arrowhead)'}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredEdge(edgeKey)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />

                  {isHovered && (
                    <g>
                      <rect
                        x={(source.x + target.x) / 2 - 60}
                        y={(source.y + target.y) / 2 - 35}
                        width="120"
                        height="70"
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        rx="6"
                        filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                      />
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 15}
                        textAnchor="middle"
                        className="text-xs font-semibold fill-gray-900"
                      >
                        Strength: {(edge.strength * 100).toFixed(0)}%
                      </text>
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        Interactions: {edge.interactionCount || 5}
                      </text>
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 + 15}
                        textAnchor="middle"
                        className={`text-xs font-medium ${isSuspicious ? 'fill-red-600' : 'fill-emerald-600'}`}
                      >
                        {isSuspicious ? '⚠ Suspicious' : '✓ Normal'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {nodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;

              const isEvaluator = node.type === 'evaluator';
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              const isConnected = connectedNodes.includes(node.id);
              const isDragging = draggedNode === node.id;
              const nodeRadius = isSelected ? 18 : isHovered ? 16 : isConnected ? 14 : 12;

              const getNodeColor = () => {
                if (!isEvaluator) return '#10B981';
                if (!node.biasScore) return '#3B82F6';
                if (node.biasScore > 70) return '#EF4444';
                if (node.biasScore > 40) return '#F59E0B';
                return '#3B82F6';
              };

              const nodeColor = getNodeColor();

              return (
                <g key={node.id}>
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 8}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="2"
                      strokeOpacity="0.3"
                      className="animate-pulse"
                    />
                  )}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeRadius}
                    fill={nodeColor}
                    stroke="white"
                    strokeWidth="3"
                    className={`cursor-move transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{
                      filter: isHovered || isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e.nativeEvent as unknown as React.MouseEvent<SVGSVGElement>, node.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node.id);
                    }}
                  />

                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={pos.x + 25}
                        y={pos.y - 35}
                        width="140"
                        height={node.biasScore !== undefined ? 75 : 60}
                        fill="white"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        rx="6"
                        filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                      />
                      <text
                        x={pos.x + 95}
                        y={pos.y - 15}
                        textAnchor="middle"
                        className="text-sm font-semibold fill-gray-900"
                      >
                        {node.name}
                      </text>
                      <text
                        x={pos.x + 95}
                        y={pos.y}
                        textAnchor="middle"
                        className="text-xs fill-gray-500"
                      >
                        {isEvaluator ? 'Evaluator' : 'Vendor'}
                      </text>
                      {node.biasScore !== undefined && (
                        <>
                          <text
                            x={pos.x + 95}
                            y={pos.y + 15}
                            textAnchor="middle"
                            className={`text-xs font-semibold ${
                              node.biasScore > 70 ? 'fill-red-600' :
                              node.biasScore > 40 ? 'fill-orange-600' :
                              'fill-emerald-600'
                            }`}
                          >
                            Bias Score: {node.biasScore.toFixed(0)}
                          </text>
                          <text
                            x={pos.x + 95}
                            y={pos.y + 30}
                            textAnchor="middle"
                            className="text-xs fill-gray-500"
                          >
                            {edges.filter(e => e.source === node.id).length} connections
                          </text>
                        </>
                      )}
                      {!isEvaluator && (
                        <text
                          x={pos.x + 95}
                          y={pos.y + 15}
                          textAnchor="middle"
                          className="text-xs fill-gray-500"
                        >
                          {edges.filter(e => e.target === node.id).length} evaluators
                        </text>
                      )}
                    </g>
                  )}

                  <text
                    x={pos.x}
                    y={pos.y + (isEvaluator ? -30 : 35)}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {showInsights && causalInsights.length > 0 && (
          <div className="absolute top-2 right-2 w-72 max-h-96 overflow-y-auto bg-white border-2 border-blue-200 rounded-lg shadow-lg">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Causal Analysis</h3>
              </div>
              <p className="text-xs text-gray-600 mt-1">Real-time pattern detection</p>
              {aiCausalAnalysis?.summary && (
                <div className="mt-2 p-2 bg-white/80 rounded border border-blue-200">
                  <p className="text-xs text-gray-700 leading-relaxed">{aiCausalAnalysis.summary}</p>
                </div>
              )}
            </div>
            <div className="p-3 space-y-3">
              {causalInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'critical' ? 'bg-red-50 border-red-500' :
                    insight.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {insight.type === 'critical' ? (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : insight.type === 'warning' ? (
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              insight.confidence > 85 ? 'bg-emerald-500' :
                              insight.confidence > 70 ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Evaluator (Clean)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Evaluator (Warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-600">Evaluator (Critical)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
            <span className="text-gray-600">Vendor</span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Drag nodes • Scroll to zoom • Click to pan • Click nodes for details
        </div>
      </div>
    </div>
  );
}
