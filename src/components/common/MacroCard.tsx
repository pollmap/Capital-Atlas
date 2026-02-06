"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { MacroNode } from "@/types";
import { useMacroData } from "@/hooks/useMarketData";

interface MacroCardProps {
  node: MacroNode;
  compact?: boolean;
}

export function MacroCard({ node, compact = false }: MacroCardProps) {
  const { data: liveData, loading } = useMacroData(node.id);

  const displayValue = liveData?.value || node.currentValue;
  const displayChange = liveData?.change || node.change;
  const displayDirection = (liveData?.direction || node.changeDirection) as
    | "up"
    | "down"
    | "neutral";
  const isLive = liveData?.source !== "static" && liveData?.source !== undefined;

  const directionIcon =
    displayDirection === "up" ? (
      <ArrowUp size={compact ? 12 : 14} className="text-atlas-up" />
    ) : displayDirection === "down" ? (
      <ArrowDown size={compact ? 12 : 14} className="text-atlas-down" />
    ) : (
      <Minus size={compact ? 12 : 14} className="text-atlas-text-muted" />
    );

  const changeColor =
    displayDirection === "up"
      ? "text-atlas-up"
      : displayDirection === "down"
      ? "text-atlas-down"
      : "text-atlas-text-muted";

  if (compact) {
    return (
      <Link href={`/macro/${node.id}`}>
        <div className="bg-atlas-panel border border-atlas-border rounded-lg p-3 hover:border-atlas-macro/50 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-atlas-text-muted truncate">
              {node.name}
            </span>
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-atlas-up flex-shrink-0 animate-pulse" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className={`font-data text-sm font-semibold text-atlas-text-primary ${loading ? "animate-pulse" : ""}`}>
              {displayValue}
            </span>
            <span className={`flex items-center gap-0.5 font-data text-xs ${changeColor}`}>
              {directionIcon}
              {displayChange}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/macro/${node.id}`}>
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4 hover:border-atlas-macro/50 hover:glow-macro transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-atlas-text-primary group-hover:text-atlas-macro transition-colors">
              {node.name}
            </h3>
            <p className="text-xs text-atlas-text-muted">{node.nameEn}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-atlas-up animate-pulse" title="Live data" />
            )}
            <span className="text-xs px-2 py-0.5 rounded bg-atlas-macro/10 text-atlas-macro">
              {node.region}
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <span className={`font-data text-xl font-bold text-atlas-text-primary ${loading ? "animate-pulse" : ""}`}>
            {displayValue}
          </span>
          <span className={`flex items-center gap-1 font-data text-sm ${changeColor}`}>
            {directionIcon}
            {displayChange}
          </span>
        </div>
      </div>
    </Link>
  );
}
