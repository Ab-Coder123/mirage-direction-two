import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ميراج فارما (Mirage Pharma) — حلول وعلوم الحياة المدعومة بالأبحاث الإكلينيكية',
  description:
    'مستحضرات وتركيبات دوائية وغذائية متطورة من مختبرات Naturals 4be قائمة على خلاصات نباتية فائقة النقاء وأعلى معايير التصنيع الدوائي وسلاسل التبريد.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
