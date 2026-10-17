import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from 'next/font/google';

/**
 * Typography Hierarchy & Zero CLS Font Engine (Tier 2.2)
 *
 * Implements next/font/google self-hosted zero-cookie compliant fonts.
 * adjustFontFallback generates automatic fallback font metrics (ascent-override,
 * descent-override, size-adjust) ensuring Cumulative Layout Shift remains 0.000.
 */

export const fontJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const fontInter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const fontSpace = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});
