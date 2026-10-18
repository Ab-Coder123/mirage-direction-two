import type { Metadata } from 'next';
import { fontJakarta, fontInter, fontSpace } from '@/lib/fonts';
import { GlobalShell } from '@/components/shell/GlobalShell';
import { ThemeScript, ThemeProvider } from '@/components/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mirage Pharma — Values-Led, Performance-Driven Life Sciences',
  description:
    'Advanced science-based nutritional formulations, clinical phytotherapy, and cold-chain medical excellence.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased scroll-smooth ${fontJakarta.variable} ${fontInter.variable} ${fontSpace.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full bg-brand-surface text-brand-navy font-sans selection:bg-brand-primary/20 dark:bg-[#020F24] dark:text-[#F8FAFC] transition-colors duration-200">
        <ThemeProvider>
          <GlobalShell>{children}</GlobalShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
