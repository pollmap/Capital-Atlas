// Capital Atlas — Macro Data API Route
// Proxies requests to FRED, ECOS to avoid CORS and protect API keys

import { NextRequest, NextResponse } from "next/server";
import { getMacroNodeById } from "@/lib/data";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const ECOS_BASE = "https://ecos.bok.or.kr/api/StatisticSearch";

// FRED series mapping: macro node apiKey -> FRED series ID
const FRED_SERIES: Record<string, string> = {
  FEDFUNDS: "FEDFUNDS",
  DGS10: "DGS10",
  DGS2: "DGS2",
  T10Y2Y: "T10Y2Y",
  DTWEXBGS: "DTWEXBGS",
  DCOILWTICO: "DCOILWTICO",
  VIXCLS: "VIXCLS",
  GOLDAMGBD228NLBM: "GOLDAMGBD228NLBM",
  CPIAUCSL: "CPIAUCSL",
  CPILFESL: "CPILFESL",
  UNRATE: "UNRATE",
  PAYEMS: "PAYEMS",
  BAMLH0A0HYM2: "BAMLH0A0HYM2",
  TEDRATE: "TEDRATE",
  M2SL: "M2SL",
  WALCL: "WALCL",
  UMCSENT: "UMCSENT",
  SP500: "SP500",
  NASDAQCOM: "NASDAQCOM",
};

// ECOS stat codes: apiKey -> [statCode, itemCode, cycle]
const ECOS_SERIES: Record<string, [string, string, string]> = {
  BOK_BASE_RATE: ["722Y001", "0101000", "M"],
  USD_KRW: ["731Y003", "0000001", "D"],
  KOSPI: ["802Y001", "0001000", "D"],
  KOSDAQ: ["802Y001", "0002000", "D"],
  KR_CPI: ["901Y009", "0", "M"],
  FOREIGN_STOCK_NET: ["731Y004", "0000200", "M"],
};

function getDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(start), end: fmt(end) };
}

function getEcosDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 6);
  const fmt = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");
  return { start: fmt(start), end: fmt(end) };
}

async function fetchFRED(
  seriesId: string
): Promise<{ value: string; date: string; change: string; direction: string } | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const { start, end } = getDateRange();
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${start}&observation_end=${end}&sort_order=desc&limit=10`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const obs = data.observations?.filter(
      (o: { value: string }) => o.value !== "."
    );
    if (!obs || obs.length < 2) return null;

    const latest = parseFloat(obs[0].value);
    const prev = parseFloat(obs[1].value);
    const change = latest - prev;
    const direction = change > 0.001 ? "up" : change < -0.001 ? "down" : "neutral";

    return {
      value: latest.toFixed(2),
      date: obs[0].date,
      change: (change >= 0 ? "+" : "") + change.toFixed(2),
      direction,
    };
  } catch {
    return null;
  }
}

async function fetchECOS(
  statCode: string,
  itemCode: string,
  cycle: string
): Promise<{ value: string; date: string; change: string; direction: string } | null> {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) return null;

  const { start, end } = getEcosDateRange();
  const url = `${ECOS_BASE}/${apiKey}/json/kr/1/10/${statCode}/${cycle}/${start}/${end}/${itemCode}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const rows = data.StatisticSearch?.row;
    if (!rows || rows.length < 2) return null;

    const latest = parseFloat(rows[rows.length - 1].DATA_VALUE);
    const prev = parseFloat(rows[rows.length - 2].DATA_VALUE);
    const change = latest - prev;
    const direction = change > 0.01 ? "up" : change < -0.01 ? "down" : "neutral";

    return {
      value: latest.toLocaleString("en-US", { maximumFractionDigits: 2 }),
      date: rows[rows.length - 1].TIME,
      change: (change >= 0 ? "+" : "") + change.toFixed(2),
      direction,
    };
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  const node = getMacroNodeById(params.seriesId);
  if (!node) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  const apiKey = node.apiKey || "";
  const dataSource = node.dataSource || "";

  let result = null;

  if (dataSource === "FRED" && FRED_SERIES[apiKey]) {
    result = await fetchFRED(FRED_SERIES[apiKey]);
  } else if (dataSource === "ECOS" && ECOS_SERIES[apiKey]) {
    const [statCode, itemCode, cycle] = ECOS_SERIES[apiKey];
    result = await fetchECOS(statCode, itemCode, cycle);
  }

  if (!result) {
    // Return static data as fallback
    return NextResponse.json({
      value: node.currentValue || null,
      change: node.change || null,
      direction: node.changeDirection || "neutral",
      date: null,
      source: "static",
    });
  }

  return NextResponse.json({
    ...result,
    source: dataSource.toLowerCase(),
  });
}
