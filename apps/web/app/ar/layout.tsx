import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ميراج فارما (Mirage Pharma) — حلول وعلوم الحياة المدعومة بالأبحاث الإكلينيكية',
  description:
    'مستحضرات وتركيبات دوائية وغذائية متطورة من مختبرات Naturals 4be قائمة على خلاصات نباتية فائقة النقاء وأعلى معايير التصنيع الدوائي وسلاسل التبريد.',
};

export default function ArabicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" lang="ar" className="text-right selection:bg-brand-primary/20">
      {children}
    </div>
  );
}
