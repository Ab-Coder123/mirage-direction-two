'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@mirage/utils';
import { Button } from '@mirage/ui';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Documents', href: '/documents' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Contact', href: '/contact' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-brand-border-subtle shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-navy flex items-center justify-center text-white font-heading font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-brand-navy leading-none">
              MIRAGE <span className="text-brand-primary font-bold">PHARMA</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-brand-cyan uppercase mt-1">
              HEALTHY LIFE SCIENCES
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 font-heading text-sm font-semibold text-brand-navy">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors relative hover:text-brand-primary hover:bg-slate-50',
                  isActive && 'text-brand-primary bg-brand-primary/5 font-bold'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons & Portal Buttons */}
        <div className="flex items-center gap-3">
          {/* User Account Button */}
          <Link
            href="/contact"
            aria-label="User Account"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-700 flex items-center justify-center transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Cart / Inquiry Drawer trigger */}
          <Link
            href="/products"
            aria-label="Product Inquiries"
            className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-700 flex items-center justify-center transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-[10px] font-bold text-white flex items-center justify-center font-mono">
              5
            </span>
          </Link>

          {/* Admin Console Shortcut */}
          <div className="hidden sm:block">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href="http://localhost:3001" target="_blank" rel="noreferrer">
                Admin Console
              </a>
            </Button>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-navy hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-border-subtle bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-brand-navy hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
