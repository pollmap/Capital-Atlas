"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMacroData } from "@/hooks/useMarketData";
import type { MacroNode } from "@/types";

interface LiveMacroValueProps {
  node: MacroNode;
}

export function LiveMacroValue({ node }: LiveMacroValueProps) {
  const { data: liveData, loading } = useMacroData(node.id);

  const displayValue = liveData?.value || node.currentValue;
  const displayChange = liveData?.change || node.change;
  const displayDirection = (liveData?.direction || node.changeDirection) as
    | "up"
    | "down"
    | "neutral";
  const isLive =
    liveData?.source !== "static" && liveData?.source !== undefined;

  return (
    <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-atlas-text-muted mb-1">
            <span>현재 수치</span>
            {isLive && (
              <span className="flex items-center gap-1 text-[10px] text-atlas-up">
                <span className="w-1.5 h-1.5 rounded-full bg-atlas-up animate-pulse" />
                LIVE
              </span>
            )}
            {loading && (
              <span className="text-[10px] text-atlas-text-muted animate-pulse">
                갱신 중...
              </span>
            )}
          </div>
          <div
            className={`font-data text-4xl font-bold text-atlas-text-primary ${
              loading ? "animate-pulse" : ""
            }`}
          >
            {displayValue}
          </div>
        </div>
        {displayChange && (
          <div
            className={`flex items-center gap-1 font-data text-lg ${
              displayDirection === "up"
                ? "text-atlas-up"
                : displayDirection === "down"
                ? "text-atlas-down"
                : "text-atlas-text-muted"
            }`}
          >
            {displayDirection === "up" ? (
              <TrendingUp size={20} />
            ) : displayDirection === "down" ? (
              <TrendingDown size={20} />
            ) : (
              <Minus size={20} />
            )}
            {displayChange}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-atlas-text-muted">
        {node.dataSource && <span>출처: {node.dataSource}</span>}
        {node.unit && <span>단위: {node.unit}</span>}
        {liveData?.date && <span>기준일: {liveData.date}</span>}
      </div>
    </div>
  );
}
