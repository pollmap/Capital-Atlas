"use client";

import { useState, useMemo } from "react";
import { BarChart3, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { getCompanyNodes, getSectorNodes } from "@/lib/data";

type SortKey = "name" | "marketCap" | "per" | "pbr" | "roe" | "operatingMargin" | "dividendYield" | "return52w";
type SortDir = "asc" | "desc";

interface Filters {
  sector: string;
  maxPER: number;
  maxPBR: number;
  minROE: number;
  minDividend: number;
}

const defaultFilters: Filters = {
  sector: "all",
  maxPER: 100,
  maxPBR: 10,
  minROE: 0,
  minDividend: 0,
};

export default function ScreenerPage() {
  const companies = getCompanyNodes();
  const sectors = getSectorNodes();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    return companies
      .filter((c) => {
        if (filters.sector !== "all" && c.sectorId !== filters.sector) return false;
        if (c.financials.per > filters.maxPER && c.financials.per > 0) return false;
        if (c.financials.pbr > filters.maxPBR) return false;
        if (c.financials.roe < filters.minROE) return false;
        if (c.financials.dividendYield < filters.minDividend) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        switch (sortKey) {
          case "name": return dir * a.name.localeCompare(b.name);
          case "marketCap": return dir * (a.financials.marketCap - b.financials.marketCap);
          case "per": return dir * (a.financials.per - b.financials.per);
          case "pbr": return dir * (a.financials.pbr - b.financials.pbr);
          case "roe": return dir * (a.financials.roe - b.financials.roe);
          case "operatingMargin": return dir * (a.financials.operatingMargin - b.financials.operatingMargin);
          case "dividendYield": return dir * (a.financials.dividendYield - b.financials.dividendYield);
          case "return52w": return dir * (a.financials.return52w - b.financials.return52w);
          default: return 0;
        }
      });
  }, [companies, filters, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const fmtCap = (v: number) => {
    if (v >= 1000000000000) return `${(v / 1000000000000).toFixed(1)}조`;
    if (v >= 100000000) return `${(v / 100000000).toFixed(0)}억`;
    if (v >= 1000000000) return `$${(v / 1000000000).toFixed(0)}B`;
    return v.toLocaleString();
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-right px-3 py-2 text-xs font-semibold text-atlas-text-muted cursor-pointer hover:text-atlas-text-primary select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === field && <ArrowUpDown size={10} className="text-atlas-gold" />}
      </span>
    </th>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <BarChart3 size={24} className="text-atlas-company" />
          간단 스크리너
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          PER, PBR, ROE 등 조건으로 기업을 필터링합니다
        </p>
      </div>

      {/* Filters */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-atlas-gold" />
          <span className="text-sm font-semibold text-atlas-text-primary">필터</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-atlas-text-muted mb-1">섹터</label>
            <select
              value={filters.sector}
              onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-2 py-1.5 text-sm font-data text-atlas-text-primary focus:outline-none"
            >
              <option value="all">전체</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-atlas-text-muted mb-1">최대 PER</label>
            <input
              type="number"
              value={filters.maxPER}
              onChange={(e) => setFilters((f) => ({ ...f, maxPER: Number(e.target.value) }))}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-2 py-1.5 text-sm font-data text-atlas-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-atlas-text-muted mb-1">최대 PBR</label>
            <input
              type="number"
              step="0.1"
              value={filters.maxPBR}
              onChange={(e) => setFilters((f) => ({ ...f, maxPBR: Number(e.target.value) }))}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-2 py-1.5 text-sm font-data text-atlas-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-atlas-text-muted mb-1">최소 ROE (%)</label>
            <input
              type="number"
              value={filters.minROE}
              onChange={(e) => setFilters((f) => ({ ...f, minROE: Number(e.target.value) }))}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-2 py-1.5 text-sm font-data text-atlas-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-atlas-text-muted mb-1">최소 배당률 (%)</label>
            <input
              type="number"
              step="0.1"
              value={filters.minDividend}
              onChange={(e) => setFilters((f) => ({ ...f, minDividend: Number(e.target.value) }))}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-2 py-1.5 text-sm font-data text-atlas-text-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-2 text-xs text-atlas-text-muted">
          {filtered.length}개 기업 일치 / 전체 {companies.length}개
        </div>
      </div>

      {/* Table */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-atlas-border">
                <th className="text-left px-3 py-2 text-xs font-semibold text-atlas-text-muted cursor-pointer" onClick={() => handleSort("name")}>
                  기업명
                </th>
                <SortHeader label="시가총액" field="marketCap" />
                <SortHeader label="PER" field="per" />
                <SortHeader label="PBR" field="pbr" />
                <SortHeader label="ROE" field="roe" />
                <SortHeader label="영업이익률" field="operatingMargin" />
                <SortHeader label="배당률" field="dividendYield" />
                <SortHeader label="52주수익률" field="return52w" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-atlas-border/30 hover:bg-atlas-panel-light">
                  <td className="px-3 py-2">
                    <Link href={`/companies/${c.id}`} className="text-sm font-medium text-atlas-text-primary hover:text-atlas-gold transition-colors">
                      {c.name}
                    </Link>
                    <div className="text-xs text-atlas-text-muted">{c.ticker}</div>
                  </td>
                  <td className="px-3 py-2 font-data text-sm text-right text-atlas-text-primary">{fmtCap(c.financials.marketCap)}</td>
                  <td className="px-3 py-2 font-data text-sm text-right text-atlas-text-primary">{c.financials.per.toFixed(1)}</td>
                  <td className="px-3 py-2 font-data text-sm text-right text-atlas-text-primary">{c.financials.pbr.toFixed(2)}</td>
                  <td className={`px-3 py-2 font-data text-sm text-right ${c.financials.roe >= 15 ? "text-atlas-up" : "text-atlas-text-primary"}`}>
                    {c.financials.roe.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 font-data text-sm text-right text-atlas-text-primary">{c.financials.operatingMargin.toFixed(1)}%</td>
                  <td className="px-3 py-2 font-data text-sm text-right text-atlas-text-primary">{c.financials.dividendYield.toFixed(2)}%</td>
                  <td className={`px-3 py-2 font-data text-sm text-right ${c.financials.return52w >= 0 ? "text-atlas-up" : "text-atlas-down"}`}>
                    {c.financials.return52w > 0 ? "+" : ""}{c.financials.return52w.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-atlas-text-muted">
                    필터 조건에 맞는 기업이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
