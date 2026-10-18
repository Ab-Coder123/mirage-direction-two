import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Pill,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Star,
  Award,
  BookOpen,
} from 'lucide-react';
import { MOCK_PRODUCTS_AR, MOCK_REVIEWS_AR, Product } from '@mirage/types';
import { Button, Card, ReviewCard } from '@mirage/ui';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS_AR.map((p) => ({
    slug: p.slug,
  }));
}

export default async function ArabicProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product: Product | undefined = MOCK_PRODUCTS_AR.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const productReviews = MOCK_REVIEWS_AR.filter(
    (r) =>
      r.productName.toLowerCase().includes(product.slug.replace(/-/g, ' ')) ||
      r.productName.toLowerCase().includes(product.name.toLowerCase()) ||
      product.name.toLowerCase().includes(r.productName.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50/60 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Breadcrumbs Strip */}
      <div className="bg-white dark:bg-[#041B3B] border-b border-brand-border-subtle dark:border-white/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-brand-text-muted dark:text-slate-400">
          <Link href="/ar" className="hover:text-brand-primary dark:hover:text-brand-cyan-light transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/ar/products" className="hover:text-brand-primary dark:hover:text-brand-cyan-light transition-colors">
            المستحضرات الدوائية
          </Link>
          <span>/</span>
          <span className="text-brand-navy dark:text-white font-bold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Link */}
        <Link
          href="/ar/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary dark:text-brand-cyan-light hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى جميع المستحضرات</span>
        </Link>

        {/* Product Monument Showcase */}
        <div className="rounded-3xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Visual Showcase (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-[#020F24] dark:via-[#031530] dark:to-[#020F24] border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-inner">
              {product.heroImage ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={product.heroImage}
                    alt={product.name}
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
                <span>معايير GxP الدوائية</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Award className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light shrink-0" />
                <span>درجة نقاء إكلينيكية</span>
              </div>
            </div>
          </div>

          {/* Formulation Profile (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan dark:text-brand-cyan-light font-bold block mb-1">
                  تركيبة معتمدة من {product.brandLine}
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
                  {product.name}
                </h1>
                <p className="font-heading text-lg font-semibold text-brand-primary dark:text-brand-cyan-light mt-1">
                  {product.subtitle}
                </p>
              </div>

              {/* Arabic Regulatory Pill */}
              <div className="bg-slate-100 dark:bg-[#020F24] px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200">
                {product.arabicSubtitle}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-brand-navy dark:text-white">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400">({product.reviewsCount} تقييم موثق من الأطباء والمرضى)</span>
            </div>

            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Pack Sizes */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy dark:text-white block">
                العبوات المتوفرة:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {product.packSizes.map((pack, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-[#020F24] text-brand-navy dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm"
                  >
                    <Pill className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light" />
                    <span>
                      {pack.quantity} {pack.unit === 'capsules' ? 'كبسولة' : pack.unit === 'ml' ? 'مل' : pack.unit}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Dosage & Clinical Instructions */}
            {product.dosageInstructions && (
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-[#020F24]/80 border border-brand-primary/20 dark:border-brand-primary/30 space-y-1">
                <span className="text-xs font-bold text-brand-navy dark:text-brand-cyan-light block uppercase tracking-wider">
                  طريقة الاستخدام والجرعة الموصى بها:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {product.dosageInstructions}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Button variant="primary" size="lg" asChild className="font-bold">
                <Link href="/ar/contact">
                  طلب توريد للصيدليات والمراكز
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/ar/documents" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light" />
                  <span>ملف الأبحاث الإكلينيكية</span>
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
                <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
                  المركبات الفعالة والخلاصات النباتية المعيارية
                </h3>
                <p className="text-xs sm:text-sm text-brand-text-muted dark:text-slate-400 mt-1">
                  خلاصات نقية ذات درجة صيدلانية مستخدمة في تركيبة {product.name}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/ar/documents" className="text-xs">
                  الدوسيه العلمي الكامل ←
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.rawMaterials.map((rm) => (
                <Card key={rm.id} variant="glass" className="p-5">
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <h4 className="font-heading font-bold text-base text-brand-navy dark:text-white">
                      {rm.name}
                    </h4>
                    {rm.botanicalName && (
                      <span className="text-xs italic text-brand-primary dark:text-brand-cyan-light font-mono" dir="ltr">
                        ({rm.botanicalName})
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
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10 text-xs text-brand-navy/90 dark:text-slate-200 bg-brand-surface dark:bg-[#020F24] p-2 rounded-lg">
                      <strong className="text-brand-navy dark:text-brand-cyan-light font-bold">الآلية البيوكيميائية للعمل: </strong>
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
              الأبحاث السريرية المنشورة والموثقة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.clinicalEvidences.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase block mb-1">
                      {ev.journalName} {ev.year ? `(${ev.year})` : ''}
                    </span>
                    <h5 className="font-heading font-bold text-xs text-brand-navy dark:text-white leading-snug">
                      {ev.paperTitle}
                    </h5>
                    {ev.keyFinding && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 p-2 rounded-lg bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 italic">
                        "{ev.keyFinding}"
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
                      <span>رابط البحث المفهرس DOI</span>
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
              آراء الأطباء والمرضى الموثقة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.map((rev) => (
                <ReviewCard key={rev.id} review={rev} isArabic={true} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
