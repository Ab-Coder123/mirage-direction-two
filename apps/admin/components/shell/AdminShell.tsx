'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Pill,
  Thermometer,
  ShieldCheck,
  UserCheck,
  HeartPulse,
  Mail,
  Settings,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Command,
  Sparkles,
  Lock,
  Globe2,
  FileText,
} from 'lucide-react';
import { StatusPip } from '@mirage/ui';
import {
  MOCK_PRODUCTS,
  MOCK_COLD_CHAIN_DEPOTS,
  MOCK_HCP_APPLICATIONS,
} from '@mirage/types';

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
}

export const PRIMARY_CMS_NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/',
    description: 'Dashboard & Catalog Stats',
    icon: LayoutDashboard,
  },
  {
    label: 'Products & Formulations',
    href: '/products',
    description: 'Catalog Management (CRUD)',
    badge: `${MOCK_PRODUCTS.length}`,
    icon: Pill,
  },
  {
    label: 'Homepage & Hero CMS',
    href: '/settings?tab=cms',
    description: 'Bilingual Copy & Banners',
    badge: 'Bilingual',
    icon: Globe2,
  },
  {
    label: 'Company Story CMS',
    href: '/settings?tab=company',
    description: 'About & Quality Narrative',
    badge: 'Bilingual',
    icon: FileText,
  },
  {
    label: 'Settings & Security',
    href: '/settings',
    description: 'Access Controls & Config',
    icon: Settings,
  },
];

export const SECONDARY_OPS_NAV_ITEMS: NavItem[] = [];

const NAV_ITEMS: NavItem[] = [...PRIMARY_CMS_NAV_ITEMS];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentNav = useMemo(() => {
    if (pathname === '/') return NAV_ITEMS[0];
    return NAV_ITEMS.find((item) => item.href !== '/' && pathname.startsWith(item.href)) ?? NAV_ITEMS[0];
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const modules = NAV_ITEMS.filter(
      (item) =>
        !q ||
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    ).map((m) => ({
      type: 'Module',
      title: m.label,
      subtitle: m.description || 'Console Route',
      href: m.href,
    }));

    const products = MOCK_PRODUCTS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
    ).map((p) => ({
      type: 'Formulation',
      title: `${p.name} (${p.brandLine})`,
      subtitle: `${p.category} • ${p.arabicSubtitle}`,
      href: `/products?product=${p.slug}`,
    }));

    const depots = MOCK_COLD_CHAIN_DEPOTS.filter(
      (d) =>
        !q ||
        d.location.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q)
    ).map((d) => ({
      type: 'Cryo-Depot',
      title: `${d.code} — ${d.location}`,
      subtitle: `Temp: +${d.currentTempCelsius}°C • ${d.activeBatches} Active Batches`,
      href: '/cold-chain',
    }));

    const hcps = MOCK_HCP_APPLICATIONS.filter(
      (h) =>
        !q ||
        h.fullName.toLowerCase().includes(q) ||
        h.syndicateLicenseNumber.toLowerCase().includes(q)
    ).map((h) => ({
      type: 'HCP Dossier',
      title: h.fullName,
      subtitle: `${h.syndicateLicenseNumber} • ${h.status}`,
      href: '/hcp-verify',
    }));

    return [...modules, ...products, ...depots, ...hcps].slice(0, 12);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex bg-slate-50/90 telemetry-grid text-brand-navy">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-[#020F24] text-white border-r border-white/10 z-30 select-none">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2878BC] to-[#308995] flex items-center justify-center shadow-lg shadow-[#2878BC]/25 font-heading font-black text-lg text-white">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base tracking-tight text-white">
                  MIRAGE PHARMA
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#61C0E4] block">
                Clinical Admin OS v2.4
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Search Trigger */}
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#61C0E4]" />
              <span>Jump to module or batch...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-slate-300 border border-white/10">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-2 flex-1 overflow-y-auto space-y-4">
          {/* Main Website Content Section */}
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Website Content &amp; CMS
            </div>
            {PRIMARY_CMS_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('?')[0] ?? item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2878BC] to-[#2878BC]/80 text-white shadow-md shadow-[#2878BC]/25 border border-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-[#61C0E4]'
                      }`}
                    />
                    <div className="truncate">
                      <span className="block truncate font-semibold">{item.label}</span>
                      {item.description && (
                        <span
                          className={`text-[10px] block truncate ${
                            isActive ? 'text-sky-100' : 'text-slate-400'
                          }`}
                        >
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge ? (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {SECONDARY_OPS_NAV_ITEMS.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Operations Hub
              </div>
              {SECONDARY_OPS_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-white/10 text-slate-400">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin User Badge & Web App Link Footer */}
        <div className="p-4 border-t border-white/10 bg-[#041B3B]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2878BC] to-[#308995] text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              AD
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                Admin
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                admin@miragepharma.com
              </span>
            </div>
          </div>

          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-[#61C0E4] transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-[#020F24] text-white h-full flex flex-col justify-between z-10 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-heading font-extrabold text-base text-white">
                  MIRAGE ADMIN OS
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-[#2878BC] text-white'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#61C0E4]" />
                        <span>{item.label}</span>
                      </span>
                      {item.description ? (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.description}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        {/* Top Persistent Telemetry HUD Header */}
        <header className="sticky top-0 z-20 hud-glass border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-brand-navy"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <Link href="/" className="font-mono hover:text-brand-primary">
                Mirage Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="font-heading font-bold text-brand-navy truncate">
                {currentNav?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden xl:flex items-center">
              <StatusPip
                status="optimal"
                label="Catalog & CMS Synchronized • Live"
              />
            </div>

            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand-primary/50 text-xs font-medium text-slate-600 flex items-center gap-2 shadow-sm transition-all"
            >
              <Command className="w-3.5 h-3.5 text-brand-primary" />
              <span className="hidden sm:inline">Quick Command</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 rounded text-slate-500">
                ⌘K
              </kbd>
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-brand-navy text-white font-heading font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-brand-navy block">
                  Admin
                </span>
                <span className="text-[10px] font-mono text-brand-primary block">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Route Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto min-w-0">
          {children}
        </main>

        {/* Compliance Footer */}
        <footer className="px-4 sm:px-8 py-4 border-t border-slate-200/70 bg-white/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>
              <strong>Mirage Pharma Administration Hub</strong> — Website Content &amp; Operations Management
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            EDA GxP • 21 CFR Part 11 Active
          </div>
        </footer>
      </div>

      {/* Command Palette Modal (Ctrl+K / Cmd+K) */}
      {commandOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10">
            <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-brand-primary shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, website pages, or settings..."
                className="w-full text-sm text-brand-navy placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="px-2 py-1 text-[10px] font-mono bg-slate-100 rounded text-slate-500 hover:bg-slate-200"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching clinical dossiers, batches, or modules found.
                </div>
              ) : (
                searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCommandOpen(false);
                      setSearchQuery('');
                      router.push(res.href);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <span className="font-heading font-bold text-xs text-brand-navy block">
                        {res.title}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {res.subtitle}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-brand-primary font-mono text-[10px] font-bold shrink-0">
                      {res.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
