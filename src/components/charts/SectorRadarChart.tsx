"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CompanyNode } from "@/types";

interface SectorRadarChartProps {
  companies: CompanyNode[];
}

const COLORS = ["#06B6D4", "#8B5CF6", "#34D399", "#FB923C", "#EF4444", "#F59E0B"];

function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function SectorRadarChart({ companies }: SectorRadarChartProps) {
  if (companies.length === 0) return null;

  const metrics = [
    { key: "roe", label: "ROE", higher: true },
    { key: "operatingMargin", label: "영업이익률", higher: true },
    { key: "dividendYield", label: "배당률", higher: true },
    { key: "per_inv", label: "PER(역)", higher: true },
    { key: "pbr_inv", label: "PBR(역)", higher: true },
    { key: "return52w", label: "52주수익률", higher: true },
  ] as const;

  const ranges = {
    roe: { min: Math.min(...companies.map((c) => c.financials.roe)), max: Math.max(...companies.map((c) => c.financials.roe)) },
    operatingMargin: { min: Math.min(...companies.map((c) => c.financials.operatingMargin)), max: Math.max(...companies.map((c) => c.financials.operatingMargin)) },
    dividendYield: { min: Math.min(...companies.map((c) => c.financials.dividendYield)), max: Math.max(...companies.map((c) => c.financials.dividendYield)) },
    per_inv: { min: Math.min(...companies.map((c) => c.financials.per > 0 ? 1 / c.financials.per : 0)), max: Math.max(...companies.map((c) => c.financials.per > 0 ? 1 / c.financials.per : 0)) },
    pbr_inv: { min: Math.min(...companies.map((c) => 1 / c.financials.pbr)), max: Math.max(...companies.map((c) => 1 / c.financials.pbr)) },
    return52w: { min: Math.min(...companies.map((c) => c.financials.return52w)), max: Math.max(...companies.map((c) => c.financials.return52w)) },
  };

  const data = metrics.map((metric) => {
    const point: Record<string, string | number> = { metric: metric.label };
    companies.forEach((company) => {
      let value: number;
      switch (metric.key) {
        case "roe": value = company.financials.roe; break;
        case "operatingMargin": value = company.financials.operatingMargin; break;
        case "dividendYield": value = company.financials.dividendYield; break;
        case "per_inv": value = company.financials.per > 0 ? 1 / company.financials.per : 0; break;
        case "pbr_inv": value = 1 / company.financials.pbr; break;
        case "return52w": value = company.financials.return52w; break;
        default: value = 0;
      }
      const range = ranges[metric.key];
      point[company.id] = normalizeValue(value, range.min, range.max);
    });
    return point;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          {companies.map((company, i) => (
            <Radar
              key={company.id}
              name={company.name}
              dataKey={company.id}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#F9FAFB" }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {companies.map((company, i) => (
          <span key={company.id} className="flex items-center gap-1 text-xs text-atlas-text-secondary">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {company.name}
          </span>
        ))}
      </div>
    </div>
  );
}
