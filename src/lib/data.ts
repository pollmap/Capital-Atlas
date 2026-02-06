// Capital Atlas — Data Loading & Utility Functions

import macroNodes from "@/data/graph/nodes/macro.json";
import sectorNodes from "@/data/graph/nodes/sectors.json";
import themeNodes from "@/data/graph/nodes/themes.json";
import companyNodes from "@/data/graph/nodes/companies.json";
import causalEdges from "@/data/graph/edges/macro-causal.json";
import type {
  MacroNode,
  SectorNode,
  ThemeNode,
  CompanyNode,
  Edge,
  BaseNode,
  NodeType,
  GraphData,
  ScenarioAction,
  ScenarioResult,
} from "@/types";

// ============================================================
// Data Accessors
// ============================================================

export function getMacroNodes(): MacroNode[] {
  return macroNodes as MacroNode[];
}

export function getSectorNodes(): SectorNode[] {
  return sectorNodes as SectorNode[];
}

export function getThemeNodes(): ThemeNode[] {
  return themeNodes as ThemeNode[];
}

export function getCompanyNodes(): CompanyNode[] {
  return companyNodes as CompanyNode[];
}

export function getEdges(): Edge[] {
  return causalEdges as Edge[];
}

export function getAllNodes(): BaseNode[] {
  return [
    ...getMacroNodes(),
    ...getSectorNodes(),
    ...getThemeNodes(),
    ...getCompanyNodes(),
  ];
}

export function getGraphData(): GraphData {
  return {
    nodes: [
      ...getMacroNodes(),
      ...getSectorNodes(),
      ...getThemeNodes(),
      ...getCompanyNodes(),
    ],
    edges: getEdges(),
  };
}

// ============================================================
// Node Lookups
// ============================================================

export function getNodeById(id: string): BaseNode | undefined {
  return getAllNodes().find((n) => n.id === id);
}

export function getMacroNodeById(id: string): MacroNode | undefined {
  return getMacroNodes().find((n) => n.id === id);
}

export function getCompanyById(id: string): CompanyNode | undefined {
  return getCompanyNodes().find((n) => n.id === id);
}

export function getThemeById(id: string): ThemeNode | undefined {
  return getThemeNodes().find((n) => n.id === id);
}

export function getSectorById(id: string): SectorNode | undefined {
  return getSectorNodes().find((n) => n.id === id);
}

// ============================================================
// Edge Lookups
// ============================================================

export function getEdgesForNode(nodeId: string): Edge[] {
  return getEdges().filter((e) => e.source === nodeId || e.target === nodeId);
}

export function getConnectedNodeIds(nodeId: string): string[] {
  const edges = getEdgesForNode(nodeId);
  const ids = new Set<string>();
  edges.forEach((e) => {
    if (e.source === nodeId) ids.add(e.target);
    if (e.target === nodeId) ids.add(e.source);
  });
  return Array.from(ids);
}

export function getConnectedNodes(nodeId: string): BaseNode[] {
  const ids = getConnectedNodeIds(nodeId);
  return ids.map((id) => getNodeById(id)).filter(Boolean) as BaseNode[];
}

// ============================================================
// Scenario Analysis
// ============================================================

export function runScenario(
  nodeId: string,
  action: ScenarioAction
): ScenarioResult[] {
  const edges = getEdges().filter((e) => e.source === nodeId);
  return edges.map((edge) => {
    let expectedDirection: "up" | "down" | "complex" = "complex";

    if (edge.direction === "positive") {
      expectedDirection = action === "increase" ? "up" : "down";
    } else if (edge.direction === "negative") {
      expectedDirection = action === "increase" ? "down" : "up";
    }

    return {
      nodeId: edge.target,
      expectedDirection,
      strength: (edge.strength as "strong" | "medium" | "weak") || "medium",
      mechanism: edge.mechanism || "",
      timeLag: edge.timeLag,
    };
  });
}

// ============================================================
// Graph Statistics
// ============================================================

export function getStats() {
  const nodes = getAllNodes();
  const edges = getEdges();
  const themes = getThemeNodes();
  const companies = getCompanyNodes();

  return {
    totalNodes: nodes.length,
    macroNodes: getMacroNodes().length,
    sectorNodes: getSectorNodes().length,
    themeCount: themes.length,
    companyCount: companies.length,
    totalEdges: edges.length,
    strongEdges: edges.filter((e) => e.strength === "strong").length,
  };
}

// ============================================================
// Color Utilities
// ============================================================

export function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    macro: "#06B6D4",
    sector: "#8B5CF6",
    theme: "#8B5CF6",
    company: "#34D399",
    report: "#FB923C",
  };
  return colors[type] || "#9CA3AF";
}

export function getDirectionColor(direction: "up" | "down" | "neutral" | "complex" | undefined): string {
  if (direction === "up") return "#10B981";
  if (direction === "down") return "#EF4444";
  return "#9CA3AF";
}

// ============================================================
// Formatting
// ============================================================

export function formatMarketCap(value: number): string {
  if (value >= 1000000000000000) return `${(value / 1000000000000000).toFixed(0)}천조`;
  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(1)}조`;
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(0)}B`;
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}억`;
  return value.toLocaleString();
}
