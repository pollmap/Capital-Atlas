"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CompanyNode } from "@/types";

interface SectorBarChartProps {
  companies: CompanyNode[];
  metric: "per" | "pbr" | "roe" | "operatingMargin" | "dividendYield" | "return52w";
  label: string;
  unit?: string;
}

const COLORS = ["#06B6D4", "#8B5CF6", "#34D399", "#FB923C", "#EF4444", "#F59E0B"];

export function SectorBarChart({ companies, metric, label, unit = "" }: SectorBarChartProps) {
  if (companies.length === 0) return null;

  const data = companies.map((c) => ({
    name: c.name,
    value: c.financials[metric],
  }));

  return (
    <div>
      <h4 className="text-xs font-semibold text-atlas-text-muted mb-2">{label}</h4>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#D1D5DB", fontSize: 11 }}
              width={100}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}${unit}`, label]}
              labelStyle={{ color: "#F9FAFB" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
