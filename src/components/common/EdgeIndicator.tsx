"use client";

import { ArrowRight, TrendingUp, TrendingDown, Shuffle } from "lucide-react";
import type { Edge } from "@/types";
import { getNodeById } from "@/lib/data";

interface EdgeIndicatorProps {
  edge: Edge;
  showMechanism?: boolean;
}

export function EdgeIndicator({ edge, showMechanism = false }: EdgeIndicatorProps) {
  const sourceNode = getNodeById(edge.source);
  const targetNode = getNodeById(edge.target);

  const directionIcon =
    edge.direction === "positive" ? (
      <TrendingUp size={14} className="text-atlas-up" />
    ) : edge.direction === "negative" ? (
      <TrendingDown size={14} className="text-atlas-down" />
    ) : (
      <Shuffle size={14} className="text-atlas-accent" />
    );

  const strengthDots =
    edge.strength === "strong" ? 3 : edge.strength === "medium" ? 2 : 1;

  return (
    <div className="bg-atlas-panel border border-atlas-border rounded-lg p-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-atlas-macro font-medium truncate">
          {sourceNode?.name || edge.source}
        </span>
        <ArrowRight size={14} className="text-atlas-text-muted flex-shrink-0" />
        {directionIcon}
        <ArrowRight size={14} className="text-atlas-text-muted flex-shrink-0" />
        <span className="text-atlas-company font-medium truncate">
          {targetNode?.name || edge.target}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < strengthDots ? "bg-atlas-accent" : "bg-atlas-border"
              }`}
            />
          ))}
          <span className="text-xs text-atlas-text-muted ml-1">
            {edge.strength}
          </span>
        </div>
        {edge.timeLag && (
          <span className="text-xs text-atlas-text-muted">
            {edge.timeLag}
          </span>
        )}
      </div>

      {showMechanism && edge.mechanism && (
        <p className="text-xs text-atlas-text-secondary mt-2 leading-relaxed">
          {edge.mechanism}
        </p>
      )}
    </div>
  );
}
