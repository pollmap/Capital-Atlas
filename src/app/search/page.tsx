"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, Network, Building2, Layers, BarChart3 } from "lucide-react";
import { getAllNodes, getNodeColor } from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import type { BaseNode, NodeType } from "@/types";

const typeIcons: Record<NodeType, typeof Network> = {
  macro: Network,
  sector: BarChart3,
  theme: Layers,
  company: Building2,
  report: Network,
};

const typeLinks: Record<NodeType, string> = {
  macro: "/macro",
  sector: "/sectors",
  theme: "/themes",
  company: "/companies",
  report: "/research",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<NodeType | "all">("all");

  const allNodes = getAllNodes();

  const fuse = useMemo(
    () =>
      new Fuse(allNodes, {
        keys: [
          { name: "name", weight: 0.4 },
          { name: "nameEn", weight: 0.3 },
          { name: "description", weight: 0.2 },
          { name: "tags", weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [allNodes]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      const filtered =
        filterType === "all"
          ? allNodes
          : allNodes.filter((n) => n.type === filterType);
      return filtered.slice(0, 30);
    }

    const fuseResults = fuse.search(query);
    const filtered =
      filterType === "all"
        ? fuseResults
        : fuseResults.filter((r) => r.item.type === filterType);

    return filtered.slice(0, 30).map((r) => r.item);
  }, [query, filterType, fuse, allNodes]);

  const getLink = (node: BaseNode) => {
    const base = typeLinks[node.type];
    return `${base}/${node.id}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Search size={24} className="text-atlas-gold" />
          통합 검색
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          매크로 변수, 테마, 섹터, 기업을 검색하세요
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-atlas-text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="금리, NVIDIA, 조선, 원전..."
          className="w-full pl-12 pr-4 py-3 bg-atlas-panel border border-atlas-border rounded-xl text-atlas-text-primary placeholder-atlas-text-muted focus:outline-none focus:border-atlas-gold/50 transition-colors"
          autoFocus
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(
          [
            { value: "all", label: "전체" },
            { value: "macro", label: "매크로" },
            { value: "sector", label: "섹터" },
            { value: "theme", label: "테마" },
            { value: "company", label: "기업" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterType === f.value
                ? "bg-atlas-gold/20 text-atlas-gold border border-atlas-gold/30"
                : "bg-atlas-panel text-atlas-text-secondary border border-atlas-border hover:border-atlas-text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-atlas-text-muted ml-2 font-data">
          {results.length} 결과
        </span>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map((node) => {
          const Icon = typeIcons[node.type] || Network;
          return (
            <Link key={`${node.type}-${node.id}`} href={getLink(node)}>
              <div className="bg-atlas-panel border border-atlas-border rounded-lg p-4 hover:border-atlas-gold/30 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${getNodeColor(node.type)}15`,
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: getNodeColor(node.type) }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-atlas-text-primary group-hover:text-atlas-gold transition-colors truncate">
                        {node.name}
                      </h3>
                      <NodeBadge type={node.type} size="sm" />
                    </div>
                    <p className="text-xs text-atlas-text-muted mb-1">
                      {node.nameEn}
                    </p>
                    <p className="text-sm text-atlas-text-secondary line-clamp-2">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {results.length === 0 && query && (
        <div className="text-center py-12">
          <Search size={48} className="text-atlas-text-muted mx-auto mb-4" />
          <p className="text-atlas-text-secondary">
            &ldquo;{query}&rdquo;에 대한 결과가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
