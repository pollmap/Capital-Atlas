"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-atlas-border bg-atlas-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-atlas-gold to-atlas-accent flex items-center justify-center">
                <span className="text-atlas-bg font-bold text-xs">CA</span>
              </div>
              <span className="font-display font-bold text-atlas-text-primary">
                Capital Atlas
              </span>
            </div>
            <p className="text-sm text-atlas-text-muted leading-relaxed">
              자본시장의 인과구조를 시각화하는
              <br />
              인터랙티브 분석 플랫폼
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-atlas-text-secondary mb-3">
              탐색
            </h4>
            <div className="space-y-2">
              <Link
                href="/graph"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                인과지도
              </Link>
              <Link
                href="/themes"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                테마 밸류체인
              </Link>
              <Link
                href="/sectors"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                섹터 비교
              </Link>
              <Link
                href="/tools"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                밸류에이션 도구
              </Link>
              <Link
                href="/research"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                리서치 아카이브
              </Link>
              <Link
                href="/glossary"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                금융 용어사전
              </Link>
              <Link
                href="/changelog"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                Changelog
              </Link>
              <Link
                href="/about"
                className="block text-sm text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                프로젝트 소개
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-atlas-text-secondary mb-3">
              데이터 출처
            </h4>
            <p className="text-xs text-atlas-text-muted leading-relaxed mb-3">
              FRED, ECOS, DART, KRX
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/pollmap/Capital-Atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-atlas-text-muted hover:text-atlas-text-primary transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="https://sophia-atlas.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-atlas-text-muted hover:text-atlas-text-primary transition-colors flex items-center gap-1 text-xs"
              >
                Sophia Atlas <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-atlas-border flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-atlas-text-muted">
            &copy; 2026 이찬희. Capital Atlas — 오픈소스 프로젝트
          </p>
          <p className="text-xs text-atlas-text-muted">
            CUFA 투자연구회
          </p>
        </div>
      </div>
    </footer>
  );
}
