"use client";

import type { NodeType } from "@/types";
import { getNodeColor } from "@/lib/data";

interface NodeBadgeProps {
  type: NodeType;
  label?: string;
  size?: "sm" | "md";
}

const typeLabels: Record<NodeType, string> = {
  macro: "매크로",
  sector: "섹터",
  theme: "테마",
  company: "기업",
};

export function NodeBadge({ type, label, size = "sm" }: NodeBadgeProps) {
  const color = getNodeColor(type);
  const displayLabel = label || typeLabels[type];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      }`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className={`rounded-full mr-1.5 ${
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        }`}
        style={{ backgroundColor: color }}
      />
      {displayLabel}
    </span>
  );
}
