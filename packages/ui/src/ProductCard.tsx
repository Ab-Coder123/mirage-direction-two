import * as React from 'react';
import { Pill, Droplets, Sparkles, ArrowRight, ArrowLeft, Star, ShieldCheck } from 'lucide-react';
import { Product } from '@mirage/types';
import { cn } from '@mirage/utils';

export interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'row';
  className?: string;
  onReadMore?: (slug: string) => void;
  readMoreHref?: string;
  isArabic?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  variant = 'grid',
  className,
  readMoreHref,
  isArabic = false,
}) => {
  const defaultHref = isArabic ? `/ar/products/${product.slug}` : `/products/${product.slug}`;
  const targetHref = readMoreHref ?? defaultHref;

  // Localized category name
  const categoryName = React.useMemo(() => {
    if (!isArabic) return product.category;
    switch (product.category) {
      case 'Men Health':
        return 'صحة الرجل';
      case 'Women Health':
        return 'صحة المرأة';
      case 'Vitamins & Minerals':
        return 'فيتامينات ومعادن';
      case 'Maternal Care':
        return 'رعاية الأمومة';
      case 'Pediatrics & Immunity':
        return 'الأطفال والمناعة';
      default:
        return product.category;
    }
  }, [isArabic, product.category]);

  // Clean regulatory status
  const regulatoryText = isArabic ? 'مكمل غذائي معتمد' : 'Dietary Supplement';

  // ---------------------------------------------------------------------------
  // Variant: ROW (Catalog List View)
  // ---------------------------------------------------------------------------
  if (variant === 'row') {
    return (
      <div
        className={cn(
          'group relative flex flex-col md:flex-row items-stretch overflow-hidden rounded-2xl bg-white dark:bg-[#041B3B] border border-slate-200/80 dark:border-white/10 shadow-2xs transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 dark:hover:shadow-brand-primary/10 hover:border-brand-primary/40 dark:hover:border-brand-primary/50',
          className
        )}
      >
        {/* Left Product Pedestal Showcase */}
        <div className="relative flex items-center justify-center p-6 md:w-64 bg-gradient-to-b from-slate-50/90 via-blue-50/20 to-slate-50/90 dark:from-[#020F24] dark:via-[#041B3B]/60 dark:to-[#020F24] border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/10 shrink-0 overflow-hidden">
          {/* Ambient Radial Spotlight */}
          <div className="absolute w-36 h-36 rounded-full bg-brand-primary/5 dark:bg-brand-primary/15 blur-2xl pointer-events-none group-hover:bg-brand-primary/10 dark:group-hover:bg-brand-primary/25 transition-all duration-500" />

          <div className="relative w-44 h-44 flex items-center justify-center rounded-2xl bg-white dark:bg-[#020F24] p-3 shadow-sm border border-slate-100/80 dark:border-white/10 overflow-hidden group-hover:shadow-md transition-all duration-300">
            {product.heroImage ? (
              <img
                src={product.heroImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(2,15,36,0.1)] group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary dark:text-brand-cyan-light mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="font-heading font-extrabold text-sm text-brand-navy dark:text-white block tracking-tight">
                  {product.name}
                </span>
                <span className="text-[10px] text-brand-text-muted dark:text-slate-400 font-mono uppercase tracking-wider block">
                  {product.brandLine}
                </span>
              </div>
            )}
          </div>

          {/* Floating Category Tag */}
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-white/95 dark:bg-[#020F24]/90 text-brand-primary dark:text-brand-cyan-light border border-brand-primary/20 dark:border-brand-primary/30 shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
              <span>{categoryName}</span>
            </span>
          </div>
        </div>

        {/* Center Content Body */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Top Bar: Formulation Kicker & Clean Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cyan dark:text-brand-cyan-light block mb-1">
                  {product.brandLine} Formulation
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-brand-navy dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-cyan-light transition-colors tracking-tight">
                  {product.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-0.5">
                  {product.subtitle}
                </p>
              </div>

              {/* Clean Regulatory Status Tag */}
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-[#020F24] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{regulatoryText}</span>
                </span>
              </div>
            </div>

            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed line-clamp-2 mt-2">
              {product.description}
            </p>
          </div>

          {/* Bottom Bar: Pack Sizes & Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
            {/* Pack Size Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-text-muted dark:text-slate-400 font-medium flex items-center gap-1">
                <Pill className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light shrink-0" />
                <span>{isArabic ? 'العبوات المتاحة:' : 'Pack Sizes:'}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {product.packSizes.map((pack, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-slate-200 border border-slate-200/80 dark:border-white/10 group-hover:border-brand-primary/30 transition-colors shadow-2xs whitespace-nowrap"
                  >
                    {pack.unit === 'ml' ? (
                      <Droplets className="w-3 h-3 text-brand-cyan" />
                    ) : (
                      <Pill className="w-3 h-3 text-brand-primary" />
                    )}
                    <span>{String(pack.quantity).replace(/\s*ml/i, '')} {pack.unit === 'ml' ? 'ml' : isArabic ? 'كبسولة' : 'caps'}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#020F24] px-2.5 py-1 rounded-md border border-slate-100 dark:border-white/10">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-brand-navy dark:text-white">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-mono">
                ({product.reviewsCount} {isArabic ? 'تقييم' : 'reviews'})
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Tab Strip */}
        <div className="md:w-36 bg-slate-50/70 dark:bg-[#020F24]/60 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/10 p-4 flex md:flex-col items-center justify-center shrink-0">
          <a
            href={targetHref}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 bg-white dark:bg-[#020F24] text-brand-navy dark:text-white border border-slate-200/90 dark:border-white/10 shadow-2xs transition-all duration-200 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary group-hover:shadow-md cursor-pointer"
          >
            <span>{isArabic ? 'عرض التفاصيل' : 'View Product'}</span>
            {isArabic ? (
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            )}
          </a>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant: GRID (Bento / Product Showcase Cards)
  // ---------------------------------------------------------------------------
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-[#041B3B] border border-slate-200/80 dark:border-white/10 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 dark:hover:shadow-brand-primary/10 hover:border-brand-primary/40 dark:hover:border-brand-primary/50 hover:-translate-y-1.5',
        className
      )}
    >
      <div>
        {/* Top Header Row: Category Badge + Star Rating (never clips/wraps) */}
        <div className="flex items-center justify-between gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-heading font-bold bg-blue-50/80 dark:bg-brand-primary/15 text-brand-primary dark:text-brand-cyan-light border border-brand-primary/20 dark:border-brand-primary/30 tracking-wide shrink">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
            <span className="whitespace-nowrap">{categoryName}</span>
          </span>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#020F24] px-2 py-0.5 rounded-full border border-slate-200/70 dark:border-white/10 shrink-0 shadow-2xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Visual Product Pedestal Showcase */}
        <div className="relative w-full h-48 rounded-2xl bg-gradient-to-b from-slate-50/90 via-blue-50/20 to-slate-50/90 dark:from-[#020F24] dark:via-[#041B3B]/60 dark:to-[#020F24] border border-slate-100/90 dark:border-white/10 p-3 flex flex-col items-center justify-center mb-4 overflow-hidden transition-all duration-500 group-hover:border-brand-primary/25 group-hover:bg-gradient-to-b group-hover:from-blue-50/30 group-hover:to-slate-50 dark:group-hover:border-brand-primary/40 dark:group-hover:from-[#031530] dark:group-hover:to-[#020F24]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-32 h-32 rounded-full bg-brand-primary/5 dark:bg-brand-primary/15 blur-2xl pointer-events-none group-hover:bg-brand-primary/10 dark:group-hover:bg-brand-primary/25 transition-all duration-500" />

          {product.heroImage ? (
            <img
              src={product.heroImage}
              alt={product.name}
              className="max-h-40 max-w-full object-contain drop-shadow-[0_8px_16px_rgba(2,15,36,0.12)] group-hover:scale-108 group-hover:-translate-y-1 transition-all duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#020F24] shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-brand-primary dark:text-brand-cyan-light mb-2 mx-auto group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                {product.brandLine}
              </span>
            </div>
          )}
        </div>

        {/* Clinical Kicker: Brand Line & Regulatory Status */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cyan dark:text-brand-cyan-light">
            {product.brandLine}
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-400">
            {regulatoryText}
          </span>
        </div>

        {/* Product Title & Subtitle */}
        <h3 className="font-heading text-lg font-extrabold text-brand-navy dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-cyan-light transition-colors tracking-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 mt-0.5 mb-2 line-clamp-1">
          {product.subtitle}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 font-normal min-h-[2.25rem]">
          {product.description}
        </p>
      </div>

      {/* Footer Area: Pack Sizes & Single-Line CTA Button */}
      <div className="pt-3.5 border-t border-slate-100 dark:border-white/10 space-y-3">
        {/* Pack Sizes */}
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
            <Pill className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light shrink-0" />
            <span>{isArabic ? 'العبوات:' : 'Available:'}</span>
          </span>
          <div className="flex items-center gap-1">
            {product.packSizes.map((pack, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-slate-200 border border-slate-200/80 dark:border-white/10 group-hover:border-brand-primary/30 transition-colors shadow-2xs whitespace-nowrap"
              >
                {String(pack.quantity).replace(/\s*ml/i, '')}{pack.unit === 'ml' ? (isArabic ? ' مل' : ' ml') : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Single-line Action CTA Button */}
        <a
          href={targetHref}
          className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold font-heading flex items-center justify-between bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-white border border-slate-200/90 dark:border-white/10 shadow-2xs transition-all duration-200 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary group-hover:shadow-md cursor-pointer"
        >
          <span className="tracking-wide">
            {isArabic ? 'عرض التفاصيل' : 'View Product'}
          </span>
          <div className="w-5 h-5 rounded-md bg-white/90 dark:bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            {isArabic ? (
              <ArrowLeft className="w-3 h-3 text-brand-primary dark:text-brand-cyan-light group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
            ) : (
              <ArrowRight className="w-3 h-3 text-brand-primary dark:text-brand-cyan-light group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            )}
          </div>
        </a>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
