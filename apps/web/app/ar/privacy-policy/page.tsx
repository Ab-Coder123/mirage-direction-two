import { Lock, CheckCircle2 } from 'lucide-react';

export default function ArabicPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner (matching Hetero Cure Image 1: green banner with illustration) */}
      <section className="relative bg-gradient-to-r from-[#2e7d32] via-[#388e3c] to-[#43a047] dark:from-[#0a3818] dark:via-[#134e26] dark:to-[#0f3d1e] text-white py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-600/30 dark:border-emerald-500/20 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right relative z-10">
          <div className="space-y-3">
            <span className="font-heading font-black text-xs uppercase tracking-widest text-emerald-200">
              الإطار القانوني والامتثال التنظيمي
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
              سياسة الخصوصية
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium max-w-2xl">
              إجابات شاملة حول معايير حماية البيانات والسرية الطبية وامتثالنا لقانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020.
            </p>
          </div>

          {/* Graphic Illustration Placeholder */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center p-4 text-white shadow-xl shrink-0">
            <Lock className="w-12 h-12 text-emerald-200 mb-2" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-100 text-center">
              آمن ISO 27001
            </span>
          </div>
        </div>
      </section>

      {/* Main Legal Content (matching Hetero Cure Image 1 structure) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-8 sm:p-12 shadow-sm space-y-10 transition-colors">
          {/* Header Sub-title */}
          <div className="border-b border-slate-100 dark:border-white/10 pb-6">
            <h2 className="font-heading text-2xl font-extrabold text-brand-navy dark:text-white">
              وثيقة سياسة الخصوصية — ميراج فارما (Mirage Pharma)
            </h2>
            <p className="text-xs font-mono text-brand-text-muted dark:text-slate-400 mt-1">
              آخر تحديث: 2026 • الإصدار 2.4 (متوافق مع قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020)
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold text-xs flex items-center justify-center font-mono">
                1
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                المقدمة ونطاق التطبيق
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-9">
              تلتزم شركة ميراج فارما ومختبرات Naturals 4be بحماية خصوصيتك وبياناتك الشخصية بأقصى درجات المسؤولية والنزاهة المهنية. توضح هذه الوثيقة كيفية جمع واستخدام وحماية معلوماتك عند زيارة موقعنا الإلكتروني أو التواصل مع ممثلينا الطبيين أو تقديم استفسارات حول مستحضراتنا الصيدلانية.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold text-xs flex items-center justify-center font-mono">
                2
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                البيانات التي نقوم بجمعها
              </h3>
            </div>
            <div className="pr-9 space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>نجمع البيانات الضرورية فقط لتقديم الخدمات الطبية والاستشارية وتوريدات الصيدليات، وتشمل:</p>
              <ul className="space-y-2 text-xs pt-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>بيانات الاتصال والهوية:</strong> الاسم، المسمى المهني (طبيب / صيدلي / مريض)، رقم الهاتف، البريد الإلكتروني، وعنوان الصيدلية أو العيادة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>سجلات الاستفسارات واليقظة الدوائية:</strong> الملاحظات المقدمة بشأن المستحضرات، أرقام التشغيلات المستعلم عنها، والتقارير الطبية الاختيارية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>البيانات التقنية للتصفح:</strong> عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، ومعلومات الجلسة لتحسين أداء وتأمين الموقع.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold text-xs flex items-center justify-center font-mono">
                3
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                أغراض معالجة البيانات
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-9">
              تُستخدم بياناتك فقط للأغراض المشروعة الآتية: الرد على الاستفسارات الطبية، توفير الدوسيهات العلمية للأطباء، تنظيم طلبات التوريد للصيدليات، متابعة تقارير السلامة الدوائية، وإرسال النشرات العلمية لمن وافق صراحة على الاشتراك بها. لا نقوم إطلاقاً ببيع أو تأجير بياناتك لأي أطراف تجارية ثالثة.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold text-xs flex items-center justify-center font-mono">
                4
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                التأمين والامتثال لمعيار ISO 27001
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-9">
              تُخزن جميع البيانات في خوادم مشفرة تعتمد بروتوكولات التشفير المتقدم (AES-256 و TLS 1.3)، وتخضع لسياسات حماية صارمة تمنع الوصول غير المصرح به، متوافقة مع معايير الأمان المتبعة في قطاع الرعاية الصحية والدوائية.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light font-bold text-xs flex items-center justify-center font-mono">
                5
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                حقوقك القانونية
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pr-9">
              وفقاً لقانون حماية البيانات الشخصية رقم 151 لسنة 2020، يحق لك في أي وقت: طلب الاطلاع على بياناتك المحفوظة، تصحيح أي معلومات غير دقيقة، سحب موافقتك على المراسلات، أو طلب حذف بياناتك من سجلاتنا نهائياً عبر مراسلتنا كتابياً.
            </p>
          </section>

          {/* Contact Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-brand-text-muted dark:text-slate-400">
            <div>
              <span className="font-bold text-brand-navy dark:text-white block">مسؤول حماية البيانات (DPO):</span>
              <a href="mailto:info@miragepharma.com" className="font-mono text-brand-primary dark:text-brand-cyan-light hover:underline" dir="ltr">
                info@miragepharma.com
              </a>
            </div>
            <p className="font-mono">
              ميراج فارما — 1 شارع محمد المرعشلي، أبو الفدا، الزمالك، القاهرة
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
