// Capital Atlas — Portfolio Backtesting Engine
// Generates simulated historical performance based on company financials

import type { CompanyNode } from "@/types";

export interface PortfolioHolding {
  companyId: string;
  weight: number; // 0-100
}

export interface BacktestParams {
  holdings: PortfolioHolding[];
  startYear: number;
  endYear: number;
  initialCapital: number;
  rebalanceFreq: "monthly" | "quarterly" | "yearly";
}

export interface MonthlyReturn {
  date: string; // YYYY-MM
  portfolioValue: number;
  benchmarkValue: number;
  monthlyReturn: number;
  benchmarkReturn: number;
  drawdown: number;
}

export interface BacktestResult {
  monthlyData: MonthlyReturn[];
  totalReturn: number;
  cagr: number;
  maxDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  benchmarkTotalReturn: number;
  benchmarkCagr: number;
  holdings: Array<{
    companyId: string;
    name: string;
    weight: number;
    contribution: number;
  }>;
}

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate realistic monthly returns based on company characteristics
function generateMonthlyReturns(
  company: CompanyNode,
  months: number,
  seed: number
): number[] {
  const rng = seededRandom(seed);
  const returns: number[] = [];

  // Base monthly return derived from 52-week return
  const annualReturn = company.financials.return52w / 100;
  const monthlyMu = annualReturn / 12;

  // Volatility based on company characteristics
  let monthlyVol = 0.06; // default ~21% annual vol
  if (company.financials.marketCap > 100000000000000) monthlyVol = 0.04; // large cap = lower vol
  if (company.financials.marketCap < 5000000000000) monthlyVol = 0.08; // small cap = higher vol
  if (company.financials.debtRatio > 150) monthlyVol *= 1.3; // high debt = more vol
  if (company.financials.roe > 20) monthlyVol *= 0.9; // high quality = less vol

  for (let i = 0; i < months; i++) {
    // Box-Muller transform for normal distribution
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Add some regime switching for realism
    const regime = Math.sin(i * 0.15) * 0.02; // cyclical component
    const crisis = i % 36 < 3 ? -0.03 : 0; // periodic drawdowns

    const monthReturn = monthlyMu + regime + crisis + monthlyVol * z;
    returns.push(monthReturn);
  }

  return returns;
}

// Generate KOSPI benchmark returns
function generateBenchmarkReturns(months: number, startYear: number): number[] {
  const rng = seededRandom(startYear * 12 + 7777);
  const returns: number[] = [];
  const monthlyMu = 0.006; // ~7.5% annual
  const monthlyVol = 0.045; // ~15.5% annual

  for (let i = 0; i < months; i++) {
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const regime = Math.sin(i * 0.12) * 0.015;
    const crisis = i % 42 < 3 ? -0.025 : 0;
    returns.push(monthlyMu + regime + crisis + monthlyVol * z);
  }

  return returns;
}

export function runBacktest(
  params: BacktestParams,
  companies: CompanyNode[]
): BacktestResult {
  const { holdings, startYear, endYear, initialCapital } = params;
  const months = (endYear - startYear) * 12;
  const years = endYear - startYear;

  if (months <= 0 || holdings.length === 0) {
    return {
      monthlyData: [],
      totalReturn: 0,
      cagr: 0,
      maxDrawdown: 0,
      volatility: 0,
      sharpeRatio: 0,
      benchmarkTotalReturn: 0,
      benchmarkCagr: 0,
      holdings: [],
    };
  }

  // Normalize weights
  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);
  const normalizedHoldings = holdings.map((h) => ({
    ...h,
    weight: totalWeight > 0 ? h.weight / totalWeight : 0,
  }));

  // Generate returns for each holding
  const holdingReturns: { companyId: string; company: CompanyNode; weight: number; returns: number[] }[] = [];

  for (const holding of normalizedHoldings) {
    const company = companies.find((c) => c.id === holding.companyId);
    if (!company) continue;

    const seed = holding.companyId
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) + startYear;

    holdingReturns.push({
      companyId: holding.companyId,
      company,
      weight: holding.weight,
      returns: generateMonthlyReturns(company, months, seed),
    });
  }

  // Benchmark returns
  const benchmarkReturns = generateBenchmarkReturns(months, startYear);

  // Calculate portfolio monthly data
  const monthlyData: MonthlyReturn[] = [];
  let portfolioValue = initialCapital;
  let benchmarkValue = initialCapital;
  let peak = initialCapital;
  const portfolioMonthlyReturns: number[] = [];

  for (let m = 0; m < months; m++) {
    // Weighted portfolio return
    let portfolioReturn = 0;
    for (const hr of holdingReturns) {
      portfolioReturn += hr.weight * hr.returns[m];
    }

    portfolioValue *= 1 + portfolioReturn;
    benchmarkValue *= 1 + benchmarkReturns[m];
    peak = Math.max(peak, portfolioValue);
    const drawdown = (portfolioValue - peak) / peak;

    const year = startYear + Math.floor(m / 12);
    const month = (m % 12) + 1;

    monthlyData.push({
      date: `${year}-${String(month).padStart(2, "0")}`,
      portfolioValue: Math.round(portfolioValue),
      benchmarkValue: Math.round(benchmarkValue),
      monthlyReturn: portfolioReturn,
      benchmarkReturn: benchmarkReturns[m],
      drawdown,
    });

    portfolioMonthlyReturns.push(portfolioReturn);
  }

  // Calculate metrics
  const totalReturn = (portfolioValue - initialCapital) / initialCapital;
  const cagr = years > 0 ? Math.pow(portfolioValue / initialCapital, 1 / years) - 1 : 0;
  const maxDrawdown = Math.min(...monthlyData.map((d) => d.drawdown));

  const avgReturn =
    portfolioMonthlyReturns.reduce((s, r) => s + r, 0) /
    portfolioMonthlyReturns.length;
  const variance =
    portfolioMonthlyReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) /
    (portfolioMonthlyReturns.length - 1);
  const monthlyVol = Math.sqrt(variance);
  const annualVol = monthlyVol * Math.sqrt(12);
  const riskFreeRate = 0.035; // 3.5% annual
  const sharpeRatio =
    annualVol > 0 ? (cagr - riskFreeRate) / annualVol : 0;

  const benchmarkTotalReturn =
    (benchmarkValue - initialCapital) / initialCapital;
  const benchmarkCagr =
    years > 0 ? Math.pow(benchmarkValue / initialCapital, 1 / years) - 1 : 0;

  // Holdings contribution
  const holdingsResult = holdingReturns.map((hr) => {
    const cumReturn = hr.returns.reduce((acc, r) => acc * (1 + r), 1) - 1;
    return {
      companyId: hr.companyId,
      name: hr.company.name,
      weight: hr.weight * 100,
      contribution: cumReturn * hr.weight * 100,
    };
  });

  return {
    monthlyData,
    totalReturn: totalReturn * 100,
    cagr: cagr * 100,
    maxDrawdown: maxDrawdown * 100,
    volatility: annualVol * 100,
    sharpeRatio,
    benchmarkTotalReturn: benchmarkTotalReturn * 100,
    benchmarkCagr: benchmarkCagr * 100,
    holdings: holdingsResult,
  };
}
