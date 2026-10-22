/**
 * SERVER-ONLY MongoDB document schemas, collections, and index specifications.
 *
 * This module defines the collections and document models needed by Mirage Pharma:
 *  - `site_content`: CMS-managed brand & homepage content (homepage_hero, company_story)
 *  - `products`: Commercial monographs and formulations
 *  - `b2b_leads`: Public partnership intake and inquiries
 *  - `audit_logs`: 21 CFR Part 11 electronic audit ledger
 */

import { z } from 'zod';
import type { Db, IndexDescription } from 'mongodb';
import { assertServerContext } from './mongodb';
import {
  HomepageHeroContentSchema,
  type HomepageHeroContent,
} from '../homepage-content';
import {
  CompanyStoryContentSchema,
  type CompanyStoryContent,
} from '../company-content';

assertServerContext();

// =============================================================================
// COLLECTION NAMES
// =============================================================================
export const MONGO_COLLECTIONS = {
  SITE_CONTENT: 'site_content',
  PRODUCTS: 'products',
  B2B_LEADS: 'b2b_leads',
  AUDIT_LOGS: 'audit_logs',
} as const;

export type MongoCollectionName =
  (typeof MONGO_COLLECTIONS)[keyof typeof MONGO_COLLECTIONS];

// =============================================================================
// SITE CONTENT DOCUMENT MODEL
// =============================================================================
export const SiteContentKeySchema = z.enum(['homepage_hero', 'company_story']);
export type SiteContentKey = z.infer<typeof SiteContentKeySchema>;

export const MongoSiteContentDocSchema = z
  .object({
    key: SiteContentKeySchema,
    data: z.record(z.unknown()),
    updatedAt: z.string().or(z.date()).optional().nullable(),
    updatedBy: z.string().optional().nullable(),
  })
  .superRefine((doc, ctx) => {
    const validation = validateSiteContentData(doc.key, doc.data);
    if (!validation.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['data'],
        message: validation.error,
      });
    }
  });
export type MongoSiteContentDoc = z.infer<typeof MongoSiteContentDocSchema>;

// Specialized document models
export interface MongoHomepageHeroDoc {
  key: 'homepage_hero';
  data: HomepageHeroContent;
  updatedAt?: string | Date | null;
  updatedBy?: string | null;
}

export interface MongoCompanyStoryDoc {
  key: 'company_story';
  data: CompanyStoryContent;
  updatedAt?: string | Date | null;
  updatedBy?: string | null;
}

// =============================================================================
// PRODUCT DOCUMENT SCHEMA
// =============================================================================
export const MongoProductPackSizeSchema = z.object({
  quantity: z.union([z.number(), z.string()]),
  unit: z.enum(['capsules', 'tablets', 'ml', 'sachets']),
  inStock: z.boolean(),
  gtin: z.string().optional(),
  nhraLicense: z.string().optional(),
});

export const MongoProductDocSchema = z.object({
  id: z.string().min(1, 'Product id is required'),
  slug: z.string().min(1, 'Product slug is required'),
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Product category is required'),
  description: z.string().min(5, 'Product description is required'),
  brandLine: z.string().min(1),
  heroImage: z.string().min(1),
  packSizes: z.array(MongoProductPackSizeSchema),
  subtitle: z.string().optional(),
  arabicSubtitle: z.string().optional(),
  tagline: z.string().optional(),
  priceInfo: z.string().optional(),
  packagingDetails: z.string().optional(),
  dosageInstructions: z.string().optional(),
  storageConditions: z.string().optional(),
  bottleImage: z.string().optional(),
  boxImage: z.string().optional(),
  bannerImage: z.string().optional(),
  rating: z.number().optional(),
  reviewsCount: z.number().optional(),
  isFeatured: z.boolean().optional(),
  synergyBanner: z.record(z.unknown()).optional(),
  clinicalIndications: z.array(z.record(z.unknown())).optional(),
  warnings: z.array(z.string()).optional(),
  keyBenefits: z.array(z.string()).optional(),
  indications: z.array(z.string()).optional(),
  supplementFacts: z.union([z.record(z.unknown()), z.array(z.record(z.unknown()))]).optional(),
  rawMaterials: z.array(z.record(z.unknown())).optional(),
  clinicalEvidences: z.array(z.record(z.unknown())).optional(),
  clinicalStudies: z.array(z.record(z.unknown())).optional(),
  serialization: z.record(z.unknown()).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  updatedBy: z.string().optional(),
});
export type MongoProductDoc = z.infer<typeof MongoProductDocSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================
export type SiteContentValidationResult =
  | {
      ok: true;
      key: SiteContentKey;
      data: HomepageHeroContent | CompanyStoryContent;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Validates both the site_content key and its corresponding payload schema.
 * Strictly rejects unknown keys and malformed payloads.
 */
export function validateSiteContentData(
  key: string,
  data: unknown
): SiteContentValidationResult {
  const keyCheck = SiteContentKeySchema.safeParse(key);
  if (!keyCheck.success) {
    return {
      ok: false,
      error: `Unsupported site_content key "${String(key)}". Allowed keys: ${SiteContentKeySchema.options.join(', ')}.`,
    };
  }

  const validKey = keyCheck.data;

  if (validKey === 'homepage_hero') {
    const parsed = HomepageHeroContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues.map((i) => i.message).join('; '),
      };
    }
    return { ok: true, key: validKey, data: parsed.data };
  }

  // validKey === 'company_story'
  const parsed = CompanyStoryContentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join('; '),
    };
  }
  return { ok: true, key: validKey, data: parsed.data };
}

// =============================================================================
// INDEX DEFINITIONS
// =============================================================================
export interface CollectionIndexPlan {
  collection: MongoCollectionName;
  indexes: IndexDescription[];
}

export const MONGO_INDEX_SPECIFICATIONS: CollectionIndexPlan[] = [
  {
    collection: MONGO_COLLECTIONS.SITE_CONTENT,
    indexes: [
      {
        key: { key: 1 },
        name: 'idx_site_content_key_unique',
        unique: true,
      },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.PRODUCTS,
    indexes: [
      {
        key: { id: 1 },
        name: 'idx_products_id_unique',
        unique: true,
      },
      {
        key: { slug: 1 },
        name: 'idx_products_slug_unique',
        unique: true,
      },
      {
        key: { category: 1 },
        name: 'idx_products_category',
      },
      {
        key: { name: 'text', description: 'text' },
        name: 'idx_products_text_search',
      },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.B2B_LEADS,
    indexes: [
      {
        key: { id: 1 },
        name: 'idx_b2b_leads_id_unique',
        unique: true,
      },
      {
        key: { created_at: -1 },
        name: 'idx_b2b_leads_created_at_desc',
      },
      {
        key: { status: 1 },
        name: 'idx_b2b_leads_status',
      },
    ],
  },
  {
    collection: MONGO_COLLECTIONS.AUDIT_LOGS,
    indexes: [
      {
        key: { id: 1 },
        name: 'idx_audit_logs_id_unique',
        unique: true,
      },
      {
        key: { event_id: 1 },
        name: 'idx_audit_logs_event_id_unique',
        unique: true,
      },
      {
        key: { timestamp: -1 },
        name: 'idx_audit_logs_timestamp_desc',
      },
      {
        key: { entity_id: 1 },
        name: 'idx_audit_logs_entity_id',
      },
    ],
  },
];

/**
 * Checks whether a MongoDB index error strictly represents an index that
 * already exists with the exact same specification (benign idempotent case).
 * All other errors (options conflict, key conflict, duplicate key, auth, network)
 * return false and must be surfaced.
 */
function isBenignSameSpecIndexError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { code?: number; codeName?: string; message?: string };
  const msg = typeof anyErr.message === 'string' ? anyErr.message : '';

  // Explicitly reject known conflict/failure codes:
  // 85 = IndexOptionsConflict, 86 = IndexKeySpecsConflict, 11000 = DuplicateKey, 13 = Unauthorized
  if (
    anyErr.code === 85 ||
    anyErr.code === 86 ||
    anyErr.code === 11000 ||
    anyErr.code === 13 ||
    anyErr.codeName === 'IndexOptionsConflict' ||
    anyErr.codeName === 'IndexKeySpecsConflict' ||
    anyErr.codeName === 'Unauthorized' ||
    /different options/i.test(msg) ||
    /duplicate key/i.test(msg) ||
    /not authorized|unauthorized|permission/i.test(msg) ||
    /connect|network|topology|timed out/i.test(msg)
  ) {
    return false;
  }

  return (
    anyErr.code === 68 ||
    anyErr.codeName === 'IndexAlreadyExists' ||
    /index already exists with the same specification/i.test(msg)
  );
}

/**
 * Creates or updates all required indexes across collections.
 * Idempotent and safe to run on application startup or migrations.
 * Propagates permission, connectivity, duplicate-key, and incompatible-index errors.
 */
export async function ensureMongoIndexes(db: Db): Promise<{
  collectionsEnsured: string[];
  indexesCreated: Record<string, string[]>;
}> {
  const indexesCreated: Record<string, string[]> = {};
  const collectionsEnsured: string[] = [];

  for (const plan of MONGO_INDEX_SPECIFICATIONS) {
    const coll = db.collection(plan.collection);
    const createdNames: string[] = [];

    for (const indexSpec of plan.indexes) {
      const indexLabel = indexSpec.name ?? JSON.stringify(indexSpec.key);
      try {
        const createOptions: Record<string, unknown> = { background: true };
        if (indexSpec.name) createOptions.name = indexSpec.name;
        if (indexSpec.unique !== undefined) createOptions.unique = indexSpec.unique;

        const name = await coll.createIndex(indexSpec.key, createOptions as any);
        createdNames.push(name);
      } catch (err) {
        if (isBenignSameSpecIndexError(err)) {
          createdNames.push(`${indexLabel} (existing)`);
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(
            `Failed to ensure index "${indexLabel}" on collection "${plan.collection}": ${msg}`
          );
        }
      }
    }

    collectionsEnsured.push(plan.collection);
    indexesCreated[plan.collection] = createdNames;
  }

  return { collectionsEnsured, indexesCreated };
}
