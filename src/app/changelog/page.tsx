import { GitBranch, Zap, Database, Wrench, BookOpen } from "lucide-react";

const changelog = [
  {
    version: "0.3.0",
    date: "2025-05",
    title: "Phase 3 — 리서치 아카이브 & 고급 도구",
    icon: BookOpen,
    color: "text-atlas-report",
    items: [
      "리서치 아카이브 모듈 추가 (/research)",
      "금융 용어 사전 (Glossary) 추가 (/glossary)",
      "Graham Number 계산기 추가",
      "S-RIM (잔여이익모델) 계산기 추가",
      "간단 스크리너 도구 추가",
      "Recharts 기반 레이더/바 차트 추가",
      "테마 확장 (바이오/헬스케어, 부동산/리츠, 우주/항공)",
      "섹터 확장 (바이오, 금융, IT 플랫폼, 부동산)",
    ],
  },
  {
    version: "0.2.0",
    date: "2025-04",
    title: "Phase 2 — 밸류에이션 도구 & 데이터 확장",
    icon: Wrench,
    color: "text-atlas-gold",
    items: [
      "DCF 계산기 추가 (/tools/dcf)",
      "WACC 계산기 추가 (/tools/wacc)",
      "매크로 노드 50개 이상으로 확장",
      "인과관계 엣지 52개로 확장",
      "기업 데이터 16개 기업 수록",
      "Vercel 빌드 오류 수정 (peer-deps)",
    ],
  },
  {
    version: "0.1.0",
    date: "2025-03",
    title: "Phase 1 — MVP 출시",
    icon: Zap,
    color: "text-atlas-up",
    items: [
      "3D 인과지도 그래프 엔진 (Three.js + R3F)",
      "매크로 대시보드 (/macro)",
      "테마 밸류체인 지도 (/themes) — 5개 테마",
      "섹터 비교 엔진 (/sectors) — 7개 섹터",
      "기업 상세 페이지 (/companies)",
      "Fuse.js 검색 엔진",
      "시나리오 분석 기능",
      "다크모드 디자인 시스템",
      "Vercel 정적 배포",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <GitBranch size={24} className="text-atlas-sector" />
          Changelog
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          Capital Atlas 개발 히스토리
        </p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-atlas-border" />

        <div className="space-y-8">
          {changelog.map((release) => {
            const Icon = release.icon;
            return (
              <div key={release.version} className="relative pl-16">
                {/* Timeline Dot */}
                <div className={`absolute left-4 top-1 w-5 h-5 rounded-full bg-atlas-panel border-2 border-atlas-border flex items-center justify-center`}>
                  <div className={`w-2 h-2 rounded-full ${release.color === "text-atlas-up" ? "bg-atlas-up" : release.color === "text-atlas-gold" ? "bg-atlas-gold" : "bg-atlas-report"}`} />
                </div>

                <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon size={18} className={release.color} />
                    <div>
                      <span className="font-data text-sm font-bold text-atlas-text-primary">
                        v{release.version}
                      </span>
                      <span className="text-xs text-atlas-text-muted ml-2">{release.date}</span>
                    </div>
                  </div>
                  <h2 className="text-base font-bold text-atlas-text-primary mb-3">
                    {release.title}
                  </h2>
                  <ul className="space-y-1.5">
                    {release.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-atlas-text-secondary">
                        <Database size={12} className="text-atlas-text-muted mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-atlas-text-muted">
        <p>총괄 개발자 및 저작권자: 이찬희</p>
        <p className="mt-1">CUFA 투자연구회</p>
      </div>
    </div>
  );
}
