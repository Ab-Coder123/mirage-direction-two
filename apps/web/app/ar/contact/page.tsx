'use client';

import * as React from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button, Card, Badge } from '@mirage/ui';

export default function ArabicContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: 'استفسار طبي عام',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            الدعم الطبي والإكلينيكي المباشر
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            اتصل بنا
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            تواصل مباشرة مع فريقنا العلمي المتخصص، أو استفسر عن شبكة توزيع الصيدليات وتوريدات المراكز الطبية.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards & Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="glass" className="p-8 space-y-6">
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
                المقر الرئيسي لشركة ميراج فارما
              </h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">
                تقع مكاتبنا الرئيسية ومكتب الاتصال العلمي في القاهرة الجديدة، لتنسيق سلاسل الإمداد والتوزيع لكبرى الصيدليات في كافة محافظات مصر.
              </p>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      العنوان الميداني:
                    </span>
                    <p className="text-sm">فيلا 270 الأندلس، التجمع الخامس، القاهرة، جمهورية مصر العربية</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      الهواتف المباشرة:
                    </span>
                    <p className="font-mono text-sm" dir="ltr">
                      <a href="tel:01070786720" className="hover:text-brand-primary">01070786720</a> • <a href="tel:01070786721" className="hover:text-brand-primary">01070786721</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      البريد الإلكتروني للاستفسارات:
                    </span>
                    <a
                      href="mailto:info@hetero-cure.com"
                      className="font-mono text-sm text-brand-primary hover:underline"
                      dir="ltr"
                    >
                      info@hetero-cure.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      مواعيد العمل الرسمية:
                    </span>
                    <p className="text-sm">الأحد إلى الخميس: 9:00 صباحاً – 5:00 مساءً</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pharmacovigilance Alert Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-brand-primary/10 border border-emerald-500/20 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>اليقظة الصيدلانية ومتابعة سلامة المرضى</span>
              </div>
              <p className="leading-relaxed">
                للإبلاغ عن أي استفسار دوائي عاجل أو ملاحظة حول تشغيلة، يُرجى مراسلة مكتب اليقظة الدوائية مباشرة عبر البريد الإلكتروني مع إرفاق رقم التشغيلة المطبوع على العبوة.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Medical Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card variant="glass" className="p-8 sm:p-10 shadow-sm">
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy mb-2">
                إرسال استفسار أو طلب توريد
              </h3>
              <p className="text-xs sm:text-sm text-brand-text-muted mb-8">
                يسعد فريقنا العلمي والطبي بالرد على كافة أسئلتكم خلال 24 ساعة عمل.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-brand-green text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-bold text-xl text-brand-navy">
                    تم استلام استفسارك بنجاح!
                  </h4>
                  <p className="text-sm text-brand-text-muted max-w-md mx-auto leading-relaxed">
                    شكراً لتواصلك مع ميراج فارما. سيقوم أحد ممثلي فريقنا الطبي بمراجعة رسالتك والتواصل معك في أقرب وقت.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'استفسار طبي عام',
                        message: '',
                      });
                    }}
                    className="mt-2"
                  >
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-navy block">
                        الاسم بالكامل *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="د. أحمد مصطفى"
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-navy block">
                        رقم الهاتف للتواصل *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="01012345678"
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-navy block">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@example.com"
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-navy block">
                        نوع الاستفسار *
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right cursor-pointer"
                      >
                        <option value="استفسار طبي عام">استفسار طبي عام حول المستحضرات</option>
                        <option value="طلب توريد لصيدلية أو مركز طبي">طلب توريد لصيدلية أو مركز طبي</option>
                        <option value="استفسار حول الدراسات السريرية">استفسار حول الدراسات السريرية</option>
                        <option value="إبلاغ عن تيقظ دوائي أو جودة تشغيلة">إبلاغ عن تيقظ دوائي أو جودة تشغيلة</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-navy block">
                      نص الرسالة أو تفاصيل الطلب *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب استفسارك بالتفصيل مع ذكر اسم المستحضر أو عنوان الصيدلية إن وُجد..."
                      className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold flex items-center justify-center gap-2 shadow-hud-glow"
                  >
                    <span>إرسال الرسالة الآن</span>
                    <Send className="w-4 h-4 rotate-180" />
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
