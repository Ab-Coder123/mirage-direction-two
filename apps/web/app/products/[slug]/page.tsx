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
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_REVIEWS, Product } from '@mirage/types';
import { Button, Card, ReviewCard } from '@mirage/ui';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product: Product | undefined = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const productReviews = MOCK_REVIEWS.filter(
    (r) => r.productName.toLowerCase() === product.name.toLowerCase()
  );

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* Breadcrumbs Strip */}
      <div className="bg-white border-b border-brand-border-subtle py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-brand-text-muted">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-brand-navy font-bold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Product Monument Showcase */}
        <div className="rounded-3xl bg-white border border-brand-border-subtle p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 border border-slate-200/60 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
              <div className="w-28 h-28 rounded-3xl bg-white shadow-xl border border-white flex items-center justify-center text-brand-primary mb-4">
                <Sparkles className="w-14 h-14" />
              </div>
              <h2 className="font-heading font-black text-2xl text-brand-navy">
                {product.name}
              </h2>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
                {product.brandLine}
              </span>
              <div className="mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {product.category}
              </div>
            </div>

            {/* Quality Seals */}
            <div className="mt-4 grid grid-cols-2 gap-3 w-full">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GxP Standardized</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <Award className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Clinical Grade</span>
              </div>
            </div>
          </div>

          {/* Right Column: Formulation Profile */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-bold block mb-1">
                  {product.brandLine} Formulation
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
                  {product.name}
                </h1>
                <p className="font-heading text-lg font-semibold text-brand-primary mt-1">
                  {product.subtitle}
                </p>
              </div>

              {/* Arabic Regulatory Pill */}
              <div className="bg-slate-100 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                {product.arabicSubtitle}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-brand-navy">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewsCount} verified patient reviews)</span>
            </div>

            <p className="text-sm sm:text-base text-brand-text-muted leading-relaxed">
              {product.description}
            </p>

            {/* Pack Sizes */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy block">
                Available Packaging:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {product.packSizes.map((pack, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 text-brand-navy border border-slate-200 shadow-sm"
                  >
                    <Pill className="w-3.5 h-3.5 text-brand-primary" />
                    <span>{pack.quantity} {pack.unit}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Dosage & Clinical Instructions */}
            {product.dosageInstructions && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-brand-primary/20 space-y-1">
                <span className="text-xs font-bold text-brand-navy block uppercase tracking-wider">
                  Recommended Administration:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {product.dosageInstructions}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button variant="primary" size="lg" asChild className="font-bold">
                <Link href="/contact">
                  Request Prescription Supply
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span>View Clinical Evidence</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Ingredients & Raw Materials Breakdown */}
        {product.rawMaterials && product.rawMaterials.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
                  Active Botanical & Chemical Compounds
                </h3>
                <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
                  Standardized pharmaceutical extracts used in {product.name}
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
                  <h4 className="font-heading font-bold text-base text-brand-navy mb-1">
                    {rm.name}
                  </h4>
                  <ul className="space-y-1.5 mt-2 text-xs text-brand-text-muted">
                    {rm.keyBenefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Clinical Studies Section */}
        {product.clinicalEvidences && product.clinicalEvidences.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
              Published Clinical Evidence
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.clinicalEvidences.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-white border border-brand-border-subtle shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-bold text-brand-primary uppercase block mb-1">
                      {ev.journalName}
                    </span>
                    <h5 className="font-heading font-bold text-xs text-brand-navy leading-snug">
                      {ev.paperTitle}
                    </h5>
                  </div>
                  {ev.doiUrl && (
                    <a
                      href={ev.doiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-[11px] font-bold text-brand-cyan hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Indexed Journal DOI</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews for this product */}
        {productReviews.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-brand-border-subtle">
            <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
              Physician & Patient Feedback
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
