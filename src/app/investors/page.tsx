"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Quote, TrendingUp, Target, ExternalLink } from "lucide-react";
import investorsData from "@/data/investors.json";
import { getNodeById } from "@/lib/data";

export default function InvestorsPage() {
  const [selectedInvestor, setSelectedInvestor] = useState(investorsData[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Users size={24} className="text-atlas-gold" />
          7대 매크로 투자자 프레임워크
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          글로벌 + 한국 대표 매크로 투자자들의 분석 프레임워크와 핵심 지표
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investor List */}
        <div className="lg:col-span-1 space-y-3">
          {investorsData.map((investor) => (
            <button
              key={investor.id}
              onClick={() => setSelectedInvestor(investor)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedInvestor.id === investor.id
                  ? "bg-atlas-gold/10 border-atlas-gold/50"
                  : "bg-atlas-panel border-atlas-border hover:border-atlas-gold/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-atlas-panel-light to-atlas-panel flex items-center justify-center text-atlas-gold font-bold">
                  {investor.nameKr.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-atlas-text-primary">{investor.nameKr}</div>
                  <div className="text-xs text-atlas-text-muted">{investor.firm}</div>
                  <div className="text-xs text-atlas-sector mt-0.5">{investor.style}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Investor Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-atlas-gold/20 to-atlas-accent/20 flex items-center justify-center text-2xl font-bold text-atlas-gold">
                {selectedInvestor.nameKr.slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-atlas-text-primary">{selectedInvestor.name}</h2>
                <p className="text-sm text-atlas-text-muted">{selectedInvestor.nameKr}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-atlas-sector/10 text-atlas-sector text-xs rounded">{selectedInvestor.style}</span>
                  <span className="text-xs text-atlas-text-muted">{selectedInvestor.firm}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-atlas-text-secondary mt-4 leading-relaxed">
              {selectedInvestor.description}
            </p>
          </div>

          {/* Philosophy */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-atlas-gold" />
              <h3 className="text-sm font-semibold text-atlas-text-primary">투자 철학</h3>
            </div>
            <p className="text-sm text-atlas-text-secondary italic leading-relaxed">
              &ldquo;{selectedInvestor.philosophy}&rdquo;
            </p>
          </div>

          {/* Key Indicators */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-atlas-macro" />
              <h3 className="text-sm font-semibold text-atlas-text-primary">주요 관심 지표</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedInvestor.keyIndicators.map((indicatorId) => {
                const node = getNodeById(indicatorId);
                return (
                  <Link
                    key={indicatorId}
                    href={`/macro/${indicatorId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-atlas-macro/10 text-atlas-macro text-sm hover:bg-atlas-macro/20 transition-colors"
                  >
                    {node?.name || indicatorId}
                    <ExternalLink size={10} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-atlas-text-primary mb-3">핵심 분석 영역</h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedInvestor.focusAreas.map((area, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-atlas-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-atlas-gold" />
                  {area}
                </div>
              ))}
            </div>
          </div>

          {/* Famous Quotes */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Quote size={16} className="text-atlas-accent" />
              <h3 className="text-sm font-semibold text-atlas-text-primary">명언</h3>
            </div>
            <div className="space-y-3">
              {selectedInvestor.famousQuotes.map((quote, i) => (
                <div key={i} className="pl-4 border-l-2 border-atlas-accent/30">
                  <p className="text-sm text-atlas-text-secondary italic">&ldquo;{quote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Track Record */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-atlas-text-primary mb-2">실적</h3>
            <p className="text-sm text-atlas-text-secondary leading-relaxed">
              {selectedInvestor.trackRecord}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
