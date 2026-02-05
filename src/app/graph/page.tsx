"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Network,
  ArrowUp,
  ArrowDown,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  getMacroNodes,
  getEdges,
  getNodeById,
  getEdgesForNode,
  getConnectedNodes,
  runScenario,
} from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import { EdgeIndicator } from "@/components/common/EdgeIndicator";
import type { MacroNode, ScenarioResult } from "@/types";

const CausalGraph3D = dynamic(
  () =>
    import("@/components/graph/CausalGraph3D").then((m) => m.CausalGraph3D),
  { ssr: false, loading: () => <GraphLoading /> }
);

function GraphLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-atlas-bg">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-atlas-macro border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-atlas-text-muted">인과지도 로딩 중...</p>
      </div>
    </div>
  );
}

export default function GraphPage() {
  const macroNodes = getMacroNodes();
  const edges = getEdges();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);

  const selectedNode = selectedNodeId
    ? (getNodeById(selectedNodeId) as MacroNode | undefined)
    : null;
  const selectedEdges = selectedNodeId ? getEdgesForNode(selectedNodeId) : [];
  const highlightedNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = getConnectedNodes(selectedNodeId);
    const ids = new Set<string>([selectedNodeId]);
    connected.forEach((n) => ids.add(n.id));
    return ids;
  }, [selectedNodeId]);

  const scenarioMap = useMemo(() => {
    const map = new Map<string, "up" | "down" | "complex">();
    scenarioResults.forEach((r) => map.set(r.nodeId, r.expectedDirection));
    return map;
  }, [scenarioResults]);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
        setScenarioMode(false);
        setScenarioResults([]);
      } else {
        setSelectedNodeId(nodeId);
        setScenarioMode(false);
        setScenarioResults([]);
      }
    },
    [selectedNodeId]
  );

  const handleScenario = useCallback(
    (action: "increase" | "decrease") => {
      if (!selectedNodeId) return;
      const results = runScenario(selectedNodeId, action);
      setScenarioResults(results);
      setScenarioMode(true);
    },
    [selectedNodeId]
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row">
      {/* Graph Canvas */}
      <div className="flex-1 relative">
        <CausalGraph3D
          nodes={macroNodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          focusNodeId={selectedNodeId || undefined}
          highlightedNodes={highlightedNodes}
          scenarioResults={scenarioMode ? scenarioMap : undefined}
        />

        {/* Top Legend */}
        <div className="absolute top-4 left-4 flex items-center gap-3 glass px-3 py-2 rounded-lg">
          <Network size={16} className="text-atlas-gold" />
          <span className="text-xs text-atlas-text-secondary">
            매크로 인과지도
          </span>
          <span className="text-xs font-data text-atlas-text-muted">
            {macroNodes.length} nodes / {edges.length} edges
          </span>
        </div>

        {/* Color Legend */}
        <div className="absolute bottom-4 left-4 glass px-3 py-2 rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-atlas-up" />
              정(+)상관
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-atlas-down" />
              역(-)상관
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-atlas-accent" />
              복합
            </span>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-atlas-border bg-atlas-panel overflow-y-auto max-h-[50vh] lg:max-h-full">
        {selectedNode ? (
          <div className="p-4">
            {/* Selected Node Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <NodeBadge type={selectedNode.type} />
                <h2 className="text-lg font-bold text-atlas-text-primary mt-2">
                  {selectedNode.name}
                </h2>
                <p className="text-xs text-atlas-text-muted">
                  {selectedNode.nameEn}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setScenarioMode(false);
                  setScenarioResults([]);
                }}
                className="p-1 hover:bg-atlas-panel-light rounded"
              >
                <X size={16} className="text-atlas-text-muted" />
              </button>
            </div>

            {/* Current Value */}
            {"currentValue" in selectedNode && selectedNode.currentValue && (
              <div className="bg-atlas-bg rounded-lg p-3 mb-4">
                <div className="text-xs text-atlas-text-muted mb-1">
                  현재 수치
                </div>
                <div className="font-data text-2xl font-bold text-atlas-text-primary">
                  {selectedNode.currentValue}
                </div>
                {"change" in selectedNode && selectedNode.change && (
                  <div
                    className={`font-data text-sm mt-1 ${
                      selectedNode.changeDirection === "up"
                        ? "text-atlas-up"
                        : selectedNode.changeDirection === "down"
                        ? "text-atlas-down"
                        : "text-atlas-text-muted"
                    }`}
                  >
                    {selectedNode.change}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-atlas-text-secondary leading-relaxed mb-4">
              {selectedNode.description}
            </p>

            {/* Scenario Buttons */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2">
                <Zap size={12} className="inline mr-1" />
                시나리오 분석
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleScenario("increase")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    scenarioMode && scenarioResults.length > 0
                      ? "bg-atlas-up/20 text-atlas-up border border-atlas-up/30"
                      : "bg-atlas-panel-light text-atlas-text-secondary hover:text-atlas-up hover:bg-atlas-up/10"
                  }`}
                >
                  <ArrowUp size={14} />
                  상승 시나리오
                </button>
                <button
                  onClick={() => handleScenario("decrease")}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-atlas-panel-light text-atlas-text-secondary hover:text-atlas-down hover:bg-atlas-down/10 transition-all"
                >
                  <ArrowDown size={14} />
                  하락 시나리오
                </button>
              </div>
            </div>

            {/* Scenario Results */}
            {scenarioMode && scenarioResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2">
                  예상 영향
                </h3>
                <div className="space-y-2">
                  {scenarioResults.map((result) => {
                    const targetNode = getNodeById(result.nodeId);
                    return (
                      <div
                        key={result.nodeId}
                        className="bg-atlas-bg rounded-lg p-3 cursor-pointer hover:bg-atlas-panel-light transition-colors"
                        onClick={() => handleNodeClick(result.nodeId)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-atlas-text-primary">
                            {targetNode?.name || result.nodeId}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              result.expectedDirection === "up"
                                ? "text-atlas-up"
                                : result.expectedDirection === "down"
                                ? "text-atlas-down"
                                : "text-atlas-accent"
                            }`}
                          >
                            {result.expectedDirection === "up"
                              ? "상승"
                              : result.expectedDirection === "down"
                              ? "하락"
                              : "복합"}
                          </span>
                        </div>
                        <p className="text-xs text-atlas-text-muted mt-1">
                          {result.mechanism}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-atlas-text-muted">
                            강도: {result.strength}
                          </span>
                          {result.timeLag && (
                            <span className="text-xs text-atlas-text-muted">
                              시차: {result.timeLag}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connected Edges */}
            <div>
              <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2">
                연결된 인과관계 ({selectedEdges.length})
              </h3>
              <div className="space-y-2">
                {selectedEdges.map((edge) => (
                  <EdgeIndicator key={edge.id} edge={edge} showMechanism />
                ))}
              </div>
            </div>

            {/* Tags */}
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {selectedNode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <Network
              size={48}
              className="text-atlas-text-muted mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-atlas-text-primary mb-2">
              노드를 클릭하세요
            </h3>
            <p className="text-sm text-atlas-text-muted leading-relaxed">
              3D 그래프에서 매크로 변수를 클릭하면
              <br />
              인과관계와 시나리오 분석을 볼 수 있습니다
            </p>
            <div className="mt-6 text-left space-y-2">
              <p className="text-xs text-atlas-text-muted">주요 노드:</p>
              {macroNodes.slice(0, 8).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-atlas-panel-light transition-colors group"
                >
                  <span className="text-sm text-atlas-text-secondary group-hover:text-atlas-text-primary">
                    {node.name}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-atlas-text-muted group-hover:text-atlas-macro"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
