"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Network,
  TrendingUp,
  Layers,
  BarChart3,
  Search,
  Menu,
  X,
  Calculator,
  Grid3X3,
} from "lucide-react";

const navItems = [
  { label: "인드라망", href: "/graph", icon: Network },
  { label: "매크로", href: "/macro", icon: TrendingUp },
  { label: "테마", href: "/themes", icon: Layers },
  { label: "섹터", href: "/sectors", icon: BarChart3 },
  { label: "도구", href: "/tools", icon: Calculator },
  { label: "검색", href: "/search", icon: Search },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 glass border-b transition-all duration-200 ${
        scrolled
          ? "border-atlas-border shadow-lg shadow-black/20"
          : "border-atlas-border/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-atlas-gold to-atlas-accent flex items-center justify-center">
              <span className="text-atlas-bg font-bold text-sm">CA</span>
            </div>
            <span className="font-display font-bold text-lg text-atlas-text-primary group-hover:text-atlas-gold transition-colors hidden sm:inline">
              Capital Atlas
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-atlas-panel-light text-atlas-gold"
                      : "text-atlas-text-secondary hover:text-atlas-text-primary hover:bg-atlas-panel"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="lg:hidden p-2 text-atlas-text-secondary hover:text-atlas-text-primary touch-target"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-atlas-border bg-atlas-panel animate-slide-down">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all touch-target ${
                    isActive
                      ? "bg-atlas-panel-light text-atlas-gold"
                      : "text-atlas-text-secondary hover:text-atlas-text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-atlas-border mt-2 pt-2">
              <Link
                href="/tools/heatmap"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-atlas-text-secondary hover:text-atlas-text-primary touch-target"
              >
                <Grid3X3 size={16} />
                상관관계 히트맵
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
