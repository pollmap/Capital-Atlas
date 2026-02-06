// Capital Atlas — Company Price API Route
// Fetches stock prices from Yahoo Finance (no API key needed)

import { NextRequest, NextResponse } from "next/server";
import { getCompanyById } from "@/lib/data";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooQuote {
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
}

async function fetchYahoo(ticker: string): Promise<YahooQuote | null> {
  try {
    const url = `${YAHOO_BASE}/${ticker}?interval=1d&range=5d`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();

    const meta = data.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      currentPrice,
      previousClose,
      change,
      changePercent,
      currency: meta.currency || "KRW",
      marketState: meta.marketState || "CLOSED",
    };
  } catch {
    return null;
  }
}

// Map our company IDs to Yahoo Finance tickers
const TICKER_MAP: Record<string, string> = {
  // Korean stocks (KOSPI/KOSDAQ add .KS/.KQ suffix)
  samsung_elec: "005930.KS",
  sk_hynix: "000660.KS",
  hyundai_heavy: "329180.KS",
  samsung_heavy: "010140.KS",
  hanwha_ocean: "042660.KS",
  hanwha_aerospace: "012450.KS",
  lig_nex1: "079550.KS",
  korea_aerospace: "047810.KS",
  hyundai_elec: "267260.KS",
  doosan_enerbility: "034020.KS",
  posco_hldg: "005490.KS",
  hd_korea_shipbuilding: "009540.KS",
  samsung_sdi: "006400.KS",
  lg_energy: "373220.KS",
  kakao: "035720.KS",
  naver: "035420.KS",
  celltrion: "068270.KS",
  hyundai_motor: "005380.KS",
  kia: "000270.KS",
  // US stocks
  tsmc: "TSM",
  nvidia: "NVDA",
  asml: "ASML",
  lam_research: "LRCX",
  applied_materials: "AMAT",
  micron: "MU",
  arm_holdings: "ARM",
  broadcom: "AVGO",
  amd: "AMD",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const companyId = params.ticker;
  const company = getCompanyById(companyId);

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const yahooTicker = TICKER_MAP[companyId] || company.ticker;
  const quote = await fetchYahoo(yahooTicker);

  if (!quote) {
    return NextResponse.json({
      price: company.valuation?.currentPrice || null,
      change: null,
      changePercent: null,
      source: "static",
    });
  }

  return NextResponse.json({
    price: quote.currentPrice,
    previousClose: quote.previousClose,
    change: quote.change,
    changePercent: quote.changePercent,
    currency: quote.currency,
    marketState: quote.marketState,
    source: "yahoo",
  });
}
