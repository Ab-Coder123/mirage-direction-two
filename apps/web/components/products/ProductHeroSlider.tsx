'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Pill } from 'lucide-react';
import { Product } from '@mirage/types';
import { Button } from '@mirage/ui';

export interface ProductHeroSliderProps {
  products: Product[];
}

export const ProductHeroSlider: React.FC<ProductHeroSliderProps> = ({ products }) => {
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const current = featured[currentIndex]!;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#023368] via-[#104e8b] to-[#1e6bb8] text-white p-8 md:p-12 shadow-2xl border border-white/20">
      {/* Background Decorative Rings & Telemetry Grid */}
      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-brand-primary/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Information Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/15 text-brand-cyan-light border border-white/20">
              {current.brandLine} • {current.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Featured Molecule
            </span>
          </div>

          <div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-sm">
              {current.name}
            </h2>
            <p className="font-heading text-lg sm:text-xl font-bold text-brand-cyan-light mt-2 tracking-wide">
              {current.subtitle}
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
            {current.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" size="lg" asChild className="bg-white text-brand-navy hover:bg-slate-100 font-bold shadow-lg">
              <Link href={`/products/${current.slug}`} className="flex items-center gap-2">
                <span>View Full Formulation</span>
                <ArrowRight className="w-4 h-4 text-brand-primary" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/40 text-white hover:bg-white/10">
              <Link href="/documents">
                Clinical Evidence Dossier
              </Link>
            </Button>
          </div>

          {/* Quick Specifications */}
          <div className="pt-4 flex items-center gap-4 text-xs font-mono text-slate-300 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-brand-cyan-light" />
              <span>Available in: {current.packSizes.map((p: { quantity: number | string }) => p.quantity).join(' / ')} units</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Standardized Formulation</span>
            </span>
          </div>
        </div>

        {/* Right 3D Visual Box / Bottle Presentation */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-64 h-72 sm:w-80 sm:h-80 rounded-3xl bg-white/10 backdrop-blur-md p-6 border border-white/30 shadow-2xl flex flex-col items-center justify-center text-center group overflow-hidden">
            {current.heroImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={current.heroImage}
                  alt={current.name}
                  className="max-h-52 sm:max-h-60 max-w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 rounded-xl"
                />
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="font-heading font-black text-lg tracking-tight text-white block">
                    {current.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-brand-cyan-light border border-white/30">
                    {current.category}
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Visual Medicine Bottle Glow */}
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-brand-primary/40 to-brand-cyan/40 flex items-center justify-center text-white mb-4 border border-white/40 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-14 h-14 text-white" />
                </div>

                <span className="font-heading font-black text-2xl tracking-tight text-white block">
                  {current.name}
                </span>
                <span className="text-xs font-mono text-brand-cyan-light tracking-widest uppercase block mt-1">
                  {current.arabicSubtitle}
                </span>

                <span className="mt-4 px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                  Pure Active Formulations
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Dot Navigation */}
      <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-center gap-2">
        {featured.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}: ${item.name}`}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? 'w-8 bg-brand-cyan-light' : 'w-2.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
