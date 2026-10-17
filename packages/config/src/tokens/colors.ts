export const brandColors = {
  primary: {
    DEFAULT: '#2878BC', // Medical Blue Primary
    light: '#4B96D4',
    dark: '#1C5C94',
    50: '#F0F7FD',
    100: '#DDEEF9',
    200: '#B8DCF3',
    300: '#8AC3EB',
    400: '#54A6E1',
    500: '#2878BC',
    600: '#1C5C94',
    700: '#154671',
    800: '#11395C',
    900: '#0E3A63',
  },
  navy: {
    DEFAULT: '#023368', // Deep Corporate Pharma Navy (WCAG AAA on white: 11.8:1)
    light: '#054B98',
    dark: '#011F41',
    950: '#011226',
  },
  green: {
    DEFAULT: '#35AB38', // Vitality Green
    light: '#53C756',
    dark: '#258327',
    50: '#F2FBF2',
    100: '#E1F6E2',
    500: '#35AB38',
    900: '#144616',
  },
  cyan: {
    DEFAULT: '#308995', // Bio-Glass Cyan / Refraction
    light: '#61C0E4',
    dark: '#1F5D66',
    50: '#F0F9FA',
    500: '#308995',
  },
  surface: {
    DEFAULT: '#F8FAFC',
    pure: '#FFFFFF',
    muted: '#F1F5F9',
    obsidian: '#020F24', // Deep Clinical Dark Surface
    obsidianElevated: '#041B3B',
  },
  border: {
    subtle: '#E2E8F0',
    glass: 'rgba(255, 255, 255, 0.75)',
    glassDark: 'rgba(255, 255, 255, 0.12)',
    dark: '#CBD5E1',
  },
} as const;

export const brandRgb = {
  primary: '40, 120, 188',
  navy: '2, 51, 104',
  green: '53, 171, 56',
  cyan: '48, 137, 149',
  cyanLight: '97, 192, 228',
  obsidian: '2, 15, 36',
} as const;
