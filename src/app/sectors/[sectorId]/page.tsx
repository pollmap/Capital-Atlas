import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSectorNodes, getSectorById, getCompanyById, formatMarketCap } from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";

export function generateStaticParams() {
  return getSectorNodes().map((s) => ({ sectorId: s.id }));
}

export default function SectorDetailPage({
  params,
}: {
  params: { sectorId: string };
}) {
  const sector = getSectorById(params.sectorId);
  if (!sector) return notFound();

  const companies = sector.companyIds
    .map((id) => getCompanyById(id))
    .filter(Boolean);

  const metrics = [
    { key: "per", label: "PER", unit: "x" },
    { key: "pbr", label: "PBR", unit: "x" },
    { key: "roe", label: "ROE", unit: "%" },
    { key: "operatingMargin", label: "영업이익률", unit: "%" },
    { key: "debtRatio", label: "부채비율", unit: "%" },
    { key: "dividendYield", label: "배당수익률", unit: "%" },
    { key: "return52w", label: "52주 수익률", unit: "%" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-atlas-text-muted mb-6">
        <Link href="/sectors" className="hover:text-atlas-link">
          섹터
        </Link>
        <ArrowRight size={12} />
        <span className="text-atlas-text-primary">{sector.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <NodeBadge type="sector" />
        <h1 className="text-3xl font-bold text-atlas-text-primary mt-2">
          {sector.name} 섹터 비교
        </h1>
        <p className="text-sm text-atlas-text-muted mt-1">
          {sector.nameEn} — {companies.length}개 기업
        </p>
        <p className="text-atlas-text-secondary mt-3">{sector.description}</p>
      </div>

      {/* Comparison Table */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-atlas-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-atlas-text-muted uppercase">
                  기업
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-atlas-text-muted uppercase">
                  시가총액
                </th>
                {metrics.map((m) => (
                  <th
                    key={m.key}
                    className="text-right px-4 py-3 text-xs font-semibold text-atlas-text-muted uppercase"
                  >
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) =>
                company ? (
                  <tr
                    key={company.id}
                    className="border-b border-atlas-border/50 hover:bg-atlas-panel-light transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${company.id}`}
                        className="hover:text-atlas-company transition-colors"
                      >
                        <div className="font-semibold text-sm text-atlas-text-primary">
                          {company.name}
                        </div>
                        <div className="text-xs text-atlas-text-muted font-data">
                          {company.ticker}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-data text-sm text-atlas-text-primary">
                      {formatMarketCap(company.financials.marketCap)}
                    </td>
                    {metrics.map((m) => {
                      const value = company.financials[m.key];
                      const isReturn = m.key === "return52w";
                      return (
                        <td
                          key={m.key}
                          className={`px-4 py-3 text-right font-data text-sm ${
                            isReturn
                              ? value >= 0
                                ? "text-atlas-up"
                                : "text-atlas-down"
                              : "text-atlas-text-primary"
                          }`}
                        >
                          {isReturn && value > 0 ? "+" : ""}
                          {value}
                          {m.unit}
                        </td>
                      );
                    })}
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {companies.map((company) =>
          company ? (
            <Link key={company.id} href={`/companies/${company.id}`}>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 hover:border-atlas-company/50 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-atlas-text-primary group-hover:text-atlas-company transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-atlas-text-muted">
                      {company.ticker} · {company.market}
                    </p>
                  </div>
                  <span
                    className={`font-data text-sm font-semibold ${
                      company.financials.return52w >= 0
                        ? "text-atlas-up"
                        : "text-atlas-down"
                    }`}
                  >
                    {company.financials.return52w > 0 ? "+" : ""}
                    {company.financials.return52w}%
                  </span>
                </div>
                {company.role && (
                  <p className="text-xs text-atlas-text-secondary mb-3">
                    {company.role}
                  </p>
                )}
                {company.valuation && (
                  <div className="bg-atlas-bg rounded-lg p-3 border border-atlas-border">
                    <div className="text-xs text-atlas-text-muted mb-1">
                      적정가치 괴리율
                    </div>
                    <div className="font-data text-sm text-atlas-gold font-semibold">
                      {company.valuation.gap}
                    </div>
                    <p className="text-xs text-atlas-text-muted mt-1">
                      {company.valuation.thesis}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}
