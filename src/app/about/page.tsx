import Link from "next/link";
import {
  Github,
  ExternalLink,
  Network,
  Layers,
  BarChart3,
  BookOpen,
  User,
  Code,
} from "lucide-react";
import { getStats } from "@/lib/data";

export default function AboutPage() {
  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-atlas-gold to-atlas-accent flex items-center justify-center mx-auto mb-4">
          <span className="text-atlas-bg font-bold text-2xl">CA</span>
        </div>
        <h1 className="text-3xl font-bold text-atlas-text-primary mb-2">
          Capital Atlas
        </h1>
        <p className="text-atlas-text-secondary">
          자본시장의 인과구조를 시각화하는 인터랙티브 분석 플랫폼
        </p>
      </div>

      {/* Identity */}
      <section className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-atlas-text-primary mb-4">
          프로젝트 정체성
        </h2>
        <div className="space-y-3 text-sm text-atlas-text-secondary leading-relaxed">
          <p>
            <strong className="text-atlas-gold">한 줄 정의:</strong>{" "}
            &ldquo;금리가 오르면 뭐가 오르고 뭐가 내리는가?&rdquo;를 구조적으로
            탐색할 수 있는 자본시장 인과지도
          </p>
          <p>
            <strong className="text-atlas-gold">핵심 철학:</strong> 예측하지
            않는다. 구조를 보여준다. 숫자 나열이 아니라 &ldquo;왜 이것이 저것에
            영향을 미치는가&rdquo;의 인과 경로를 시각화한다.
          </p>
          <p>
            <strong className="text-atlas-gold">네이밍:</strong> Capital(자본 +
            핵심) + Atlas(지도) — Sophia Atlas 시리즈의 금융 편
          </p>
        </div>
      </section>

      {/* Series */}
      <section className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-atlas-text-primary mb-4">
          Atlas 시리즈
        </h2>
        <div className="space-y-3">
          {[
            {
              name: "Sophia Atlas",
              desc: "인류 사상의 인과지도 — 1,019명의 사상가, 8,538개 연결",
              url: "https://sophia-atlas.vercel.app",
              role: "인드라망 3D 그래프 엔진, 탐색 UX",
            },
            {
              name: "Value Alpha",
              desc: "밸류에이션 학습 도구 — DCF/WACC/Graham 계산기",
              url: "https://pollmap.github.io/Value_Alpha",
              role: "DCF 계산기, 용어사전, 재무 분석 프레임워크",
            },
            {
              name: "Capital Atlas",
              desc: "실전 분석 도구 — 두 프로젝트의 기술과 콘텐츠 융합",
              url: "#",
              role: "매크로 인과지도 + 밸류체인 + 섹터 비교 + 리서치",
            },
          ].map((project) => (
            <div
              key={project.name}
              className="flex items-start gap-3 p-3 rounded-lg bg-atlas-bg"
            >
              <Code size={18} className="text-atlas-gold mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-atlas-text-primary text-sm">
                    {project.name}
                  </span>
                  {project.url !== "#" && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-atlas-link"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-atlas-text-secondary">
                  {project.desc}
                </p>
                <p className="text-xs text-atlas-text-muted mt-1">
                  재활용: {project.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Modules */}
      <section className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-atlas-text-primary mb-4">
          4개 핵심 모듈
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: Network,
              name: "Module A: 매크로 인과지도",
              desc: "매크로 변수 간 인과관계를 3D 그래프로 탐색. 시나리오 분석 기능 포함",
              color: "text-atlas-macro",
              href: "/graph",
            },
            {
              icon: Layers,
              name: "Module B: 밸류체인 지도",
              desc: "테마별 상류→하류 산업 구조와 핵심 기업 시각화",
              color: "text-atlas-sector",
              href: "/themes",
            },
            {
              icon: BarChart3,
              name: "Module C: 섹터 비교 엔진",
              desc: "동일 섹터 내 기업 정량 비교. PER, PBR, ROE 등",
              color: "text-atlas-company",
              href: "/sectors",
            },
            {
              icon: BookOpen,
              name: "Module D: 리서치 아카이브",
              desc: "CUFA 리서치 리포트 퍼블리싱 (Phase 3)",
              color: "text-atlas-report",
              href: "#",
            },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.name} href={mod.href}>
                <div className="bg-atlas-bg rounded-lg p-4 border border-atlas-border hover:border-atlas-gold/30 transition-colors h-full">
                  <Icon size={20} className={mod.color} />
                  <h3 className="font-semibold text-sm text-atlas-text-primary mt-2">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-atlas-text-muted mt-1">
                    {mod.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-atlas-text-primary mb-4">
          기술 스택
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: "Next.js 14", desc: "App Router, Static Export" },
            { name: "TypeScript", desc: "Strict mode" },
            { name: "Tailwind CSS", desc: "다크모드 기본" },
            { name: "Three.js", desc: "react-three-fiber, 3D 그래프" },
            { name: "Recharts", desc: "재무 차트" },
            { name: "Fuse.js", desc: "클라이언트 검색" },
          ].map((tech) => (
            <div key={tech.name} className="bg-atlas-bg rounded-lg p-3">
              <div className="font-data text-sm font-semibold text-atlas-text-primary">
                {tech.name}
              </div>
              <div className="text-xs text-atlas-text-muted">{tech.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Source */}
      <section className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-atlas-text-primary mb-4">
          데이터 출처 & 분석 프레임워크
        </h2>
        <p className="text-sm text-atlas-text-secondary leading-relaxed mb-3">
          7대 매크로 투자자의 프레임워크를 분석하여 38개 핵심 매크로 변수와 67개
          인과관계를 도출했습니다:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            "스탠리 드러켄밀러 — 유동성 중심론",
            "시타델/켄 그리핀 — 멀티스트랫 퀀트",
            "빌 애크먼 — 집중투자 + 매크로 헷지",
            "하워드 막스 — 신용사이클론",
            "성상현 — 한국 매크로 전문",
            "VIP 자산운용/최준철 — 한국 가치투자",
            "르네상스 테크놀로지 — 통계적 접근법",
          ].map((investor) => (
            <div key={investor} className="flex items-center gap-2 text-atlas-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-atlas-gold flex-shrink-0" />
              {investor}
            </div>
          ))}
        </div>
      </section>

      {/* Author */}
      <section className="bg-gradient-to-r from-atlas-panel to-atlas-panel-light border border-atlas-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-atlas-gold/20 flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-atlas-gold" />
          </div>
          <div>
            <h3 className="font-bold text-atlas-text-primary">이찬희</h3>
            <p className="text-sm text-atlas-text-secondary">
              총괄 개발자 & 저작권자 · CUFA 투자연구회
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://github.com/pollmap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-atlas-link hover:underline"
              >
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="font-data text-2xl font-bold text-atlas-macro">
              {stats.macroNodes}+
            </div>
            <div className="text-xs text-atlas-text-muted">매크로 변수</div>
          </div>
          <div>
            <div className="font-data text-2xl font-bold text-atlas-gold">
              {stats.totalEdges}+
            </div>
            <div className="text-xs text-atlas-text-muted">인과 연결</div>
          </div>
          <div>
            <div className="font-data text-2xl font-bold text-atlas-sector">
              {stats.themeCount}
            </div>
            <div className="text-xs text-atlas-text-muted">테마</div>
          </div>
          <div>
            <div className="font-data text-2xl font-bold text-atlas-company">
              {stats.companyCount}+
            </div>
            <div className="text-xs text-atlas-text-muted">기업</div>
          </div>
        </div>
      </div>
    </div>
  );
}
