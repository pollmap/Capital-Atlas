import Link from "next/link";
import {
  Network,
  Layers,
  BarChart3,
  ArrowRight,
  GitBranch,
  Zap,
  Calculator,
} from "lucide-react";
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
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-atlas-gold/10 border border-atlas-gold/30 rounded-lg text-atlas-gold font-medium text-sm hover:bg-atlas-gold/20 transition-colors"
            >
              <Network size={16} />
              인드라망 열기
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Macro Dashboard */}
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

          {/* Modules */}
          <div>
            <h2 className="text-lg font-semibold text-atlas-text-primary flex items-center gap-2 mb-4">
              <GitBranch size={20} className="text-atlas-gold" />
              분석 모듈
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/graph">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-gold/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-gold/10">
                      <Network size={20} className="text-atlas-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-gold transition-colors">
                        인드라망
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        2D 인과지도 + 밸류체인 + 시나리오
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        {stats.totalNodes} 노드 · {stats.totalEdges} 엣지
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/themes">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-sector/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-sector/10">
                      <Layers size={20} className="text-atlas-sector" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-sector transition-colors">
                        밸류체인
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        테마별 상류→하류 산업 구조
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        {stats.themeCount} 테마
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/sectors">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-company/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-company/10">
                      <BarChart3 size={20} className="text-atlas-company" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-company transition-colors">
                        섹터 비교
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        섹터 내 기업 정량 비교
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        {stats.companyCount} 기업
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/tools">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-report/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-report/10">
                      <Calculator size={20} className="text-atlas-report" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-report transition-colors">
                        분석 도구
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        DCF, RIM, 히트맵, 스크리너
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        도구 모음
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider">
                Capital Atlas v2
              </h2>
              <p className="text-xs text-atlas-text-muted mt-1">
                7대 매크로 투자자 프레임워크 기반 · {stats.totalNodes} 노드 ·{" "}
                {stats.totalEdges} 엣지 · {stats.causalEdges} 인과관계
              </p>
            </div>
            <Link
              href="/about"
              className="text-sm text-atlas-link hover:text-atlas-gold transition-colors flex items-center gap-1"
            >
              프로젝트 소개 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
