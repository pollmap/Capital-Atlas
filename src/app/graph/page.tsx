"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  X,
  ChevronRight,
  Zap,
  TrendingUp,
  TrendingDown,
  Shuffle,
  Download,
  Network,
  Filter,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import {
  getAllNodes,
  getEdges,
  getNodeById,
  getEdgesForNode,
  getConnectedNodes,
  runScenario,
  getNodeColor,
  getMacroNodes,
  getNodeThemes,
  formatMarketCap,
} from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import { exportToPdf, buildScenarioExportData } from "@/lib/export";
import type { MacroNode, CompanyNode, ScenarioResult, EdgeType } from "@/types";

const IndraNet = dynamic(
  () => import("@/components/graph/IndraNet").then((m) => m.IndraNet),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-atlas-bg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-atlas-gold border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-atlas-text-muted">인드라망 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

// ============================================================
// Graph Page
// ============================================================

export default function GraphPage() {
  const allNodes = useMemo(() => getAllNodes(), []);
  const allEdges = useMemo(() => getEdges(), []);
  const macroNodes = useMemo(() => getMacroNodes(), []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [edgeFilter, setEdgeFilter] = useState<Set<EdgeType>>(
    new Set<EdgeType>(["causal", "supply_chain", "belongs_to"])
  );

  // Scenario
  const [scenarioMode, setScenarioMode] = useState(false);
  const [scenarioAction, setScenarioAction] = useState<"increase" | "decrease" | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? getNodeById(selectedNodeId) : null),
    [selectedNodeId]
  );

  const connectedNodes = useMemo(
    () => (selectedNodeId ? getConnectedNodes(selectedNodeId) : []),
    [selectedNodeId]
  );

  const nodeEdges = useMemo(
    () => (selectedNodeId ? getEdgesForNode(selectedNodeId) : []),
    [selectedNodeId]
  );

  const nodeThemes = useMemo(
    () => (selectedNodeId ? getNodeThemes(selectedNodeId) : []),
    [selectedNodeId]
  );

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const q = searchQuery.toLowerCase();
    return allNodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.nameEn.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 15);
  }, [searchQuery, allNodes]);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
      setScenarioMode(false);
      setScenarioAction(null);
      setScenarioResults([]);
    },
    []
  );

  const handleScenario = useCallback(
    (action: "increase" | "decrease") => {
      if (!selectedNodeId) return;
      setScenarioAction(action);
      setScenarioMode(true);
      const results = runScenario(selectedNodeId, action, 3);
      setScenarioResults(results);
    },
    [selectedNodeId]
  );

  const toggleEdgeFilter = useCallback((type: EdgeType) => {
    setEdgeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const sortedResults = useMemo(
    () =>
      [...scenarioResults].sort((a, b) => {
        const order = { strong: 0, medium: 1, weak: 2 };
        return (order[a.strength] || 2) - (order[b.strength] || 2);
      }),
    [scenarioResults]
  );

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80 min-w-[320px]" : "w-0"
        } transition-all duration-200 overflow-hidden border-r border-atlas-border bg-atlas-panel flex-shrink-0`}
      >
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-text-muted"
            />
            <input
              type="text"
              placeholder="노드 검색 (이름, 태그)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-atlas-bg border border-atlas-border rounded-lg text-atlas-text-primary placeholder:text-atlas-text-muted focus:outline-none focus:border-atlas-gold/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-atlas-text-muted hover:text-atlas-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="space-y-1">
              {searchResults.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    handleNodeSelect(n.id);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-atlas-panel-light transition-colors"
                >
                  <NodeBadge type={n.type} />
                  <span className="text-sm text-atlas-text-primary truncate">
                    {n.name}
                  </span>
                  <span className="text-xs text-atlas-text-muted ml-auto flex-shrink-0">
                    {n.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Edge Filter */}
          <div>
            <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <Filter size={12} />
              엣지 필터
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { type: "causal" as EdgeType, label: "인과관계", color: "text-atlas-macro" },
                { type: "supply_chain" as EdgeType, label: "밸류체인", color: "text-atlas-gold" },
                { type: "belongs_to" as EdgeType, label: "소속", color: "text-atlas-sector" },
              ].map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => toggleEdgeFilter(type)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    edgeFilter.has(type)
                      ? `${color} bg-atlas-panel-light border border-current/30`
                      : "text-atlas-text-muted bg-atlas-bg border border-atlas-border"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Node Detail */}
          {selectedNode ? (
            <div className="space-y-4">
              <div className="bg-atlas-bg rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <NodeBadge type={selectedNode.type} />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                  />
                </div>
                <h2 className="text-lg font-bold text-atlas-text-primary">
                  {selectedNode.name}
                </h2>
                <p className="text-xs text-atlas-text-muted mt-0.5">
                  {selectedNode.nameEn}
                </p>

                {/* Macro-specific info */}
                {selectedNode.type === "macro" && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-atlas-text-muted">현재값</span>
                      <span className="font-data text-sm font-semibold text-atlas-text-primary">
                        {(selectedNode as MacroNode).currentValue || "—"}
                      </span>
                    </div>
                    {(selectedNode as MacroNode).change && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-atlas-text-muted">변화</span>
                        <span
                          className={`font-data text-sm font-semibold ${
                            (selectedNode as MacroNode).changeDirection === "up"
                              ? "text-atlas-up"
                              : (selectedNode as MacroNode).changeDirection === "down"
                                ? "text-atlas-down"
                                : "text-atlas-text-secondary"
                          }`}
                        >
                          {(selectedNode as MacroNode).change}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Company-specific info */}
                {selectedNode.type === "company" && (
                  <div className="mt-3">
                    <span className="text-xs font-data text-atlas-text-muted">
                      {(selectedNode as CompanyNode).ticker} ·{" "}
                      {(selectedNode as CompanyNode).market}
                    </span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-[10px] text-atlas-text-muted">시가총액</span>
                        <div className="font-data text-xs font-semibold text-atlas-text-primary">
                          {formatMarketCap(
                            (selectedNode as CompanyNode).financials.marketCap
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-atlas-text-muted">PER</span>
                        <div className="font-data text-xs font-semibold text-atlas-text-primary">
                          {(selectedNode as CompanyNode).financials.per}x
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-atlas-text-muted">ROE</span>
                        <div className="font-data text-xs font-semibold text-atlas-text-primary">
                          {(selectedNode as CompanyNode).financials.roe}%
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-atlas-text-muted">52주 수익</span>
                        <div
                          className={`font-data text-xs font-semibold ${
                            (selectedNode as CompanyNode).financials.return52w >= 0
                              ? "text-atlas-up"
                              : "text-atlas-down"
                          }`}
                        >
                          {(selectedNode as CompanyNode).financials.return52w > 0 ? "+" : ""}
                          {(selectedNode as CompanyNode).financials.return52w}%
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/companies/${selectedNode.id}`}
                      className="flex items-center gap-1 text-xs text-atlas-link hover:text-atlas-gold mt-3 transition-colors"
                    >
                      상세 페이지 <ArrowRight size={10} />
                    </Link>
                  </div>
                )}

                <p className="text-xs text-atlas-text-secondary leading-relaxed mt-3">
                  {selectedNode.description}
                </p>
              </div>

              {/* Theme info */}
              {nodeThemes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                    <GitBranch size={12} />
                    밸류체인
                  </h3>
                  <div className="space-y-1">
                    {nodeThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className="px-3 py-2 rounded-lg bg-atlas-gold/5 border border-atlas-gold/10 text-xs"
                      >
                        <span className="text-atlas-gold font-medium">
                          {theme.name}
                        </span>
                        <div className="text-atlas-text-muted mt-1">
                          {theme.tiers.map((t) => t.name).join(" → ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenario Panel */}
              {selectedNode.type === "macro" && (
                <div>
                  <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Zap size={12} />
                    시나리오 시뮬레이션
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScenario("increase")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        scenarioAction === "increase"
                          ? "bg-atlas-up/20 text-atlas-up border border-atlas-up/30"
                          : "bg-atlas-bg border border-atlas-border text-atlas-text-secondary hover:text-atlas-up hover:border-atlas-up/30"
                      }`}
                    >
                      <TrendingUp size={12} className="inline mr-1" />
                      상승 시나리오
                    </button>
                    <button
                      onClick={() => handleScenario("decrease")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        scenarioAction === "decrease"
                          ? "bg-atlas-down/20 text-atlas-down border border-atlas-down/30"
                          : "bg-atlas-bg border border-atlas-border text-atlas-text-secondary hover:text-atlas-down hover:border-atlas-down/30"
                      }`}
                    >
                      <TrendingDown size={12} className="inline mr-1" />
                      하락 시나리오
                    </button>
                  </div>
                </div>
              )}

              {/* Scenario Results */}
              {scenarioMode && sortedResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider">
                      예상 영향 ({sortedResults.length}개, 3단계 전파)
                    </h3>
                    <button
                      onClick={() => {
                        if (!selectedNode || !scenarioAction) return;
                        const data = buildScenarioExportData(
                          selectedNode.name,
                          selectedNode.nameEn,
                          scenarioAction,
                          (selectedNode as MacroNode).currentValue,
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
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-atlas-text-muted hover:text-atlas-gold transition-colors"
                    >
                      <Download size={10} />
                      PDF
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {sortedResults.map((result) => {
                      const targetNode = getNodeById(result.nodeId);
                      const DirIcon =
                        result.expectedDirection === "up"
                          ? TrendingUp
                          : result.expectedDirection === "down"
                            ? TrendingDown
                            : Shuffle;
                      return (
                        <button
                          key={result.nodeId}
                          onClick={() => handleNodeSelect(result.nodeId)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-atlas-bg hover:bg-atlas-panel-light transition-colors text-left"
                        >
                          <DirIcon
                            size={12}
                            className={
                              result.expectedDirection === "up"
                                ? "text-atlas-up"
                                : result.expectedDirection === "down"
                                  ? "text-atlas-down"
                                  : "text-atlas-text-muted"
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-atlas-text-primary truncate">
                              {targetNode?.name || result.nodeId}
                            </div>
                            <div className="text-[10px] text-atlas-text-muted truncate">
                              {result.mechanism}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                result.depth === 1
                                  ? "bg-atlas-macro/20 text-atlas-macro"
                                  : result.depth === 2
                                    ? "bg-atlas-sector/20 text-atlas-sector"
                                    : "bg-atlas-text-muted/20 text-atlas-text-muted"
                              }`}
                            >
                              {result.depth}차
                            </span>
                            <span
                              className={`text-[10px] ${
                                result.strength === "strong"
                                  ? "text-atlas-gold"
                                  : result.strength === "medium"
                                    ? "text-atlas-text-secondary"
                                    : "text-atlas-text-muted"
                              }`}
                            >
                              {result.strength === "strong"
                                ? "●●●"
                                : result.strength === "medium"
                                  ? "●●○"
                                  : "●○○"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connected Nodes */}
              <div>
                <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2">
                  연결된 노드 ({connectedNodes.length})
                </h3>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {connectedNodes.map((n) => {
                    const edge = nodeEdges.find(
                      (e) =>
                        (e.source === selectedNodeId && e.target === n.id) ||
                        (e.target === selectedNodeId && e.source === n.id)
                    );
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNodeSelect(n.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-atlas-panel-light transition-colors text-left"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getNodeColor(n.type) }}
                        />
                        <span className="text-xs text-atlas-text-primary truncate flex-1">
                          {n.name}
                        </span>
                        {edge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                              edge.type === "causal"
                                ? "bg-atlas-macro/10 text-atlas-macro"
                                : edge.type === "supply_chain"
                                  ? "bg-atlas-gold/10 text-atlas-gold"
                                  : "bg-atlas-sector/10 text-atlas-sector"
                            }`}
                          >
                            {edge.type === "causal"
                              ? "인과"
                              : edge.type === "supply_chain"
                                ? "밸류체인"
                                : "소속"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* No selection - show overview */
            <div className="space-y-4">
              <div className="bg-atlas-bg rounded-xl p-4">
                <h2 className="text-sm font-bold text-atlas-text-primary flex items-center gap-2 mb-2">
                  <Network size={16} className="text-atlas-gold" />
                  인드라망 (Indra&apos;s Net)
                </h2>
                <p className="text-xs text-atlas-text-secondary leading-relaxed">
                  자본시장의 인과구조를 시각화합니다. 노드를 클릭하면 중앙으로
                  이동하며, 연결된 인과관계(위아래)와 밸류체인(좌우)이
                  배열됩니다.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-center py-2 bg-atlas-panel rounded-lg">
                    <div className="font-data text-lg font-bold text-atlas-text-primary">
                      {allNodes.length}
                    </div>
                    <div className="text-[10px] text-atlas-text-muted">노드</div>
                  </div>
                  <div className="text-center py-2 bg-atlas-panel rounded-lg">
                    <div className="font-data text-lg font-bold text-atlas-text-primary">
                      {allEdges.length}
                    </div>
                    <div className="text-[10px] text-atlas-text-muted">엣지</div>
                  </div>
                </div>
              </div>

              {/* Quick Access - Macro Variables */}
              <div>
                <h3 className="text-xs font-semibold text-atlas-text-muted uppercase tracking-wider mb-2">
                  주요 매크로 변수
                </h3>
                <div className="space-y-1">
                  {macroNodes
                    .filter((n) =>
                      [
                        "us_fed_rate",
                        "dxy",
                        "us_10y",
                        "usd_krw",
                        "wti",
                        "semiconductor_cycle",
                        "vix",
                        "kospi",
                      ].includes(n.id)
                    )
                    .map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNodeSelect(n.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-atlas-panel-light transition-colors text-left"
                      >
                        <div className="w-2 h-2 rounded-full bg-atlas-macro flex-shrink-0" />
                        <span className="text-xs text-atlas-text-primary truncate flex-1">
                          {n.name}
                        </span>
                        <span
                          className={`font-data text-[10px] flex-shrink-0 ${
                            n.changeDirection === "up"
                              ? "text-atlas-up"
                              : n.changeDirection === "down"
                                ? "text-atlas-down"
                                : "text-atlas-text-muted"
                          }`}
                        >
                          {n.currentValue}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-atlas-panel border border-atlas-border rounded-r-lg px-1 py-3 text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
        style={{ left: sidebarOpen ? "320px" : "0" }}
      >
        <ChevronRight
          size={14}
          className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Main Graph Area */}
      <div className="flex-1 relative">
        <IndraNet
          nodes={allNodes}
          edges={allEdges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={handleNodeSelect}
          searchQuery={searchQuery}
          edgeFilter={edgeFilter}
        />

        {/* Top bar info */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {selectedNode && (
            <button
              onClick={() => handleNodeSelect(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atlas-panel/80 border border-atlas-border/50 backdrop-blur text-xs text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
            >
              <X size={12} />
              선택 해제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
