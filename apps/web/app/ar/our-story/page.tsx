import Link from 'next/link';
import {
  ShieldCheck,
  Microscope,
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  Globe2,
  Calendar,
  Briefcase,
  Award,
  MapPin,
} from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function ArabicOurStoryPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            تأسست عام 2019 • Healthy Life
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            ميراج فارما — MIRAGE PHARMA
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium max-w-3xl mx-auto">
            إحدى كبرى الشركات الرائدة في مجال التصنيع والتجارة للمكملات الغذائية والأدوية في مصر والشرق الأوسط.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Executive Corporate Profile & New Vision New Era */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light text-xs font-mono font-bold uppercase tracking-wider">
              النبذة التعريفية للشركة
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
              رؤية جديدة.. عصر جديد في صناعة الرعاية الصحية
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              انطلقت شركة <strong>ميراج فارما (Mirage Pharma)</strong> في عام <strong>2019</strong>، وتطورت لتصبح واحدة من أكبر الكيانات الصناعية والتجارية في قطاع المكملات الغذائية وصناعة الدواء، برأس مال يبلغ <strong>50 مليون جنيه مصري</strong> وحجم أعمال سنوي يتجاوز <strong>80 مليون جنيه مصري</strong>.
            </p>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#041B3B] border-r-4 border-brand-primary dark:border-brand-cyan-light shadow-sm space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light block">
                New Vision • New Era — رؤية جديدة لعصر جديد
              </span>
              <p className="text-sm sm:text-base text-brand-navy dark:text-slate-200 font-medium leading-relaxed">
                &laquo;أن نكون في طليعة صناعة الرعاية الصحية في تقديم مستحضرات دوائية متطورة وعلامات تجارية رائدة للمرضى في الأسواق التي نخدمها. يتم اختيار مستحضراتنا المستهدفة بعناية فائقة لتلبية وتحقيق الرفاه الصحي المتكامل.&raquo;
              </p>
            </div>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              يرتكز جوهر استراتيجية الشركة على بناء محفظة واسعة من العلامات التجارية الفريدة والمستحضرات الدوائية المثيلة (Generics) من خلال <strong>التطوير الذاتي (Self Development)</strong>، بالإضافة إلى <strong>تمثيل الشركات الأوروبية والأمريكية</strong> في مصر والشرق الأوسط — لمواجهة التحديات التطويرية والتصنيعية الدقيقة وتقديم خيارات علاجية عالية الجودة تلبي الاحتياجات الصحية المستقبلية للمجتمع.
            </p>
          </div>

          {/* Left Column: Official Corporate Fact Sheet Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#041B3B] dark:to-[#020F24] p-8 border border-brand-primary/20 dark:border-white/10 shadow-lg space-y-6 transition-colors">
              <div className="border-b border-brand-primary/15 dark:border-white/10 pb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light">
                  البيانات الرسمية المعتمدة
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white mt-1">
                  بطاقة تعريف الشركة
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Calendar className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    تاريخ التأسيس
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    2019
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Briefcase className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    مجال العمل
                  </span>
                  <span className="font-heading font-extrabold text-base text-brand-navy dark:text-white">
                    صناعي وتجاري
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Building2 className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    رأس المال
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    50 مليون ج.م
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <TrendingUp className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    حجم الأعمال
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    80 مليون ج.م
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Users className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    عدد الموظفين
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    75 + 500
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <MapPin className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="text-[11px] font-mono text-brand-text-muted dark:text-slate-400 block">
                    المقر والفروع
                  </span>
                  <span className="font-heading font-extrabold text-base text-brand-navy dark:text-white">
                    القاهرة، مصر
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light shrink-0" />
                  <span className="text-xs font-bold text-brand-navy dark:text-white">
                    الخدمات والأنشطة الرئيسية:
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted dark:text-slate-300 leading-relaxed">
                  تصنيع وتجارة المكملات الغذائية والأدوية في جمهورية مصر العربية وأسواق الشرق الأوسط.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light flex items-center justify-center mb-2">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase">
              الركيزة الأولى
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              التطوير الذاتي والابتكار الدوائي
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              بناء محفظة متكاملة من العلامات التجارية الفريدة والمستحضرات المثيلة المصممة للتغلب على تحديات التصنيع الدقيقة ورفع التوافر الحيوي.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-2">
              <Globe2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-green dark:text-emerald-400 uppercase">
              الركيزة الثانية
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              تمثيل الشركات الأوروبية والأمريكية
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              التمثيل التجاري والعلمي لكبرى شركات الأدوية والمكملات الحيوية الأوروبية والأمريكية في مصر ومنطقة الشرق الأوسط.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan dark:text-brand-cyan-light flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-cyan dark:text-brand-cyan-light uppercase">
              الركيزة الثالثة
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              خيارات علاجية عالية الجودة
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              توفير حلول علاجية متطورة تلبي الاحتياجات الصحية غير الملباة للمجتمع، وفق أعلى معايير الجودة الدوائية العالمية.
            </p>
          </Card>
        </section>

        {/* CTA Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-[#023368] to-[#0a66c2] dark:from-[#011B3B] dark:to-[#041B3B] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-transparent dark:border-white/10 transition-colors">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            استكشف محفظة مستحضرات ميراج فارما
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            تصفح مجموعتنا المتكاملة من المكملات الغذائية والأدوية المعتمدة والمصممة خصيصاً لدعم صحة المجتمع.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="primary" size="lg" asChild className="bg-white text-brand-navy hover:bg-slate-100 font-bold shadow-lg">
              <Link href="/ar/products" className="flex items-center gap-2">
                <span>تصفح المستحضرات</span>
                <ArrowLeft className="w-4 h-4 text-brand-primary" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/40 text-white hover:bg-white/10">
              <Link href="/ar/contact">
                تواصل مع فريقنا العلمي
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
