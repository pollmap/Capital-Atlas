import { TrendingUp } from "lucide-react";
import { getMacroNodes } from "@/lib/data";
import { MacroCard } from "@/components/common/MacroCard";
import type { MacroCategory } from "@/types";

const categoryLabels: Record<MacroCategory, string> = {
  monetary_policy: "통화정책",
  currency: "환율",
  bond: "채권·금리",
  commodity: "원자재",
  indicator: "거시지표",
  flow: "자금흐름·심리",
  index: "시장지수",
};

const categoryOrder: MacroCategory[] = [
  "monetary_policy",
  "bond",
  "currency",
  "commodity",
  "indicator",
  "flow",
  "index",
];

export default function MacroPage() {
  const macroNodes = getMacroNodes();

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    label: categoryLabels[cat],
    nodes: macroNodes.filter((n) => n.category === cat),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <TrendingUp size={24} className="text-atlas-macro" />
          매크로 대시보드
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          {macroNodes.length}개 매크로 변수 — 7대 투자자 프레임워크 기반
        </p>
      </div>

      <div className="space-y-8">
        {grouped.map(
          ({ category, label, nodes }) =>
            nodes.length > 0 && (
              <section key={category}>
                <h2 className="text-lg font-semibold text-atlas-text-primary mb-3 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#06B6D4" }}
                  />
                  {label}
                  <span className="text-xs font-data text-atlas-text-muted">
                    ({nodes.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {nodes.map((node) => (
                    <MacroCard key={node.id} node={node} />
                  ))}
                </div>
              </section>
            )
        )}
      </div>
    </div>
  );
}
