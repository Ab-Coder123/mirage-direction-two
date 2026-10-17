import * as React from 'react';
import { Pill, Droplets, Sparkles, ArrowRight, Star } from 'lucide-react';
import { Product } from '@mirage/types';
import { cn } from '@mirage/utils';
import { Badge } from './Badge';
import { Button } from './Button';

export interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'row';
  className?: string;
  onReadMore?: (slug: string) => void;
  readMoreHref?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'grid',
  className,
  readMoreHref,
}) => {
  const targetHref = readMoreHref ?? `/products/${product.slug}`;

  if (variant === 'row') {
    return (
      <div
        className={cn(
          'group relative flex flex-col md:flex-row items-stretch overflow-hidden rounded-2xl bg-white border border-brand-border-subtle shadow-sm transition-all duration-300 hover:shadow-hud-glow hover:border-brand-primary/40',
          className
        )}
      >
        {/* Left Product Image & Brand Anchor */}
        <div className="relative flex items-center justify-center p-6 md:w-64 bg-gradient-to-br from-slate-50 to-blue-50/40 border-b md:border-b-0 md:border-r border-brand-border-subtle shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center rounded-xl bg-white/80 p-2 shadow-inner border border-white">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="font-heading font-extrabold text-sm text-brand-navy block tracking-tight">
                {product.name}
              </span>
              <span className="text-[10px] text-brand-text-muted font-mono uppercase tracking-wider block">
                {product.brandLine}
              </span>
            </div>
          </div>

          <div className="absolute top-3 left-3">
            <Badge variant="outline" size="sm" className="bg-white/90 text-[10px]">
              {product.category}
            </Badge>
          </div>
        </div>

        {/* Center Content Body */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <h3 className="font-heading text-2xl font-bold text-brand-navy group-hover:text-brand-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-semibold text-brand-primary tracking-wide">
                  {product.subtitle}
                </p>
              </div>

              {/* Arabic Dietary Supplement Label */}
              <div className="text-right">
                <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                  {product.arabicSubtitle}
                </span>
              </div>
            </div>

            <p className="text-sm text-brand-text-muted leading-relaxed line-clamp-2 mt-2">
              {product.description}
            </p>
          </div>

          {/* Bottom Bar: Pack Sizes & Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
            {/* Pack Size Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-text-muted font-medium">Pack Sizes:</span>
              <div className="flex items-center gap-1.5">
                {product.packSizes.map((pack, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-brand-surface text-brand-navy border border-brand-border-subtle"
                  >
                    {pack.unit === 'ml' ? (
                      <Droplets className="w-3 h-3 text-brand-cyan" />
                    ) : (
                      <Pill className="w-3 h-3 text-brand-primary" />
                    )}
                    {pack.quantity}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-brand-navy">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-mono">({product.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Right CTA Tab Strip */}
        <div className="md:w-32 bg-slate-50/80 border-t md:border-t-0 md:border-l border-brand-border-subtle p-4 flex md:flex-col items-center justify-center shrink-0">
          <Button variant="primary" size="sm" asChild className="w-full shadow-none group/btn">
            <a href={targetHref} className="flex items-center justify-center gap-1.5 text-xs font-bold">
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Grid Card Layout (for Homepage / Bento Showcase)
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-brand-border-subtle p-6 transition-all duration-300 hover:shadow-hud-glow hover:border-brand-primary/40 hover:-translate-y-1',
        className
      )}
    >
      <div>
        {/* Category & Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge variant="primary" size="sm">
            {product.category}
          </Badge>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {product.arabicSubtitle}
          </span>
        </div>

        {/* Visual Box Placeholder */}
        <div className="h-44 w-full rounded-xl bg-gradient-to-b from-slate-50 to-blue-50/50 flex flex-col items-center justify-center p-4 border border-slate-100 mb-5 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-primary mb-2 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            {product.brandLine}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-heading text-xl font-bold text-brand-navy group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs font-semibold text-brand-primary tracking-wide mb-2">
          {product.subtitle}
        </p>
        <p className="text-xs text-brand-text-muted leading-relaxed line-clamp-3 mb-4">
          {product.description}
        </p>
      </div>

      {/* Footer Area */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        {/* Pack Sizes */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-brand-text-muted">Available:</span>
          <div className="flex items-center gap-1">
            {product.packSizes.map((pack, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700"
              >
                {pack.quantity}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" size="sm" asChild className="w-full justify-between hover:bg-brand-primary hover:text-white transition-all">
          <a href={targetHref}>
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
};
