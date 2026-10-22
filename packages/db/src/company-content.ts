import { z } from 'zod';

// =============================================================================
// COMPANY STORY & PROFILE CONTENT (bilingual, editable from Admin CMS)
// -----------------------------------------------------------------------------
// Used by /our-story and /ar/our-story public pages.
// Client-safe schema module; server storage in @mirage/db/server.
// =============================================================================

const text = (label: string, max: number) =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const CompanyStoryInputSchema = z.object({
  heroTitleEn: text('English hero title', 150),
  heroTitleAr: text('Arabic hero title', 150),
  heroSubtitleEn: text('English hero subtitle', 400),
  heroSubtitleAr: text('Arabic hero subtitle', 400),
  visionTitleEn: text('English vision title', 150),
  visionTitleAr: text('Arabic vision title', 150),
  visionQuoteEn: text('English vision quote', 500),
  visionQuoteAr: text('Arabic vision quote', 500),
  capitalEn: text('English capital', 60),
  capitalAr: text('Arabic capital', 60),
  annualVolumeEn: text('English annual volume', 60),
  annualVolumeAr: text('Arabic annual volume', 60),
  workforceEn: text('English workforce', 80),
  workforceAr: text('Arabic workforce', 80),
  headquartersEn: text('English headquarters', 120),
  headquartersAr: text('Arabic headquarters', 120),
});

export type CompanyStoryInput = z.infer<typeof CompanyStoryInputSchema>;

export const CompanyStoryContentSchema = CompanyStoryInputSchema.extend({
  updatedAt: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
});

export type CompanyStoryContent = z.infer<typeof CompanyStoryContentSchema>;

export const COMPANY_STORY_FIELDS = Object.keys(
  CompanyStoryInputSchema.shape
) as (keyof CompanyStoryInput)[];

export const DEFAULT_COMPANY_STORY_CONTENT: CompanyStoryContent = {
  heroTitleEn: 'MIRAGE PHARMA',
  heroTitleAr: 'ميراج فارما — MIRAGE PHARMA',
  heroSubtitleEn:
    'One of the leading industrial manufacturing & trading enterprises in the food supplements and medicine industry in Egypt and the Middle East.',
  heroSubtitleAr:
    'إحدى كبرى الشركات الرائدة في مجال التصنيع والتجارة للمكملات الغذائية والأدوية في مصر والشرق الأوسط.',
  visionTitleEn: 'New Vision, New Era in Healthcare Excellence',
  visionTitleAr: 'رؤية جديدة.. عصر جديد في صناعة الرعاية الصحية',
  visionQuoteEn:
    'To be at the forefront of the healthcare industry in bringing complex brand and generic products to patients in the markets we serve. Our target products are carefully selected to fulfil and satisfy life’s well-being.',
  visionQuoteAr:
    'أن نكون في طليعة صناعة الرعاية الصحية في تقديم مستحضرات دوائية متطورة وعلامات تجارية رائدة للمرضى في الأسواق التي نخدمها. يتم اختيار مستحضراتنا المستهدفة بعناية فائقة لتلبية وتحقيق الرفاه الصحي المتكامل.',
  capitalEn: '50 Million EGP',
  capitalAr: '50 مليون جنيه مصري',
  annualVolumeEn: '80 Million EGP',
  annualVolumeAr: '80 مليون جنيه مصري',
  workforceEn: '75 + 500',
  workforceAr: '75 + 500',
  headquartersEn: 'Cairo, Arab Republic of Egypt',
  headquartersAr: 'القاهرة، جمهورية مصر العربية',
  updatedAt: null,
  updatedBy: null,
};

export type SaveCompanyStoryResult =
  | {
      ok: true;
      content: CompanyStoryContent;
      storage: { mode: 'mongodb' | 'file'; label: string };
      revalidation: { status: 'ok' | 'skipped' | 'failed'; message: string };
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string> | undefined;
      missingEnv?: string[] | undefined;
    };
