/**
 * SERVER-ONLY safe, non-destructive migration utilities for MongoDB.
 *
 * Rules:
 *  - NEVER drop collections, tables, or records automatically.
 *  - NEVER overwrite an existing MongoDB document when importing from local JSON
 *    files or legacy Supabase tables.
 *  - Detects and reports conflicts when a destination record already exists with
 *    different content, preserving both the MongoDB record and the source data.
 *  - Preserves source files and source databases completely intact (read-only).
 *  - Provides programmatic snapshots and documented backup & rollback procedures.
 */

import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import type { Db } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import { assertServerContext } from './mongodb';
import {
  MONGO_COLLECTIONS,
  validateSiteContentData,
  MongoProductDocSchema,
} from './mongo-models';
import {
  HOMEPAGE_HERO_FIELDS,
  type HomepageHeroContent,
} from '../homepage-content';
import {
  COMPANY_STORY_FIELDS,
  type CompanyStoryContent,
} from '../company-content';
import {
  B2BLeadRecordSchema,
  AuditLogRecordSchema,
} from '../schema';

assertServerContext();

export interface MigrationConflict {
  collection: string;
  keyOrId: string;
  reason: string;
  preservedDestinationUpdatedAt?: string | null;
  sourceUpdatedAt?: string | null;
}

export interface MigrationSummary {
  ok: boolean;
  status:
    | 'completed'
    | 'completed_with_conflicts'
    | 'pending_configuration'
    | 'failed';
  source: 'local_files' | 'supabase';
  migratedRecords: {
    site_content: number;
    products?: number;
    b2b_leads?: number;
    audit_logs?: number;
    [key: string]: number | undefined;
  };
  skippedRecords: {
    site_content: number;
    products?: number;
    b2b_leads?: number;
    audit_logs?: number;
    [key: string]: number | undefined;
  };
  conflicts: MigrationConflict[];
  errors: string[];
  manualActionRequired?: string;
  timestamp: string;
}

export interface SupabaseReadOnlySource {
  fetchTable(
    tableName: 'site_content' | 'products' | 'b2b_leads' | 'audit_logs'
  ): Promise<{
    data: Record<string, unknown>[] | null;
    error?: { message: string } | null;
  }>;
}

function areSiteContentPayloadsEqual(
  key: 'homepage_hero' | 'company_story',
  a: Record<string, unknown> | undefined | null,
  b: HomepageHeroContent | CompanyStoryContent
): boolean {
  if (!a || typeof a !== 'object') return false;
  const fields =
    key === 'homepage_hero' ? HOMEPAGE_HERO_FIELDS : COMPANY_STORY_FIELDS;
  const recordB = b as Record<string, unknown>;
  return fields.every((f) => a[f] === recordB[f]);
}

/**
 * Non-destructively imports content from existing local storage files into MongoDB.
 * Uses strictly insert-only semantics: if a MongoDB document already exists, it is
 * NEVER overwritten. Differences are reported in `conflicts` for explicit review.
 * Leaves all local files on disk intact as persistent backup.
 */
export async function migrateFromLocalFiles(
  db: Db,
  baseDir?: string,
  options?: Record<string, unknown>
): Promise<MigrationSummary> {
  if (options && 'force' in options && Boolean(options.force)) {
    throw new Error(
      'Destructive force-migration is prohibited. Local file migration is strictly non-destructive and will not overwrite existing MongoDB documents.'
    );
  }

  const root = baseDir || process.cwd();
  const summary: MigrationSummary = {
    ok: true,
    status: 'completed',
    source: 'local_files',
    migratedRecords: { site_content: 0 },
    skippedRecords: { site_content: 0 },
    conflicts: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  const siteContentColl = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);

  const fileCandidates: Array<{
    key: 'homepage_hero' | 'company_story';
    filePath: string;
  }> = [
    {
      key: 'homepage_hero',
      filePath:
        process.env.MIRAGE_HOMEPAGE_CONTENT_FILE ||
        path.join(root, '.data', 'site-content', 'homepage-hero.json'),
    },
    {
      key: 'company_story',
      filePath:
        process.env.MIRAGE_COMPANY_CONTENT_FILE ||
        path.join(root, '.data', 'site-content', 'company-story.json'),
    },
  ];

  for (const candidate of fileCandidates) {
    if (!existsSync(candidate.filePath)) {
      summary.skippedRecords.site_content++;
      continue;
    }

    try {
      const raw = await fs.readFile(candidate.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const validated = validateSiteContentData(candidate.key, parsed);

      if (!validated.ok) {
        summary.errors.push(
          `Local file for "${candidate.key}" at ${candidate.filePath} failed validation: ${validated.error}`
        );
        continue;
      }

      const existing = await siteContentColl.findOne({ key: candidate.key });
      if (!existing) {
        const res = await siteContentColl.updateOne(
          { key: candidate.key },
          {
            $setOnInsert: {
              key: candidate.key,
              data: validated.data,
              updatedAt: validated.data.updatedAt || new Date().toISOString(),
              updatedBy: validated.data.updatedBy || 'Migrated from local JSON',
            },
          },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          summary.migratedRecords.site_content++;
        } else {
          summary.skippedRecords.site_content++;
        }
      } else {
        const existingData = existing.data as
          | Record<string, unknown>
          | undefined;
        const isSame = areSiteContentPayloadsEqual(
          candidate.key,
          existingData,
          validated.data
        );

        summary.skippedRecords.site_content++;

        if (!isSame) {
          summary.conflicts.push({
            collection: MONGO_COLLECTIONS.SITE_CONTENT,
            keyOrId: candidate.key,
            reason:
              'Destination MongoDB document already exists with different content; preserved existing MongoDB document and kept local JSON file intact.',
            preservedDestinationUpdatedAt:
              typeof existing.updatedAt === 'string'
                ? existing.updatedAt
                : null,
            sourceUpdatedAt: validated.data.updatedAt ?? null,
          });
        }
      }
    } catch (err) {
      summary.errors.push(
        `Failed to read or migrate local file for "${candidate.key}" at ${candidate.filePath}: ${String(err)}`
      );
    }
  }

  if (summary.errors.length > 0) {
    summary.ok = false;
    summary.status = 'failed';
  } else if (summary.conflicts.length > 0) {
    summary.ok = true;
    summary.status = 'completed_with_conflicts';
  }

  return summary;
}

/**
 * Creates a read-only Supabase table fetcher from environment credentials if configured.
 * Returns null when credentials are absent.
 */
function createEnvSupabaseReadOnlySource(): SupabaseReadOnlySource | null {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  )?.trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !url.startsWith('http') || !key) {
    return null;
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async fetchTable(tableName) {
      const { data, error } = await client.from(tableName).select('*');
      return {
        data: (data as Record<string, unknown>[] | null) ?? null,
        error: error ? { message: error.message } : null,
      };
    },
  };
}

/**
 * Safe, read-only import path from legacy Supabase tables into MongoDB.
 *
 * - Never modifies or deletes records in Supabase.
 * - Never overwrites existing MongoDB documents; conflicts are logged for review.
 * - If Supabase credentials are not configured and no custom reader is provided,
 *   returns `status: 'pending_configuration'` with the exact manual step required.
 */
export async function migrateFromSupabase(
  db: Db,
  customSource?: SupabaseReadOnlySource
): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    ok: true,
    status: 'completed',
    source: 'supabase',
    migratedRecords: {
      site_content: 0,
      products: 0,
      b2b_leads: 0,
      audit_logs: 0,
    },
    skippedRecords: {
      site_content: 0,
      products: 0,
      b2b_leads: 0,
      audit_logs: 0,
    },
    conflicts: [],
    errors: [],
    timestamp: new Date().toISOString(),
  };

  const reader = customSource ?? createEnvSupabaseReadOnlySource();
  if (!reader) {
    summary.ok = false;
    summary.status = 'pending_configuration';
    summary.errors.push(
      'Supabase credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured. Read-only Supabase import has NOT been executed.'
    );
    summary.manualActionRequired =
      'If legacy data exists in a remote Supabase project, provide NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and MONGODB_URI on the server and invoke migrateFromSupabase(db), or export the Supabase tables as JSON and import into MongoDB.';
    return summary;
  }

  // 1. Import site_content
  const siteContentColl = db.collection(MONGO_COLLECTIONS.SITE_CONTENT);
  const siteRes = await reader.fetchTable('site_content');
  if (siteRes.error) {
    summary.errors.push(`Supabase read error on site_content: ${siteRes.error.message}`);
  } else if (Array.isArray(siteRes.data)) {
    for (const row of siteRes.data) {
      const rawKey = typeof row.key === 'string' ? row.key : '';
      const rawPayload = row.content ?? row.data;
      const validated = validateSiteContentData(rawKey, rawPayload);
      if (!validated.ok) {
        summary.errors.push(
          `Supabase site_content row "${rawKey}" failed validation: ${validated.error}`
        );
        continue;
      }

      const existing = await siteContentColl.findOne({ key: validated.key });
      if (!existing) {
        const res = await siteContentColl.updateOne(
          { key: validated.key },
          {
            $setOnInsert: {
              key: validated.key,
              data: validated.data,
              updatedAt:
                (typeof row.updated_at === 'string' ? row.updated_at : null) ??
                validated.data.updatedAt ??
                new Date().toISOString(),
              updatedBy:
                (typeof row.updated_by === 'string' ? row.updated_by : null) ??
                validated.data.updatedBy ??
                'Migrated from Supabase',
            },
          },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          summary.migratedRecords.site_content++;
        } else {
          summary.skippedRecords.site_content++;
        }
      } else {
        summary.skippedRecords.site_content++;
        const isSame = areSiteContentPayloadsEqual(
          validated.key,
          existing.data as Record<string, unknown> | undefined,
          validated.data
        );
        if (!isSame) {
          summary.conflicts.push({
            collection: MONGO_COLLECTIONS.SITE_CONTENT,
            keyOrId: validated.key,
            reason:
              'Destination MongoDB site_content document already exists with different content; preserved MongoDB document.',
            preservedDestinationUpdatedAt:
              typeof existing.updatedAt === 'string' ? existing.updatedAt : null,
            sourceUpdatedAt:
              typeof row.updated_at === 'string' ? row.updated_at : null,
          });
        }
      }
    }
  }

  // 2. Import products
  const productsColl = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  const prodRes = await reader.fetchTable('products');
  if (prodRes.error) {
    summary.errors.push(`Supabase read error on products: ${prodRes.error.message}`);
  } else if (Array.isArray(prodRes.data)) {
    for (const row of prodRes.data) {
      const parsed = MongoProductDocSchema.safeParse(row);
      if (!parsed.success) {
        summary.errors.push(
          `Supabase product row "${String(row.id ?? '<missing>')}" failed validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
        continue;
      }
      const existing = await productsColl.findOne({ id: parsed.data.id });
      if (!existing) {
        const res = await productsColl.updateOne(
          { id: parsed.data.id },
          { $setOnInsert: parsed.data },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          summary.migratedRecords.products =
            (summary.migratedRecords.products ?? 0) + 1;
        } else {
          summary.skippedRecords.products =
            (summary.skippedRecords.products ?? 0) + 1;
        }
      } else {
        summary.skippedRecords.products =
          (summary.skippedRecords.products ?? 0) + 1;
        if (
          existing.name !== parsed.data.name ||
          existing.description !== parsed.data.description
        ) {
          summary.conflicts.push({
            collection: MONGO_COLLECTIONS.PRODUCTS,
            keyOrId: parsed.data.id,
            reason:
              'Destination MongoDB product already exists with different fields; preserved MongoDB product.',
          });
        }
      }
    }
  }

  // 3. Import b2b_leads
  const leadsColl = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
  const leadsRes = await reader.fetchTable('b2b_leads');
  if (leadsRes.error) {
    summary.errors.push(`Supabase read error on b2b_leads: ${leadsRes.error.message}`);
  } else if (Array.isArray(leadsRes.data)) {
    for (const row of leadsRes.data) {
      const parsed = B2BLeadRecordSchema.safeParse(row);
      if (!parsed.success) {
        summary.errors.push(
          `Supabase b2b_leads row "${String(row.id ?? '<missing>')}" failed validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
        continue;
      }
      const existing = await leadsColl.findOne({ id: parsed.data.id });
      if (!existing) {
        const res = await leadsColl.updateOne(
          { id: parsed.data.id },
          { $setOnInsert: parsed.data },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          summary.migratedRecords.b2b_leads =
            (summary.migratedRecords.b2b_leads ?? 0) + 1;
        } else {
          summary.skippedRecords.b2b_leads =
            (summary.skippedRecords.b2b_leads ?? 0) + 1;
        }
      } else {
        summary.skippedRecords.b2b_leads =
          (summary.skippedRecords.b2b_leads ?? 0) + 1;
      }
    }
  }

  // 4. Import audit_logs
  const auditColl = db.collection(MONGO_COLLECTIONS.AUDIT_LOGS);
  const auditRes = await reader.fetchTable('audit_logs');
  if (auditRes.error) {
    summary.errors.push(`Supabase read error on audit_logs: ${auditRes.error.message}`);
  } else if (Array.isArray(auditRes.data)) {
    for (const row of auditRes.data) {
      const parsed = AuditLogRecordSchema.safeParse(row);
      if (!parsed.success) {
        summary.errors.push(
          `Supabase audit_logs row "${String(row.id ?? '<missing>')}" failed validation: ${parsed.error.issues.map((i) => i.message).join('; ')}`
        );
        continue;
      }
      const existing = await auditColl.findOne({ id: parsed.data.id });
      if (!existing) {
        const res = await auditColl.updateOne(
          { id: parsed.data.id },
          { $setOnInsert: parsed.data },
          { upsert: true }
        );
        if (res.upsertedCount > 0) {
          summary.migratedRecords.audit_logs =
            (summary.migratedRecords.audit_logs ?? 0) + 1;
        } else {
          summary.skippedRecords.audit_logs =
            (summary.skippedRecords.audit_logs ?? 0) + 1;
        }
      } else {
        summary.skippedRecords.audit_logs =
          (summary.skippedRecords.audit_logs ?? 0) + 1;
      }
    }
  }

  if (summary.errors.length > 0) {
    summary.ok = false;
    summary.status = 'failed';
  } else if (summary.conflicts.length > 0) {
    summary.ok = true;
    summary.status = 'completed_with_conflicts';
  }

  return summary;
}

/**
 * Creates an in-memory JSON snapshot of MongoDB collections for backup or audit verification.
 */
export async function exportMongoSnapshot(db: Db): Promise<{
  timestamp: string;
  collections: Record<string, unknown[]>;
}> {
  const collections: Record<string, unknown[]> = {};
  for (const collName of Object.values(MONGO_COLLECTIONS)) {
    try {
      const records = await db.collection(collName).find({}).toArray();
      // Remove raw MongoDB internal ObjectIDs from snapshot serialization
      collections[collName] = records.map((r) => {
        const { _id, ...rest } = r;
        return rest;
      });
    } catch {
      collections[collName] = [];
    }
  }
  return {
    timestamp: new Date().toISOString(),
    collections,
  };
}

/**
 * Documentation string for database backup and rollback procedures.
 */
export const MONGODB_BACKUP_AND_ROLLBACK_GUIDE = `
# MongoDB Backup and Rollback Procedures (Mirage Direction Two)

### 1. Manual Backup Before Migration (Command Line)
To take a full cluster/database dump:
  mongodump --uri="mongodb://localhost:27017" --db="mirage_pharma" --out="./backups/backup_$(date +%Y%m%d_%H%M%S)"

### 2. Exporting Single Collections as JSON:
  mongoexport --uri="mongodb://localhost:27017" --db="mirage_pharma" --collection="site_content" --out="./backups/site_content.json"
  mongoexport --uri="mongodb://localhost:27017" --db="mirage_pharma" --collection="products" --out="./backups/products.json"

### 3. Emergency Rollback Procedure:
If a migration error occurs or data state needs to be restored to pre-migration baseline:
  mongorestore --uri="mongodb://localhost:27017" --db="mirage_pharma" --drop "./backups/<backup_name>/mirage_pharma"

### 4. Non-Destructive Principles Applied:
- Source SQL migrations and local JSON files are never deleted or modified.
- Existing MongoDB records are never overwritten by automated seeds or migrations.
- Application logic falls back to original static source data if MongoDB is unreachable or empty.
`;
