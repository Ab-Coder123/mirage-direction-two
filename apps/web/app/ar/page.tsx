import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Globe2,
  Microscope,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_PRODUCTS_AR, MOCK_REVIEWS_AR } from '@mirage/types';
import { Button, Badge, ProductCard, ReviewCard } from '@mirage/ui';

export default function ArabicHomePage() {
  const featuredProducts = MOCK_PRODUCTS_AR;

  return (
    <main className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-brand-surface to-white dark:from-[#031530] dark:via-[#020F24] dark:to-[#020F24] py-16 md:py-24 border-b border-brand-border-subtle dark:border-white/10 telemetry-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-brand-cyan-light text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>ميراج فارما (Mirage Pharma) • Healthy Life • تأسست عام 2019</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            رؤية جديدة.. عصر جديد في <br />
            <span className="text-brand-primary dark:text-brand-cyan-light">المكملات الغذائية وصناعة الدواء</span>
          </h1>

          <p className="text-brand-text-muted dark:text-slate-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium">
            انطلقت شركة <strong>ميراج فارما (Mirage Pharma)</strong> في عام 2019 لتصبح واحدة من أكبر الشركات الرائدة في مجال التصنيع والتجارة للمكملات الغذائية والأدوية في مصر والشرق الأوسط، وتقديم خيارات علاجية متطورة تلبي الاحتياجات الصحية للمجتمع.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" asChild className="shadow-hud-glow">
              <Link href="/ar/products" className="flex items-center gap-2">
                <span>استكشف المستحضرات الدوائية</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="hover:border-brand-primary">
              <Link href="/ar/our-story">
                عن الشركة ورؤيتنا
              </Link>
            </Button>
          </div>

          {/* Official Corporate Telemetry Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <Calendar className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white block">2019</span>
              <span className="text-xs text-brand-text-muted dark:text-slate-400">تاريخ التأسيس بالقاهرة</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <Building2 className="w-5 h-5 text-brand-green mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white block">50 مليون ج.م</span>
              <span className="text-xs text-brand-text-muted dark:text-slate-400">رأس مال الشركة</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="w-5 h-5 text-brand-cyan dark:text-brand-cyan-light mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white block">80 مليون ج.م</span>
              <span className="text-xs text-brand-text-muted dark:text-slate-400">حجم الأعمال السنوي</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mx-auto mb-1.5" />
              <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white block">75 + 500</span>
              <span className="text-xs text-brand-text-muted dark:text-slate-400">حجم الكوادر البشرية</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT MIRAGE PHARMA — Corporate Overview Section (عن ميراج فارما) */}
      <section className="py-16 md:py-20 bg-white dark:bg-[#02132B] border-b border-brand-border-subtle dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Badge variant="cyan" size="md">
                عن ميراج فارما — Mirage Pharma
              </Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight leading-tight">
                في طليعة صناعة الرعاية الصحية والدوائية
              </h2>
              <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
                نسعى لأن نكون في طليعة صناعة الرعاية الصحية في تقديم مستحضرات دوائية متطورة وعلامات تجارية رائدة للمرضى في الأسواق التي نخدمها. يتم اختيار مستحضراتنا بعناية فائقة لتلبية وتحقيق الرفاه الصحي المتكامل.
              </p>
              <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
                يرتكز جوهر استراتيجية الشركة على بناء محفظة واسعة من العلامات التجارية الفريدة والمستحضرات الدوائية من خلال <strong>التطوير الذاتي (Self Development)</strong>، و<strong>تمثيل الشركات الأوروبية والأمريكية</strong> في مصر والشرق الأوسط — لمواجهة تحديات التطوير والتصنيع وتوفير خيارات علاجية عالية الجودة تلبي الاحتياجات الصحية المستقبلية للمجتمع.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <Microscope className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    التطوير الذاتي
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    علامات تجارية ومستحضرات نوعية
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <Globe2 className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    وكالات أوروبية وأمريكية
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    تمثيل كبرى الشركات العالمية
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    تصنيع وتجارة
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    المكملات الغذائية والأدوية
                  </span>
                </div>
              </div>
            </div>

            {/* Fact Summary Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-br from-[#023368] to-[#0a66c2] dark:from-[#041B3B] dark:to-[#01142B] text-white p-8 shadow-xl border border-white/10 space-y-5">
                <div className="border-b border-white/15 pb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan-light block">
                    البيانات الأساسية للشركة
                  </span>
                  <h3 className="font-heading text-2xl font-extrabold mt-1">
                    ميراج فارما في أرقام
                  </h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">تاريخ الانطلاق</span>
                    <span className="font-mono font-bold text-white">2019</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">مجال العمل</span>
                    <span className="font-semibold text-white">صناعي وتجاري</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">رأس المال</span>
                    <span className="font-mono font-bold text-brand-cyan-light">50 مليون جنيه مصري</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">حجم الأعمال</span>
                    <span className="font-mono font-bold text-emerald-300">80 مليون جنيه مصري</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">عدد الموظفين</span>
                    <span className="font-mono font-bold text-white">75 + 500</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">المقر الرئيسي والفروع</span>
                    <span className="font-semibold text-white">القاهرة</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-300">نطاق العمل</span>
                    <span className="font-semibold text-white">مصر والشرق الأوسط</span>
                  </li>
                </ul>
              </div>
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
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            مستحضراتنا الدوائية المعتمدة
          </h2>
          <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 max-w-2xl mx-auto">
            مكملات غذائية ومستحضرات دوائية مختارة بعناية فائقة لتلبية وتحقيق الرفاه الصحي للمجتمع.
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
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50/40 dark:from-[#031530] dark:to-[#020F24] border-t border-brand-border-subtle dark:border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none telemetry-grid" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="cyan" size="md">
              التقييمات الإكلينيكية
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
              آراء الأطباء والاستشاريين المعتمدين
            </h2>
            <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 max-w-2xl mx-auto">
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
