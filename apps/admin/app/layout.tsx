import type { Metadata } from 'next';
import { fontJakarta, fontInter, fontSpace } from '@/lib/fonts';
import { AdminShell } from '@/components/shell/AdminShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mirage Pharma Admin OS — 10-Phase Clinical & Operations Portal',
  description:
    'Enterprise clinical administration, formulation studio, cold-chain IoT telemetry, 21 CFR Part 11 GxP audit ledger, and HCP credentialing console.',
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
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
