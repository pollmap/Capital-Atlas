"use client";

import { useState, useMemo } from "react";
import { Calculator, Info } from "lucide-react";

interface GrahamInputs {
  eps: number;
  bps: number;
  currentPrice: number;
}

const defaultInputs: GrahamInputs = {
  eps: 5000,
  bps: 40000,
  currentPrice: 50000,
};

export default function GrahamPage() {
  const [inputs, setInputs] = useState<GrahamInputs>(defaultInputs);

  const update = (key: keyof GrahamInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    const { eps, bps, currentPrice } = inputs;
    if (eps <= 0 || bps <= 0) return null;

    const grahamNumber = Math.sqrt(22.5 * eps * bps);
    const ncavPerShare = bps * 0.67;
    const margin = ((grahamNumber - currentPrice) / currentPrice) * 100;

    const defensiveValue = eps * 8.5;
    const growthValue15 = eps * (8.5 + 2 * 15);
    const growthValue10 = eps * (8.5 + 2 * 10);
    const growthValue5 = eps * (8.5 + 2 * 5);

    return {
      grahamNumber: Math.round(grahamNumber),
      ncavPerShare: Math.round(ncavPerShare),
      margin: margin.toFixed(1),
      isUndervalued: grahamNumber > currentPrice,
      defensiveValue: Math.round(defensiveValue),
      growthValue5: Math.round(growthValue5),
      growthValue10: Math.round(growthValue10),
      growthValue15: Math.round(growthValue15),
    };
  }, [inputs]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Calculator size={24} className="text-atlas-gold" />
          Graham Number
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          벤저민 그레이엄의 공식으로 보수적 내재가치를 산출합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-atlas-text-primary mb-2">입력값</h3>
          {([
            { key: "eps" as const, label: "주당순이익 (EPS)", unit: "원" },
            { key: "bps" as const, label: "주당순자산 (BPS)", unit: "원" },
            { key: "currentPrice" as const, label: "현재 주가", unit: "원" },
          ]).map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-atlas-text-secondary mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type="number"
                  value={inputs[field.key]}
                  onChange={(e) => update(field.key, Number(e.target.value))}
                  className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-3 py-2 text-sm font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-atlas-text-muted">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">그레이엄 넘버</h3>
                <div className="text-center mb-4">
                  <div className="font-data text-4xl font-bold text-atlas-gold">
                    {result.grahamNumber.toLocaleString()}원
                  </div>
                  <div className={`text-sm font-semibold mt-2 ${result.isUndervalued ? "text-atlas-up" : "text-atlas-down"}`}>
                    {result.isUndervalued ? "저평가" : "고평가"} ({result.margin}%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">Graham Number</div>
                    <div className="font-data text-lg font-bold text-atlas-gold">
                      {result.grahamNumber.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">NCAV/주</div>
                    <div className="font-data text-lg font-bold text-atlas-macro">
                      {result.ncavPerShare.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-atlas-text-primary mb-3">
                  그레이엄 성장주 공식 (V = EPS × (8.5 + 2g))
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "수비형 (g=0%)", value: result.defensiveValue, color: "text-atlas-text-muted" },
                    { label: "저성장 (g=5%)", value: result.growthValue5, color: "text-atlas-sector" },
                    { label: "중성장 (g=10%)", value: result.growthValue10, color: "text-atlas-macro" },
                    { label: "고성장 (g=15%)", value: result.growthValue15, color: "text-atlas-up" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between bg-atlas-bg rounded-lg px-3 py-2">
                      <span className="text-sm text-atlas-text-secondary">{row.label}</span>
                      <span className={`font-data text-sm font-bold ${row.color}`}>
                        {row.value.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-atlas-gold mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-atlas-text-muted leading-relaxed">
                    <p className="font-semibold text-atlas-text-secondary mb-1">Graham Number 공식</p>
                    <p>V = √(22.5 × EPS × BPS)</p>
                    <p className="mt-1">22.5 = PER 15 × PBR 1.5 (그레이엄의 보수적 기준)</p>
                    <p>NCAV = (유동자산 - 총부채) ≈ BPS × 0.67</p>
                    <p className="mt-1 text-atlas-text-muted/60">
                      * 그레이엄은 Graham Number 이하에서 매수하고, NCAV 이하면 &quot;담배꽁초&quot; 투자 대상으로 봤습니다
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-atlas-panel border border-atlas-border rounded-xl p-8 text-center">
              <p className="text-atlas-down font-medium">EPS와 BPS가 양수여야 합니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
