/**
 * Mirage Pharma Typography Hierarchy & Fluid Scalability Engine (Tier 2.2)
 *
 * Implements editorial Swiss typography principles:
 * - Headlines & Monuments: Plus Jakarta Sans (optical tracking, high impact)
 * - Clinical Body: Inter (maximum legibility, high x-height)
 * - Telemetry & Metrics: Space Grotesk (tabular numbers, monospace character, clinical precision)
 * - Fluid clamp() scales calculated smoothly between mobile (375px) and desktop (1440px+).
 */

export interface FontSizeOptions {
  lineHeight?: string;
  letterSpacing?: string;
  fontWeight?: string | number;
}

export type FontSizeValue = [string, FontSizeOptions];

export const fluidTypography: Record<string, FontSizeValue> = {
  // Monuments & Mega Display (Landing page heroes, flagship page titles)
  'display-2xl': [
    'clamp(3.25rem, 2.25rem + 3.2vw, 5.5rem)',
    {
      lineHeight: '1.05',
      letterSpacing: '-0.035em',
      fontWeight: '800',
    },
  ],
  // Section Hero Headlines
  'display-xl': [
    'clamp(2.5rem, 1.85rem + 2.2vw, 4.0rem)',
    {
      lineHeight: '1.1',
      letterSpacing: '-0.03em',
      fontWeight: '700',
    },
  ],
  // Major Chapter & Category Headers
  'display-lg': [
    'clamp(2.0rem, 1.6rem + 1.4vw, 3.0rem)',
    {
      lineHeight: '1.15',
      letterSpacing: '-0.025em',
      fontWeight: '700',
    },
  ],
  // Subsection & Card Monument Titles
  'display-md': [
    'clamp(1.65rem, 1.35rem + 0.9vw, 2.25rem)',
    {
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
      fontWeight: '600',
    },
  ],
  // Bento Tile Titles & Large Headings
  'title-lg': [
    'clamp(1.25rem, 1.15rem + 0.35vw, 1.5rem)',
    {
      lineHeight: '1.3',
      letterSpacing: '-0.015em',
      fontWeight: '600',
    },
  ],
  // Standard Subsection Headers
  'title-md': [
    'clamp(1.1rem, 1.05rem + 0.2vw, 1.25rem)',
    {
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
      fontWeight: '600',
    },
  ],
  // Clinical Long-form Body — Large (Introductions, lead paragraphs)
  'body-lg': [
    'clamp(1.0625rem, 1.02rem + 0.15vw, 1.125rem)',
    {
      lineHeight: '1.65',
      letterSpacing: '-0.005em',
      fontWeight: '400',
    },
  ],
  // Standard Clinical Body
  'body-md': [
    '1rem',
    {
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
    },
  ],
  // Secondary Body & Annotations
  'body-sm': [
    '0.875rem',
    {
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
    },
  ],
  // Captions & Metadata Disclaimers
  caption: [
    '0.75rem',
    {
      lineHeight: '1.4',
      letterSpacing: '0.02em',
      fontWeight: '500',
    },
  ],
  // Persistent Clinical Telemetry Strip & GxP Metrics (Tabular Figures)
  'telemetry-lg': [
    'clamp(1.5rem, 1.25rem + 0.8vw, 2.25rem)',
    {
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      fontWeight: '700',
    },
  ],
  'telemetry-sm': [
    '0.8125rem',
    {
      lineHeight: '1.3',
      letterSpacing: '0.04em',
      fontWeight: '600',
    },
  ],
};
