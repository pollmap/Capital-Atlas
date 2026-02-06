"use client";

import { Download } from "lucide-react";
import { exportToPdf, buildCompanyExportData } from "@/lib/export";

interface CompanyExportProps {
  company: {
    name: string;
    nameEn: string;
    ticker: string;
    market: string;
    sectorName: string;
    description: string;
    financials: {
      marketCap: number;
      per: number;
      pbr: number;
      roe: number;
      operatingMargin: number;
      debtRatio: number;
      dividendYield: number;
      return52w: number;
    };
    valuation?: {
      dcfTarget?: number;
      rimTarget?: number;
      currentPrice: number;
      gap?: string;
      thesis?: string;
    };
    themes: string[];
  };
}

export function CompanyExportButton({ company }: CompanyExportProps) {
  return (
    <button
      onClick={() => {
        const data = buildCompanyExportData(company);
        exportToPdf(data);
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-atlas-text-muted hover:text-atlas-gold hover:bg-atlas-gold/10 border border-atlas-border transition-colors"
    >
      <Download size={14} />
      PDF 내보내기
    </button>
  );
}
