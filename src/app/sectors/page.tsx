import Link from "next/link";
import { BarChart3, ArrowRight, Building2 } from "lucide-react";
import { getSectorNodes, getCompanyById } from "@/lib/data";

export default function SectorsPage() {
  const sectors = getSectorNodes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <BarChart3 size={24} className="text-atlas-company" />
          섹터 비교
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          {sectors.length}개 섹터 — 동일 섹터 내 기업 비교 분석
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sectors.map((sector) => {
          const companies = sector.companyIds
            .map((id) => getCompanyById(id))
            .filter(Boolean);

          return (
            <Link key={sector.id} href={`/sectors/${sector.id}`}>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 hover:border-atlas-company/50 transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-atlas-text-primary group-hover:text-atlas-company transition-colors">
                      {sector.name}
                    </h2>
                    <p className="text-xs text-atlas-text-muted mt-0.5">
                      {sector.nameEn}
                    </p>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-atlas-text-muted group-hover:text-atlas-company transition-colors"
                  />
                </div>

                <p className="text-sm text-atlas-text-secondary mb-4">
                  {sector.description}
                </p>

                <div className="space-y-2">
                  {companies.map((company) =>
                    company ? (
                      <div
                        key={company.id}
                        className="flex items-center justify-between bg-atlas-bg rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Building2
                            size={14}
                            className="text-atlas-company"
                          />
                          <span className="text-sm text-atlas-text-primary">
                            {company.name}
                          </span>
                          <span className="text-xs font-data text-atlas-text-muted">
                            {company.ticker}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-data">
                          <span className="text-atlas-text-muted">
                            PER {company.financials.per}x
                          </span>
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
                    ) : null
                  )}
                </div>

                <div className="mt-3 text-xs text-atlas-text-muted font-data">
                  {companies.length} 기업
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
