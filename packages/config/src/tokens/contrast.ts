/**
 * WCAG 2.1 Mathematical Color Contrast and Relative Luminance Engine
 *
 * Implements W3C WCAG 2.1 Relative Luminance and Contrast Ratio algorithms:
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */

export function parseHexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0]! + cleanHex[0]!, 16);
    const g = parseInt(cleanHex[1]! + cleanHex[1]!, 16);
    const b = parseInt(cleanHex[2]! + cleanHex[2]!, 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Invalid hex color string: ${hex}`);
}

/**
 * Calculates relative luminance according to WCAG 2.1 spec.
 * Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where R, G, B are converted to linear color space.
 */
export function calculateLuminance(hex: string): number {
  const [r, g, b] = parseHexToRgb(hex);

  const linear = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
}

/**
 * Calculates the contrast ratio between two hex colors.
 * Formula: (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter of the two colors.
 * Result ranges from 1:1 to 21:1.
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const lum1 = calculateLuminance(foreground);
  const lum2 = calculateLuminance(background);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

export interface WcagComplianceResult {
  ratio: number;
  meetsNormalAAA: boolean; // >= 7.0:1
  meetsNormalAA: boolean;  // >= 4.5:1
  meetsLargeAAA: boolean;  // >= 4.5:1 (>= 18pt or >= 14pt bold)
  meetsLargeAA: boolean;   // >= 3.0:1 (UI components / large text)
}

export function evaluateWcagCompliance(
  foreground: string,
  background: string
): WcagComplianceResult {
  const ratio = calculateContrastRatio(foreground, background);
  return {
    ratio,
    meetsNormalAAA: ratio >= 7.0,
    meetsNormalAA: ratio >= 4.5,
    meetsLargeAAA: ratio >= 4.5,
    meetsLargeAA: ratio >= 3.0,
  };
}
