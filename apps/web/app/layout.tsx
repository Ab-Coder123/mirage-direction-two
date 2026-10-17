import type { Metadata } from 'next';
import { fontJakarta, fontInter, fontSpace } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mirage Direction Two — Web Portal',
  description: 'Precision biotechnology, cold-chain assurance, and clinical healthcare excellence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased scroll-smooth overflow-x-hidden ${fontJakarta.variable} ${fontInter.variable} ${fontSpace.variable}`}
    >
      <body className="min-h-full bg-brand-surface text-brand-navy font-sans selection:bg-brand-primary/20 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
