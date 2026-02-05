"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Grid3X3, Info, ArrowLeft } from "lucide-react";
import { getMacroNodes, getEdges } from "@/lib/data";
import type { MacroNode, Edge } from "@/types";

// Compute correlation matrix from edges
function computeCorrelationMatrix(nodes: MacroNode[], edges: Edge[]) {
  const nodeIds = nodes.map((n) => n.id);
  const matrix: Record<string, Record<string, { value: number; mechanism: string; strength: string }>> = {};

  nodeIds.forEach((id) => {
    matrix[id] = {};
    nodeIds.forEach((id2) => {
      matrix[id][id2] = { value: 0, mechanism: "", strength: "" };
    });
    matrix[id][id] = { value: 1, mechanism: "자기 자신", strength: "strong" };
  });

  edges.forEach((edge) => {
    if (!matrix[edge.source] || !matrix[edge.source][edge.target]) return;

    const strengthVal = edge.strength === "strong" ? 0.9 : edge.strength === "medium" ? 0.6 : 0.3;
    const directionVal = edge.direction === "positive" ? 1 : edge.direction === "negative" ? -1 : 0.5;
    const val = strengthVal * directionVal;

    matrix[edge.source][edge.target] = {
      value: val,
      mechanism: edge.mechanism || "",
      strength: edge.strength || "weak",
    };
    matrix[edge.target][edge.source] = {
      value: val * 0.7,
      mechanism: edge.mechanism || "",
      strength: edge.strength || "weak",
    };
  });

  return matrix;
}

function getHeatColor(value: number): string {
  if (value === 1) return "rgba(245, 158, 11, 0.8)"; // self
  if (value > 0.7) return "rgba(16, 185, 129, 0.8)";
  if (value > 0.4) return "rgba(16, 185, 129, 0.5)";
  if (value > 0.1) return "rgba(16, 185, 129, 0.25)";
  if (value > 0) return "rgba(16, 185, 129, 0.12)";
  if (value === 0) return "rgba(107, 114, 128, 0.1)";
  if (value > -0.1) return "rgba(239, 68, 68, 0.08)";
  if (value > -0.4) return "rgba(239, 68, 68, 0.25)";
  if (value > -0.7) return "rgba(239, 68, 68, 0.5)";
  return "rgba(239, 68, 68, 0.8)";
}

type CategoryFilter = "all" | "monetary_policy" | "currency" | "bond" | "commodity" | "indicator" | "flow" | "index";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "전체",
  monetary_policy: "통화정책",
  currency: "환율",
  bond: "채권",
  commodity: "원자재",
  indicator: "지표",
  flow: "자금흐름",
  index: "지수",
};

export default function HeatmapPage() {
  const allMacroNodes = getMacroNodes();
  const edges = getEdges();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    value: number;
    mechanism: string;
  } | null>(null);

  const filteredNodes = useMemo(() => {
    if (category === "all") {
      // Show top connected nodes to keep heatmap readable
      const connectionCount = new Map<string, number>();
      edges.forEach((e) => {
        connectionCount.set(e.source, (connectionCount.get(e.source) || 0) + 1);
        connectionCount.set(e.target, (connectionCount.get(e.target) || 0) + 1);
      });
      return [...allMacroNodes]
        .sort((a, b) => (connectionCount.get(b.id) || 0) - (connectionCount.get(a.id) || 0))
        .slice(0, 20);
    }
    return allMacroNodes.filter((n) => n.category === category);
  }, [category, allMacroNodes, edges]);

  const matrix = useMemo(
    () => computeCorrelationMatrix(filteredNodes, edges),
    [filteredNodes, edges]
  );

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/tools"
            className="p-2 rounded-lg hover:bg-atlas-panel-light text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
              <Grid3X3 size={24} className="text-atlas-gold" />
              상관관계 히트맵
            </h1>
            <p className="text-sm text-atlas-text-muted mt-1">
              매크로 변수 간 인과적 상관관계를 시각화합니다
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                category === cat
                  ? "bg-atlas-gold/20 text-atlas-gold border border-atlas-gold/30"
                  : "bg-atlas-panel text-atlas-text-secondary hover:text-atlas-text-primary border border-atlas-border"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-atlas-text-muted">
          <div className="flex items-center gap-2">
            <span className="text-atlas-text-secondary">강한 정(+)</span>
            <div className="flex gap-0.5">
              <div className="w-4 h-4 rounded" style={{ background: "rgba(16, 185, 129, 0.8)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(16, 185, 129, 0.5)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(16, 185, 129, 0.25)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(107, 114, 128, 0.1)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(239, 68, 68, 0.25)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(239, 68, 68, 0.5)" }} />
              <div className="w-4 h-4 rounded" style={{ background: "rgba(239, 68, 68, 0.8)" }} />
            </div>
            <span className="text-atlas-text-secondary">강한 역(-)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ background: "rgba(245, 158, 11, 0.8)" }} />
            <span>자기 자신</span>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className="fixed z-50 pointer-events-none glass border border-atlas-border rounded-lg p-3 shadow-xl max-w-xs"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          >
            <div className="text-sm font-medium text-atlas-text-primary mb-1">
              {allMacroNodes.find((n) => n.id === hoveredCell.row)?.name || hoveredCell.row}
              {" → "}
              {allMacroNodes.find((n) => n.id === hoveredCell.col)?.name || hoveredCell.col}
            </div>
            <div className="font-data text-xs mb-1">
              <span className={hoveredCell.value > 0 ? "text-atlas-up" : hoveredCell.value < 0 ? "text-atlas-down" : "text-atlas-text-muted"}>
                상관계수: {hoveredCell.value.toFixed(2)}
              </span>
            </div>
            {hoveredCell.mechanism && (
              <p className="text-xs text-atlas-text-muted leading-relaxed">
                {hoveredCell.mechanism}
              </p>
            )}
          </div>
        )}

        {/* Heatmap Grid */}
        <div className="overflow-x-auto bg-atlas-panel border border-atlas-border rounded-xl p-4">
          <div className="min-w-[600px]">
            {/* Column headers */}
            <div className="flex">
              <div className="w-28 flex-shrink-0" />
              {filteredNodes.map((node) => (
                <div
                  key={`col-${node.id}`}
                  className="flex-1 min-w-[36px] text-center"
                >
                  <div
                    className="text-xs text-atlas-text-muted truncate px-0.5 transform -rotate-45 origin-bottom-left h-20 flex items-end"
                    title={node.name}
                  >
                    {node.name.length > 6 ? node.name.slice(0, 6) + ".." : node.name}
                  </div>
                </div>
              ))}
            </div>
            {/* Rows */}
            {filteredNodes.map((rowNode) => (
              <div key={`row-${rowNode.id}`} className="flex items-center">
                <div className="w-28 flex-shrink-0 text-xs text-atlas-text-secondary truncate pr-2 text-right" title={rowNode.name}>
                  {rowNode.name}
                </div>
                {filteredNodes.map((colNode) => {
                  const cell = matrix[rowNode.id]?.[colNode.id];
                  const value = cell?.value || 0;
                  return (
                    <div
                      key={`cell-${rowNode.id}-${colNode.id}`}
                      className="flex-1 min-w-[36px] aspect-square m-0.5 rounded cursor-pointer transition-all hover:ring-1 hover:ring-atlas-gold/50"
                      style={{ background: getHeatColor(value) }}
                      onMouseEnter={() =>
                        setHoveredCell({
                          row: rowNode.id,
                          col: colNode.id,
                          value,
                          mechanism: cell?.mechanism || "",
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${rowNode.name} → ${colNode.name}: ${value.toFixed(2)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-atlas-panel border border-atlas-border rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-atlas-macro mt-0.5 flex-shrink-0" />
            <div className="text-xs text-atlas-text-muted leading-relaxed">
              <p className="mb-1">
                이 히트맵은 매크로 변수 간의 <span className="text-atlas-text-secondary">인과적 상관관계</span>를 시각화합니다.
                실제 통계적 상관계수가 아닌, 인과관계 데이터에서 도출된 방향성과 강도 기반의 상관 행렬입니다.
              </p>
              <p>
                <span className="text-atlas-up">녹색</span>은 정(+)의 인과관계,{" "}
                <span className="text-atlas-down">적색</span>은 역(-)의 인과관계를 나타냅니다.
                셀 위에 마우스를 올리면 구체적인 메커니즘을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
