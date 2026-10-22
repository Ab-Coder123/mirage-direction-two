import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import type { Db } from 'mongodb';

import {
  MONGO_COLLECTIONS,
  MONGO_INDEX_SPECIFICATIONS,
  MongoSiteContentDocSchema,
  MongoProductDocSchema,
  validateSiteContentData,
  ensureMongoIndexes,
} from '../src/server/mongo-models';
import {
  seedMongoDatabase,
  resolveHomepageHeroWithFallback,
  resolveCompanyStoryWithFallback,
} from '../src/server/mongo-seed';
import {
  migrateFromLocalFiles,
  migrateFromSupabase,
  exportMongoSnapshot,
  MONGODB_BACKUP_AND_ROLLBACK_GUIDE,
  type SupabaseReadOnlySource,
} from '../src/server/mongo-migration';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
} from '../src/homepage-content';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
} from '../src/company-content';
import {
  INITIAL_PRODUCTS,
  INITIAL_B2B_LEADS,
  INITIAL_AUDIT_LOGS,
} from '../src/seed-data';

/**
 * UNIT TEST HARNESS: In-memory mock of MongoDB `Db` for deterministic testing
 * of schemas, index orchestration, seed idempotency, conflict detection, and
 * non-destructive migration logic (NOT a live MongoDB server integration test).
 */
function createMockDb(options?: {
  onCreateIndex?: (collectionName: string, keys: unknown, opts: unknown) => Promise<string>;
}): { db: Db; store: Record<string, any[]> } {
  const store: Record<string, any[]> = {
    site_content: [],
    products: [],
    b2b_leads: [],
    audit_logs: [],
  };

  const createdIndexes: Record<string, any[]> = {};

  const collection = (name: string) => ({
    createIndex: vi.fn(async (keys: any, indexOpts: any) => {
      if (options?.onCreateIndex) {
        return options.onCreateIndex(name, keys, indexOpts);
      }
      createdIndexes[name] = createdIndexes[name] || [];
      createdIndexes[name].push({ keys, options: indexOpts });
      return indexOpts?.name || Object.keys(keys).join('_');
    }),
    findOne: vi.fn(async (filter: any) => {
      const items = store[name] || [];
      return (
        items.find((item) =>
          Object.entries(filter).every(([k, v]) => item[k] === v)
        ) || null
      );
    }),
    updateOne: vi.fn(async (filter: any, update: any, updateOpts?: any) => {
      store[name] = store[name] || [];
      const idx = store[name].findIndex((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      );

      if (idx >= 0) {
        if (update.$set) {
          store[name][idx] = { ...store[name][idx], ...update.$set };
          return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
        }
        // $setOnInsert does NOT modify an existing document
        return { matchedCount: 1, modifiedCount: 0, upsertedCount: 0 };
      } else {
        if (updateOpts?.upsert) {
          const newDoc = {
            ...filter,
            ...(update.$set || {}),
            ...(update.$setOnInsert || {}),
          };
          store[name].push(newDoc);
          return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
        }
        return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
      }
    }),
    find: vi.fn(() => ({
      toArray: vi.fn(async () => store[name] || []),
    })),
  });

  return {
    db: { collection } as unknown as Db,
    store,
  };
}

describe('UNIT TEST — PHASE 3: MongoDB Models, Validation, Indexes, Seed & Safe Migration (Mock Db)', () => {
  describe('Document Schemas & Strict Key/Payload Validation', () => {
    it('validates MongoSiteContentDocSchema with valid homepage_hero document', () => {
      const doc = {
        key: 'homepage_hero',
        data: DEFAULT_HOMEPAGE_HERO_CONTENT,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Test Runner',
      };

      const parsed = MongoSiteContentDocSchema.safeParse(doc);
      expect(parsed.success).toBe(true);
    });

    it('validates MongoSiteContentDocSchema with valid company_story document', () => {
      const doc = {
        key: 'company_story',
        data: DEFAULT_COMPANY_STORY_CONTENT,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Test Runner',
      };

      const parsed = MongoSiteContentDocSchema.safeParse(doc);
      expect(parsed.success).toBe(true);
    });

    it('rejects unknown content keys in both validateSiteContentData and MongoSiteContentDocSchema', () => {
      const unknownCheck = validateSiteContentData('unknown_section', {
        arbitrary: 'value',
      });
      expect(unknownCheck.ok).toBe(false);
      if (!unknownCheck.ok) {
        expect(unknownCheck.error).toMatch(/Unsupported site_content key "unknown_section"/);
      }

      const schemaCheck = MongoSiteContentDocSchema.safeParse({
        key: 'arbitrary_key',
        data: DEFAULT_HOMEPAGE_HERO_CONTENT,
      });
      expect(schemaCheck.success).toBe(false);
    });

    it('rejects empty keys and malformed payloads for known keys', () => {
      const emptyKey = validateSiteContentData('', DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(emptyKey.ok).toBe(false);

      const badHero = validateSiteContentData('homepage_hero', { badgeEn: '' });
      expect(badHero.ok).toBe(false);
      if (!badHero.ok) {
        expect(badHero.error.length).toBeGreaterThan(0);
      }

      const badStory = validateSiteContentData('company_story', {
        heroTitleEn: 'Valid Title',
        workforceEn: '', // required non-empty
      });
      expect(badStory.ok).toBe(false);

      const docSchemaBadData = MongoSiteContentDocSchema.safeParse({
        key: 'homepage_hero',
        data: { badgeEn: '' },
      });
      expect(docSchemaBadData.success).toBe(false);
    });

    it('validates company_story and confirms static workforce 75 + 500 baseline', () => {
      const res = validateSiteContentData(
        'company_story',
        DEFAULT_COMPANY_STORY_CONTENT
      );
      expect(res.ok).toBe(true);
      if (res.ok && 'workforceEn' in res.data) {
        expect(res.data.workforceEn).toBe('75 + 500');
        expect(res.data.workforceAr).toBe('75 + 500');
      }
    });

    it('validates product documents with MongoProductDocSchema', () => {
      const validProd = MongoProductDocSchema.safeParse(INITIAL_PRODUCTS[0]);
      expect(validProd.success).toBe(true);

      const invalidProd = MongoProductDocSchema.safeParse({ id: '', name: 'X' });
      expect(invalidProd.success).toBe(false);
    });
  });

  describe('Field-by-Field Fallback Resolution (Static Data Preservation)', () => {
    it('resolves homepage hero field-by-field from static defaults without mutating originals', () => {
      const emptyResolved = resolveHomepageHeroWithFallback(null);
      expect(emptyResolved).toEqual(DEFAULT_HOMEPAGE_HERO_CONTENT);

      const partialResolved = resolveHomepageHeroWithFallback({
        headlinePrefixEn: 'Custom Override Prefix',
      });
      expect(partialResolved.headlinePrefixEn).toBe('Custom Override Prefix');
      expect(partialResolved.headlineHighlightEn).toBe(
        DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn
      );
      expect(partialResolved.headlinePrefixAr).toBe(
        DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr
      );
      // Confirm original static object was not mutated
      expect(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn).toBe(
        'New Vision, New Era in'
      );
    });

    it('resolves company story field-by-field and preserves 75 + 500 workforce default', () => {
      const emptyResolved = resolveCompanyStoryWithFallback(undefined);
      expect(emptyResolved.workforceEn).toBe('75 + 500');
      expect(emptyResolved.workforceAr).toBe('75 + 500');

      const partialResolved = resolveCompanyStoryWithFallback({
        capitalEn: '95 Million EGP',
      });
      expect(partialResolved.capitalEn).toBe('95 Million EGP');
      expect(partialResolved.workforceEn).toBe('75 + 500');
      expect(partialResolved.workforceAr).toBe('75 + 500');
      expect(DEFAULT_COMPANY_STORY_CONTENT.capitalEn).toBe('50 Million EGP');
    });
  });

  describe('Index Specifications and Error Surfacing', () => {
    it('defines unique and query indexes for all 4 primary collections', () => {
      const collections = MONGO_INDEX_SPECIFICATIONS.map((s) => s.collection);
      expect(collections).toContain(MONGO_COLLECTIONS.SITE_CONTENT);
      expect(collections).toContain(MONGO_COLLECTIONS.PRODUCTS);
      expect(collections).toContain(MONGO_COLLECTIONS.B2B_LEADS);
      expect(collections).toContain(MONGO_COLLECTIONS.AUDIT_LOGS);

      const siteContentSpec = MONGO_INDEX_SPECIFICATIONS.find(
        (s) => s.collection === MONGO_COLLECTIONS.SITE_CONTENT
      );
      expect(
        siteContentSpec?.indexes.some(
          (idx) => idx.unique && idx.key && 'key' in idx.key
        )
      ).toBe(true);

      const productSpec = MONGO_INDEX_SPECIFICATIONS.find(
        (s) => s.collection === MONGO_COLLECTIONS.PRODUCTS
      );
      expect(
        productSpec?.indexes.some(
          (idx) => idx.unique && idx.key && 'id' in idx.key
        )
      ).toBe(true);
      expect(
        productSpec?.indexes.some(
          (idx) => idx.unique && idx.key && 'slug' in idx.key
        )
      ).toBe(true);
    });

    it('creates indexes idempotently and accepts benign same-specification responses', async () => {
      const { db } = createMockDb({
        onCreateIndex: async (_coll, _keys, opts: any) => {
          if (opts?.name === 'idx_site_content_key_unique') {
            const benignErr = Object.assign(
              new Error('Index already exists with the same specification'),
              { code: 68, codeName: 'IndexAlreadyExists' }
            );
            throw benignErr;
          }
          return opts?.name ?? 'index';
        },
      });

      const result = await ensureMongoIndexes(db);
      expect(result.collectionsEnsured).toHaveLength(4);
      expect(result.indexesCreated[MONGO_COLLECTIONS.SITE_CONTENT]).toContain(
        'idx_site_content_key_unique (existing)'
      );
    });

    it('surfaces permission, connectivity, duplicate-key, and incompatible-index errors instead of hiding them', async () => {
      const failureCases = [
        Object.assign(
          new Error('Index already exists with different options'),
          { code: 85, codeName: 'IndexOptionsConflict' }
        ),
        Object.assign(
          new Error('E11000 duplicate key error collection: mirage_pharma.products'),
          { code: 11000 }
        ),
        Object.assign(
          new Error('not authorized on mirage_pharma to execute command { createIndexes: "site_content" }'),
          { code: 13, codeName: 'Unauthorized' }
        ),
        new Error('MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017'),
      ];

      for (const simulatedError of failureCases) {
        const { db } = createMockDb({
          onCreateIndex: async () => {
            throw simulatedError;
          },
        });

        await expect(ensureMongoIndexes(db)).rejects.toThrow(
          /Failed to ensure index/
        );
      }
    });
  });

  describe('Strictly Non-Destructive & Idempotent Seed Behavior', () => {
    it('seeds default static data on initial run without mutating originals', async () => {
      const { db, store } = createMockDb();
      const res = await seedMongoDatabase(db);

      expect(res.ok).toBe(true);
      expect(res.siteContentSeeded).toBe(2);
      expect(res.productsSeeded).toBe(INITIAL_PRODUCTS.length);
      expect(res.leadsSeeded).toBe(INITIAL_B2B_LEADS.length);
      expect(res.auditLogsSeeded).toBe(INITIAL_AUDIT_LOGS.length);

      const storyDoc = store.site_content.find((d) => d.key === 'company_story');
      expect(storyDoc).toBeDefined();
      expect(storyDoc.data.workforceEn).toBe('75 + 500');
      expect(storyDoc.data.workforceAr).toBe('75 + 500');
    });

    it('preserves existing site_content, products, leads, and audit_logs on rerun', async () => {
      const { db, store } = createMockDb();

      // Prepopulate MongoDB with customized records across all 4 collections
      store.site_content.push(
        {
          key: 'homepage_hero',
          data: {
            ...DEFAULT_HOMEPAGE_HERO_CONTENT,
            headlinePrefixEn: 'Admin Customized Hero Headline',
          },
          updatedAt: '2026-10-21T12:00:00Z',
          updatedBy: 'Dr. Admin',
        },
        {
          key: 'company_story',
          data: {
            ...DEFAULT_COMPANY_STORY_CONTENT,
            capitalEn: '120 Million EGP',
          },
          updatedAt: '2026-10-21T12:00:00Z',
          updatedBy: 'Dr. Admin',
        }
      );

      store.products.push({
        ...INITIAL_PRODUCTS[0],
        name: 'SymPDCA Custom Clinical Edition',
      });

      store.b2b_leads.push({
        ...INITIAL_B2B_LEADS[0],
        status: 'CONTRACT_SIGNED',
      });

      store.audit_logs.push({
        ...INITIAL_AUDIT_LOGS[0],
        action: 'CUSTOM_EXISTING_AUDIT_ENTRY',
      });

      const res = await seedMongoDatabase(db);
      expect(res.ok).toBe(true);
      expect(res.siteContentSeeded).toBe(0);
      expect(res.skipped).toBeGreaterThanOrEqual(5);

      // Verify none of the existing records were overwritten
      const heroDoc = store.site_content.find((d) => d.key === 'homepage_hero');
      expect(heroDoc.data.headlinePrefixEn).toBe('Admin Customized Hero Headline');

      const storyDoc = store.site_content.find((d) => d.key === 'company_story');
      expect(storyDoc.data.capitalEn).toBe('120 Million EGP');

      const prodDoc = store.products.find((p) => p.id === INITIAL_PRODUCTS[0].id);
      expect(prodDoc.name).toBe('SymPDCA Custom Clinical Edition');

      const leadDoc = store.b2b_leads.find((l) => l.id === INITIAL_B2B_LEADS[0].id);
      expect(leadDoc.status).toBe('CONTRACT_SIGNED');

      const auditDoc = store.audit_logs.find((a) => a.id === INITIAL_AUDIT_LOGS[0].id);
      expect(auditDoc.action).toBe('CUSTOM_EXISTING_AUDIT_ENTRY');
    });

    it('rejects any attempt to pass { force: true } to seedMongoDatabase', async () => {
      const { db, store } = createMockDb();
      store.site_content.push({
        key: 'homepage_hero',
        data: {
          ...DEFAULT_HOMEPAGE_HERO_CONTENT,
          headlinePrefixEn: 'Protected Content',
        },
      });

      await expect(
        seedMongoDatabase(db, { force: true })
      ).rejects.toThrow(/Destructive force-seeding is prohibited/);

      expect(store.site_content[0].data.headlinePrefixEn).toBe('Protected Content');
    });
  });

  describe('Non-Destructive Local File Migration & Conflict Detection', () => {
    let tempDir: string;
    let heroFile: string;
    let companyFile: string;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'mirage-migration-test-')
      );
      heroFile = path.join(tempDir, 'homepage-hero.json');
      companyFile = path.join(tempDir, 'company-story.json');

      process.env.MIRAGE_HOMEPAGE_CONTENT_FILE = heroFile;
      process.env.MIRAGE_COMPANY_CONTENT_FILE = companyFile;
    });

    afterEach(async () => {
      delete process.env.MIRAGE_HOMEPAGE_CONTENT_FILE;
      delete process.env.MIRAGE_COMPANY_CONTENT_FILE;
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignored
      }
    });

    it('imports local JSON files when MongoDB is empty and leaves source files intact', async () => {
      const customHero = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        headlinePrefixEn: 'Migrated Clinical Headline',
      };
      const customStory = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '90 Million EGP',
      };

      await fs.writeFile(heroFile, JSON.stringify(customHero), 'utf8');
      await fs.writeFile(companyFile, JSON.stringify(customStory), 'utf8');

      const { db, store } = createMockDb();
      const summary = await migrateFromLocalFiles(db, tempDir);

      expect(summary.ok).toBe(true);
      expect(summary.status).toBe('completed');
      expect(summary.migratedRecords.site_content).toBe(2);
      expect(summary.conflicts).toHaveLength(0);

      const heroInDb = store.site_content.find((d) => d.key === 'homepage_hero');
      expect(heroInDb.data.headlinePrefixEn).toBe('Migrated Clinical Headline');

      const storyInDb = store.site_content.find((d) => d.key === 'company_story');
      expect(storyInDb.data.capitalEn).toBe('90 Million EGP');
      expect(storyInDb.data.workforceEn).toBe('75 + 500');

      const heroStillExists = await fs.stat(heroFile);
      expect(heroStillExists.isFile()).toBe(true);
      const storyStillExists = await fs.stat(companyFile);
      expect(storyStillExists.isFile()).toBe(true);
    });

    it('does NOT overwrite newer existing MongoDB documents when rerunning migration with stale local JSON', async () => {
      const { db, store } = createMockDb();

      // Prepopulate MongoDB with newer Admin edits
      store.site_content.push(
        {
          key: 'homepage_hero',
          data: {
            ...DEFAULT_HOMEPAGE_HERO_CONTENT,
            headlinePrefixEn: 'Newer MongoDB Admin Headline',
          },
          updatedAt: '2026-10-21T14:00:00Z',
          updatedBy: 'Admin User',
        },
        {
          key: 'company_story',
          data: {
            ...DEFAULT_COMPANY_STORY_CONTENT,
            capitalEn: '150 Million EGP (Newer MongoDB)',
          },
          updatedAt: '2026-10-21T14:00:00Z',
          updatedBy: 'Admin User',
        }
      );

      // Write stale local JSON files with older values
      const staleHero = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        headlinePrefixEn: 'Stale Local Disk Headline',
        updatedAt: '2026-10-01T00:00:00Z',
      };
      const staleStory = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '55 Million EGP (Stale Local)',
        updatedAt: '2026-10-01T00:00:00Z',
      };
      await fs.writeFile(heroFile, JSON.stringify(staleHero), 'utf8');
      await fs.writeFile(companyFile, JSON.stringify(staleStory), 'utf8');

      // Run migration
      const summary = await migrateFromLocalFiles(db, tempDir);

      expect(summary.ok).toBe(true);
      expect(summary.status).toBe('completed_with_conflicts');
      expect(summary.migratedRecords.site_content).toBe(0);
      expect(summary.skippedRecords.site_content).toBe(2);
      expect(summary.conflicts).toHaveLength(2);

      // Verify existing MongoDB documents remain completely unchanged
      const heroInDb = store.site_content.find((d) => d.key === 'homepage_hero');
      expect(heroInDb.data.headlinePrefixEn).toBe('Newer MongoDB Admin Headline');

      const storyInDb = store.site_content.find((d) => d.key === 'company_story');
      expect(storyInDb.data.capitalEn).toBe('150 Million EGP (Newer MongoDB)');

      // Verify local JSON files were also preserved untouched on disk
      const diskHero = JSON.parse(await fs.readFile(heroFile, 'utf8'));
      expect(diskHero.headlinePrefixEn).toBe('Stale Local Disk Headline');
    });

    it('rejects { force: true } on migrateFromLocalFiles', async () => {
      const { db } = createMockDb();
      await expect(
        migrateFromLocalFiles(db, tempDir, { force: true })
      ).rejects.toThrow(/Destructive force-migration is prohibited/);
    });
  });

  describe('Legacy Supabase Read-Only Import Path', () => {
    it('reports pending_configuration when Supabase credentials are not configured', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { db } = createMockDb();
      const summary = await migrateFromSupabase(db);

      expect(summary.ok).toBe(false);
      expect(summary.status).toBe('pending_configuration');
      expect(summary.manualActionRequired).toBeDefined();
      expect(summary.errors[0]).toMatch(/Supabase credentials .* are not configured/);
    });

    it('imports Supabase records read-only without overwriting existing MongoDB records', async () => {
      const { db, store } = createMockDb();

      // Prepopulate MongoDB with an existing homepage_hero edit
      store.site_content.push({
        key: 'homepage_hero',
        data: {
          ...DEFAULT_HOMEPAGE_HERO_CONTENT,
          headlinePrefixEn: 'Existing MongoDB Hero',
        },
        updatedAt: '2026-10-21T14:00:00Z',
      });

      const readOnlySource: SupabaseReadOnlySource = {
        fetchTable: vi.fn(async (tableName) => {
          if (tableName === 'site_content') {
            return {
              data: [
                {
                  key: 'homepage_hero',
                  content: {
                    ...DEFAULT_HOMEPAGE_HERO_CONTENT,
                    headlinePrefixEn: 'Older Supabase Hero',
                  },
                  updated_at: '2026-10-01T00:00:00Z',
                },
                {
                  key: 'company_story',
                  content: {
                    ...DEFAULT_COMPANY_STORY_CONTENT,
                    capitalEn: '85 Million EGP from Supabase',
                  },
                  updated_at: '2026-10-15T00:00:00Z',
                },
              ],
            };
          }
          if (tableName === 'products') {
            return { data: [INITIAL_PRODUCTS[0] as unknown as Record<string, unknown>] };
          }
          if (tableName === 'b2b_leads') {
            return { data: [INITIAL_B2B_LEADS[0] as unknown as Record<string, unknown>] };
          }
          if (tableName === 'audit_logs') {
            return { data: [INITIAL_AUDIT_LOGS[0] as unknown as Record<string, unknown>] };
          }
          return { data: [] };
        }),
      };

      const summary = await migrateFromSupabase(db, readOnlySource);

      expect(summary.ok).toBe(true);
      expect(summary.status).toBe('completed_with_conflicts');
      expect(summary.migratedRecords.site_content).toBe(1); // company_story inserted
      expect(summary.skippedRecords.site_content).toBe(1); // homepage_hero preserved
      expect(summary.conflicts).toHaveLength(1);
      expect(summary.conflicts[0]?.keyOrId).toBe('homepage_hero');

      // Existing MongoDB homepage_hero was NOT overwritten
      const heroInDb = store.site_content.find((d) => d.key === 'homepage_hero');
      expect(heroInDb.data.headlinePrefixEn).toBe('Existing MongoDB Hero');

      // Missing company_story WAS imported from Supabase
      const storyInDb = store.site_content.find((d) => d.key === 'company_story');
      expect(storyInDb.data.capitalEn).toBe('85 Million EGP from Supabase');
    });

    it('exports in-memory snapshots and documents backup/rollback instructions', async () => {
      const { db } = createMockDb();
      await seedMongoDatabase(db);

      const snapshot = await exportMongoSnapshot(db);
      expect(snapshot.timestamp).toBeDefined();
      expect(snapshot.collections.site_content).toHaveLength(2);
      expect(snapshot.collections.products?.length).toBeGreaterThanOrEqual(2);

      expect(MONGODB_BACKUP_AND_ROLLBACK_GUIDE).toContain('mongodump');
      expect(MONGODB_BACKUP_AND_ROLLBACK_GUIDE).toContain('mongorestore');
      expect(MONGODB_BACKUP_AND_ROLLBACK_GUIDE).toContain('--drop');
    });
  });
});
