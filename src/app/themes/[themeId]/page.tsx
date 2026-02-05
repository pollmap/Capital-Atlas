import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Network, Building2 } from "lucide-react";
import { getThemeNodes, getThemeById, getCompanyById, getMacroNodeById } from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import { formatMarketCap } from "@/lib/data";

export function generateStaticParams() {
  return getThemeNodes().map((t) => ({ themeId: t.id }));
}

export default function ThemeDetailPage({
  params,
}: {
  params: { themeId: string };
}) {
  const theme = getThemeById(params.themeId);
  if (!theme) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-atlas-text-muted mb-6">
        <Link href="/themes" className="hover:text-atlas-link">
          테마
        </Link>
        <ArrowRight size={12} />
        <span className="text-atlas-text-primary">{theme.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <NodeBadge type="theme" />
        </div>
        <h1 className="text-3xl font-bold text-atlas-text-primary">
          {theme.name}
        </h1>
        <p className="text-sm text-atlas-text-muted mt-1">{theme.nameEn}</p>
        <p className="text-atlas-text-secondary mt-3 leading-relaxed">
          {theme.description}
        </p>
      </div>

      {/* Value Chain Flow (horizontal) */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-4">
          밸류체인 흐름
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {theme.tiers.map((tier, i) => (
            <div key={tier.tier} className="flex items-center gap-2">
              <div className="bg-atlas-sector/10 border border-atlas-sector/20 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-atlas-text-muted mb-0.5">
                  Tier {tier.tier}
                </div>
                <div className="text-sm font-semibold text-atlas-sector">
                  {tier.name}
                </div>
                <div className="text-xs text-atlas-text-muted mt-0.5">
                  {tier.nodes.length}개 기업
                </div>
              </div>
              {i < theme.tiers.length - 1 && (
                <ArrowRight size={16} className="text-atlas-text-muted flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tiers Detail */}
      <div className="space-y-6 mb-8">
        {theme.tiers.map((tier) => (
          <div
            key={tier.tier}
            className="bg-atlas-panel border border-atlas-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-lg bg-atlas-sector/10 flex items-center justify-center text-sm font-bold text-atlas-sector">
                {tier.tier}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-atlas-text-primary">
                  {tier.name}
                </h3>
                <p className="text-xs text-atlas-text-muted">{tier.nameEn}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tier.nodes.map((companyId) => {
                const company = getCompanyById(companyId);
                if (!company) {
                  return (
                    <div
                      key={companyId}
                      className="bg-atlas-bg rounded-lg p-3 border border-atlas-border"
                    >
                      <span className="text-sm text-atlas-text-muted">
                        {companyId}
                      </span>
                    </div>
                  );
                }

                return (
                  <Link key={company.id} href={`/companies/${company.id}`}>
                    <div className="bg-atlas-bg rounded-lg p-4 border border-atlas-border hover:border-atlas-company/50 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-atlas-text-primary group-hover:text-atlas-company transition-colors">
                            {company.name}
                          </h4>
                          <p className="text-xs text-atlas-text-muted">
                            {company.ticker} · {company.market}
                          </p>
                        </div>
                        <Building2
                          size={16}
                          className="text-atlas-text-muted group-hover:text-atlas-company"
                        />
                      </div>
                      {company.role && (
                        <p className="text-xs text-atlas-text-secondary mb-2">
                          {company.role}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-data">
                        <div className="flex justify-between">
                          <span className="text-atlas-text-muted">시총</span>
                          <span className="text-atlas-text-primary">
                            {formatMarketCap(company.financials.marketCap)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-atlas-text-muted">PER</span>
                          <span className="text-atlas-text-primary">
                            {company.financials.per}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-atlas-text-muted">ROE</span>
                          <span className="text-atlas-text-primary">
                            {company.financials.roe}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-atlas-text-muted">52W</span>
                          <span
                            className={
                              company.financials.return52w >= 0
                                ? "text-atlas-up"
                                : "text-atlas-down"
                            }
                          >
                            {company.financials.return52w > 0 ? "+" : ""}
                            {company.financials.return52w}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Connected Macro Nodes */}
      {theme.connectedMacroNodes.length > 0 && (
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Network size={16} className="text-atlas-macro" />
            연결된 매크로 변수
          </h2>
          <div className="flex flex-wrap gap-2">
            {theme.connectedMacroNodes.map((macroId) => {
              const macroNode = getMacroNodeById(macroId);
              return (
                <Link key={macroId} href={`/macro/${macroId}`}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-atlas-macro/10 border border-atlas-macro/20 hover:border-atlas-macro/50 transition-colors cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-atlas-macro" />
                    <span className="text-sm text-atlas-macro font-medium">
                      {macroNode?.name || macroId}
                    </span>
                    {macroNode?.currentValue && (
                      <span className="font-data text-xs text-atlas-text-muted">
                        {macroNode.currentValue}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
