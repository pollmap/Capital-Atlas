"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useCompanyPrice } from "@/hooks/useMarketData";

interface LiveCompanyPriceProps {
  companyId: string;
  staticPrice?: number;
  currency?: string;
}

export function LiveCompanyPrice({
  companyId,
  staticPrice,
  currency = "KRW",
}: LiveCompanyPriceProps) {
  const { data, loading } = useCompanyPrice(companyId);

  const price = data?.price || staticPrice;
  const change = data?.change;
  const changePercent = data?.changePercent;
  const isLive = data?.source === "yahoo";
  const marketState = data?.marketState;

  if (!price && !loading) return null;

  const formatPrice = (p: number) => {
    if (currency === "USD" || data?.currency === "USD") {
      return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${p.toLocaleString("ko-KR")}원`;
  };

  return (
    <div className="bg-atlas-panel border border-atlas-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-atlas-text-muted">현재가</span>
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] text-atlas-up">
            <span className="w-1.5 h-1.5 rounded-full bg-atlas-up animate-pulse" />
            {marketState === "REGULAR" ? "장중" : "장마감"}
          </span>
        )}
        {loading && (
          <span className="text-[10px] text-atlas-text-muted animate-pulse">
            갱신 중...
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <span
          className={`font-data text-2xl font-bold text-atlas-text-primary ${
            loading ? "animate-pulse" : ""
          }`}
        >
          {price ? formatPrice(price) : "—"}
        </span>
        {change !== null && change !== undefined && (
          <div
            className={`flex items-center gap-1 font-data text-sm ${
              change > 0
                ? "text-atlas-up"
                : change < 0
                ? "text-atlas-down"
                : "text-atlas-text-muted"
            }`}
          >
            {change > 0 ? (
              <ArrowUp size={14} />
            ) : change < 0 ? (
              <ArrowDown size={14} />
            ) : (
              <Minus size={14} />
            )}
            {change > 0 ? "+" : ""}
            {changePercent?.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  );
}
