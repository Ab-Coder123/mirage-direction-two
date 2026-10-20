/**
 * Convert a human-readable product name into a URL-safe slug.
 *
 * - Strips diacritics (NFKD) so "Crème" becomes "creme".
 * - Collapses every run of non [a-z0-9] characters into a single hyphen.
 * - Trims leading/trailing hyphens.
 *
 * Returns an empty string when the input contains no Latin letters or digits
 * (for example Arabic-only names). Callers MUST treat an empty slug as invalid.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type SlugValidation =
  | { ok: true; slug: string }
  | { ok: false; reason: 'empty' | 'duplicate'; message: string; slug: string };

/**
 * Validate a candidate name against the slugs that are already registered.
 */
export function validateNewSlug(name: string, existingSlugs: readonly string[]): SlugValidation {
  const slug = slugify(name);
  if (!slug) {
    return {
      ok: false,
      reason: 'empty',
      slug,
      message: 'Product name must contain at least one Latin letter or digit to generate a URL slug.',
    };
  }
  if (existingSlugs.includes(slug)) {
    return {
      ok: false,
      reason: 'duplicate',
      slug,
      message: `A formulation with the URL slug "${slug}" already exists.`,
    };
  }
  return { ok: true, slug };
}
