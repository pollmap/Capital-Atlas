// Capital Atlas v2 — Data Loading & Utility Functions

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
  MacroCategory,
  GraphData,
  ScenarioAction,
  ScenarioResult,
  EdgeStrength,
} from "@/types";

// ============================================================
// Lookup Caches (O(1) instead of O(n))
// ============================================================

const nodeMap = new Map<string, BaseNode>();
const macroMap = new Map<string, MacroNode>();
const companyMap = new Map<string, CompanyNode>();
const sectorMap = new Map<string, SectorNode>();
const themeMap = new Map<string, ThemeNode>();

function initCaches() {
  if (nodeMap.size > 0) return;
  for (const n of macroNodes as MacroNode[]) {
    macroMap.set(n.id, n);
    nodeMap.set(n.id, n);
  }
  for (const n of sectorNodes as SectorNode[]) {
    sectorMap.set(n.id, n);
    nodeMap.set(n.id, n);
  }
  for (const n of themeNodes as ThemeNode[]) {
    themeMap.set(n.id, n);
    nodeMap.set(n.id, n);
  }
  for (const n of companyNodes as CompanyNode[]) {
    companyMap.set(n.id, n);
    nodeMap.set(n.id, n);
  }
}

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

export function getCausalEdges(): Edge[] {
  return causalEdges as Edge[];
}

// ============================================================
// Computed Edges (Supply Chain + Belongs To)
// ============================================================

let _computedEdges: Edge[] | null = null;

function computeSupplyChainEdges(): Edge[] {
  initCaches();
  const edges: Edge[] = [];
  const seen = new Set<string>();

  for (const theme of themeNodes as ThemeNode[]) {
    const sortedTiers = [...theme.tiers].sort((a, b) => a.tier - b.tier);

    for (let i = 0; i < sortedTiers.length - 1; i++) {
      const upstream = sortedTiers[i];
      const downstream = sortedTiers[i + 1];
      const upExisting = upstream.nodes.filter((id) => nodeMap.has(id));
      const downExisting = downstream.nodes.filter((id) => nodeMap.has(id));

      for (const srcId of upExisting) {
        for (const tgtId of downExisting) {
          if (srcId === tgtId) continue;
          const key = `${srcId}__${tgtId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push({
            id: `sc_${theme.id}_${srcId}_${tgtId}`,
            source: srcId,
            target: tgtId,
            type: "supply_chain",
            direction: "positive",
            strength: "medium",
            mechanism: `${upstream.name} → ${downstream.name} (${theme.name})`,
          });
        }
      }
    }
  }

  return edges;
}

function computeBelongsToEdges(): Edge[] {
  initCaches();
  const edges: Edge[] = [];

  for (const company of companyNodes as CompanyNode[]) {
    if (sectorMap.has(company.sectorId)) {
      edges.push({
        id: `bt_${company.id}_${company.sectorId}`,
        source: company.id,
        target: company.sectorId,
        type: "belongs_to",
        strength: "strong",
        mechanism: `${company.name} ∈ ${sectorMap.get(company.sectorId)?.name}`,
      });
    }
  }

  return edges;
}

function getComputedEdges(): Edge[] {
  if (!_computedEdges) {
    _computedEdges = [...computeSupplyChainEdges(), ...computeBelongsToEdges()];
  }
  return _computedEdges;
}

export function getEdges(): Edge[] {
  return [...getCausalEdges(), ...getComputedEdges()];
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
// Node Lookups (O(1) with cache)
// ============================================================

export function getNodeById(id: string): BaseNode | undefined {
  initCaches();
  return nodeMap.get(id);
}

export function getMacroNodeById(id: string): MacroNode | undefined {
  initCaches();
  return macroMap.get(id);
}

export function getCompanyById(id: string): CompanyNode | undefined {
  initCaches();
  return companyMap.get(id);
}

export function getThemeById(id: string): ThemeNode | undefined {
  initCaches();
  return themeMap.get(id);
}

export function getSectorById(id: string): SectorNode | undefined {
  initCaches();
  return sectorMap.get(id);
}

// ============================================================
// Edge Lookups
// ============================================================

let _edgeIndex: Map<string, Edge[]> | null = null;

function getEdgeIndex(): Map<string, Edge[]> {
  if (!_edgeIndex) {
    _edgeIndex = new Map();
    for (const e of getEdges()) {
      if (!_edgeIndex.has(e.source)) _edgeIndex.set(e.source, []);
      if (!_edgeIndex.has(e.target)) _edgeIndex.set(e.target, []);
      _edgeIndex.get(e.source)!.push(e);
      _edgeIndex.get(e.target)!.push(e);
    }
  }
  return _edgeIndex;
}

export function getEdgesForNode(nodeId: string): Edge[] {
  return getEdgeIndex().get(nodeId) || [];
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
  return ids
    .map((id) => getNodeById(id))
    .filter((n): n is BaseNode => n !== undefined);
}

// ============================================================
// Multi-Level Scenario (BFS, up to 3 levels)
// ============================================================

export function runScenario(
  nodeId: string,
  action: ScenarioAction,
  maxDepth: number = 3
): ScenarioResult[] {
  const causal = getCausalEdges();
  const results: ScenarioResult[] = [];
  const visited = new Set<string>([nodeId]);

  interface QueueItem {
    id: string;
    dir: "up" | "down" | "complex";
    depth: number;
  }

  const queue: QueueItem[] = [];

  const directEdges = causal.filter((e) => e.source === nodeId);
  for (const edge of directEdges) {
    let dir: "up" | "down" | "complex" = "complex";
    if (edge.direction === "positive") {
      dir = action === "increase" ? "up" : "down";
    } else if (edge.direction === "negative") {
      dir = action === "increase" ? "down" : "up";
    }

    if (!visited.has(edge.target)) {
      visited.add(edge.target);
      results.push({
        nodeId: edge.target,
        expectedDirection: dir,
        strength: (edge.strength as EdgeStrength) || "medium",
        mechanism: edge.mechanism || "",
        timeLag: edge.timeLag,
        depth: 1,
      });
      queue.push({ id: edge.target, dir, depth: 1 });
    }
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.depth >= maxDepth) continue;

    const nextEdges = causal.filter((e) => e.source === item.id);
    for (const edge of nextEdges) {
      if (visited.has(edge.target)) continue;
      visited.add(edge.target);

      let dir: "up" | "down" | "complex" = "complex";
      if (item.dir !== "complex" && edge.direction !== "complex") {
        if (edge.direction === "positive") {
          dir = item.dir;
        } else if (edge.direction === "negative") {
          dir = item.dir === "up" ? "down" : "up";
        }
      }

      const strengthOrder: EdgeStrength[] = ["strong", "medium", "weak"];
      const parentIdx = strengthOrder.indexOf(
        (edge.strength as EdgeStrength) || "medium"
      );
      const attenuated = strengthOrder[
        Math.min(parentIdx + item.depth - 1, 2)
      ] as EdgeStrength;

      results.push({
        nodeId: edge.target,
        expectedDirection: dir,
        strength: attenuated,
        mechanism: edge.mechanism || "",
        timeLag: edge.timeLag,
        depth: item.depth + 1,
      });
      queue.push({ id: edge.target, dir, depth: item.depth + 1 });
    }
  }

  return results;
}

// ============================================================
// Path Finding (BFS shortest path)
// ============================================================

export function findPath(
  fromId: string,
  toId: string
): { nodes: string[]; edges: Edge[] } | null {
  const allEdges = getEdges();
  const adjacency = new Map<string, { nodeId: string; edge: Edge }[]>();

  for (const e of allEdges) {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    if (!adjacency.has(e.target)) adjacency.set(e.target, []);
    adjacency.get(e.source)!.push({ nodeId: e.target, edge: e });
    adjacency.get(e.target)!.push({ nodeId: e.source, edge: e });
  }

  const visited = new Set<string>([fromId]);
  const prev = new Map<string, { nodeId: string; edge: Edge }>();
  const bfsQueue = [fromId];

  while (bfsQueue.length > 0) {
    const current = bfsQueue.shift()!;
    if (current === toId) {
      const pathNodes: string[] = [toId];
      const pathEdges: Edge[] = [];
      let node = toId;
      while (node !== fromId) {
        const p = prev.get(node)!;
        pathEdges.unshift(p.edge);
        pathNodes.unshift(p.nodeId);
        node = p.nodeId;
      }
      return { nodes: pathNodes, edges: pathEdges };
    }

    for (const neighbor of adjacency.get(current) || []) {
      if (!visited.has(neighbor.nodeId)) {
        visited.add(neighbor.nodeId);
        prev.set(neighbor.nodeId, { nodeId: current, edge: neighbor.edge });
        bfsQueue.push(neighbor.nodeId);
      }
    }
  }

  return null;
}

// ============================================================
// Theme Utils
// ============================================================

export function getNodeThemes(nodeId: string): ThemeNode[] {
  return getThemeNodes().filter((theme) =>
    theme.tiers.some((tier) => tier.nodes.includes(nodeId))
  );
}

export function getNodeTierInTheme(
  nodeId: string,
  themeId: string
): number | null {
  const theme = getThemeById(themeId);
  if (!theme) return null;
  for (const tier of theme.tiers) {
    if (tier.nodes.includes(nodeId)) return tier.tier;
  }
  return null;
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
    causalEdges: getCausalEdges().length,
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
    theme: "#F59E0B",
    company: "#34D399",
  };
  return colors[type] || "#9CA3AF";
}

export function getDirectionColor(
  direction: "up" | "down" | "neutral" | "complex" | undefined
): string {
  if (direction === "up") return "#10B981";
  if (direction === "down") return "#EF4444";
  return "#9CA3AF";
}

export function getCategoryColor(category: MacroCategory): string {
  const colors: Record<MacroCategory, string> = {
    monetary_policy: "#06B6D4",
    currency: "#3B82F6",
    bond: "#8B5CF6",
    commodity: "#F59E0B",
    commodity_energy: "#EF4444",
    commodity_metal: "#D97706",
    commodity_agri: "#84CC16",
    indicator: "#10B981",
    flow: "#EC4899",
    index: "#6366F1",
  };
  return colors[category] || "#9CA3AF";
}

// ============================================================
// Formatting
// ============================================================

export function formatMarketCap(value: number): string {
  if (value >= 1000000000000000)
    return `${(value / 1000000000000000).toFixed(0)}천조`;
  if (value >= 1000000000000)
    return `${(value / 1000000000000).toFixed(1)}조`;
  if (value >= 1000000000)
    return `$${(value / 1000000000).toFixed(0)}B`;
  if (value >= 100000000) return `${(value / 100000000).toFixed(0)}억`;
  return value.toLocaleString();
}
