import Link from "next/link";
import { ArrowLeft, Calendar, Tag, ExternalLink, FileText } from "lucide-react";
import reportsData from "@/data/research/reports.json";
import { getNodeById, getCompanyById } from "@/lib/data";

export function generateStaticParams() {
  return reportsData.map((r) => ({ reportId: r.id }));
}

export default function ReportDetailPage({
  params,
}: {
  params: { reportId: string };
}) {
  const report = reportsData.find((r) => r.id === params.reportId);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <FileText size={48} className="text-atlas-text-muted mx-auto mb-4" />
        <h1 className="text-xl font-bold text-atlas-text-primary mb-2">보고서를 찾을 수 없습니다</h1>
        <Link href="/research" className="text-sm text-atlas-report hover:underline">
          리서치 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const opinionColor: Record<string, string> = {
    BUY: "text-atlas-up bg-atlas-up/10 border-atlas-up/30",
    HOLD: "text-atlas-gold bg-atlas-gold/10 border-atlas-gold/30",
    SELL: "text-atlas-down bg-atlas-down/10 border-atlas-down/30",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/research"
        className="inline-flex items-center gap-1 text-sm text-atlas-text-muted hover:text-atlas-report transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        리서치 목록
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded border ${opinionColor[report.opinion]}`}>
              {report.opinion}
            </span>
            <span className="text-sm text-atlas-text-muted flex items-center gap-1">
              <Calendar size={12} />
              {report.date}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-atlas-text-primary mb-2">{report.title}</h1>
          <p className="text-sm text-atlas-text-muted">{report.nameEn}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-atlas-text-secondary">
              {report.author} · {report.authorRole}
            </span>
          </div>
        </header>

        <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-atlas-text-primary mb-3">요약</h2>
          <p className="text-sm text-atlas-text-secondary leading-relaxed">
            {report.description}
          </p>
        </div>

        {report.companies.length > 0 && (
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-atlas-text-primary mb-3">관련 기업</h2>
            <div className="flex flex-wrap gap-2">
              {report.companies.map((cId) => {
                const company = getCompanyById(cId);
                return (
                  <Link
                    key={cId}
                    href={`/companies/${cId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-atlas-company/10 text-atlas-company text-sm hover:bg-atlas-company/20 transition-colors"
                  >
                    {company?.name || cId}
                    <ExternalLink size={10} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {report.connectedMacroNodes.length > 0 && (
          <div className="bg-atlas-panel border border-atlas-border rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-atlas-text-primary mb-3">관련 매크로 변수</h2>
            <div className="flex flex-wrap gap-2">
              {report.connectedMacroNodes.map((nId) => {
                const node = getNodeById(nId);
                return (
                  <Link
                    key={nId}
                    href={`/macro/${nId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-atlas-macro/10 text-atlas-macro text-sm hover:bg-atlas-macro/20 transition-colors"
                  >
                    {node?.name || nId}
                    <ExternalLink size={10} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Tag size={14} className="text-atlas-text-muted" />
          {report.tags.map((tag) => (
            <span key={tag} className="text-sm px-2 py-1 rounded bg-atlas-panel-light text-atlas-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}
