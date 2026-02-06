import Link from "next/link";
import {
  Network,
  TrendingUp,
  Layers,
  BarChart3,
  ArrowRight,
  GitBranch,
  Zap,
  FileText,
} from "lucide-react";
import { getMacroNodes, getThemeNodes, getStats } from "@/lib/data";
import { MacroCard } from "@/components/common/MacroCard";
import type { MacroNode } from "@/types";

const heroMacroIds = [
  "us_fed_rate",
  "dxy",
  "usd_krw",
  "wti",
  "copper",
  "vix",
];

export default function Home() {
  const macroNodes = getMacroNodes();
  const themes = getThemeNodes();
  const stats = getStats();

  const heroMacros = heroMacroIds
    .map((id) => macroNodes.find((n) => n.id === id))
    .filter(Boolean) as MacroNode[];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-atlas-macro/5 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-atlas-macro/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-48 h-48 bg-atlas-sector/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-atlas-gold/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-atlas-panel border border-atlas-border text-xs text-atlas-text-secondary mb-6">
              <Zap size={12} className="text-atlas-gold" />
              Sophia Atlas 시리즈 — 금융 편
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="text-atlas-text-primary">자본시장의 </span>
              <span className="bg-gradient-to-r from-atlas-gold via-atlas-accent to-atlas-macro bg-clip-text text-transparent">
                인과구조
              </span>
              <span className="text-atlas-text-primary">를 탐험하세요</span>
            </h1>

            <p className="text-lg text-atlas-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
              &ldquo;금리가 오르면 뭐가 오르고 뭐가 내리는가?&rdquo;
              <br />
              예측하지 않습니다. 구조를 보여줍니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/graph"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-atlas-gold to-atlas-accent text-atlas-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                <Network size={18} />
                인과지도 탐험하기
              </Link>
              <Link
                href="/themes"
                className="inline-flex items-center gap-2 px-6 py-3 border border-atlas-border text-atlas-text-primary rounded-lg hover:bg-atlas-panel transition-colors"
              >
                <Layers size={18} />
                밸류체인 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Macro Snapshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-atlas-text-primary flex items-center gap-2">
            <TrendingUp size={20} className="text-atlas-macro" />
            매크로 스냅샷
          </h2>
          <Link
            href="/macro"
            className="text-sm text-atlas-text-muted hover:text-atlas-link flex items-center gap-1"
          >
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {heroMacros.map((node) => (
            <MacroCard key={node.id} node={node} compact />
          ))}
        </div>
      </section>

      {/* Themes & Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Theme Value Chains */}
          <div>
            <h2 className="text-lg font-semibold text-atlas-text-primary flex items-center gap-2 mb-4">
              <Layers size={20} className="text-atlas-sector" />
              테마 밸류체인
            </h2>
            <div className="space-y-2">
              {themes.map((theme) => (
                <Link key={theme.id} href={`/themes/${theme.id}`}>
                  <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-sector/50 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-atlas-text-primary group-hover:text-atlas-sector transition-colors">
                          {theme.name}
                        </h3>
                        <p className="text-xs text-atlas-text-muted mt-0.5">
                          {theme.nameEn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-atlas-text-muted font-data">
                          {theme.tiers.length} Tiers
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-atlas-text-muted group-hover:text-atlas-sector transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {theme.tiers.map((tier) => (
                        <span
                          key={tier.tier}
                          className="text-xs px-2 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted"
                        >
                          {tier.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 4 Modules */}
          <div>
            <h2 className="text-lg font-semibold text-atlas-text-primary flex items-center gap-2 mb-4">
              <GitBranch size={20} className="text-atlas-gold" />
              분석 모듈
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/graph">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-macro/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-macro/10">
                      <Network size={20} className="text-atlas-macro" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-macro transition-colors">
                        매크로 인과지도
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        금리, 환율, 원자재 간 인과관계를 3D로 탐색
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        {stats.macroNodes} 변수
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
                        밸류체인 지도
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        테마별 상류→하류 산업 구조 시각화
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
                        섹터 비교 엔진
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        동일 섹터 내 기업 정량 비교 분석
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        {stats.companyCount} 기업
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/research">
                <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-report/40 transition-all group cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-atlas-report/10">
                      <FileText size={20} className="text-atlas-report" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-atlas-text-primary group-hover:text-atlas-report transition-colors">
                        리서치 아카이브
                      </h3>
                      <p className="text-xs text-atlas-text-muted mt-0.5">
                        CUFA 리서치 리포트 아카이브
                      </p>
                      <span className="inline-block text-xs font-data text-atlas-text-secondary mt-2">
                        리포트
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: "매크로 변수", value: `${stats.macroNodes}+`, color: "text-atlas-macro" },
              { label: "인과 연결", value: `${stats.totalEdges}+`, color: "text-atlas-gold" },
              { label: "테마", value: stats.themeCount, color: "text-atlas-sector" },
              { label: "기업", value: `${stats.companyCount}+`, color: "text-atlas-company" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`font-data text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-atlas-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-gradient-to-r from-atlas-panel to-atlas-panel-light border border-atlas-border rounded-xl p-6 sm:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-atlas-text-primary mb-3">
              Capital Atlas는 예측하지 않습니다
            </h2>
            <p className="text-sm text-atlas-text-secondary leading-relaxed mb-4">
              구조를 보여줍니다. 7대 매크로 투자자(드러켄밀러, 시타델, 애크먼,
              막스, 성상현, VIP, 르네상스)의 프레임워크를 분석하여 38개 핵심
              매크로 변수와 67개 인과관계를 도출했습니다. 사용자가 자신의
              View를 형성할 수 있는 사고 도구입니다.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-sm text-atlas-gold hover:underline"
            >
              프로젝트 소개 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
