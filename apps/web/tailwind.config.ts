import type { Config } from 'tailwindcss';
import { brandColors, fluidTypography } from '@mirage/config';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: brandColors,
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-space)', 'Space Grotesk', 'monospace'],
      },
      fontSize: fluidTypography,
      boxShadow: {
        'hud-glass': '0 8px 32px 0 rgba(40, 120, 188, 0.08)',
        'hud-glass-specular':
          'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), 0 8px 32px 0 rgba(40, 120, 188, 0.08)',
        'hud-glass-dark':
          'inset 0 1px 1px 0 rgba(255, 255, 255, 0.12), 0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'hud-glow': '0 0 35px rgba(40, 120, 188, 0.18)',
        'vitality-glow': '0 0 25px rgba(53, 171, 56, 0.22)',
        'cyan-glow': '0 0 30px rgba(48, 137, 149, 0.20)',
        'obsidian-glow': '0 20px 40px -15px rgba(2, 15, 36, 0.6)',
      },
      backdropBlur: {
        hud: '16px',
        clinical: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
