// Capital Atlas — OpenDART Financial Data API Route
// Fetches Korean company financial statements from OpenDART

import { NextRequest, NextResponse } from "next/server";

const DART_BASE = "https://opendart.fss.or.kr/api";

// Map our company IDs to DART corp codes
const CORP_CODES: Record<string, string> = {
  samsung_elec: "00126380",
  sk_hynix: "00164779",
  hyundai_heavy: "00164742",
  samsung_heavy: "00149855",
  hanwha_ocean: "00389223",
  hanwha_aerospace: "00143671",
  lig_nex1: "00356370",
  korea_aerospace: "00330263",
  hyundai_elec: "01046212",
  doosan_enerbility: "00130780",
  posco_hldg: "00183917",
  hd_korea_shipbuilding: "00164529",
  samsung_sdi: "00126186",
  lg_energy: "01639164",
  kakao: "00258801",
  naver: "00266961",
  celltrion: "00421045",
  hyundai_motor: "00164818",
  kia: "00164593",
};

interface DartFinancial {
  account_nm: string;
  thstrm_amount: string;
  frmtrm_amount: string;
  bfefrmtrm_amount: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { corpCode: string } }
) {
  const apiKey = process.env.OPENDART_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenDART API key not configured", source: "static" },
      { status: 503 }
    );
  }

  const corpCode = CORP_CODES[params.corpCode];
  if (!corpCode) {
    return NextResponse.json(
      { error: "Company not found in DART mapping" },
      { status: 404 }
    );
  }

  const currentYear = new Date().getFullYear();
  const reportYear = String(currentYear - 1);

  try {
    // Fetch annual financial statements (consolidated)
    const url = `${DART_BASE}/fnlttSinglAcntAll.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${reportYear}&reprt_code=11011&fs_div=CFS`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "DART API request failed", source: "static" },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (data.status !== "000" || !data.list) {
      return NextResponse.json(
        { error: data.message || "No data available", source: "static" },
        { status: 404 }
      );
    }

    // Extract key financials
    const items = data.list as DartFinancial[];
    const find = (name: string) =>
      items.find(
        (i) => i.account_nm.includes(name)
      );

    const revenue = find("매출액") || find("수익(매출액)");
    const operatingProfit = find("영업이익") || find("영업이익(손실)");
    const netIncome = find("당기순이익") || find("당기순이익(손실)");
    const totalAssets = find("자산총계");
    const totalLiabilities = find("부채총계");
    const totalEquity = find("자본총계");

    const parseAmount = (val: string | undefined) =>
      val ? parseInt(val.replace(/,/g, ""), 10) : null;

    return NextResponse.json({
      year: reportYear,
      revenue: parseAmount(revenue?.thstrm_amount),
      revenuePrev: parseAmount(revenue?.frmtrm_amount),
      operatingProfit: parseAmount(operatingProfit?.thstrm_amount),
      operatingProfitPrev: parseAmount(operatingProfit?.frmtrm_amount),
      netIncome: parseAmount(netIncome?.thstrm_amount),
      netIncomePrev: parseAmount(netIncome?.frmtrm_amount),
      totalAssets: parseAmount(totalAssets?.thstrm_amount),
      totalLiabilities: parseAmount(totalLiabilities?.thstrm_amount),
      totalEquity: parseAmount(totalEquity?.thstrm_amount),
      source: "opendart",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch DART data", source: "static" },
      { status: 500 }
    );
  }
}
