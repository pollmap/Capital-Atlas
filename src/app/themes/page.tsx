import Link from "next/link";
import { Layers, ArrowRight, Network } from "lucide-react";
import { getThemeNodes } from "@/lib/data";

export default function ThemesPage() {
  const themes = getThemeNodes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Layers size={24} className="text-atlas-sector" />
          테마 밸류체인
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          {themes.length}개 테마 — 상류부터 하류까지 산업 구조를 탐색하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const totalCompanies = theme.tiers.reduce(
            (acc, tier) => acc + tier.nodes.length,
            0
          );

          return (
            <Link key={theme.id} href={`/themes/${theme.id}`}>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 hover:border-atlas-sector/50 transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-atlas-text-primary group-hover:text-atlas-sector transition-colors">
                      {theme.name}
                    </h2>
                    <p className="text-xs text-atlas-text-muted mt-0.5">
                      {theme.nameEn}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-atlas-text-muted group-hover:text-atlas-sector transition-colors mt-1"
                  />
                </div>

                <p className="text-sm text-atlas-text-secondary leading-relaxed mb-4">
                  {theme.description}
                </p>

                {/* Value Chain Flow */}
                <div className="flex items-center gap-1 flex-wrap mb-4">
                  {theme.tiers.map((tier, i) => (
                    <div key={tier.tier} className="flex items-center gap-1">
                      <span className="text-xs px-2 py-1 rounded bg-atlas-sector/10 text-atlas-sector font-medium">
                        {tier.name}
                      </span>
                      {i < theme.tiers.length - 1 && (
                        <ArrowRight
                          size={12}
                          className="text-atlas-text-muted"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-atlas-text-muted">
                  <span className="font-data">
                    {theme.tiers.length} Tiers
                  </span>
                  <span className="font-data">
                    {totalCompanies} 기업
                  </span>
                  {theme.connectedMacroNodes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Network size={12} className="text-atlas-macro" />
                      {theme.connectedMacroNodes.length} 매크로 연결
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
