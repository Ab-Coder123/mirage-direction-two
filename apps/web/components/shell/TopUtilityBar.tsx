'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Globe } from 'lucide-react';

export const TopUtilityBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const isAr = pathname?.startsWith('/ar');

  const toggleLanguage = () => {
    if (isAr) {
      const enPath = pathname.replace(/^\/ar/, '') || '/';
      router.push(enPath);
    } else {
      const arPath = pathname === '/' ? '/ar' : `/ar${pathname}`;
      router.push(arPath);
    }
  };

  return (
    <div className="w-full bg-brand-navy text-white text-xs py-2 px-4 border-b border-brand-navy-light/40 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Telemetry / Welcome Tagline */}
        <div className="hidden md:flex items-center gap-3 text-slate-300 font-mono text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>
            {isAr
              ? 'الرعاية الصحية الإكلينيكية والتميز في العلاجات النباتية'
              : 'Clinical Healthcare & Phytotherapeutic Excellence'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            {isAr ? 'القاهرة • عمليات الشرق الأوسط وأفريقيا' : 'Cairo • EMEA Operations'}
          </span>
        </div>

        {/* Right Search, Social Icons & Language Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Quick Search Input Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                const searchTarget = isAr
                  ? `/ar/products?search=${encodeURIComponent(searchQuery)}`
                  : `/products?search=${encodeURIComponent(searchQuery)}`;
                router.push(searchTarget);
              }
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن مستحضر، مركب فعال...' : 'Search products, ingredients...'}
              className="w-48 sm:w-64 pl-8 pr-3 py-1 rounded-full text-xs bg-white/10 text-white placeholder:text-slate-400 border border-white/20 outline-none focus:border-brand-primary focus:bg-white/20 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          </form>

          {/* Social Icons (LinkedIn, Facebook, Instagram) */}
          <div className="flex items-center gap-2.5 text-slate-300">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-brand-cyan-light transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-brand-cyan-light transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5V12h3.642l.358-4h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-brand-cyan-light transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-brand-primary hover:bg-brand-primary-light text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Globe className="w-3 h-3" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
