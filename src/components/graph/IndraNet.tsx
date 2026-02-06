"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
} from "d3-force";
import { zoom, zoomIdentity, type ZoomTransform, type D3ZoomEvent } from "d3-zoom";
import { select } from "d3-selection";
import type { BaseNode, Edge, NodeType, MacroNode, EdgeType } from "@/types";
import { getNodeColor } from "@/lib/data";

// ============================================================
// Types
// ============================================================

interface GraphNode {
  id: string;
  name: string;
  nameEn: string;
  type: NodeType;
  category?: string;
  radius: number;
  color: string;
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  vx: number;
  vy: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string;
  edgeType: EdgeType;
  direction?: string;
  strength?: string;
  mechanism?: string;
}

interface IndraNetProps {
  nodes: BaseNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  highlightedIds?: Set<string>;
  searchQuery?: string;
  edgeFilter?: Set<EdgeType>;
}

// ============================================================
// Constants
// ============================================================

const NODE_RADIUS: Record<NodeType, number> = {
  macro: 8,
  sector: 12,
  theme: 10,
  company: 7,
};

const EDGE_COLORS: Record<EdgeType, string> = {
  causal: "rgba(6, 182, 212, 0.4)",
  supply_chain: "rgba(245, 158, 11, 0.4)",
  belongs_to: "rgba(139, 92, 246, 0.15)",
};

const EDGE_HIGHLIGHT_COLORS: Record<EdgeType, string> = {
  causal: "rgba(6, 182, 212, 0.9)",
  supply_chain: "rgba(245, 158, 11, 0.9)",
  belongs_to: "rgba(139, 92, 246, 0.5)",
};

// ============================================================
// Component
// ============================================================

export function IndraNet({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  searchQuery,
  edgeFilter,
}: IndraNetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<Simulation<GraphNode, GraphLink> | null>(null);
  const graphNodesRef = useRef<GraphNode[]>([]);
  const graphLinksRef = useRef<GraphLink[]>([]);
  const transformRef = useRef<ZoomTransform>(zoomIdentity);
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Connected node IDs for the selected node
  const connectedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.source === selectedNodeId) ids.add(e.target);
      if (e.target === selectedNodeId) ids.add(e.source);
    }
    return ids;
  }, [selectedNodeId, edges]);

  // Search-matched node IDs
  const searchMatchIds = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return null;
    const q = searchQuery.toLowerCase();
    const ids = new Set<string>();
    for (const n of nodes) {
      if (
        n.name.toLowerCase().includes(q) ||
        n.nameEn.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        ids.add(n.id);
      }
    }
    return ids;
  }, [searchQuery, nodes]);

  // Convert app data to d3 nodes/links
  const { simNodes, simLinks } = useMemo(() => {
    const gNodes: GraphNode[] = nodes.map((n) => ({
      id: n.id,
      name: n.name,
      nameEn: n.nameEn,
      type: n.type,
      category: (n as MacroNode).category,
      radius: NODE_RADIUS[n.type] || 6,
      color: getNodeColor(n.type),
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: 0,
      vy: 0,
    }));

    const nodeIdSet = new Set(gNodes.map((n) => n.id));
    const gLinks: GraphLink[] = edges
      .filter((e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
      .filter((e) => !edgeFilter || edgeFilter.has(e.type))
      .map((e) => ({
        source: e.source,
        target: e.target,
        id: e.id,
        edgeType: e.type,
        direction: e.direction,
        strength: e.strength,
        mechanism: e.mechanism,
      }));

    return { simNodes: gNodes, simLinks: gLinks };
  }, [nodes, edges, edgeFilter]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
  }, [dimensions]);

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const t = transformRef.current;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const gNodes = graphNodesRef.current;
    const gLinks = graphLinksRef.current;
    const hovered = hoveredNodeRef.current;
    const hasFocus = selectedNodeId !== null;

    // Draw edges
    for (const link of gLinks) {
      const src = link.source as GraphNode;
      const tgt = link.target as GraphNode;
      if (!src.x || !tgt.x) continue;

      const isConnected =
        hasFocus &&
        (src.id === selectedNodeId || tgt.id === selectedNodeId);

      const alpha = hasFocus ? (isConnected ? 1 : 0.05) : 0.5;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);

      if (isConnected) {
        ctx.strokeStyle = EDGE_HIGHLIGHT_COLORS[link.edgeType] || "rgba(255,255,255,0.5)";
        ctx.lineWidth = link.strength === "strong" ? 2 : 1.2;
      } else {
        ctx.strokeStyle = EDGE_COLORS[link.edgeType] || "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.5;
      }
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw arrow for causal edges when connected
      if (isConnected && link.edgeType === "causal") {
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
        const arrowLen = 6;
        const dist = Math.sqrt((tgt.x - src.x) ** 2 + (tgt.y - src.y) ** 2);
        const r = (tgt as GraphNode).radius || 6;
        const ax = tgt.x - Math.cos(angle) * (r + 4);
        const ay = tgt.y - Math.sin(angle) * (r + 4);

        if (dist > 20) {
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(
            ax - arrowLen * Math.cos(angle - Math.PI / 6),
            ay - arrowLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            ax - arrowLen * Math.cos(angle + Math.PI / 6),
            ay - arrowLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = EDGE_HIGHLIGHT_COLORS[link.edgeType];
          ctx.fill();
        }
      }
    }

    // Draw nodes
    for (const node of gNodes) {
      if (node.x === undefined || node.y === undefined) continue;

      const isSelected = node.id === selectedNodeId;
      const isConnected2 = connectedIds.has(node.id);
      const isHovered = hovered?.id === node.id;
      const isSearchMatch = searchMatchIds ? searchMatchIds.has(node.id) : true;

      let nodeAlpha = 1;
      if (hasFocus && !isSelected && !isConnected2) nodeAlpha = 0.12;
      if (searchMatchIds && !isSearchMatch) nodeAlpha = 0.08;

      const r = isSelected ? node.radius * 1.8 : isHovered ? node.radius * 1.4 : node.radius;

      ctx.globalAlpha = nodeAlpha;

      // Glow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r + 6);
        grad.addColorStop(0, node.color + "60");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? "#F59E0B" : node.color;
      ctx.fill();

      // Border
      if (isSelected || isHovered || isConnected2) {
        ctx.strokeStyle = isSelected ? "#F59E0B" : "rgba(255,255,255,0.6)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();
      }

      // Label
      if (t.k > 0.5 || isSelected || isHovered || isConnected2) {
        const fontSize = Math.max(9, Math.min(12, 10 / t.k));
        ctx.font = `${isSelected ? "600" : "400"} ${fontSize}px 'Pretendard', 'Inter', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isSelected
          ? "#F59E0B"
          : hasFocus && !isConnected2
            ? "rgba(229, 231, 235, 0.2)"
            : "rgba(229, 231, 235, 0.85)";
        ctx.fillText(node.name, node.x, node.y + r + 3);
      }

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [selectedNodeId, connectedIds, searchMatchIds]);

  // Initialize simulation
  useEffect(() => {
    const w = dimensions.width;
    const h = dimensions.height;

    graphNodesRef.current = simNodes;
    graphLinksRef.current = simLinks;

    const simulation = forceSimulation<GraphNode>(simNodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => {
            if (d.edgeType === "belongs_to") return 40;
            if (d.edgeType === "supply_chain") return 70;
            return 100;
          })
          .strength((d) => {
            if (d.edgeType === "belongs_to") return 0.8;
            if (d.edgeType === "supply_chain") return 0.3;
            return 0.15;
          })
      )
      .force("charge", forceManyBody().strength(-180).distanceMax(350))
      .force("center", forceCenter(w / 2, h / 2).strength(0.05))
      .force("collide", forceCollide<GraphNode>().radius((d) => d.radius + 4))
      .force(
        "x",
        forceX<GraphNode>(w / 2).strength(0.02)
      )
      .force(
        "y",
        forceY<GraphNode>(h / 2).strength(0.02)
      )
      .alphaDecay(0.02)
      .on("tick", () => {
        render();
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [simNodes, simLinks, dimensions, render]);

  // Focus mode: apply custom forces when a node is selected
  useEffect(() => {
    const sim = simulationRef.current;
    if (!sim) return;
    const gNodes = graphNodesRef.current;
    const w = dimensions.width;
    const h = dimensions.height;

    if (selectedNodeId) {
      const focusNode = gNodes.find((n) => n.id === selectedNodeId);
      if (focusNode) {
        // Fix the focus node at center
        focusNode.fx = w / 2;
        focusNode.fy = h / 2;

        // Apply directional forces to connected nodes
        sim.force(
          "focusX",
          forceX<GraphNode>().x((d) => {
            if (d.id === selectedNodeId) return w / 2;
            if (!connectedIds.has(d.id)) return d.x || w / 2;

            // Find the edge connecting this node to the focus
            const edge = edges.find(
              (e) =>
                (e.source === selectedNodeId && e.target === d.id) ||
                (e.target === selectedNodeId && e.source === d.id)
            );
            if (!edge) return d.x || w / 2;

            if (edge.type === "supply_chain") {
              // Upstream = left, downstream = right
              const isUpstream = edge.target === selectedNodeId;
              return isUpstream ? w / 2 - 200 : w / 2 + 200;
            }
            return w / 2;
          }).strength((d) => (connectedIds.has(d.id) ? 0.15 : 0))
        );

        sim.force(
          "focusY",
          forceY<GraphNode>().y((d) => {
            if (d.id === selectedNodeId) return h / 2;
            if (!connectedIds.has(d.id)) return d.y || h / 2;

            const edge = edges.find(
              (e) =>
                (e.source === selectedNodeId && e.target === d.id) ||
                (e.target === selectedNodeId && e.source === d.id)
            );
            if (!edge) return d.y || h / 2;

            if (edge.type === "causal") {
              // Causes = above, effects = below
              const isCause = edge.target === selectedNodeId;
              return isCause ? h / 2 - 180 : h / 2 + 180;
            }
            if (edge.type === "belongs_to") {
              return h / 2 + 100;
            }
            return h / 2;
          }).strength((d) => (connectedIds.has(d.id) ? 0.15 : 0))
        );
      }
    } else {
      // Remove focus forces, unfix all nodes
      for (const n of gNodes) {
        n.fx = null;
        n.fy = null;
      }
      sim.force("focusX", null);
      sim.force("focusY", null);
    }

    sim.alpha(0.5).restart();
  }, [selectedNodeId, connectedIds, edges, dimensions]);

  // Zoom handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const zoomBehavior = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.15, 5])
      .on("zoom", (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
        transformRef.current = event.transform;
        render();
      });

    select(canvas).call(zoomBehavior);

    return () => {
      select(canvas).on(".zoom", null);
    };
  }, [render]);

  // Mouse interaction
  const findNodeAtPoint = useCallback(
    (clientX: number, clientY: number): GraphNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const t = transformRef.current;
      const x = (clientX - rect.left - t.x) / t.k;
      const y = (clientY - rect.top - t.y) / t.k;

      for (let i = graphNodesRef.current.length - 1; i >= 0; i--) {
        const node = graphNodesRef.current[i];
        const dx = (node.x || 0) - x;
        const dy = (node.y || 0) - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius + 4) return node;
      }
      return null;
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node !== hoveredNodeRef.current) {
        hoveredNodeRef.current = node;
        setHoveredNode(node);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor = node ? "pointer" : "grab";
        }
        render();
      }
    },
    [findNodeAtPoint, render]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const node = findNodeAtPoint(e.clientX, e.clientY);
      if (node) {
        onNodeSelect(node.id === selectedNodeId ? null : node.id);
      } else {
        onNodeSelect(null);
      }
    },
    [findNodeAtPoint, onNodeSelect, selectedNodeId]
  );

  // Tooltip position
  const tooltipPos = useMemo(() => {
    if (!hoveredNode || hoveredNode.x === undefined) return null;
    const t = transformRef.current;
    return {
      x: hoveredNode.x * t.k + t.x,
      y: hoveredNode.y * t.k + t.y,
    };
  }, [hoveredNode]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-atlas-bg">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {/* Hover Tooltip */}
      {hoveredNode && tooltipPos && (
        <div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-atlas-panel border border-atlas-border shadow-xl max-w-[240px]"
          style={{
            left: tooltipPos.x + 16,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: hoveredNode.color }}
            />
            <span className="text-sm font-semibold text-atlas-text-primary truncate">
              {hoveredNode.name}
            </span>
          </div>
          <div className="text-xs text-atlas-text-muted">
            {hoveredNode.nameEn}
          </div>
          <div className="text-[10px] text-atlas-text-muted mt-1 uppercase tracking-wider">
            {hoveredNode.type}
            {hoveredNode.category ? ` · ${hoveredNode.category}` : ""}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-2 rounded-lg bg-atlas-panel/80 border border-atlas-border/50 backdrop-blur text-[10px] text-atlas-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-atlas-macro" />
          매크로
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-atlas-sector" />
          섹터
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-atlas-company" />
          기업
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-atlas-gold" />
          테마
        </div>
        <span className="border-l border-atlas-border/50 pl-3">
          <span className="text-atlas-macro">—</span> 인과 &nbsp;
          <span className="text-atlas-gold">—</span> 밸류체인
        </span>
      </div>
    </div>
  );
}
