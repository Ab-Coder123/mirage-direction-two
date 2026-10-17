import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from 'next/font/google';

/**
 * Typography Hierarchy & Zero CLS Font Engine (Tier 2.2)
 *
 * Implements next/font/google self-hosted zero-cookie compliant fonts.
 * Using native variable font configurations without discrete weight arrays
 * to prevent upstream Google Font axis parsing errors and eliminate CLS.
 */

export const fontJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const fontSpace = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});
