import Link from 'next/link';
import { ShieldCheck, Microscope, HeartHandshake, ArrowLeft } from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function ArabicOurStoryPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            تاريخنا ورسالتنا العلمية
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            قصتنا ورؤيتنا
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            الجمع بين طب الأعشاب الأصيل وعلم الأدوية الجزيئي الحديث لتطوير حلول صحية وعلاجية نباتية فائقة الفاعلية ومعيارية الدقة.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Core Philosophy Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light">
              نشأة وتأسيس Naturals 4be
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
              تركيبات رائدة تهدف إلى استدامة الصحة وطول العمر
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              انطلاقاً من القناعة الراسخة بأن المكملات الغذائية اليومية يجب أن تخضع لنفس المعايير الدوائية الصارمة التي تخضع لها الأدوية الموصوفة طبياً، أسست <strong>ميراج فارما (Mirage Pharma)</strong> قطاع <strong>Naturals 4be</strong> للقضاء على التركيبات العشوائية ضعيفة الامتصاص المليئة بالمواد المالئة عديمة الجدوى.
            </p>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              كل مركب داخل محفظتنا الدوائية — بدءاً من محفزات الطاقة المعايرة في <em>Man Edge</em>، إلى النسبة الفسيولوجية المثبتة 40:1 في <em>Inositol 40:1</em>، والفولات النشط ميثيل تيتراهيدروفولات — تتم معايرته بأعلى درجات الدقة الإكلينيكية، مدعوماً بأبحاث محكمة وملفات تحليل دوائي معتمدة.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#041B3B] dark:to-[#020F24] p-8 border border-brand-primary/20 dark:border-white/10 shadow-lg space-y-6 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold shrink-0">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    المعايرة الجزيئية الدقيقة
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    صفر بودرة نباتية عشوائية دون شهادات تحليل كروماتوغرافي HPLC تثبت نقاء المادة الفعالة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green text-white flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    النقاء وفق معايير التصنيع الدوائي GxP
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    التصنيع حصراً في غرف نظيفة معتمدة وفق أعلى معايير cGMP و ISO 22000 الدولية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan text-white flex items-center justify-center font-bold shrink-0">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    الشفافية الطبية والموثوقية
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    إتاحة الوصول المفتوح لكافة نتائج التجارب السريرية وتفاصيل المكونات الفعالة للمرضى والأطباء.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase">
              الركيزة الأولى
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              البحث والتطوير القائم على البراهين
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              نرفض الممارسات التسويقية غير المستندة إلى أسس علمية. يبدأ كل مستحضر لدينا بدراسة إكلينيكية مستفيضة ومراجعة منهجية لجرعات الامتصاص والتحليل الميتري.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-green dark:text-emerald-400 uppercase">
              الركيزة الثانية
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              المعايرة الصيدلانية الصارمة
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              نضمن ثبات تركيز المواد الفعالة في كل كبسولة من أول حبة وحتى آخر تشغيلة، مع إخضاع الشحنات لفحوصات ميكروبيولوجية وخلو المعادن الثقيلة.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-cyan dark:text-brand-cyan-light uppercase">
              الركيزة الثالثة
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              سلاسل التبريد والتتبع الرقمي
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              حماية المركبات الحساسة للحرارة عبر مستودعات مبردة وشاحنات مراقبة رقمياً بأجهزة استشعار IoT على مدار الساعة لضمان وصول المنتج بكامل فاعليته.
            </p>
          </Card>
        </section>

        {/* CTA Bar */}
        <div className="rounded-3xl bg-gradient-to-r from-[#023368] to-[#0a66c2] dark:from-[#011B3B] dark:to-[#041B3B] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl border border-transparent dark:border-white/10 transition-colors">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            مستعد لاكتشاف أثر النقاء الإكلينيكي في حياتك؟
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            استكشف مجموعتنا المتكاملة من المستحضرات الدوائية المعتمدة والمصممة خصيصاً لدعم صحتك وحيوية أسرتك.
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
