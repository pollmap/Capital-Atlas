"use client";

import dynamic from "next/dynamic";
import type { CompanyNode } from "@/types";

const SectorRadarChart = dynamic(
  () => import("@/components/charts/SectorRadarChart").then((m) => m.SectorRadarChart),
  { ssr: false, loading: () => <ChartLoading /> }
);

const SectorBarChart = dynamic(
  () => import("@/components/charts/SectorBarChart").then((m) => m.SectorBarChart),
  { ssr: false, loading: () => <ChartLoading /> }
);

function ChartLoading() {
  return (
    <div className="w-full h-48 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-atlas-sector border-t-transparent animate-spin" />
    </div>
  );
}

export function SectorChartsSection({ companies }: { companies: CompanyNode[] }) {
  if (companies.length < 2) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">종합 비교 (레이더 차트)</h3>
        <SectorRadarChart companies={companies} />
      </div>
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 space-y-6">
        <SectorBarChart companies={companies} metric="roe" label="ROE (%)" unit="%" />
        <SectorBarChart companies={companies} metric="per" label="PER (x)" unit="x" />
      </div>
    </div>
  );
}
