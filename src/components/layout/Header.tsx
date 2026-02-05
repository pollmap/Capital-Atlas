"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Network,
  TrendingUp,
  Layers,
  BarChart3,
  Search,
  Menu,
  X,
  Calculator,
  Users,
} from "lucide-react";

const navItems = [
  { label: "인과지도", href: "/graph", icon: Network },
  { label: "매크로", href: "/macro", icon: TrendingUp },
  { label: "테마", href: "/themes", icon: Layers },
  { label: "섹터", href: "/sectors", icon: BarChart3 },
  { label: "투자자", href: "/investors", icon: Users },
  { label: "도구", href: "/tools", icon: Calculator },
  { label: "검색", href: "/search", icon: Search },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-atlas-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-atlas-gold to-atlas-accent flex items-center justify-center">
              <span className="text-atlas-bg font-bold text-sm">CA</span>
            </div>
            <span className="font-display font-bold text-lg text-atlas-text-primary group-hover:text-atlas-gold transition-colors">
              Capital Atlas
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-atlas-panel-light text-atlas-gold"
                      : "text-atlas-text-secondary hover:text-atlas-text-primary hover:bg-atlas-panel"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden p-2 text-atlas-text-secondary hover:text-atlas-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-atlas-border bg-atlas-panel">
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
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
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
          </nav>
        </div>
      )}
    </header>
  );
}
