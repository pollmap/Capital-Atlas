import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Network,
} from "lucide-react";
import {
  getMacroNodeById,
  getMacroNodes,
  getEdgesForNode,
} from "@/lib/data";
import { NodeBadge } from "@/components/common/NodeBadge";
import { EdgeIndicator } from "@/components/common/EdgeIndicator";

export function generateStaticParams() {
  return getMacroNodes().map((node) => ({ nodeId: node.id }));
}

export default function MacroDetailPage({
  params,
}: {
  params: { nodeId: string };
}) {
  const node = getMacroNodeById(params.nodeId);
  if (!node) return notFound();

  const edges = getEdgesForNode(node.id);
  const outgoing = edges.filter((e) => e.source === node.id);
  const incoming = edges.filter((e) => e.target === node.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-atlas-text-muted mb-6">
        <Link href="/macro" className="hover:text-atlas-link">
          매크로
        </Link>
        <ArrowRight size={12} />
        <span className="text-atlas-text-primary">{node.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <NodeBadge type="macro" />
            <span className="text-xs px-2 py-0.5 rounded bg-atlas-panel-light text-atlas-text-muted">
              {node.region}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-atlas-text-primary">
            {node.name}
          </h1>
          <p className="text-sm text-atlas-text-muted mt-1">{node.nameEn}</p>
        </div>
        <Link
          href={`/graph?focus=${node.id}`}
          className="flex items-center gap-1 px-3 py-2 bg-atlas-panel-light rounded-lg text-sm text-atlas-text-secondary hover:text-atlas-macro transition-colors"
        >
          <Network size={16} />
          그래프에서 보기
        </Link>
      </div>

      {/* Value Card */}
      {node.currentValue && (
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-atlas-text-muted mb-1">현재 수치</div>
              <div className="font-data text-4xl font-bold text-atlas-text-primary">
                {node.currentValue}
              </div>
            </div>
            {node.change && (
              <div
                className={`flex items-center gap-1 font-data text-lg ${
                  node.changeDirection === "up"
                    ? "text-atlas-up"
                    : node.changeDirection === "down"
                    ? "text-atlas-down"
                    : "text-atlas-text-muted"
                }`}
              >
                {node.changeDirection === "up" ? (
                  <TrendingUp size={20} />
                ) : node.changeDirection === "down" ? (
                  <TrendingDown size={20} />
                ) : (
                  <Minus size={20} />
                )}
                {node.change}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-atlas-text-muted">
            {node.dataSource && <span>출처: {node.dataSource}</span>}
            {node.unit && <span>단위: {node.unit}</span>}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
          설명
        </h2>
        <p className="text-atlas-text-secondary leading-relaxed">
          {node.description}
        </p>
        {node.trackedBy && node.trackedBy.length > 0 && (
          <div className="mt-4 pt-4 border-t border-atlas-border">
            <span className="text-xs text-atlas-text-muted">추적 투자자: </span>
            <span className="text-xs text-atlas-gold">
              {node.trackedBy.join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Causal Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {outgoing.length > 0 && (
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
              이 변수가 영향을 미치는 변수 ({outgoing.length})
            </h2>
            <div className="space-y-2">
              {outgoing.map((edge) => (
                <EdgeIndicator key={edge.id} edge={edge} showMechanism />
              ))}
            </div>
          </div>
        )}

        {incoming.length > 0 && (
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-atlas-text-muted uppercase tracking-wider mb-3">
              이 변수에 영향을 미치는 변수 ({incoming.length})
            </h2>
            <div className="space-y-2">
              {incoming.map((edge) => (
                <EdgeIndicator key={edge.id} edge={edge} showMechanism />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-atlas-panel text-atlas-text-muted border border-atlas-border"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
