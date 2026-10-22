import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Db } from 'mongodb';

import {
  DEFAULT_COMPANY_STORY_CONTENT,
  CompanyStoryInputSchema,
  type CompanyStoryInput,
  type CompanyStoryContent,
} from '../src/company-content';
import {
  resolveCompanyStorage,
  loadCompanyStoryContent,
  loadCompanyStoryContentFromDb,
  saveCompanyStoryContent,
  saveCompanyStoryContentToDb,
  COMPANY_STORY_KEY,
  ContentPersistenceError,
} from '../src/server/company-repository';
import {
  issueSessionToken,
  setTestSessionCookieForTesting,
} from '../src/server/auth';
import {
  getCompanyStoryAction,
  saveCompanyStoryAction,
} from '../../../apps/admin/app/settings/company-actions';

const TEST_SECRET = 'mirage-test-session-secret-key-32-chars-long!';

/**
 * UNIT TEST HARNESS: In-memory mock of MongoDB `Db` for deterministic testing
 * of Phase 8 MongoDB write acknowledgment, retrieval, and partial override fallback.
 * NOTE: This is a unit test harness using an in-memory mock, NOT proof of a live MongoDB connection.
 */
function createMockMongoDb(initialDocs: Record<string, any[]> = {}): {
  db: Db;
  store: Record<string, any[]>;
  setAcknowledged: (val: boolean) => void;
} {
  const store: Record<string, any[]> = {
    site_content: initialDocs.site_content ? [...initialDocs.site_content] : [],
  };

  let acknowledged = true;

  const collection = (name: string) => ({
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
        }
        return {
          acknowledged,
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
        };
      } else {
        if (updateOpts?.upsert) {
          const newDoc = {
            ...filter,
            ...(update.$set || {}),
            ...(update.$setOnInsert || {}),
          };
          store[name].push(newDoc);
          return {
            acknowledged,
            matchedCount: 0,
            modifiedCount: 0,
            upsertedCount: 1,
          };
        }
        return {
          acknowledged,
          matchedCount: 0,
          modifiedCount: 0,
          upsertedCount: 0,
        };
      }
    }),
  });

  return {
    db: { collection } as unknown as Db,
    store,
    setAcknowledged: (val: boolean) => {
      acknowledged = val;
    },
  };
}

describe('PHASE 8: Company Story & Facts CMS ↔ MongoDB Runtime Storage Suite', () => {
  beforeEach(() => {
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    delete process.env.MIRAGE_CONTENT_BACKEND;
  });

  afterEach(() => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    delete process.env.MONGODB_URI;
  });

  describe('1. MongoDB Load & Partial Override Fallback', () => {
    it('returns default company content when collection is empty', async () => {
      const { db } = createMockMongoDb();
      const result = await loadCompanyStoryContentFromDb(db);

      expect(result.source).toBe('default');
      expect(result.content.heroTitleEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn);
      expect(result.content.capitalEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.capitalEn);
      expect(result.content.workforceEn).toBe('75 + 500');
    });

    it('loads persisted overrides from MongoDB site_content and reports source: "mongodb"', async () => {
      const now = new Date();
      const { db } = createMockMongoDb({
        site_content: [
          {
            key: COMPANY_STORY_KEY,
            data: {
              ...DEFAULT_COMPANY_STORY_CONTENT,
              heroTitleEn: 'MIRAGE PHARMA GLOBAL ENTERPRISES',
              capitalEn: '100 Million EGP',
            },
            updatedAt: now,
            updatedBy: 'Lead Developer <dev@miragepharma.com>',
          },
        ],
      });

      const result = await loadCompanyStoryContentFromDb(db);
      expect(result.source).toBe('mongodb');
      expect(result.content.heroTitleEn).toBe('MIRAGE PHARMA GLOBAL ENTERPRISES');
      expect(result.content.capitalEn).toBe('100 Million EGP');
      expect(result.content.workforceEn).toBe('75 + 500'); // preserved
      expect(result.content.updatedBy).toBe('Lead Developer <dev@miragepharma.com>');
    });

    it('falls back to default values for missing individual fields in partial MongoDB document', async () => {
      const { db } = createMockMongoDb({
        site_content: [
          {
            key: COMPANY_STORY_KEY,
            data: {
              capitalEn: '250 Million EGP',
            },
          },
        ],
      });

      const result = await loadCompanyStoryContentFromDb(db);
      expect(result.source).toBe('mongodb');
      expect(result.content.capitalEn).toBe('250 Million EGP');
      expect(result.content.heroTitleEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn);
      expect(result.content.visionTitleAr).toBe(DEFAULT_COMPANY_STORY_CONTENT.visionTitleAr);
    });
  });

  describe('2. MongoDB Write Acknowledgment & Schema Enforcement', () => {
    it('persists validated updates and acknowledges write operation', async () => {
      const { db, store } = createMockMongoDb();
      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '150 Million EGP',
        capitalAr: '150 مليون جنيه مصري',
      };

      const result = await saveCompanyStoryContentToDb(db, payload, 'Super Admin <admin@miragepharma.com>');
      expect(result.mode).toBe('mongodb');
      expect(result.content.capitalEn).toBe('150 Million EGP');
      expect(result.content.updatedBy).toBe('Super Admin <admin@miragepharma.com>');

      expect(store.site_content).toHaveLength(1);
      expect(store.site_content[0].data.capitalEn).toBe('150 Million EGP');
    });

    it('refuses to confirm success if MongoDB write is not acknowledged', async () => {
      const { db, setAcknowledged } = createMockMongoDb();
      setAcknowledged(false);

      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '150 Million EGP',
      };

      await expect(
        saveCompanyStoryContentToDb(db, payload, 'Super Admin <admin@miragepharma.com>')
      ).rejects.toThrow(/MongoDB did not acknowledge write operation/i);
    });

    it('rejects invalid inputs violating character bounds before touching the database', async () => {
      const { db, store } = createMockMongoDb();
      const invalidPayload = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        heroTitleEn: 'A'.repeat(250), // max is 150
      };

      await expect(
        saveCompanyStoryContentToDb(db, invalidPayload, 'Super Admin')
      ).rejects.toThrow(ContentPersistenceError);

      expect(store.site_content).toHaveLength(0);
    });
  });

  describe('3. Database Failure & Offline Graceful Degradation', () => {
    it('gracefully degrades to static defaults and sets warning when MongoDB is offline / unreachable on load', async () => {
      process.env.MIRAGE_CONTENT_BACKEND = 'mongodb';
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099/mirage_pharma'; // offline port

      const result = await loadCompanyStoryContent();
      expect(result.source).toBe('default');
      expect(result.content.heroTitleEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn);
      expect(result.content.capitalEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.capitalEn);
      expect(result.warning).toBeDefined();
      expect(result.warning).toMatch(/MongoDB unavailable/i);
    });
  });

  describe('4. Admin Server Actions Authorization & Role Matrix', () => {
    it('fails closed when attempting to save without valid session cookie', async () => {
      setTestSessionCookieForTesting(null);
      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '500 Million EGP',
      };

      const result = await saveCompanyStoryAction(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/Authentication required/i);
      }
    });

    it('rejects operators with insufficient permissions (read_only role cannot write CMS)', async () => {
      const readOnlyToken = issueSessionToken(
        {
          sub: 'USR-READONLY-01',
          email: 'reader@miragepharma.com',
          name: 'Read Only User',
          role: 'read_only',
        },
        TEST_SECRET
      );
      setTestSessionCookieForTesting(readOnlyToken);

      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
      };

      const result = await saveCompanyStoryAction(payload);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/Forbidden/i);
      }
    });
  });
});
