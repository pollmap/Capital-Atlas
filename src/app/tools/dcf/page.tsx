"use client";

import { useState, useMemo } from "react";
import { Calculator, Info } from "lucide-react";

interface DCFInputs {
  currentFCF: number;
  growthRateHigh: number;
  growthRateLow: number;
  highGrowthYears: number;
  terminalGrowthRate: number;
  discountRate: number;
  sharesOutstanding: number;
  netDebt: number;
}

const defaultInputs: DCFInputs = {
  currentFCF: 5000,
  growthRateHigh: 15,
  growthRateLow: 5,
  highGrowthYears: 5,
  terminalGrowthRate: 2,
  discountRate: 10,
  sharesOutstanding: 100,
  netDebt: 10000,
};

function InputField({
  label,
  hint,
  value,
  onChange,
  unit,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-atlas-text-secondary mb-1">
        {label}
        {hint && (
          <span className="text-xs text-atlas-text-muted ml-1">({hint})</span>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-atlas-bg border border-atlas-border rounded-lg px-3 py-2 text-sm font-data text-atlas-text-primary focus:outline-none focus:border-atlas-gold/50 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-atlas-text-muted">
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function DCFPage() {
  const [inputs, setInputs] = useState<DCFInputs>(defaultInputs);

  const update = (key: keyof DCFInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    const {
      currentFCF,
      growthRateHigh,
      growthRateLow,
      highGrowthYears,
      terminalGrowthRate,
      discountRate,
      sharesOutstanding,
      netDebt,
    } = inputs;

    const rHigh = growthRateHigh / 100;
    const rLow = growthRateLow / 100;
    const rTerm = terminalGrowthRate / 100;
    const wacc = discountRate / 100;

    if (wacc <= rTerm) return null;

    const projections: { year: number; fcf: number; pv: number }[] = [];
    let totalPV = 0;

    for (let i = 1; i <= 10; i++) {
      const growthRate = i <= highGrowthYears ? rHigh : rLow;
      const prevFCF = i === 1 ? currentFCF : projections[i - 2].fcf;
      const fcf = prevFCF * (1 + growthRate);
      const pv = fcf / Math.pow(1 + wacc, i);
      totalPV += pv;
      projections.push({ year: i, fcf, pv });
    }

    const terminalFCF = projections[9].fcf * (1 + rTerm);
    const terminalValue = terminalFCF / (wacc - rTerm);
    const pvTerminal = terminalValue / Math.pow(1 + wacc, 10);

    const enterpriseValue = totalPV + pvTerminal;
    const equityValue = enterpriseValue - netDebt;
    const fairValue = equityValue / sharesOutstanding;

    return {
      projections,
      totalPVofFCF: totalPV,
      terminalValue,
      pvTerminal,
      enterpriseValue,
      equityValue,
      fairValue: Math.round(fairValue),
    };
  }, [inputs]);

  const fmt = (n: number) =>
    n >= 10000
      ? `${(n / 10000).toFixed(1)}조`
      : n >= 1
      ? `${n.toFixed(0)}억`
      : `${(n * 10000).toFixed(0)}만`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-atlas-text-primary flex items-center gap-2">
          <Calculator size={24} className="text-atlas-up" />
          DCF 계산기
        </h1>
        <p className="text-sm text-atlas-text-secondary mt-1">
          Discounted Cash Flow — 미래 잉여현금흐름을 현재가치로 할인하여
          내재가치를 산출합니다
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">
              입력값
            </h3>
            <div className="space-y-3">
              <InputField
                label="현재 FCF"
                hint="잉여현금흐름"
                value={inputs.currentFCF}
                onChange={(v) => update("currentFCF", v)}
                unit="억원"
              />
              <InputField
                label="고성장률"
                hint="1~N년"
                value={inputs.growthRateHigh}
                onChange={(v) => update("growthRateHigh", v)}
                unit="%"
              />
              <InputField
                label="안정성장률"
                hint="N+1~10년"
                value={inputs.growthRateLow}
                onChange={(v) => update("growthRateLow", v)}
                unit="%"
              />
              <InputField
                label="고성장 기간"
                value={inputs.highGrowthYears}
                onChange={(v) => update("highGrowthYears", v)}
                unit="년"
              />
              <InputField
                label="영구성장률"
                hint="Terminal"
                value={inputs.terminalGrowthRate}
                onChange={(v) => update("terminalGrowthRate", v)}
                unit="%"
              />
              <InputField
                label="할인율"
                hint="WACC"
                value={inputs.discountRate}
                onChange={(v) => update("discountRate", v)}
                unit="%"
              />
              <InputField
                label="발행주식수"
                value={inputs.sharesOutstanding}
                onChange={(v) => update("sharesOutstanding", v)}
                unit="만주"
              />
              <InputField
                label="순차입금"
                hint="부채-현금"
                value={inputs.netDebt}
                onChange={(v) => update("netDebt", v)}
                unit="억원"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-atlas-text-primary mb-4">
                  밸류에이션 결과
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-atlas-text-muted">FCF PV 합계</div>
                    <div className="font-data text-lg font-bold text-atlas-text-primary">
                      {fmt(result.totalPVofFCF)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-atlas-text-muted">터미널 PV</div>
                    <div className="font-data text-lg font-bold text-atlas-text-primary">
                      {fmt(result.pvTerminal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-atlas-text-muted">기업가치 (EV)</div>
                    <div className="font-data text-lg font-bold text-atlas-macro">
                      {fmt(result.enterpriseValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-atlas-text-muted">주당 적정가치</div>
                    <div className="font-data text-2xl font-bold text-atlas-gold">
                      {result.fairValue.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>

              {/* Projection Table */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-atlas-border">
                  <h3 className="text-sm font-semibold text-atlas-text-primary">
                    10년 현금흐름 추정
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-atlas-border">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-atlas-text-muted">
                          Year
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">
                          FCF (억원)
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">
                          PV (억원)
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-atlas-text-muted">
                          성장률
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.projections.map((p) => (
                        <tr
                          key={p.year}
                          className="border-b border-atlas-border/30 hover:bg-atlas-panel-light"
                        >
                          <td className="px-4 py-2 font-data text-sm text-atlas-text-secondary">
                            {p.year}
                          </td>
                          <td className="px-4 py-2 font-data text-sm text-right text-atlas-text-primary">
                            {Math.round(p.fcf).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 font-data text-sm text-right text-atlas-text-primary">
                            {Math.round(p.pv).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 font-data text-sm text-right text-atlas-up">
                            {p.year <= inputs.highGrowthYears
                              ? `${inputs.growthRateHigh}%`
                              : `${inputs.growthRateLow}%`}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-atlas-bg">
                        <td className="px-4 py-2 font-data text-sm text-atlas-gold font-semibold">
                          Terminal
                        </td>
                        <td className="px-4 py-2 font-data text-sm text-right text-atlas-gold">
                          {Math.round(result.terminalValue).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-data text-sm text-right text-atlas-gold">
                          {Math.round(result.pvTerminal).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-data text-sm text-right text-atlas-text-muted">
                          {inputs.terminalGrowthRate}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formula */}
              <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-atlas-macro mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-atlas-text-muted leading-relaxed">
                    <p className="font-semibold text-atlas-text-secondary mb-1">DCF 공식</p>
                    <p>EV = &Sigma;(FCF_t / (1+WACC)^t) + TV / (1+WACC)^n</p>
                    <p>TV = FCF_(n+1) / (WACC - g)</p>
                    <p>적정주가 = (EV - 순차입금) / 발행주식수</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-atlas-panel border border-atlas-border rounded-xl p-8 text-center">
              <p className="text-atlas-down font-medium">
                할인율이 영구성장률보다 커야 합니다
              </p>
              <p className="text-xs text-atlas-text-muted mt-1">
                WACC &gt; Terminal Growth Rate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
