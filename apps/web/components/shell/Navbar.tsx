'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@mirage/utils';
import { ThemeToggle } from '@/components/theme';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS_EN: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Documents', href: '/documents' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Contact', href: '/contact' },
];

const NAV_ITEMS_AR: NavItem[] = [
  { label: 'الرئيسية', href: '/ar' },
  { label: 'المستحضرات الدوائية', href: '/ar/products' },
  { label: 'الملفات والأبحاث', href: '/ar/documents' },
  { label: 'قصتنا ومعاييرنا', href: '/ar/our-story' },
  { label: 'اتصل بنا', href: '/ar/contact' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAr = pathname?.startsWith('/ar');
  const navItems = isAr ? NAV_ITEMS_AR : NAV_ITEMS_EN;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#020F24]/85 backdrop-blur-md border-b border-brand-border-subtle dark:border-white/10 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Official Mirage Brand Logo */}
        <Link href={isAr ? '/ar' : '/'} className="flex items-center shrink-0 group py-1" aria-label="Mirage Pharma Home">
          <Image
            src="/brand/mirage_pharma_logo.png"
            alt="Mirage Pharma — Healthy Life"
            width={160}
            height={48}
            priority
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] dark:hidden"
          />
          <Image
            src="/brand/mirage_pharma_logo_dark.png"
            alt="Mirage Pharma — Healthy Life"
            width={160}
            height={48}
            priority
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] hidden dark:block"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 font-heading text-sm font-semibold text-brand-navy dark:text-slate-200">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg transition-colors relative hover:text-brand-primary dark:hover:text-brand-cyan-light hover:bg-slate-50 dark:hover:bg-white/5',
                  isActive && 'text-brand-primary dark:text-brand-cyan-light bg-brand-primary/5 dark:bg-brand-primary/15 font-bold'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-primary dark:bg-brand-cyan-light rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Icons & Portal Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle Button (Desktop & Mobile) */}
          <ThemeToggle />

          {/* User Account Button */}
          <Link
            href={isAr ? '/ar/contact' : '/contact'}
            aria-label="User Account"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>

          {/* Cart / Inquiry Drawer trigger */}
          <Link
            href={isAr ? '/ar/products' : '/products'}
            aria-label="Product Inquiries"
            className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-primary text-[10px] font-bold text-white flex items-center justify-center font-mono">
              5
            </span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-navy dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-border-subtle dark:border-white/10 bg-white dark:bg-[#020F24] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold'
                    : 'text-brand-navy dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
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
