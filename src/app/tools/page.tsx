import Link from "next/link";
import { Calculator, TrendingUp, Percent, DollarSign, BarChart3, Grid3X3 } from "lucide-react";

const tools = [
  {
    id: "dcf",
    name: "DCF 계산기",
    nameEn: "Discounted Cash Flow",
    description: "미래 현금흐름을 현재가치로 할인하여 기업의 내재가치를 산출합니다",
    icon: DollarSign,
    color: "text-atlas-up",
    bgColor: "bg-atlas-up/10",
  },
  {
    id: "wacc",
    name: "WACC 계산기",
    nameEn: "Weighted Average Cost of Capital",
    description: "자기자본비용과 타인자본비용을 가중평균하여 할인율을 산출합니다",
    icon: Percent,
    color: "text-atlas-macro",
    bgColor: "bg-atlas-macro/10",
  },
  {
    id: "graham",
    name: "Graham Number",
    nameEn: "Benjamin Graham's Intrinsic Value",
    description: "벤저민 그레이엄의 공식으로 보수적 내재가치를 산출합니다",
    icon: Calculator,
    color: "text-atlas-gold",
    bgColor: "bg-atlas-gold/10",
  },
  {
    id: "rim",
    name: "S-RIM 계산기",
    nameEn: "Residual Income Model",
    description: "잔여이익모델로 ROE 기반 적정 주가를 산출합니다",
    icon: TrendingUp,
    color: "text-atlas-sector",
    bgColor: "bg-atlas-sector/10",
  },
  {
    id: "screener",
    name: "간단 스크리너",
    nameEn: "Quick Screener",
    description: "PER, PBR, ROE 등 조건으로 기업을 필터링합니다",
    icon: BarChart3,
    color: "text-atlas-company",
    bgColor: "bg-atlas-company/10",
  },
  {
    id: "heatmap",
    name: "상관관계 히트맵",
    nameEn: "Correlation Heatmap",
    description: "매크로 변수 간 인과적 상관관계를 히트맵으로 시각화합니다",
    icon: Grid3X3,
    color: "text-atlas-report",
    bgColor: "bg-atlas-report/10",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Calculator size={24} className="text-atlas-gold" />
          밸류에이션 도구
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          Value Alpha에서 포팅한 밸류에이션 계산기 — DCF, WACC, Graham, S-RIM
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={`/tools/${tool.id}`}>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 hover:border-atlas-gold/30 transition-all group cursor-pointer h-full">
                <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4`}>
                  <Icon size={24} className={tool.color} />
                </div>
                <h2 className="text-lg font-bold text-atlas-text-primary group-hover:text-atlas-gold transition-colors">
                  {tool.name}
                </h2>
                <p className="text-xs text-atlas-text-muted mt-0.5 font-data">
                  {tool.nameEn}
                </p>
                <p className="text-sm text-atlas-text-secondary mt-3 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
