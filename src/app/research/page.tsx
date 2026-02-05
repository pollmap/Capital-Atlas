"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Calendar, Tag, Filter } from "lucide-react";
import reportsData from "@/data/research/reports.json";

type OpinionFilter = "all" | "BUY" | "HOLD" | "SELL";

const opinionColor: Record<string, string> = {
  BUY: "text-atlas-up bg-atlas-up/10 border-atlas-up/30",
  HOLD: "text-atlas-gold bg-atlas-gold/10 border-atlas-gold/30",
  SELL: "text-atlas-down bg-atlas-down/10 border-atlas-down/30",
};

export default function ResearchPage() {
  const [opinionFilter, setOpinionFilter] = useState<OpinionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const reports = useMemo(() => {
    return reportsData
      .filter((r) => {
        if (opinionFilter !== "all" && r.opinion !== opinionFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [opinionFilter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <FileText size={24} className="text-atlas-report" />
          리서치 아카이브
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          CUFA 투자연구회 리서치 보고서 — 총괄: 이찬희
        </p>
      </div>

      {/* Filters */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-atlas-report" />
          <span className="text-sm font-semibold text-atlas-text-primary">필터</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="보고서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-atlas-bg border border-atlas-border rounded-lg px-3 py-2 text-sm text-atlas-text-primary focus:outline-none focus:border-atlas-report/50"
          />
          <div className="flex gap-2">
            {(["all", "BUY", "HOLD", "SELL"] as OpinionFilter[]).map((op) => (
              <button
                key={op}
                onClick={() => setOpinionFilter(op)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  opinionFilter === op
                    ? op === "all"
                      ? "bg-atlas-panel-light text-atlas-text-primary border-atlas-border"
                      : opinionColor[op]
                    : "text-atlas-text-muted border-transparent hover:bg-atlas-panel-light"
                }`}
              >
                {op === "all" ? "전체" : op}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs text-atlas-text-muted">
          {reports.length}개 보고서
        </div>
      </div>

      {/* Report List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Link key={report.id} href={`/research/${report.id}`}>
            <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 hover:border-atlas-report/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${opinionColor[report.opinion]}`}>
                      {report.opinion}
                    </span>
                    <span className="text-xs text-atlas-text-muted flex items-center gap-1">
                      <Calendar size={10} />
                      {report.date}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-atlas-text-primary group-hover:text-atlas-report transition-colors">
                    {report.title}
                  </h2>
                  <p className="text-xs text-atlas-text-muted mt-0.5">{report.nameEn}</p>
                </div>
              </div>
              <p className="text-sm text-atlas-text-secondary leading-relaxed mb-3">
                {report.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-atlas-text-muted">
                  {report.author} · {report.authorRole}
                </span>
                <div className="flex items-center gap-1">
                  <Tag size={10} className="text-atlas-text-muted" />
                  {report.tags.map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="text-atlas-text-muted mx-auto mb-3" />
            <p className="text-atlas-text-muted">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
