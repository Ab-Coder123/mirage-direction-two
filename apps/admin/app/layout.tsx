import type { Metadata } from 'next';
import { fontJakarta, fontInter, fontSpace } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mirage Admin Portal — Operations & Telemetry',
  description: 'Enterprise clinical administration, batch credentialing, and cold-chain sensor telemetry console.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased scroll-smooth ${fontJakarta.variable} ${fontInter.variable} ${fontSpace.variable}`}
    >
      <body className="min-h-full bg-brand-surface text-brand-navy font-sans selection:bg-brand-primary/20">
        {children}
      </body>
    </html>
  );
}
