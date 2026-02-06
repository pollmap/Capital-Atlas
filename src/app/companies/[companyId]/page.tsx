import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Layers, BarChart3 } from "lucide-react";
import {
  getCompanyNodes,
  getCompanyById,
  getSectorById,
  getThemeById,
  formatMarketCap,
} from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import { CompanyExportButton } from "./ExportButton";

export function generateStaticParams() {
  return getCompanyNodes().map((c) => ({ companyId: c.id }));
}

export default function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const company = getCompanyById(params.companyId);
  if (!company) return notFound();

  const sector = getSectorById(company.sectorId);
  const themes = company.themeIds
    .map((id) => getThemeById(id))
    .filter(Boolean);

  const financialMetrics = [
    { label: "시가총액", value: formatMarketCap(company.financials.marketCap) },
    { label: "PER", value: `${company.financials.per}x` },
    { label: "PBR", value: `${company.financials.pbr}x` },
    { label: "ROE", value: `${company.financials.roe}%` },
    { label: "영업이익률", value: `${company.financials.operatingMargin}%` },
    { label: "부채비율", value: `${company.financials.debtRatio}%` },
    { label: "배당수익률", value: `${company.financials.dividendYield}%` },
    {
      label: "52주 수익률",
      value: `${company.financials.return52w > 0 ? "+" : ""}${company.financials.return52w}%`,
      color:
        company.financials.return52w >= 0 ? "text-atlas-up" : "text-atlas-down",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-atlas-text-muted mb-6">
        <Link href="/sectors" className="hover:text-atlas-link">
          섹터
        </Link>
        <ArrowRight size={12} />
        {sector && (
          <>
            <Link
              href={`/sectors/${sector.id}`}
              className="hover:text-atlas-link"
            >
              {sector.name}
            </Link>
            <ArrowRight size={12} />
          </>
        )}
        <span className="text-atlas-text-primary">{company.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <NodeBadge type="company" />
            <span className="text-xs font-data px-2 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted">
              {company.ticker} · {company.market}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-atlas-text-primary">
            {company.name}
          </h1>
          <p className="text-sm text-atlas-text-muted mt-1">{company.nameEn}</p>
        </div>
        <CompanyExportButton
          company={{
            name: company.name,
            nameEn: company.nameEn,
            ticker: company.ticker,
            market: company.market,
            sectorName: sector?.name || "",
            description: company.description,
            financials: company.financials,
            valuation: company.valuation,
            themes: themes.map((t) => t?.name || "").filter(Boolean),
          }}
        />
      </div>

      {/* Role */}
      {company.role && (
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4 mb-6">
          <p className="text-atlas-text-secondary">{company.role}</p>
        </div>
      )}

      {/* Description */}
      <p className="text-atlas-text-secondary leading-relaxed mb-6">
        {company.description}
      </p>

      {/* Financials Grid */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 size={16} />
          재무 지표
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {financialMetrics.map((m) => (
            <div key={m.label} className="bg-atlas-bg rounded-lg p-3">
              <div className="text-xs text-atlas-text-muted mb-1">
                {m.label}
              </div>
              <div
                className={`font-data text-lg font-semibold ${
                  m.color || "text-atlas-text-primary"
                }`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation */}
      {company.valuation && (
        <div className="bg-atlas-panel border border-atlas-gold/20 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-atlas-gold uppercase tracking-wider mb-4">
            밸류에이션
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {company.valuation.dcfTarget && (
              <div className="bg-atlas-bg rounded-lg p-3">
                <div className="text-xs text-atlas-text-muted mb-1">
                  DCF 적정가
                </div>
                <div className="font-data text-lg font-semibold text-atlas-text-primary">
                  {company.valuation.dcfTarget.toLocaleString()}원
                </div>
              </div>
            )}
            {company.valuation.rimTarget && (
              <div className="bg-atlas-bg rounded-lg p-3">
                <div className="text-xs text-atlas-text-muted mb-1">
                  RIM 적정가
                </div>
                <div className="font-data text-lg font-semibold text-atlas-text-primary">
                  {company.valuation.rimTarget.toLocaleString()}원
                </div>
              </div>
            )}
            <div className="bg-atlas-bg rounded-lg p-3">
              <div className="text-xs text-atlas-text-muted mb-1">현재가</div>
              <div className="font-data text-lg font-semibold text-atlas-text-primary">
                {company.valuation.currentPrice.toLocaleString()}원
              </div>
            </div>
          </div>
          {company.valuation.gap && (
            <div className="bg-atlas-gold/10 rounded-lg p-3 mb-3">
              <div className="text-xs text-atlas-text-muted mb-1">괴리율</div>
              <div className="font-data text-xl font-bold text-atlas-gold">
                {company.valuation.gap}
              </div>
            </div>
          )}
          {company.valuation.thesis && (
            <p className="text-sm text-atlas-text-secondary leading-relaxed">
              {company.valuation.thesis}
            </p>
          )}
          <div className="text-xs text-atlas-text-muted mt-3">
            최종 업데이트: {company.valuation.lastUpdated}
          </div>
        </div>
      )}

      {/* Connected Themes */}
      {themes.length > 0 && (
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers size={16} className="text-atlas-sector" />
            관련 테마
          </h2>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) =>
              theme ? (
                <Link key={theme.id} href={`/themes/${theme.id}`}>
                  <div className="px-3 py-2 rounded-lg bg-atlas-sector/10 border border-atlas-sector/20 hover:border-atlas-sector/50 transition-colors cursor-pointer">
                    <span className="text-sm text-atlas-sector font-medium">
                      {theme.name}
                    </span>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {company.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {company.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-atlas-panel text-atlas-text-muted border border-atlas-border"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
