// Capital Atlas v2 — Core Type Definitions
// 총괄 개발자: 이찬희

// ============================================================
// Node Types
// ============================================================

export type NodeType = "macro" | "sector" | "theme" | "company";

export type MacroCategory =
  | "monetary_policy"
  | "currency"
  | "bond"
  | "commodity"
  | "commodity_energy"
  | "commodity_metal"
  | "commodity_agri"
  | "indicator"
  | "flow"
  | "index";

export type Region = "US" | "KR" | "EU" | "JP" | "CN" | "Global";

export type Market = "KOSPI" | "KOSDAQ" | "NYSE" | "NASDAQ" | "LSE" | "TSE" | "ASX" | "SSE" | "UNLISTED";

export interface BaseNode {
  id: string;
  name: string;
  nameEn: string;
  type: NodeType;
  description: string;
  tags: string[];
}

export interface MacroNode extends BaseNode {
  type: "macro";
  category: MacroCategory;
  region: Region;
  unit: string;
  currentValue?: string;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  dataSource?: string;
  apiKey?: string;
  trackedBy?: string[];
}

export interface SectorNode extends BaseNode {
  type: "sector";
  benchmark?: string;
  companyIds: string[];
}

export interface ThemeNode extends BaseNode {
  type: "theme";
  tiers: ThemeTier[];
  connectedMacroNodes: string[];
}

export interface ThemeTier {
  tier: number;
  name: string;
  nameEn: string;
  nodes: string[];
}

export interface CompanyFinancials {
  marketCap: number;
  per: number;
  pbr: number;
  roe: number;
  operatingMargin: number;
  debtRatio: number;
  dividendYield: number;
  return52w: number;
}

export interface CompanyValuation {
  dcfTarget?: number;
  rimTarget?: number;
  currentPrice: number;
  gap?: string;
  thesis?: string;
  lastUpdated: string;
}

export interface CompanyNode extends BaseNode {
  type: "company";
  ticker: string;
  market: Market;
  sectorId: string;
  themeIds: string[];
  role?: string;
  financials: CompanyFinancials;
  valuation?: CompanyValuation;
}

// ============================================================
// Edge Types
// ============================================================

export type EdgeType = "causal" | "supply_chain" | "belongs_to";
export type EdgeDirection = "positive" | "negative" | "complex";
export type EdgeStrength = "strong" | "medium" | "weak";

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  direction?: EdgeDirection;
  strength?: EdgeStrength;
  timeLag?: string;
  mechanism?: string;
  exceptions?: string;
  consensusInvestors?: string[];
}

// ============================================================
// Graph Data
// ============================================================

export interface GraphData {
  nodes: (MacroNode | SectorNode | ThemeNode | CompanyNode)[];
  edges: Edge[];
}

// ============================================================
// Scenario Types
// ============================================================

export type ScenarioAction = "increase" | "decrease";

export interface ScenarioResult {
  nodeId: string;
  expectedDirection: "up" | "down" | "complex";
  strength: EdgeStrength;
  mechanism: string;
  timeLag?: string;
  depth: number;
}

// ============================================================
// Search Types
// ============================================================

export interface SearchResult {
  id: string;
  name: string;
  nameEn: string;
  type: NodeType;
  description: string;
  score: number;
}

// ============================================================
// UI Types
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// ============================================================
// Graph Simulation Types (D3)
// ============================================================

export interface SimNode {
  id: string;
  name: string;
  nameEn: string;
  type: NodeType;
  category?: string;
  region?: string;
  radius: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  id: string;
  edgeType: EdgeType;
  direction?: EdgeDirection;
  strength?: EdgeStrength;
  mechanism?: string;
}
