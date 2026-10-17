import type { Config } from 'tailwindcss';
import { brandColors } from './src/tokens/colors';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../apps/web/app/**/*.{ts,tsx}',
    '../../apps/web/components/**/*.{ts,tsx}',
    '../../apps/admin/app/**/*.{ts,tsx}',
    '../../apps/admin/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: brandColors,
        border: 'hsl(var(--border, 214.3 31.8% 91.4%))',
        background: 'hsl(var(--background, 0 0% 100%))',
        foreground: 'hsl(var(--foreground, 222.2 84% 4.9%))',
      },
      fontFamily: {
        heading: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-space)', 'Space Grotesk', 'monospace'],
      },
      boxShadow: {
        'hud-glass': '0 8px 32px 0 rgba(40, 120, 188, 0.08)',
        'hud-glow': '0 0 35px rgba(40, 120, 188, 0.18)',
        'vitality-glow': '0 0 25px rgba(53, 171, 56, 0.22)',
      },
      backdropBlur: {
        hud: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
