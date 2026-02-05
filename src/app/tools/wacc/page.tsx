"use client";

import { useState, useMemo } from "react";
import { Percent, Info } from "lucide-react";

interface WACCInputs {
  equityValue: number;
  debtValue: number;
  riskFreeRate: number;
  beta: number;
  marketPremium: number;
  costOfDebt: number;
  taxRate: number;
}

const defaultInputs: WACCInputs = {
  equityValue: 100000,
  debtValue: 50000,
  riskFreeRate: 4.25,
  beta: 1.2,
  marketPremium: 5.5,
  costOfDebt: 5.0,
  taxRate: 22,
};

export default function WACCPage() {
  const [inputs, setInputs] = useState<WACCInputs>(defaultInputs);

  const update = (key: keyof WACCInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    const { equityValue, debtValue, riskFreeRate, beta, marketPremium, costOfDebt, taxRate } = inputs;
    const totalValue = equityValue + debtValue;
    if (totalValue === 0) return null;

    const weightEquity = equityValue / totalValue;
    const weightDebt = debtValue / totalValue;
    const costOfEquity = riskFreeRate + beta * marketPremium;
    const afterTaxDebt = costOfDebt * (1 - taxRate / 100);
    const wacc = weightEquity * costOfEquity + weightDebt * afterTaxDebt;

    return {
      costOfEquity,
      afterTaxDebt,
      weightEquity: weightEquity * 100,
      weightDebt: weightDebt * 100,
      wacc,
    };
  }, [inputs]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Percent size={24} className="text-atlas-macro" />
          WACC 계산기
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          가중평균자본비용 — DCF 할인율 산출에 사용
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-atlas-text-primary mb-2">입력값</h3>
          {([
            { key: "equityValue" as const, label: "자기자본 (시가총액)", unit: "억원" },
            { key: "debtValue" as const, label: "타인자본 (차입금)", unit: "억원" },
            { key: "riskFreeRate" as const, label: "무위험수익률", unit: "%" },
            { key: "beta" as const, label: "베타 (β)", unit: "" },
            { key: "marketPremium" as const, label: "시장 리스크 프리미엄", unit: "%" },
            { key: "costOfDebt" as const, label: "세전 타인자본비용", unit: "%" },
            { key: "taxRate" as const, label: "법인세율", unit: "%" },
          ]).map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-atlas-text-secondary mb-1">{field.label}</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={inputs[field.key]}
                  onChange={(e) => update(field.key, Number(e.target.value))}
                  className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-3 py-2 text-sm font-data text-atlas-text-primary focus:outline-none focus:border-atlas-macro/50"
                />
                {field.unit && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-atlas-text-muted">{field.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {result && (
            <>
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">결과</h3>
                <div className="text-center mb-6">
                  <div className="text-xs text-atlas-text-muted mb-1">WACC</div>
                  <div className="font-data text-4xl font-bold text-atlas-gold">
                    {result.wacc.toFixed(2)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">자기자본비용 (Ke)</div>
                    <div className="font-data text-lg font-bold text-atlas-macro">
                      {result.costOfEquity.toFixed(2)}%
                    </div>
                    <div className="text-xs text-atlas-text-muted mt-1">
                      비중: {result.weightEquity.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-atlas-bg rounded-lg p-3">
                    <div className="text-xs text-atlas-text-muted">세후 타인자본비용</div>
                    <div className="font-data text-lg font-bold text-atlas-sector">
                      {result.afterTaxDebt.toFixed(2)}%
                    </div>
                    <div className="text-xs text-atlas-text-muted mt-1">
                      비중: {result.weightDebt.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-atlas-macro mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-atlas-text-muted leading-relaxed">
                    <p className="font-semibold text-atlas-text-secondary mb-1">WACC 공식</p>
                    <p>Ke = Rf + β × (Rm - Rf) = {inputs.riskFreeRate} + {inputs.beta} × {inputs.marketPremium} = {result.costOfEquity.toFixed(2)}%</p>
                    <p>Kd(1-t) = {inputs.costOfDebt} × (1 - {inputs.taxRate/100}) = {result.afterTaxDebt.toFixed(2)}%</p>
                    <p>WACC = We×Ke + Wd×Kd(1-t) = {result.wacc.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
