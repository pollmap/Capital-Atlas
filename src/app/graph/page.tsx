"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Network,
  ArrowUp,
  ArrowDown,
  X,
  ChevronRight,
  Zap,
  TrendingUp,
  TrendingDown,
  Shuffle,
  ExternalLink,
  Activity,
  Download,
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
import { exportToPdf, buildScenarioExportData } from "@/lib/export";
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

function ScenarioSummaryBar({ results }: { results: ScenarioResult[] }) {
  const upCount = results.filter((r) => r.expectedDirection === "up").length;
  const downCount = results.filter((r) => r.expectedDirection === "down").length;
  const complexCount = results.filter((r) => r.expectedDirection === "complex").length;
  const strongCount = results.filter((r) => r.strength === "strong").length;

  return (
    <div className="grid grid-cols-4 gap-2 mb-3">
      <div className="bg-atlas-up/10 border border-atlas-up/20 rounded-lg p-2 text-center">
        <div className="font-data text-lg font-bold text-atlas-up">{upCount}</div>
        <div className="text-xs text-atlas-text-muted">상승</div>
      </div>
      <div className="bg-atlas-down/10 border border-atlas-down/20 rounded-lg p-2 text-center">
        <div className="font-data text-lg font-bold text-atlas-down">{downCount}</div>
        <div className="text-xs text-atlas-text-muted">하락</div>
      </div>
      <div className="bg-atlas-accent/10 border border-atlas-accent/20 rounded-lg p-2 text-center">
        <div className="font-data text-lg font-bold text-atlas-accent">{complexCount}</div>
        <div className="text-xs text-atlas-text-muted">복합</div>
      </div>
      <div className="bg-atlas-panel-light border border-atlas-border rounded-lg p-2 text-center">
        <div className="font-data text-lg font-bold text-atlas-text-primary">{strongCount}</div>
        <div className="text-xs text-atlas-text-muted">강한 영향</div>
      </div>
    </div>
  );
}

export default function GraphPage() {
  const macroNodes = getMacroNodes();
  const edges = getEdges();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioAction, setScenarioAction] = useState<"increase" | "decrease" | null>(null);
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
        setScenarioAction(null);
      } else {
        setSelectedNodeId(nodeId);
        setScenarioMode(false);
        setScenarioResults([]);
        setScenarioAction(null);
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
      setScenarioAction(action);
    },
    [selectedNodeId]
  );

  const sortedResults = useMemo(() => {
    const strengthOrder = { strong: 0, medium: 1, weak: 2 };
    return [...scenarioResults].sort(
      (a, b) => strengthOrder[a.strength] - strengthOrder[b.strength]
    );
  }, [scenarioResults]);

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

        {/* Scenario mode banner */}
        {scenarioMode && selectedNode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg border border-atlas-gold/30">
            <div className="flex items-center gap-2 text-sm">
              <Activity size={14} className="text-atlas-gold animate-pulse" />
              <span className="text-atlas-text-secondary">
                <span className="font-semibold text-atlas-gold">{selectedNode.name}</span>
                {scenarioAction === "increase" ? " 상승" : " 하락"} 시나리오 분석 중
              </span>
              <span className="font-data text-xs text-atlas-text-muted">
                ({scenarioResults.length}개 영향)
              </span>
            </div>
          </div>
        )}
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
              <div className="flex items-center gap-1">
                <Link
                  href={`/macro/${selectedNode.id}`}
                  className="p-1 hover:bg-atlas-panel-light rounded text-atlas-text-muted hover:text-atlas-link transition-colors"
                  title="상세 페이지"
                >
                  <ExternalLink size={14} />
                </Link>
                <button
                  onClick={() => {
                    setSelectedNodeId(null);
                    setScenarioMode(false);
                    setScenarioResults([]);
                    setScenarioAction(null);
                  }}
                  className="p-1 hover:bg-atlas-panel-light rounded"
                >
                  <X size={16} className="text-atlas-text-muted" />
                </button>
              </div>
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
                    scenarioAction === "increase"
                      ? "bg-atlas-up/20 text-atlas-up border border-atlas-up/30"
                      : "bg-atlas-panel-light text-atlas-text-secondary hover:text-atlas-up hover:bg-atlas-up/10"
                  }`}
                >
                  <ArrowUp size={14} />
                  상승 시나리오
                </button>
                <button
                  onClick={() => handleScenario("decrease")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    scenarioAction === "decrease"
                      ? "bg-atlas-down/20 text-atlas-down border border-atlas-down/30"
                      : "bg-atlas-panel-light text-atlas-text-secondary hover:text-atlas-down hover:bg-atlas-down/10"
                  }`}
                >
                  <ArrowDown size={14} />
                  하락 시나리오
                </button>
              </div>
            </div>

            {/* Scenario Results */}
            {scenarioMode && scenarioResults.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider">
                    예상 영향 ({scenarioResults.length}개)
                  </h3>
                  <button
                    onClick={() => {
                      if (!selectedNode || !scenarioAction) return;
                      const data = buildScenarioExportData(
                        selectedNode.name,
                        selectedNode.nameEn,
                        scenarioAction,
                        selectedNode.currentValue,
                        sortedResults.map((r) => ({
                          name: getNodeById(r.nodeId)?.name || r.nodeId,
                          direction: r.expectedDirection,
                          strength: r.strength,
                          mechanism: r.mechanism,
                          timeLag: r.timeLag,
                        }))
                      );
                      exportToPdf(data);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-atlas-text-muted hover:text-atlas-gold hover:bg-atlas-gold/10 transition-colors"
                  >
                    <Download size={12} />
                    PDF
                  </button>
                </div>
                <ScenarioSummaryBar results={scenarioResults} />
                <div className="space-y-2">
                  {sortedResults.map((result) => {
                    const targetNode = getNodeById(result.nodeId);
                    const DirIcon =
                      result.expectedDirection === "up"
                        ? TrendingUp
                        : result.expectedDirection === "down"
                        ? TrendingDown
                        : Shuffle;
                    return (
                      <div
                        key={result.nodeId}
                        className={`rounded-lg p-3 cursor-pointer transition-all border ${
                          result.strength === "strong"
                            ? "bg-atlas-bg border-atlas-border hover:border-atlas-gold/40"
                            : "bg-atlas-bg/50 border-atlas-border/50 hover:border-atlas-border"
                        }`}
                        onClick={() => handleNodeClick(result.nodeId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DirIcon
                              size={14}
                              className={
                                result.expectedDirection === "up"
                                  ? "text-atlas-up"
                                  : result.expectedDirection === "down"
                                  ? "text-atlas-down"
                                  : "text-atlas-accent"
                              }
                            />
                            <span className="text-sm font-medium text-atlas-text-primary">
                              {targetNode?.name || result.nodeId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    i <
                                    (result.strength === "strong"
                                      ? 3
                                      : result.strength === "medium"
                                      ? 2
                                      : 1)
                                      ? "bg-atlas-accent"
                                      : "bg-atlas-border"
                                  }`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                result.expectedDirection === "up"
                                  ? "text-atlas-up bg-atlas-up/10"
                                  : result.expectedDirection === "down"
                                  ? "text-atlas-down bg-atlas-down/10"
                                  : "text-atlas-accent bg-atlas-accent/10"
                              }`}
                            >
                              {result.expectedDirection === "up"
                                ? "상승"
                                : result.expectedDirection === "down"
                                ? "하락"
                                : "복합"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-atlas-text-muted mt-1.5 leading-relaxed">
                          {result.mechanism}
                        </p>
                        {result.timeLag && (
                          <span className="inline-block text-xs text-atlas-text-muted mt-1 font-data">
                            시차: {result.timeLag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connected Edges */}
            {!scenarioMode && (
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
            )}

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
            <div className="mt-6 text-left space-y-1">
              <p className="text-xs text-atlas-text-muted mb-2">주요 노드:</p>
              {macroNodes.slice(0, 8).map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-atlas-panel-light transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-atlas-macro" />
                    <span className="text-sm text-atlas-text-secondary group-hover:text-atlas-text-primary">
                      {node.name}
                    </span>
                  </div>
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
