'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  Microscope,
  Pill,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';
import { MOCK_PRODUCTS_AR } from '@mirage/types';
import { Button, RawMaterialCard, ClinicalEvidenceCard } from '@mirage/ui';

export default function ArabicDocumentsPage() {
  const [selectedProductSlug, setSelectedProductSlug] = React.useState<string>('man-edge');

  const activeProduct =
    MOCK_PRODUCTS_AR.find((p) => p.slug === selectedProductSlug) || MOCK_PRODUCTS_AR[0]!;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner (matching Hetero Cure Image 4) */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <div>
            <span className="font-heading font-black text-xs uppercase tracking-widest text-brand-cyan-light flex items-center justify-center md:justify-start gap-1.5 mb-2">
              <Microscope className="w-4 h-4" />
              الأبحاث السريرية والملفات الرقابية SmPC
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white">
              الملفات والأبحاث
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
              نساعدك على التمتع بحياة صحية عبر شفافية الأبحاث السريرية والتحليل المعياري للمواد الفعالة.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xs font-mono text-slate-200">
            <span className="text-emerald-400 font-bold">دوسيهات علمية محكمة</span> • وصول مفتوح
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Product Formulation Switcher Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-brand-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-brand-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              اختر الدوسيه العلمي:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {MOCK_PRODUCTS_AR.map((prod) => {
              const active = prod.slug === selectedProductSlug;
              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductSlug(prod.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {prod.name}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`جاري تحميل الدوسيه السريري المعتمد لمستحضر ${activeProduct.name}...`)}
            className="text-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" />
            <span>تحميل الدوسيه (PDF)</span>
          </Button>
        </div>

        {/* Selected Product Banner Card */}
        <div className="rounded-3xl bg-white border border-brand-border-subtle p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-blue-100 flex items-center justify-center text-brand-primary shrink-0 shadow-inner overflow-hidden p-1.5">
              {activeProduct.heroImage ? (
                <img
                  src={activeProduct.heroImage}
                  alt={activeProduct.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand-primary uppercase">
                  {activeProduct.brandLine}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-brand-text-muted font-medium">
                  {activeProduct.category}
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-brand-navy mt-0.5">
                {activeProduct.name}
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-muted mt-1 max-w-xl">
                {activeProduct.subtitle}
              </p>
            </div>
          </div>

          <Button variant="primary" size="md" asChild className="shrink-0 font-bold">
            <Link href={`/ar/products/${activeProduct.slug}`} className="flex items-center gap-2">
              <span>عرض تفاصيل التركيبة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </Button>
        </div>

        {/* Section 1: Standardized Raw Materials */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary">
              تكوين التركيبة الدوائية
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              المواد الخام الفعالة والخلاصات المعيارية
            </h3>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1 max-w-2xl">
              تخضع جميع المركبات النباتية والدوائية لاختبارات التحليل الكروماتوغرافي السائل (HPLC) للتحقق من نسب النقاوة والفاعلية الحيوية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeProduct.rawMaterials && activeProduct.rawMaterials.length > 0 ? (
              activeProduct.rawMaterials.map((material) => (
                <RawMaterialCard key={material.id} material={material} isArabic={true} />
              ))
            ) : (
              <p className="text-sm text-brand-text-muted">
                تفاصيل المواد الخام متوفرة في ملف SmPC الكامل.
              </p>
            )}
          </div>
        </section>

        {/* Section 2: Clinical Evidence & Published Trials */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
              التوثيق السريري
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-navy mt-1">
              الدراسات الإكلينيكية والأبحاث المنشورة
            </h3>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1 max-w-2xl">
              تعتمد تركيبات Naturals 4be على أوراق بحثية منشورة في دوريات طبية دولية محكمة ومفهرسة عبر DOI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProduct.clinicalEvidences && activeProduct.clinicalEvidences.length > 0 ? (
              activeProduct.clinicalEvidences.map((evidence) => (
                <ClinicalEvidenceCard key={evidence.id} evidence={evidence} isArabic={true} />
              ))
            ) : (
              <p className="text-sm text-brand-text-muted">
                الأبحاث السريرية مفصلة بالكامل في ملف الدوسيه المرفق.
              </p>
            )}
          </div>
        </section>

        {/* Regulatory Clearance Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#023368] to-[#0a66c2] text-white p-8 sm:p-10 shadow-lg border border-white/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xl text-white">
                الامتثال والتسجيل الرقابي المعتمد
              </h4>
              <p className="text-xs text-slate-200">
                مطابقة لمعايير الهيئة المصرية للدواء والمواصفات القياسية الأوروبية لمأمونية المكملات
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            تخضع جميع منشآت التصنيع التابعة لميراج فارما ومختبرات Naturals 4be لعمليات تدقيق دورية صارمة تشمل معايير ممارسات التصنيع الجيد (cGMP)، ونظام إدارة سلامة الغذاء (ISO 22000)، مع توثيق كامل لدفعات الإنتاج لضمان التتبع الرقمي وسلاسل التبريد الموثوقة.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-300">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4" />
              <span>شهادات تحليل HPLC لكل تشغيلة</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>خالٍ من الهرمونات والمواد المحظورة</span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
