import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Capital Atlas — 자본시장 인과지도",
  description:
    "매크로 변수 간 인과관계, 산업 밸류체인, 섹터 비교를 하나의 그래프로 연결하는 인터랙티브 분석 플랫폼. 개발자: 이찬희",
  keywords: [
    "매크로",
    "인과지도",
    "밸류체인",
    "투자분석",
    "Capital Atlas",
    "금융",
    "시각화",
  ],
  authors: [{ name: "이찬희" }],
  openGraph: {
    title: "Capital Atlas — 자본시장 인과지도",
    description:
      "금리가 오르면 뭐가 오르고 뭐가 내리는가? 자본시장의 구조를 탐험하세요.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-atlas-bg text-atlas-text-primary antialiased">
        <Header />
        <main className="pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
