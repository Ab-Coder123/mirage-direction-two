'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowLeft } from 'lucide-react';
import { Badge, Button } from '@mirage/ui';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS_AR: FaqItem[] = [
  {
    category: 'التركيبات والمكونات الفعالة',
    question: 'ما الذي يميز مستحضرات Naturals 4be عن المكملات الغذائية التقليدية في السوق؟',
    answer:
      'على عكس المكملات العشوائية التي تعتمد على مساحيق نباتية غير معيارية بنسب متذبذبة من المواد الفعالة، تعتمد مختبرات Naturals 4be حصرياً على خلاصات نباتية معايرة كيميائياً بنسب محددة (مثل 85-95% أحماض دهنية في البلميط المنشاري، وجينسينوزيدات معايرة في الجينسنغ). كما تخضع كل دفعة إنتاج لفحص كروماتوغرافي HPLC موثق رسمياً.',
  },
  {
    category: 'التركيبات والمكونات الفعالة',
    question: 'لماذا تم تصميم مستحضر Inositol بنسبة 40:1 تحديداً؟',
    answer:
      'تمثل نسبة 40:1 بين المايو-إينوزيتول والدي-كايرو-إينوزيتول النسبة الفسيولوجية الطبيعية الموجودة في بلازما وسوائل حويصلات المبيض لدى المرأة السليمة. أثبتت الدراسات السريرية أن هذه النسبة المحددة تحسن حساسية الأنسولين وجودة التبويض دون أن تسبب الآثار الجانبية الذكورية التي تحدث عند استخدام جرعات مرتفعة من الدي-كايرو بمفرده.',
  },
  {
    category: 'الاستخدام والجرعات والأمان',
    question: 'هل مستحضرات ميراج فارما / Naturals 4be آمنة للاستخدام اليومي طويل الأمد؟',
    answer:
      'نعم تماماً. صُممت جميع مستحضراتنا كمكملات غذائية علاجية فائقة النقاء تخضع لمطابقة معايير الهيئة المصرية للدواء وحدود الأمان الأوروبية. تركيباتنا خالية تماماً من الهرمونات الصناعية، المنبهات المحظورة، أو المواد الحافظة الضارة.',
  },
  {
    category: 'الاستخدام والجرعات والأمان',
    question: 'هل يمكنني تناول أكثر من مستحضر من عائلة Naturals 4be في نفس الوقت؟',
    answer:
      'بشكل عام، صُممت تركيباتنا لتكون متكاملة وداعمة لبعضها البعض (مثل تناول Man Edge مع Folate B12، أو تناول Inositol 40:1 مع Folate B12). ومع ذلك، نوصي دائماً باستشارة طبيبك المعالج أو الصيدلي السريري قبل البدء في أي خطة علاجية مكملة جديدة.',
  },
  {
    category: 'التخزين وسلاسل التبريد',
    question: 'كيف يجب حفظ وتخزين المستحضرات في المنزل؟',
    answer:
      'يُفضل حفظ معظم الكبسولات في مكان جاف وبارد تحت درجة حرارة 25° مئوية بعيداً عن أشعة الشمس المباشرة والرطوبة. أما المستحضرات السائلة مثل شراب VitaKids & Propolis فيجب إحكام إغلاقها وحفظها في الثلاجة بعد الفتح واستخدامها خلال 30 يوماً.',
  },
  {
    category: 'التوافر وشبكة الصيدليات',
    question: 'أين يمكن شراء مستحضرات Naturals 4be الأصلية في مصر؟',
    answer:
      'تتوفر مستحضراتنا المعتمدة لدى كبرى سلاسل الصيدليات في القاهرة الكبرى والإسكندرية وجميع محافظات الجمهورية. كما يمكنكم طلب التوصيل المباشر أو الاستفسار عن أقرب صيدلية متوفر بها المستحضر عبر التواصل مع فريقنا الطبي.',
  },
];

export default function ArabicFaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            إجابات علمية موثقة من أطباء وخبراء التغذية العلاجية
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            الأسئلة الشائعة
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            كل ما تود معرفته حول تركيبات Naturals 4be، الجرعات، معايير الأمان، وشبكة الصيدليات المعتمدة.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS_AR.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-brand-border-subtle overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-right flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-brand-primary block uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-heading font-bold text-base sm:text-lg text-brand-navy leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brand-primary text-white' : 'text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-brand-text-muted leading-relaxed border-t border-slate-100 font-sans">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Box */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-8 sm:p-10 border border-brand-primary/20 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
            هل لديك سؤال طبي إضافي لم تجد إجابته هنا؟
          </h3>
          <p className="text-sm text-brand-text-muted max-w-xl mx-auto leading-relaxed">
            فريقنا من الصيادلة والباحثين الإكلينيكيين جاهز للإجابة على جميع استفساراتكم الدقيقة وتزويدكم بالدوسيهات العلمية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="primary" size="md" asChild className="font-bold">
              <Link href="/ar/contact" className="flex items-center gap-2">
                <span>تواصل معنا مباشرة</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href="/ar/documents">
                تصفح الأبحاث الإكلينيكية
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
