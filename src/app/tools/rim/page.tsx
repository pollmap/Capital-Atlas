"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Info } from "lucide-react";

interface RIMInputs {
  bps: number;
  roe: number;
  requiredReturn: number;
  sustainableYears: number;
  currentPrice: number;
}

const defaultInputs: RIMInputs = {
  bps: 40000,
  roe: 12,
  requiredReturn: 8,
  sustainableYears: 10,
  currentPrice: 50000,
};

export default function RIMPage() {
  const [inputs, setInputs] = useState<RIMInputs>(defaultInputs);

  const update = (key: keyof RIMInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    const { bps, roe, requiredReturn, sustainableYears, currentPrice } = inputs;
    const r = requiredReturn / 100;
    const roeDecimal = roe / 100;

    if (r <= 0 || bps <= 0) return null;

    const excessReturn = roeDecimal - r;
    const ri = bps * excessReturn;

    const pessimistic = bps + ri / r * 0;
    const neutral = bps + ri / r * 0.8;
    const optimistic = bps + ri / r * 1.0;

    const srimYears: { year: number; equity: number; ri: number; pvRI: number }[] = [];
    let totalPVRI = 0;
    let equity = bps;

    for (let t = 1; t <= sustainableYears; t++) {
      const profit = equity * roeDecimal;
      const residualIncome = profit - equity * r;
      const pvRI = residualIncome / Math.pow(1 + r, t);
      totalPVRI += pvRI;
      srimYears.push({ year: t, equity: Math.round(equity), ri: Math.round(residualIncome), pvRI: Math.round(pvRI) });
      equity = equity + profit * 0.5;
    }

    const lastRI = srimYears[srimYears.length - 1].ri;
    const continuingValuePessimistic = 0;
    const continuingValueNeutral = (lastRI * 0.9) / r / Math.pow(1 + r, sustainableYears);
    const continuingValueOptimistic = (lastRI * 1.0) / r / Math.pow(1 + r, sustainableYears);

    const targetPessimistic = Math.round(bps + totalPVRI + continuingValuePessimistic);
    const targetNeutral = Math.round(bps + totalPVRI + continuingValueNeutral);
    const targetOptimistic = Math.round(bps + totalPVRI + continuingValueOptimistic);

    const margin = ((targetNeutral - currentPrice) / currentPrice) * 100;

    return {
      excessReturn: (excessReturn * 100).toFixed(2),
      annualRI: Math.round(ri),
      pessimistic: Math.round(pessimistic),
      neutral: Math.round(neutral),
      optimistic: Math.round(optimistic),
      targetPessimistic,
      targetNeutral,
      targetOptimistic,
      margin: margin.toFixed(1),
      isUndervalued: targetNeutral > currentPrice,
      srimYears,
    };
  }, [inputs]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <TrendingUp size={24} className="text-atlas-sector" />
          S-RIM 계산기
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          잔여이익모델 (Residual Income Model) — ROE 기반 적정 주가 산출
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-atlas-panel border border-atlas-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-atlas-text-primary mb-2">입력값</h3>
          {([
            { key: "bps" as const, label: "주당순자산 (BPS)", unit: "원" },
            { key: "roe" as const, label: "ROE", unit: "%" },
            { key: "requiredReturn" as const, label: "요구수익률 (Ke)", unit: "%" },
            { key: "sustainableYears" as const, label: "초과이익 유지기간", unit: "년" },
            { key: "currentPrice" as const, label: "현재 주가", unit: "원" },
          ]).map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-atlas-text-secondary mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={inputs[field.key]}
                  onChange={(e) => update(field.key, Number(e.target.value))}
                  className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-3 py-2 text-sm font-data text-atlas-text-primary focus:outline-none focus:border-atlas-sector/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-atlas-text-muted">{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">S-RIM 밸류에이션</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-atlas-bg rounded-lg p-3 text-center">
                    <div className="text-xs text-atlas-text-muted mb-1">비관적</div>
                    <div className="font-data text-lg font-bold text-atlas-down">
                      {result.targetPessimistic.toLocaleString()}
                    </div>
                    <div className="text-xs text-atlas-text-muted">초과이익 소멸</div>
                  </div>
                  <div className="bg-atlas-bg rounded-lg p-3 text-center border border-atlas-gold/30">
                    <div className="text-xs text-atlas-gold mb-1">중립적</div>
                    <div className="font-data text-xl font-bold text-atlas-gold">
                      {result.targetNeutral.toLocaleString()}
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${result.isUndervalued ? "text-atlas-up" : "text-atlas-down"}`}>
                      {result.isUndervalued ? "저평가" : "고평가"} ({result.margin}%)
                    </div>
                  </div>
                  <div className="bg-atlas-bg rounded-lg p-3 text-center">
                    <div className="text-xs text-atlas-text-muted mb-1">낙관적</div>
                    <div className="font-data text-lg font-bold text-atlas-up">
                      {result.targetOptimistic.toLocaleString()}
                    </div>
                    <div className="text-xs text-atlas-text-muted">초과이익 유지</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">초과수익률</div>
                    <div className={`font-data text-lg font-bold ${Number(result.excessReturn) > 0 ? "text-atlas-up" : "text-atlas-down"}`}>
                      {result.excessReturn}%
                    </div>
                    <div className="text-xs text-atlas-text-muted">ROE - Ke</div>
                  </div>
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">연간 잔여이익</div>
                    <div className="font-data text-lg font-bold text-atlas-sector">
                      {result.annualRI.toLocaleString()}원
                    </div>
                    <div className="text-xs text-atlas-text-muted">BPS × (ROE - Ke)</div>
                  </div>
                </div>
              </div>

              <div className="bg-atlas-panel border border-atlas-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-atlas-border">
                  <h3 className="text-sm font-semibold text-atlas-text-primary">
                    {inputs.sustainableYears}년 잔여이익 추정
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-atlas-border">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-atlas-text-muted">Year</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">자본 (BPS)</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">잔여이익</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">PV(RI)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.srimYears.map((row) => (
                        <tr key={row.year} className="border-b border-atlas-border/30 hover:bg-atlas-panel-light">
                          <td className="px-4 py-2 font-data text-sm text-atlas-text-secondary">{row.year}</td>
                          <td className="px-4 py-2 font-data text-sm text-right text-atlas-text-primary">{row.equity.toLocaleString()}</td>
                          <td className={`px-4 py-2 font-data text-sm text-right ${row.ri > 0 ? "text-atlas-up" : "text-atlas-down"}`}>
                            {row.ri.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 font-data text-sm text-right text-atlas-text-primary">{row.pvRI.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-atlas-sector mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-atlas-text-muted leading-relaxed">
                    <p className="font-semibold text-atlas-text-secondary mb-1">S-RIM 공식</p>
                    <p>적정주가 = BPS + &Sigma;(RI_t / (1+Ke)^t) + CV</p>
                    <p>RI = BPS × (ROE - Ke)</p>
                    <p className="mt-1">비관: 초과이익 즉시 소멸 / 중립: 90% 유지 / 낙관: 100% 영구 유지</p>
                    <p className="mt-1 text-atlas-text-muted/60">
                      * ROE &gt; Ke이면 초과이익 발생, 이 초과이익의 현재가치를 BPS에 더함
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-atlas-panel border border-atlas-border rounded-xl p-8 text-center">
              <p className="text-atlas-down font-medium">요구수익률과 BPS가 0보다 커야 합니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
