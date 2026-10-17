import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Microscope,
  HeartHandshake,
  Award,
} from 'lucide-react';
import { MOCK_PRODUCTS_AR, MOCK_REVIEWS_AR } from '@mirage/types';
import { Button, Badge, ProductCard, ReviewCard } from '@mirage/ui';

export default function ArabicHomePage() {
  const featuredProducts = MOCK_PRODUCTS_AR;

  return (
    <main className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-brand-surface to-white py-16 md:py-24 border-b border-brand-border-subtle telemetry-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>مختبرات Naturals 4be — تركيبات نباتية علاجية متقدمة</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight max-w-4xl mx-auto">
            تركيبات غذائية ودوائية سريرية.. <br />
            <span className="text-brand-primary">مبنية على القيم ومدعومة بالعلوم الطبية</span>
          </h1>

          <p className="text-brand-text-muted text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            نطور حلولاً صحية ودوائية متقدمة تتجاوز المكملات التقليدية. تقدم Naturals 4be منظومة متكاملة من المستحضرات الدوائية والغذائية الوظيفية القائمة على خلاصات نباتية فائقة النقاء وأنظمة امتصاص دوائي حديثة تواكب أعلى المعايير العالمية.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" asChild className="shadow-hud-glow">
              <Link href="/ar/products" className="flex items-center gap-2">
                <span>استكشف المستحضرات الدوائية</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="hover:border-brand-primary">
              <Link href="/ar/documents">
                الدوسيهات والأبحاث الإكلينيكية
              </Link>
            </Button>
          </div>

          {/* Quick Metrics & Scientific Validation Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="w-5 h-5 text-brand-green mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy block">cGMP / GxP</span>
              <span className="text-xs text-brand-text-muted">معايير التصنيع الدوائي</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <Microscope className="w-5 h-5 text-brand-primary mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy block">درجة نقاء دوائية</span>
              <span className="text-xs text-brand-text-muted">خلاصات نباتية معيارية</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <Award className="w-5 h-5 text-brand-cyan mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy block">اعتماد رقابي</span>
              <span className="text-xs text-brand-text-muted">ملفات SmPC موثقة</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <HeartHandshake className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy block">99.4%</span>
              <span className="text-xs text-brand-text-muted">نسبة الرضا الإكلينيكي</span>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PRODUCTS Section (المستحضرات الدوائية) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="primary" size="md">
            محفظة المستحضرات
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
            مستحضراتنا الدوائية المعتمدة
          </h2>
          <p className="text-sm md:text-base text-brand-text-muted max-w-2xl mx-auto">
            حلول علاجية موجهة ومصممة بأعلى درجات الدقة الدوائية وخلاصات المواد الفعالة النقية لتعزيز صحة الإنسان.
          </p>
        </div>

        {/* 5-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="grid"
              isArabic={true}
              readMoreHref={`/ar/products/${product.slug}`}
            />
          ))}
        </div>

        {/* Show More Button */}
        <div className="mt-12 text-center">
          <Button variant="secondary" size="lg" asChild className="px-8 shadow-md">
            <Link href="/ar/products" className="flex items-center gap-2">
              <span>استعراض جميع المستحضرات</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CUSTOMER REVIEWS Section (التقييمات الإكلينيكية) */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50/40 border-t border-brand-border-subtle relative overflow-hidden">
        {/* Background Capsule Atmosphere */}
        <div className="absolute inset-0 opacity-5 pointer-events-none telemetry-grid" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="cyan" size="md">
              التقييمات الإكلينيكية
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
              آراء الأطباء والاستشاريين المعتمدين
            </h2>
            <p className="text-sm md:text-base text-brand-text-muted max-w-2xl mx-auto">
              شهادات وتجارب من كبار الأطباء والاستشاريين والمتعافين في مختلف المستشفيات والمراكز التخصصية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_REVIEWS_AR.map((review) => (
              <ReviewCard key={review.id} review={review} isArabic={true} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
