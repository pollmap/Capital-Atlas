// Capital Atlas — Core Type Definitions
// 총괄 개발자: 이찬희

// ============================================================
// Node Types
// ============================================================

export type NodeType = "macro" | "sector" | "theme" | "company" | "report";

export type MacroCategory =
  | "monetary_policy"
  | "currency"
  | "bond"
  | "commodity"
  | "indicator"
  | "flow"
  | "index";

export type Region = "US" | "KR" | "EU" | "JP" | "CN" | "Global";

export type Market = "KOSPI" | "KOSDAQ" | "NYSE" | "NASDAQ";

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

export interface ReportNode extends BaseNode {
  type: "report";
  title: string;
  author: string;
  authorRole?: string;
  date: string;
  sector: string;
  companies: string[];
  opinion: "BUY" | "HOLD" | "SELL";
  targetPrice?: number;
  currentPriceAtPublish?: number;
  connectedMacroNodes: string[];
  connectedThemes: string[];
  contentPath?: string;
  status: "draft" | "published";
}

// ============================================================
// Edge Types
// ============================================================

export type EdgeType = "causal" | "supply_chain" | "belongs_to" | "analyzes";
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
  nodes: (MacroNode | SectorNode | ThemeNode | CompanyNode | ReportNode)[];
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

export type ViewMode = "3d" | "2d";
