"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Play,
  BarChart3,
  Briefcase,
} from "lucide-react";
import { getCompanyNodes } from "@/lib/data";
import {
  runBacktest,
  type PortfolioHolding,
  type BacktestResult,
} from "@/lib/backtest";
import type { CompanyNode } from "@/types";

export default function BacktestPage() {
  const companies = useMemo(() => getCompanyNodes(), []);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);
  const [initialCapital, setInitialCapital] = useState(100000000);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [newWeight, setNewWeight] = useState(20);

  const addHolding = useCallback(() => {
    if (!selectedCompany || holdings.some((h) => h.companyId === selectedCompany))
      return;
    setHoldings((prev) => [
      ...prev,
      { companyId: selectedCompany, weight: newWeight },
    ]);
    setSelectedCompany("");
  }, [selectedCompany, newWeight, holdings]);

  const removeHolding = useCallback((companyId: string) => {
    setHoldings((prev) => prev.filter((h) => h.companyId !== companyId));
    setResult(null);
  }, []);

  const updateWeight = useCallback((companyId: string, weight: number) => {
    setHoldings((prev) =>
      prev.map((h) => (h.companyId === companyId ? { ...h, weight } : h))
    );
    setResult(null);
  }, []);

  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);

  const handleRun = useCallback(() => {
    if (holdings.length === 0) return;
    const res = runBacktest(
      {
        holdings,
        startYear,
        endYear,
        initialCapital,
        rebalanceFreq: "quarterly",
      },
      companies
    );
    setResult(res);
  }, [holdings, startYear, endYear, initialCapital, companies]);

  const getCompany = (id: string): CompanyNode | undefined =>
    companies.find((c) => c.id === id);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.monthlyData.map((d) => ({
      date: d.date,
      portfolio: d.portfolioValue,
      benchmark: d.benchmarkValue,
      drawdown: d.drawdown * 100,
    }));
  }, [result]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Briefcase size={24} className="text-atlas-gold" />
          포트폴리오 백테스트
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          종목 선택 후 과거 시뮬레이션 수익률을 확인하세요. KOSPI 벤치마크와
          비교합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Construction */}
        <div className="lg:col-span-1 space-y-4">
          {/* Add Holding */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
              종목 추가
            </h2>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full mb-2 px-3 py-2 bg-atlas-bg border border-atlas-border rounded-lg text-sm text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
            >
              <option value="">종목 선택...</option>
              {companies
                .filter((c) => !holdings.some((h) => h.companyId === c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ticker})
                  </option>
                ))}
            </select>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-atlas-text-muted block mb-1">
                  비중 (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-atlas-bg border border-atlas-border rounded-lg text-sm font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
                />
              </div>
              <button
                onClick={addHolding}
                disabled={!selectedCompany}
                className="self-end px-3 py-2 bg-atlas-gold/20 border border-atlas-gold/30 rounded-lg text-atlas-gold text-sm font-medium hover:bg-atlas-gold/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Holdings List */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
              포트폴리오 ({holdings.length}종목)
            </h2>
            {holdings.length === 0 ? (
              <p className="text-xs text-atlas-text-muted py-4 text-center">
                종목을 추가하세요
              </p>
            ) : (
              <div className="space-y-2">
                {holdings.map((h) => {
                  const company = getCompany(h.companyId);
                  return (
                    <div
                      key={h.companyId}
                      className="flex items-center gap-2 bg-atlas-bg rounded-lg p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-atlas-text-primary truncate">
                          {company?.name || h.companyId}
                        </div>
                        <div className="text-[10px] text-atlas-text-muted font-data">
                          {company?.ticker}
                        </div>
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={h.weight}
                        onChange={(e) =>
                          updateWeight(h.companyId, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 bg-atlas-panel border border-atlas-border rounded text-xs font-data text-atlas-text-primary text-right focus:outline-none focus:border-atlas-gold/50"
                      />
                      <span className="text-[10px] text-atlas-text-muted">%</span>
                      <button
                        onClick={() => removeHolding(h.companyId)}
                        className="p-1 text-atlas-text-muted hover:text-atlas-down transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs pt-2 border-t border-atlas-border/50">
                  <span className="text-atlas-text-muted">총 비중</span>
                  <span
                    className={`font-data font-semibold ${
                      Math.abs(totalWeight - 100) < 0.1
                        ? "text-atlas-up"
                        : "text-atlas-gold"
                    }`}
                  >
                    {totalWeight.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
              백테스트 설정
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-atlas-text-muted block mb-1">
                    시작년도
                  </label>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-atlas-bg border border-atlas-border rounded-lg text-xs font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
                  >
                    {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023].map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-atlas-text-muted block mb-1">
                    종료년도
                  </label>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-atlas-bg border border-atlas-border rounded-lg text-xs font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-atlas-text-muted block mb-1">
                  초기 자본 (원)
                </label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  step={10000000}
                  className="w-full px-3 py-1.5 bg-atlas-bg border border-atlas-border rounded-lg text-xs font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
                />
              </div>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={holdings.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-atlas-gold/20 border border-atlas-gold/30 rounded-xl text-atlas-gold font-semibold text-sm hover:bg-atlas-gold/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            백테스트 실행
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!result ? (
            <div className="bg-atlas-panel border border-atlas-border rounded-xl p-12 text-center">
              <BarChart3
                size={48}
                className="text-atlas-text-muted mx-auto mb-4"
              />
              <p className="text-atlas-text-secondary text-sm">
                종목을 추가하고 백테스트를 실행하세요
              </p>
              <p className="text-atlas-text-muted text-xs mt-2">
                시뮬레이션 기반 성과 분석 (기업 재무 특성 반영)
              </p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="총 수익률"
                  value={`${result.totalReturn > 0 ? "+" : ""}${result.totalReturn.toFixed(1)}%`}
                  color={result.totalReturn >= 0 ? "up" : "down"}
                  sub={`벤치마크: ${result.benchmarkTotalReturn > 0 ? "+" : ""}${result.benchmarkTotalReturn.toFixed(1)}%`}
                />
                <MetricCard
                  label="CAGR"
                  value={`${result.cagr > 0 ? "+" : ""}${result.cagr.toFixed(2)}%`}
                  color={result.cagr >= 0 ? "up" : "down"}
                  sub={`벤치마크: ${result.benchmarkCagr.toFixed(2)}%`}
                />
                <MetricCard
                  label="최대 낙폭 (MDD)"
                  value={`${result.maxDrawdown.toFixed(1)}%`}
                  color="down"
                  sub="Peak-to-Trough"
                />
                <MetricCard
                  label="샤프 비율"
                  value={result.sharpeRatio.toFixed(2)}
                  color={result.sharpeRatio > 0.5 ? "up" : result.sharpeRatio > 0 ? "neutral" : "down"}
                  sub={`변동성: ${result.volatility.toFixed(1)}%`}
                />
              </div>

              {/* Equity Curve */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
                  누적 자산 추이
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) => {
                          const parts = String(v).split("-");
                          return parts[1] === "01" ? parts[0] : "";
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) =>
                          `${(Number(v) / 100000000).toFixed(0)}억`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(value) => [
                          `${Number(value).toLocaleString()}원`,
                        ]}
                        labelFormatter={(label) => String(label)}
                      />
                      <Legend
                        formatter={(value) =>
                          value === "portfolio" ? "포트폴리오" : "KOSPI 벤치마크"
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="portfolio"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#6B7280"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Drawdown Chart */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
                  낙폭 (Drawdown)
                </h3>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) => {
                          const parts = String(v).split("-");
                          return parts[1] === "01" ? parts[0] : "";
                        }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) => `${Number(v).toFixed(0)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(value) => [
                          `${Number(value).toFixed(2)}%`,
                          "낙폭",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        stroke="#EF4444"
                        fill="rgba(239, 68, 68, 0.15)"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Holdings Contribution */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
                <h3 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
                  종목별 기여도
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.holdings} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickFormatter={(v) => `${Number(v).toFixed(0)}%p`}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(value) => [
                          `${Number(value).toFixed(2)}%p`,
                          "기여도",
                        ]}
                      />
                      <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                        {result.holdings.map((h, i) => (
                          <Cell
                            key={i}
                            fill={h.contribution >= 0 ? "#10B981" : "#EF4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-atlas-text-muted text-center">
                * 시뮬레이션 결과이며 실제 투자 성과를 보장하지 않습니다. 기업
                재무 특성을 기반으로 한 확률적 모델입니다.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Metric Card Component
// ============================================================

function MetricCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: "up" | "down" | "neutral";
  sub: string;
}) {
  const colorClass =
    color === "up"
      ? "text-atlas-up"
      : color === "down"
      ? "text-atlas-down"
      : "text-atlas-text-primary";

  const Icon =
    color === "up" ? TrendingUp : color === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="bg-atlas-panel border border-atlas-border rounded-xl p-3">
      <div className="text-[10px] text-atlas-text-muted uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`font-data text-xl font-bold ${colorClass} flex items-center gap-1`}>
        <Icon size={14} />
        {value}
      </div>
      <div className="text-[10px] text-atlas-text-muted mt-1">{sub}</div>
    </div>
  );
}
