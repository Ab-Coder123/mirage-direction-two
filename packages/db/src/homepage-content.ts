import { z } from 'zod';

// =============================================================================
// HOMEPAGE HERO CONTENT (bilingual, editable from the Admin CMS)
// -----------------------------------------------------------------------------
// This module is intentionally free of Node.js / Supabase imports so that it can
// be shared by client components (the Admin editor) and server code alike.
// Persistence lives in `./server/homepage-repository.ts` (`@mirage/db/server`).
// =============================================================================

const text = (label: string, max: number) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

/** Editable fields only (what the Admin form submits). */
export const HomepageHeroInputSchema = z
  .object({
    badgeEn: text('English badge', 120),
    badgeAr: text('Arabic badge', 120),
    headlinePrefixEn: text('English headline', 120),
    headlineHighlightEn: text('English highlighted headline', 120),
    headlinePrefixAr: text('Arabic headline', 120),
    headlineHighlightAr: text('Arabic highlighted headline', 120),
    supportingTextEn: text('English supporting text', 600),
    supportingTextAr: text('Arabic supporting text', 600),
    primaryCtaTextEn: text('English primary button text', 60),
    primaryCtaTextAr: text('Arabic primary button text', 60),
    secondaryCtaTextEn: text('English secondary button text', 60),
    secondaryCtaTextAr: text('Arabic secondary button text', 60),
  });
export type HomepageHeroInput = z.infer<typeof HomepageHeroInputSchema>;

/** Persisted record = editable fields + metadata. */
export const HomepageHeroContentSchema = HomepageHeroInputSchema.extend({
  updatedAt: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
});
export type HomepageHeroContent = z.infer<typeof HomepageHeroContentSchema>;

export const HOMEPAGE_HERO_FIELDS = Object.keys(
  HomepageHeroInputSchema.shape
) as (keyof HomepageHeroInput)[];

/**
 * Defaults = the copy that was previously hardcoded in
 * apps/web/app/page.tsx and apps/web/app/ar/page.tsx (unchanged wording).
 * Used until an editor saves content for the first time.
 */
export const DEFAULT_HOMEPAGE_HERO_CONTENT: HomepageHeroContent = {
  badgeEn: 'Mirage Pharma • Healthy Life • Est. 2019',
  badgeAr: 'ميراج فارما (Mirage Pharma) • Healthy Life • تأسست عام 2019',
  headlinePrefixEn: 'New Vision, New Era in',
  headlineHighlightEn: 'Food Supplements & Medicine',
  headlinePrefixAr: 'رؤية جديدة.. عصر جديد في',
  headlineHighlightAr: 'المكملات الغذائية وصناعة الدواء',
  supportingTextEn:
    'Launched in 2019, Mirage Pharma Company has developed to be one of the biggest industrial & trading leaders in the food supplements and medicine industry in Egypt and the Middle East, bringing complex brand and generic products to fulfill and satisfy life’s well-being.',
  supportingTextAr:
    'انطلقت شركة ميراج فارما (Mirage Pharma) في عام 2019 لتصبح واحدة من أكبر الشركات الرائدة في مجال التصنيع والتجارة للمكملات الغذائية والأدوية في مصر والشرق الأوسط، وتقديم خيارات علاجية متطورة تلبي الاحتياجات الصحية للمجتمع.',
  primaryCtaTextEn: 'Explore Products',
  primaryCtaTextAr: 'استكشف المستحضرات الدوائية',
  secondaryCtaTextEn: 'Corporate Profile & Vision',
  secondaryCtaTextAr: 'عن الشركة ورؤيتنا',
  updatedAt: null,
  updatedBy: null,
};

/** Result shape returned by the Admin save Server Action. */
export type SaveHomepageHeroResult =
  | {
      ok: true;
      content: HomepageHeroContent;
      storage: { mode: 'mongodb' | 'file'; label: string };
      /** Status of invalidating the public website cache (separate Next.js process). */
      revalidation: { status: 'ok' | 'skipped' | 'failed'; message: string };
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof HomepageHeroInput, string>> | undefined;
    };
