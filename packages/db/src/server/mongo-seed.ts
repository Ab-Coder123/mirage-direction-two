/**
 * SERVER-ONLY repeatable and strictly non-destructive MongoDB seed utility.
 *
 * This module seeds initial documents from canonical static data sources while
 * strictly protecting existing user modifications.
 *
 * Rules:
 *  - Uses `$setOnInsert` / existence checks so repeated runs NEVER overwrite
 *    existing CMS modifications or user records.
 *  - Force/overwrite seeding is prohibited to prevent accidental data loss.
 *  - Uses static defaults (`DEFAULT_HOMEPAGE_HERO_CONTENT`, `DEFAULT_COMPANY_STORY_CONTENT`)
 *    without mutating or replacing static source files.
 *  - Preserves workforce `'75 + 500'` in English and Arabic.
 */

import type { Db } from 'mongodb';
import { assertServerContext } from './mongodb';
import { MONGO_COLLECTIONS } from './mongo-models';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  HOMEPAGE_HERO_FIELDS,
  type HomepageHeroContent,
} from '../homepage-content';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  COMPANY_STORY_FIELDS,
  type CompanyStoryContent,
} from '../company-content';
import {
  INITIAL_PRODUCTS,
  INITIAL_B2B_LEADS,
  INITIAL_AUDIT_LOGS,
} from '../seed-data';

assertServerContext();

export interface MongoSeedResult {
  ok: boolean;
  siteContentSeeded: number;
  productsSeeded: number;
  leadsSeeded: number;
  auditLogsSeeded: number;
  skipped: number;
  timestamp: string;
}

/**
 * Resolves homepage hero content field-by-field: uses a non-empty saved override
 * field when present, otherwise retains the canonical static default field.
 * Never mutates `DEFAULT_HOMEPAGE_HERO_CONTENT`.
 */
export function resolveHomepageHeroWithFallback(
  override?: Partial<HomepageHeroContent> | null
): HomepageHeroContent {
  const resolved: HomepageHeroContent = { ...DEFAULT_HOMEPAGE_HERO_CONTENT };
  if (!override || typeof override !== 'object') {
    return resolved;
  }

  for (const field of HOMEPAGE_HERO_FIELDS) {
    const val = override[field];
    if (typeof val === 'string' && val.trim().length > 0) {
      resolved[field] = val.trim();
    }
  }

  if (override.updatedAt !== undefined) {
    resolved.updatedAt = override.updatedAt;
  }
  if (override.updatedBy !== undefined) {
    resolved.updatedBy = override.updatedBy;
  }

  return resolved;
}

/**
 * Resolves company story content field-by-field: uses a non-empty saved override
 * field when present, otherwise retains the canonical static default field
 * (including workforce `'75 + 500'`).
 * Never mutates `DEFAULT_COMPANY_STORY_CONTENT`.
 */
export function resolveCompanyStoryWithFallback(
  override?: Partial<CompanyStoryContent> | null
): CompanyStoryContent {
  const resolved: CompanyStoryContent = { ...DEFAULT_COMPANY_STORY_CONTENT };
  if (!override || typeof override !== 'object') {
    return resolved;
  }

  for (const field of COMPANY_STORY_FIELDS) {
    const val = override[field];
    if (typeof val === 'string' && val.trim().length > 0) {
      resolved[field] = val.trim();
    }
  }

  if (override.updatedAt !== undefined) {
    resolved.updatedAt = override.updatedAt;
  }
  if (override.updatedBy !== undefined) {
    resolved.updatedBy = override.updatedBy;
  }

  return resolved;
}

/**
 * Seeds the MongoDB database idempotently using strictly insert-only semantics.
 * Safe to rerun on every application boot or deployment migration.
 * Never overwrites existing documents.
 */
export async function seedMongoDatabase(
  db: Db,
  options?: Record<string, unknown>
): Promise<MongoSeedResult> {
  if (options && 'force' in options && Boolean(options.force)) {
    throw new Error(
      'Destructive force-seeding is prohibited. Seed operations are strictly insert-only to protect existing Admin edits and user records.'
    );
  }

  let siteContentSeeded = 0;
  let productsSeeded = 0;
  let leadsSeeded = 0;
  let auditLogsSeeded = 0;
  let skipped = 0;

  const now = new Date().toISOString();

  // 1. Seed Site Content (Homepage Hero) — insert only if missing
  const siteContentColl = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
  const existingHero = await siteContentColl.findOne({ key: 'homepage_hero' });
  if (!existingHero) {
    const res = await siteContentColl.updateOne(
      { key: 'homepage_hero' },
      {
        $setOnInsert: {
          key: 'homepage_hero',
          data: { ...DEFAULT_HOMEPAGE_HERO_CONTENT },
          updatedAt: now,
          updatedBy: 'System Seed (Static Baseline)',
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      siteContentSeeded++;
    } else {
      skipped++;
    }
  } else {
    skipped++;
  }

  // 2. Seed Site Content (Company Story & Facts) — insert only if missing
  const existingStory = await siteContentColl.findOne({ key: 'company_story' });
  if (!existingStory) {
    const res = await siteContentColl.updateOne(
      { key: 'company_story' },
      {
        $setOnInsert: {
          key: 'company_story',
          data: { ...DEFAULT_COMPANY_STORY_CONTENT },
          updatedAt: now,
          updatedBy: 'System Seed (Static Baseline)',
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount > 0) {
      siteContentSeeded++;
    } else {
      skipped++;
    }
  } else {
    skipped++;
  }

  // 3. Seed Commercial Products — insert only if missing
  const productsColl = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  for (const product of INITIAL_PRODUCTS) {
    const existingProduct = await productsColl.findOne({ id: product.id });
    if (!existingProduct) {
      const res = await productsColl.updateOne(
        { id: product.id },
        { $setOnInsert: JSON.parse(JSON.stringify(product)) },
        { upsert: true }
      );
      if (res.upsertedCount > 0) {
        productsSeeded++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  // 4. Seed B2B Leads — insert only if missing
  const leadsColl = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
  for (const lead of INITIAL_B2B_LEADS) {
    const existingLead = await leadsColl.findOne({ id: lead.id });
    if (!existingLead) {
      const res = await leadsColl.updateOne(
        { id: lead.id },
        { $setOnInsert: { ...lead } },
        { upsert: true }
      );
      if (res.upsertedCount > 0) {
        leadsSeeded++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  // 5. Seed Audit Logs — insert only if missing
  const auditColl = db.collection(MONGO_COLLECTIONS.AUDIT_LOGS);
  for (const log of INITIAL_AUDIT_LOGS) {
    const existingLog = await auditColl.findOne({ id: log.id });
    if (!existingLog) {
      const res = await auditColl.updateOne(
        { id: log.id },
        { $setOnInsert: { ...log } },
        { upsert: true }
      );
      if (res.upsertedCount > 0) {
        auditLogsSeeded++;
      } else {
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  return {
    ok: true,
    siteContentSeeded,
    productsSeeded,
    leadsSeeded,
    auditLogsSeeded,
    skipped,
    timestamp: now,
  };
}
