'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Search, Check } from 'lucide-react';

export const Footer: React.FC = () => {
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
            <Link href="/" className="inline-block p-1 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 transition-transform hover:scale-105">
              <Image
                src="/brand/mirage_pharma_logo.png"
                alt="Mirage Pharma"
                width={170}
                height={50}
                className="h-11 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed">
              Developing advanced, science-based nutritional formulations and clinical phytotherapy, going beyond traditional healthcare standards.
            </p>

            <ul className="space-y-3 text-xs text-slate-200 font-sans">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-cyan-light shrink-0 mt-0.5" />
                <span>Villa 270 AL Andalus, Fifth Settlement, Cairo, Egypt</span>
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

          {/* Column 2: Newsletter & Search (4 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-start">
            {/* Quick Search */}
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (footerSearch.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(footerSearch)}`;
                  }
                }}
                className="relative max-w-md"
              >
                <input
                  type="text"
                  value={footerSearch}
                  onChange={(e) => setFooterSearch(e.target.value)}
                  placeholder="Search catalog, medical papers..."
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
                Join Our Newsletter
              </h4>
              <p className="text-xs text-center text-slate-300 mb-4">
                Receive peer-reviewed medical updates, newly formulated batch releases, and clinical insights.
              </p>

              {subscribed ? (
                <div className="p-3 rounded-xl bg-brand-green/20 border border-brand-green/40 text-center text-xs font-semibold text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Thank you! You are now subscribed to our clinical dispatches.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email Here.."
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 border border-white/40 outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light hover:from-brand-navy hover:to-brand-primary text-white font-heading font-bold text-sm tracking-wide shadow-hud-glow transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 3: Quick Links & Follow Us (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h4 className="font-heading font-bold text-lg text-white mb-3 tracking-tight">
                Follow Us
              </h4>
              {/* Social Icons row */}
              <div className="flex items-center gap-3 text-white">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5V12h3.642l.358-4h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>

                <a
                  href="https://wa.me/201070786720"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-emerald-400"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X (Twitter)"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-rose-400"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links List (matching Hetero Cure links) */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-mono uppercase tracking-wider block mb-2">
                Quick Links
              </span>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-slate-300 hover:text-white transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/our-story" className="text-slate-300 hover:text-white transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="text-slate-300 hover:text-white transition-colors">
                    Documents
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-slate-300 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright, Privacy Policy & Sub-Credits strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <p>© 2026 Mirage Pharma / Hetero Cure Pharma. All Rights Reserved.</p>
            <span className="hidden sm:inline text-white/20">|</span>
            <Link
              href="/privacy-policy"
              className="text-slate-300 hover:text-white underline underline-offset-4 font-semibold transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            Powered By <span className="text-white font-medium">Active4Web</span> & <span className="text-brand-cyan-light font-medium">Mirage Clinical Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
