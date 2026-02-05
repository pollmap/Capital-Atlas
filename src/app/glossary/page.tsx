"use client";

import { useState, useMemo } from "react";
import { BookOpen, Search } from "lucide-react";
import glossaryData from "@/data/glossary.json";

const categories: Record<string, string> = {
  all: "전체",
  valuation: "밸류에이션",
  profitability: "수익성",
  cashflow: "현금흐름",
  risk: "리스크",
  macro: "매크로",
  indicator: "지표",
  theory: "이론",
  strategy: "전략",
  industry: "산업",
};

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return glossaryData
      .filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            item.term.toLowerCase().includes(q) ||
            item.termEn.toLowerCase().includes(q) ||
            item.definition.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.term.localeCompare(b.term, "ko"));
  }, [search, category]);

  const usedCategories = useMemo(() => {
    const cats = new Set(glossaryData.map((g) => g.category));
    return ["all", ...Array.from(cats)];
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <BookOpen size={24} className="text-atlas-gold" />
          금융 용어 사전
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          투자 분석에 필요한 핵심 금융 용어 — Value Alpha에서 포팅
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-text-muted" />
            <input
              type="text"
              placeholder="용어 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-atlas-bg border border-atlas-border rounded-lg pl-9 pr-3 py-2 text-sm text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? "bg-atlas-gold/20 text-atlas-gold border border-atlas-gold/30"
                  : "text-atlas-text-muted hover:bg-atlas-panel-light border border-transparent"
              }`}
            >
              {categories[cat] || cat}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-atlas-text-muted">
          {filtered.length}개 용어
        </div>
      </div>

      {/* Glossary List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.term}
            className="bg-atlas-panel border border-atlas-border rounded-xl p-4 hover:border-atlas-gold/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-atlas-text-primary">{item.term}</h3>
                <span className="text-xs text-atlas-text-muted font-data">{item.termEn}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted">
                {categories[item.category] || item.category}
              </span>
            </div>
            <p className="text-sm text-atlas-text-secondary leading-relaxed">
              {item.definition}
            </p>
            {item.formula && (
              <div className="mt-2 bg-atlas-bg rounded-lg px-3 py-2">
                <span className="font-data text-xs text-atlas-macro">{item.formula}</span>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-atlas-text-muted mx-auto mb-3" />
            <p className="text-atlas-text-muted">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
