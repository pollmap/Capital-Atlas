// Capital Atlas — PDF/Print Export Utility

interface ExportSection {
  title: string;
  content: string;
  type: "text" | "table" | "list";
}

interface ExportData {
  title: string;
  subtitle?: string;
  date: string;
  sections: ExportSection[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: ExportData): string {
  const sectionsHtml = data.sections
    .map((section) => {
      const contentHtml =
        section.type === "table"
          ? section.content
          : section.type === "list"
          ? `<ul style="padding-left:20px;margin:8px 0">${section.content}</ul>`
          : `<p style="margin:8px 0;line-height:1.6;color:#374151">${escapeHtml(section.content)}</p>`;

      return `
        <div style="margin-bottom:20px">
          <h3 style="font-size:14px;font-weight:600;color:#1F2937;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #E5E7EB">
            ${escapeHtml(section.title)}
          </h3>
          ${contentHtml}
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(data.title)}</title>
  <style>
    @page { margin: 20mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Inter", sans-serif;
      color: #111827;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #E5E7EB;
      padding: 6px 10px;
      text-align: left;
    }
    th {
      background: #F3F4F6;
      font-weight: 600;
      color: #374151;
    }
    td { color: #4B5563; }
    .up { color: #059669; font-weight: 600; }
    .down { color: #DC2626; font-weight: 600; }
    .complex { color: #D97706; font-weight: 600; }
    ul li {
      margin-bottom: 4px;
      color: #374151;
      line-height: 1.5;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div style="border-bottom:2px solid #F59E0B;padding-bottom:16px;margin-bottom:20px">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0">
      ${escapeHtml(data.title)}
    </h1>
    ${data.subtitle ? `<p style="font-size:13px;color:#6B7280;margin:4px 0 0">${escapeHtml(data.subtitle)}</p>` : ""}
    <p style="font-size:11px;color:#9CA3AF;margin:8px 0 0">
      Capital Atlas | ${escapeHtml(data.date)}
    </p>
  </div>
  ${sectionsHtml}
  <div style="margin-top:30px;padding-top:12px;border-top:1px solid #E5E7EB;text-align:center;font-size:10px;color:#9CA3AF">
    Capital Atlas &mdash; 자본시장 인과구조 분석 플랫폼 | &copy; 이찬희
  </div>
</body>
</html>`;
}

export function exportToPdf(data: ExportData): void {
  const html = buildHtml(data);
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}

export function buildScenarioExportData(
  nodeName: string,
  nodeNameEn: string,
  action: "increase" | "decrease",
  currentValue: string | undefined,
  results: Array<{
    name: string;
    direction: "up" | "down" | "complex";
    strength: string;
    mechanism: string;
    timeLag?: string;
  }>
): ExportData {
  const actionLabel = action === "increase" ? "상승" : "하락";
  const dirLabel = (d: string) =>
    d === "up" ? "상승" : d === "down" ? "하락" : "복합";
  const dirClass = (d: string) =>
    d === "up" ? "up" : d === "down" ? "down" : "complex";

  const tableRows = results
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td class="${dirClass(r.direction)}">${dirLabel(r.direction)}</td>
        <td>${escapeHtml(r.strength)}</td>
        <td>${escapeHtml(r.mechanism)}</td>
        <td>${r.timeLag ? escapeHtml(r.timeLag) : "-"}</td>
      </tr>`
    )
    .join("");

  const upCount = results.filter((r) => r.direction === "up").length;
  const downCount = results.filter((r) => r.direction === "down").length;
  const complexCount = results.filter((r) => r.direction === "complex").length;

  return {
    title: `시나리오 분석: ${nodeName} ${actionLabel}`,
    subtitle: `${nodeNameEn}${currentValue ? ` (현재: ${currentValue})` : ""}`,
    date: new Date().toLocaleDateString("ko-KR"),
    sections: [
      {
        title: "분석 요약",
        type: "text",
        content: `${nodeName}의 ${actionLabel} 시나리오에서 총 ${results.length}개 변수에 영향이 예상됩니다. 상승 ${upCount}개, 하락 ${downCount}개, 복합 ${complexCount}개.`,
      },
      {
        title: "예상 영향 상세",
        type: "table",
        content: `
          <table>
            <thead>
              <tr>
                <th>영향 변수</th>
                <th>방향</th>
                <th>강도</th>
                <th>메커니즘</th>
                <th>시차</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>`,
      },
    ],
  };
}

export function buildCompanyExportData(company: {
  name: string;
  nameEn: string;
  ticker: string;
  market: string;
  sectorName: string;
  description: string;
  financials: {
    marketCap: number;
    per: number;
    pbr: number;
    roe: number;
    operatingMargin: number;
    debtRatio: number;
    dividendYield: number;
    return52w: number;
  };
  valuation?: {
    dcfTarget?: number;
    rimTarget?: number;
    currentPrice: number;
    gap?: string;
    thesis?: string;
  };
  themes: string[];
}): ExportData {
  const f = company.financials;
  const v = company.valuation;

  return {
    title: `${company.name} (${company.ticker})`,
    subtitle: `${company.nameEn} | ${company.market} | ${company.sectorName}`,
    date: new Date().toLocaleDateString("ko-KR"),
    sections: [
      {
        title: "기업 개요",
        type: "text",
        content: company.description,
      },
      {
        title: "재무 지표",
        type: "table",
        content: `
          <table>
            <thead>
              <tr><th>지표</th><th>값</th></tr>
            </thead>
            <tbody>
              <tr><td>시가총액</td><td>${f.marketCap.toLocaleString()}원</td></tr>
              <tr><td>PER</td><td>${f.per}x</td></tr>
              <tr><td>PBR</td><td>${f.pbr}x</td></tr>
              <tr><td>ROE</td><td>${f.roe}%</td></tr>
              <tr><td>영업이익률</td><td>${f.operatingMargin}%</td></tr>
              <tr><td>부채비율</td><td>${f.debtRatio}%</td></tr>
              <tr><td>배당수익률</td><td>${f.dividendYield}%</td></tr>
              <tr><td>52주 수익률</td><td class="${f.return52w >= 0 ? "up" : "down"}">${f.return52w}%</td></tr>
            </tbody>
          </table>`,
      },
      ...(v
        ? [
            {
              title: "밸류에이션" as const,
              type: "table" as const,
              content: `
                <table>
                  <thead>
                    <tr><th>모델</th><th>적정가</th></tr>
                  </thead>
                  <tbody>
                    ${v.dcfTarget ? `<tr><td>DCF</td><td>${v.dcfTarget.toLocaleString()}원</td></tr>` : ""}
                    ${v.rimTarget ? `<tr><td>S-RIM</td><td>${v.rimTarget.toLocaleString()}원</td></tr>` : ""}
                    <tr><td>현재가</td><td>${v.currentPrice.toLocaleString()}원</td></tr>
                    ${v.gap ? `<tr><td>괴리율</td><td class="${v.gap.startsWith("+") ? "up" : "down"}">${v.gap}</td></tr>` : ""}
                  </tbody>
                </table>
                ${v.thesis ? `<p style="margin-top:8px;color:#374151;line-height:1.6"><strong>투자 논거:</strong> ${escapeHtml(v.thesis)}</p>` : ""}`,
            },
          ]
        : []),
      {
        title: "연관 테마",
        type: "list",
        content: company.themes.map((t) => `<li>${escapeHtml(t)}</li>`).join(""),
      },
    ],
  };
}
