import Link from 'next/link';
import { CheckCircle2, Award, ThermometerSnowflake, FileCheck2, ArrowLeft } from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function ArabicQualityPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="vitality" size="md">
            معايير التصنيع الدوائي الصارم GxP
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            الجودة والامتثال الدوائي
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            صرامة المعايير الدوائية مطبقة على التغذية العلاجية: بدءاً من فحص دفعات المواد الخام النباتية وحتى المراقبة المستمرة لمستشعرات سلاسل التبريد الذكية.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Quality Protocols Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              التحليل الكروماتوغرافي HPLC
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              يتم تحليل كل شحنة واردة من الخلاصات النباتية عبر الكروماتوغرافيا السائلة عالية الأداء (HPLC) لتأكيد تركيز المواد الفعالة واستبعاد أي ملوثات.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>فحص دقيق للمعادن الثقيلة (الرصاص، الزئبق، الكادميوم)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>خلو تام من الملوثات الميكروبيولوجية والممرضات</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>صفرية متبقيات المبيدات الحشرية والسموم الفطرية</span>
              </li>
            </ul>
          </Card>

          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              غرف نظيفة معتمدة cGMP
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              تتم عمليات الخلط والتعبئة والكبسلة داخل غرف تصنيع نظيفة معتمدة طبقاً للمواصفة ISO Class 7 ومزودة بفلاتر الهواء الرقائقية HEPA.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>شهادة إدارة الجودة الدولية ISO 9001:2015</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>معايير سلامة الأغذية والتصنيع ISO 22000</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>فروق ضغط هواء إيجابية لمنع التلوث العكسي</span>
              </li>
            </ul>
          </Card>

          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center font-bold">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              سلاسل التبريد والتتبع الرقمي
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              المستحضرات الحساسة للحرارة والمساعدات الإنزيمية (مثل CoQ10 وميثيل كوبالامين) يتم تخزينها ونقلها عبر شبكات تبريد مزودة بمستشعرات IoT رقمية.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>لوجستيات مبردة ومحكمة بين +2° مئوية و +8° مئوية</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>إنذارات فورية آلية على مدار الساعة لتغير درجات الحرارة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>مسجلات حرارية مشفرة ومضادة للتلاعب</span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Verification Report Banner */}
        <div className="rounded-3xl bg-white border border-brand-border-subtle p-8 sm:p-12 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-brand-primary uppercase">
                بروتوكول التدقيق الإكلينيكي
              </span>
              <h2 className="font-heading text-2xl font-extrabold text-brand-navy mt-1">
                سلسلة التوريد الموثقة والتحقق المخبري
              </h2>
            </div>
            <Badge variant="vitality" size="sm">
              دفعات معتمدة 100%
            </Badge>
          </div>

          <p className="text-sm text-brand-text-muted leading-relaxed">
            تطبق شركة ميراج فارما نظام رقابي مغلق (Closed-Loop Quality Control) يربط بين كود كل عبوة ورقم التشغيلة وشهادة التحليل المخبري HPLC المودعة لدى الهيئة الرقابية، بما يمنح الأطباء والصيادلة والمرضى ثقة مطلقة في جودة وفاعلية كل كبسولة تنتجها مختبراتنا.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="primary" size="md" asChild className="font-bold">
              <Link href="/ar/documents" className="flex items-center gap-2">
                <span>تصفح ملفات الأبحاث والتحاليل</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/ar/contact">
                طلب زيارة تدقيق أو استفسار صيدلاني
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
