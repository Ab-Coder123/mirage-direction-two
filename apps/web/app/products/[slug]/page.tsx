import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Pill,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Star,
  Award,
  BookOpen,
  Zap,
  Stethoscope,
} from 'lucide-react';
import { MOCK_REVIEWS } from '@mirage/types';
import { loadProductBySlugFromDb, loadProductsFromDb } from '@mirage/db/server';
import { Button, Badge, Card, ReviewCard } from '@mirage/ui';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { products } = await loadProductsFromDb({ locale: 'en' });
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const { product } = await loadProductBySlugFromDb(slug, 'en');

  if (!product) {
    notFound();
  }

  const productReviews = MOCK_REVIEWS.filter(
    (r) => r.productName.toLowerCase() === product.name.toLowerCase()
  );

  return (
    <main className="min-h-screen bg-slate-50/60 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Breadcrumbs Strip */}
      <div className="bg-white dark:bg-[#041B3B] border-b border-brand-border-subtle dark:border-white/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-brand-text-muted dark:text-slate-400">
          <Link href="/" className="hover:text-brand-primary dark:hover:text-brand-cyan-light transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-primary dark:hover:text-brand-cyan-light transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-brand-navy dark:text-white font-bold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary dark:text-brand-cyan-light hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Product Monument Showcase */}
        <div className="rounded-3xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-[#020F24] dark:via-[#031530] dark:to-[#020F24] border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-inner">
              {product.heroImage ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={product.heroImage}
                    alt={product.name}
                    width={700}
                    height={438}
                    fetchPriority="high"
                    decoding="async"
                    className="max-h-64 sm:max-h-72 max-w-full object-contain drop-shadow-xl"
                  />
                  <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light border border-brand-primary/20 dark:border-brand-primary/30">
                    {product.category}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-28 h-28 rounded-3xl bg-white dark:bg-[#020F24] shadow-xl border border-white dark:border-white/10 flex items-center justify-center text-brand-primary dark:text-brand-cyan-light mb-4">
                    <Sparkles className="w-14 h-14" />
                  </div>
                  <h2 className="font-heading font-black text-2xl text-brand-navy dark:text-white">
                    {product.name}
                  </h2>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
                    {product.brandLine}
                  </span>
                  <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light border border-brand-primary/20 dark:border-brand-primary/30">
                    {product.category}
                  </div>
                </>
              )}
            </div>

            {/* Quality Seals */}
            <div className="mt-4 grid grid-cols-2 gap-3 w-full">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>GxP Standardized</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Award className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light shrink-0" />
                <span>Clinical Grade</span>
              </div>
            </div>
          </div>

          {/* Right Column: Formulation Profile */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan dark:text-brand-cyan-light font-bold block mb-1">
                  {product.brandLine} Formulation
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
                  {product.name}
                </h1>
                <p className="font-heading text-lg font-semibold text-brand-primary dark:text-brand-cyan-light mt-1">
                  {product.subtitle}
                </p>
              </div>

              {/* Regulatory Pill */}
              <div className="bg-slate-100 dark:bg-[#020F24] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
                {product.arabicSubtitle}
              </div>
            </div>

            {product.tagline && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-cyan/10 dark:from-brand-primary/20 dark:to-brand-cyan/10 border border-brand-primary/20 dark:border-brand-primary/30 text-xs sm:text-sm font-heading font-bold text-brand-navy dark:text-white">
                {product.tagline}
              </div>
            )}

            {/* Rating & Commercial Price */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {product.reviewsCount > 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-brand-navy dark:text-white">{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({product.reviewsCount} verified reviews)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Official Mirage Pharma Formulation</span>
                </div>
              )}

              {product.priceInfo && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/80 dark:border-emerald-700 text-xs sm:text-sm font-mono font-extrabold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                  <span>Price:</span>
                  <span>{product.priceInfo}</span>
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Pack Sizes & Packaging Details */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy dark:text-white block">
                Available Packaging:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {product.packagingDetails ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm">
                    <Pill className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light" />
                    <span>{product.packagingDetails}</span>
                  </span>
                ) : (
                  product.packSizes.map((pack, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                      <Pill className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light" />
                      <span>{pack.quantity} {pack.unit}</span>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Dosage & Clinical Instructions */}
            {product.dosageInstructions && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#020F24]/80 border border-brand-primary/20 dark:border-brand-primary/30 space-y-1">
                <span className="text-xs font-bold text-brand-navy dark:text-brand-cyan-light block uppercase tracking-wider">
                  Recommended Administration:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {product.dosageInstructions}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button variant="primary" size="lg" asChild className="font-bold">
                <Link href="/contact">
                  Request Clinic / Pharmacy Supply
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light" />
                  <span>View Clinical Evidence</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Synergy Architecture Banner (1 + 1 = 3 Smart Synergy Ratio) */}
        {product.synergyBanner && (
          <section className="rounded-3xl bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#031530] dark:via-[#041B3B] dark:to-[#020F24] text-white p-8 sm:p-10 shadow-lg border border-brand-primary/30 dark:border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Badge variant="cyan" size="md">
                {product.synergyBanner.badge}
              </Badge>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Smart Synergy Mechanism</span>
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              {product.synergyBanner.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-4xl">
              {product.synergyBanner.description}
            </p>
          </section>
        )}

        {/* Clinical Indications Section (e.g. Post-Antibiotic Recovery, IBS & Bloating, Immune Support) */}
        {product.clinicalIndications && product.clinicalIndications.length > 0 && (
          <section className="space-y-6">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light block mb-1">
                Therapeutic Focus Areas
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
                {product.name} — The Trusted Path For:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.clinicalIndications.map((ind, idx) => (
                <Card key={idx} variant="glass" className="p-6 space-y-3 border-t-4 border-t-brand-green">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    {ind.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
                    {ind.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Ingredients & Raw Materials Breakdown */}
        {product.rawMaterials && product.rawMaterials.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
                  Active Botanical &amp; Probiotic Compounds
                </h3>
                <p className="text-xs sm:text-sm text-brand-text-muted dark:text-slate-400 mt-1">
                  Standardized pharmaceutical-grade components in {product.name}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/documents" className="text-xs">
                  Full Scientific Dossier →
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.rawMaterials.map((rm) => (
                <Card key={rm.id} variant="glass" className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <h4 className="font-heading font-bold text-base text-brand-navy dark:text-white">
                      {rm.name}
                    </h4>
                    {rm.botanicalName && (
                      <span className="text-xs font-mono text-brand-primary dark:text-brand-cyan-light">
                        {rm.botanicalName}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 mt-2 text-xs text-brand-text-muted dark:text-slate-300">
                    {rm.keyBenefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {rm.mechanism && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 text-xs bg-slate-50 dark:bg-[#020F24] p-2.5 rounded-lg">
                      <strong className="text-brand-navy dark:text-brand-cyan-light font-bold">Mechanism of Action: </strong>
                      <span className="text-slate-600 dark:text-slate-300">{rm.mechanism}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Clinical Studies Section */}
        {product.clinicalEvidences && product.clinicalEvidences.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
              Published Clinical Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.clinicalEvidences.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase block mb-1">
                      {ev.journalName} {ev.year ? `(${ev.year})` : ''}
                    </span>
                    <h5 className="font-heading font-bold text-xs sm:text-sm text-brand-navy dark:text-white leading-snug">
                      {ev.paperTitle}
                    </h5>
                    {ev.keyFinding && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 italic">
                        &ldquo;{ev.keyFinding}&rdquo;
                      </p>
                    )}
                  </div>
                  {ev.doiUrl && (
                    <a
                      href={ev.doiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-[11px] font-bold text-brand-cyan dark:text-brand-cyan-light hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Indexed Medical Reference (PubMed / DOI)</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews for this product */}
        {productReviews.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-brand-border-subtle dark:border-white/10">
            <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
              Physician &amp; Patient Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
