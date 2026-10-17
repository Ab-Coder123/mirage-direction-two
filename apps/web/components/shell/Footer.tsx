'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Search, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const isAr = pathname?.startsWith('/ar');

  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [footerSearch, setFooterSearch] = React.useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="w-full bg-[#022852] text-white border-t border-brand-navy-light/40 relative overflow-hidden">
      {/* Top Wave/Substrate Ambient Lighting */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-brand-cyan to-brand-green" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Company Info & Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link
              href={isAr ? '/ar' : '/'}
              className="inline-block p-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 transition-transform hover:scale-105"
            >
              <Image
                src="/brand/mirage_pharma_logo.png"
                alt="Mirage Pharma"
                width={170}
                height={50}
                className="h-11 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'تطوير تركيبات غذائية ومستحضرات دوائية متقدمة قائمة على الأبحاث الإكلينيكية وعلوم النباتات الطبية، لتتجاوز معايير الرعاية الصحية التقليدية.'
                : 'Developing advanced, science-based nutritional formulations and clinical phytotherapy, going beyond traditional healthcare standards.'}
            </p>

            <ul className="space-y-3 text-xs text-slate-200 font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-cyan-light shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'فيلا 270 الأندلس، التجمع الخامس، القاهرة، مصر'
                    : 'Villa 270 AL Andalus, Fifth Settlement, Cairo, Egypt'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-cyan-light shrink-0" />
                <div className="flex items-center gap-2 font-mono">
                  <a href="tel:01070786720" className="hover:text-white transition-colors">
                    01070786720
                  </a>
                  <span>-</span>
                  <a href="tel:01070786721" className="hover:text-white transition-colors">
                    01070786721
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-cyan-light shrink-0" />
                <a
                  href="mailto:info@hetero-cure.com"
                  className="font-mono hover:text-white transition-colors"
                >
                  info@hetero-cure.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Newsletter & Search (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
            {/* Quick Search */}
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (footerSearch.trim()) {
                    const target = isAr
                      ? `/ar/products?search=${encodeURIComponent(footerSearch)}`
                      : `/products?search=${encodeURIComponent(footerSearch)}`;
                    window.location.href = target;
                  }
                }}
                className="relative max-w-md"
              >
                <input
                  type="text"
                  value={footerSearch}
                  onChange={(e) => setFooterSearch(e.target.value)}
                  placeholder={
                    isAr ? 'ابحث في الدليل والأوراق العلمية...' : 'Search catalog, medical papers...'
                  }
                  className="w-full pl-4 pr-10 py-2.5 rounded-full text-xs bg-white/10 text-white placeholder:text-slate-400 border border-white/20 outline-none focus:border-brand-cyan-light focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Newsletter Subscription Box */}
            <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl max-w-md">
              <h4 className="font-heading font-extrabold text-base uppercase tracking-wider text-center text-white mb-3">
                {isAr ? 'النشرة الطبية والإكلينيكية' : 'Join Our Newsletter'}
              </h4>
              <p className="text-xs text-center text-slate-300 mb-4">
                {isAr
                  ? 'اشترك لتصلك أحدث المستجدات حول الدراسات السريرية والمستحضرات الدوائية الجديدة.'
                  : 'Receive peer-reviewed medical updates, newly formulated batch releases, and clinical insights.'}
              </p>

              {subscribed ? (
                <div className="p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 text-center text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    {isAr
                      ? 'شكراً لك! تم تسجيل بريدك الإلكتروني بنجاح في نشرة ميراج الإكلينيكية.'
                      : 'Thank you! You are now subscribed to our clinical dispatches.'}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني هنا...' : 'Enter Your Email Here..'}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 border border-white/40 outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light hover:from-brand-navy hover:to-brand-primary text-white font-heading font-bold text-sm tracking-wide shadow-hud-glow transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {isAr ? 'اشترك الآن' : 'Subscribe Now'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 3: Quick Links & Follow Us (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h4 className="font-heading font-bold text-lg text-white mb-3 tracking-tight">
                {isAr ? 'تابعنا على' : 'Follow Us'}
              </h4>
              {/* Social Icons row */}
              <div className="flex items-center gap-3 text-white">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors hover:text-brand-cyan-light"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors hover:text-brand-cyan-light"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5V12h3.642l.358-4h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors hover:text-brand-cyan-light"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links List */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-mono uppercase tracking-wider block mb-2">
                {isAr ? 'روابط سريعة' : 'Quick Links'}
              </span>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={isAr ? '/ar' : '/'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'الرئيسية' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/products' : '/products'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'المستحضرات الدوائية' : 'Products'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/our-story' : '/our-story'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'قصتنا ومعاييرنا' : 'Our Story'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/documents' : '/documents'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'الملفات والأبحاث' : 'Documents'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/contact' : '/contact'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'اتصل بنا' : 'Contact'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/faq' : '/faq'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAr ? '/ar/privacy-policy' : '/privacy-policy'}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright, Privacy Policy & Sub-Credits strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <p>
              {isAr
                ? '© 2026 ميراج فارما (Mirage Pharma) / ناتشورالز 4be. جميع الحقوق محفوظة.'
                : '© 2026 Mirage Pharma / Hetero Cure Pharma. All Rights Reserved.'}
            </p>
            <span className="hidden sm:inline text-white/20">|</span>
            <Link
              href={isAr ? '/ar/privacy-policy' : '/privacy-policy'}
              className="text-slate-300 hover:text-white underline underline-offset-4 font-semibold transition-colors"
            >
              {isAr ? 'سياسة الخصوصية والاستخدام' : 'Privacy Policy'}
            </Link>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Powered By <span className="text-white font-medium">Active4Web</span> &{' '}
            <span className="text-brand-cyan-light font-medium">Mirage Clinical Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
