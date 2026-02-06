import Link from "next/link";
import { Network, ArrowRight, Zap, GitBranch, Search } from "lucide-react";
import { getMacroNodes, getStats } from "@/lib/data";
import { MacroCard } from "@/components/common/MacroCard";
import type { MacroNode } from "@/types";

const heroMacroIds = [
  "us_fed_rate",
  "dxy",
  "us_10y",
  "usd_krw",
  "wti",
  "semiconductor_cycle",
  "vix",
  "kospi",
];

export default function HomePage() {
  const macroNodes = getMacroNodes();
  const stats = getStats();

  const heroMacros = heroMacroIds
    .map((id) => macroNodes.find((n) => n.id === id))
    .filter(Boolean) as MacroNode[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-atlas-text-primary text-balance">
              Capital Atlas
            </h1>
            <p className="text-atlas-text-secondary mt-2 max-w-2xl leading-relaxed">
              자본시장의 인과구조를 시각화하는 인터랙티브 분석 플랫폼.
              매크로 변수, 밸류체인, 섹터, 종목을 하나의 인드라망으로 연결합니다.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link
                href="/graph"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-atlas-gold/10 border border-atlas-gold/30 rounded-lg text-atlas-gold font-medium text-sm hover:bg-atlas-gold/20 transition-colors"
              >
                <Network size={16} />
                인드라망 열기
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-atlas-border rounded-lg text-atlas-text-secondary text-sm hover:text-atlas-text-primary hover:border-atlas-border/80 transition-colors"
              >
                <Search size={14} />
                노드 검색
              </Link>
            </div>
          </div>

          {/* Key Macro Variables */}
          <div>
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap size={14} className="text-atlas-macro" />
              주요 매크로 변수
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {heroMacros.map((node) => (
                <MacroCard key={node.id} node={node} />
              ))}
            </div>
          </div>

          {/* Graph Stats */}
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch size={18} className="text-atlas-gold" />
              <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider">
                인과구조 네트워크
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold font-data text-atlas-text-primary">
                  {stats.totalNodes}
                </p>
                <p className="text-xs text-atlas-text-muted mt-0.5">
                  전체 노드
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-data text-atlas-text-primary">
                  {stats.totalEdges}
                </p>
                <p className="text-xs text-atlas-text-muted mt-0.5">
                  전체 엣지
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-data text-atlas-text-primary">
                  {stats.causalEdges}
                </p>
                <p className="text-xs text-atlas-text-muted mt-0.5">
                  인과관계
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold font-data text-atlas-text-primary">
                  {stats.themeCount}
                </p>
                <p className="text-xs text-atlas-text-muted mt-0.5">
                  밸류체인 테마
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-atlas-border">
              <p className="text-xs text-atlas-text-muted">
                매크로 {stats.macroNodes}개 · 섹터 {stats.sectorNodes}개 · 기업{" "}
                {stats.companyCount}개 · 강한 인과관계 {stats.strongEdges}개
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
