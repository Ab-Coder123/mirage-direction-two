import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Db } from 'mongodb';

import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  HomepageHeroInputSchema,
  type HomepageHeroInput,
  type HomepageHeroContent,
} from '../src/homepage-content';
import {
  resolveHomepageStorage,
  loadHomepageHeroContent,
  loadHomepageHeroContentFromDb,
  saveHomepageHeroContent,
  saveHomepageHeroContentToDb,
  HOMEPAGE_HERO_KEY,
  ContentPersistenceError,
} from '../src/server/homepage-repository';
import {
  issueSessionToken,
  setTestSessionCookieForTesting,
} from '../src/server/auth';
import {
  getHomepageHeroAction,
  saveHomepageHeroAction,
} from '../../../apps/admin/app/settings/homepage-actions';

const TEST_SECRET = 'mirage-test-session-secret-key-32-chars-long!';

/**
 * UNIT TEST HARNESS: In-memory mock of MongoDB `Db` for deterministic testing
 * of Phase 5 MongoDB write acknowledgment, retrieval, and partial override fallback.
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

describe('PHASE 5: Bilingual Homepage CMS & MongoDB Runtime Storage', () => {
  beforeEach(() => {
    delete process.env.MIRAGE_CONTENT_BACKEND;
    delete process.env.MONGODB_URI;
    delete process.env.MIRAGE_CONTENT_FILE;
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-ADMIN-P5',
          email: 'admin@miragepharma.com',
          name: 'Super Admin',
          role: 'super_admin',
        },
        TEST_SECRET
      )
    );
  });

  afterEach(() => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    delete process.env.MONGODB_URI;
    delete process.env.MIRAGE_CONTENT_FILE;
  });

  // ==========================================================================
  // 1. Bilingual Defaults and Schema Validation
  // ==========================================================================
  describe('1. Bilingual Defaults & Schema Validation', () => {
    it('contains all required English and Arabic fields in static defaults', () => {
      const defaults = DEFAULT_HOMEPAGE_HERO_CONTENT;

      // English fields
      expect(defaults.badgeEn).toBeTruthy();
      expect(defaults.headlinePrefixEn).toBeTruthy();
      expect(defaults.headlineHighlightEn).toBeTruthy();
      expect(defaults.supportingTextEn).toBeTruthy();
      expect(defaults.primaryCtaTextEn).toBeTruthy();
      expect(defaults.secondaryCtaTextEn).toBeTruthy();

      // Arabic fields (verifying Arabic text integrity and RTL wording)
      expect(defaults.badgeAr).toMatch(/ميراج فارما/);
      expect(defaults.headlinePrefixAr).toMatch(/رؤية جديدة/);
      expect(defaults.headlineHighlightAr).toMatch(/المكملات الغذائية/);
      expect(defaults.supportingTextAr).toMatch(/انطلقت شركة ميراج فارما/);
      expect(defaults.primaryCtaTextAr).toMatch(/استكشف/);
      expect(defaults.secondaryCtaTextAr).toMatch(/عن الشركة/);
    });

    it('rejects input with empty or missing required bilingual fields', () => {
      const invalid = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeEn: '', // Empty English badge
      };

      const result = HomepageHeroInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('badgeEn');
      }
    });
  });

  // ==========================================================================
  // 2. Mock MongoDB Unit Tests: Write Acknowledgment, Retrieval & Overrides
  // (NOTE: Verified with in-memory mock Db; not a live MongoDB connection)
  // ==========================================================================
  describe('2. In-Memory Mock MongoDB Unit Tests (Offline Verification)', () => {
    it('returns static defaults when no homepage document exists in MongoDB (Mock Db)', async () => {
      const { db } = createMockMongoDb();
      const loaded = await loadHomepageHeroContentFromDb(db);

      expect(loaded.source).toBe('default');
      expect(loaded.content.headlinePrefixEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn);
      expect(loaded.content.headlinePrefixAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr);
      expect(loaded.warning).toBeUndefined();
    });

    it('persists changes to MongoDB site_content and retrieves them after successful write acknowledgment (Mock Db)', async () => {
      const { db, store } = createMockMongoDb();

      const input: HomepageHeroInput = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        headlinePrefixEn: 'Pioneering Clinical Research in',
        headlineHighlightEn: 'Biomedical Innovation & Therapeutics',
        headlinePrefixAr: 'ريادة الأبحاث السريرية في',
        headlineHighlightAr: 'الابتكار الحيوي والعلاجات المتقدمة',
      };

      const actor = 'Super Admin <admin@miragepharma.com> (super_admin)';
      const saveResult = await saveHomepageHeroContentToDb(db, input, actor);

      expect(saveResult.mode).toBe('mongodb');
      expect(saveResult.content.headlinePrefixEn).toBe('Pioneering Clinical Research in');
      expect(saveResult.content.headlinePrefixAr).toBe('ريادة الأبحاث السريرية في');

      // Verify the document was upserted into mock collection
      expect(store.site_content).toHaveLength(1);
      expect(store.site_content[0].key).toBe(HOMEPAGE_HERO_KEY);
      expect(store.site_content[0].updatedBy).toBe(actor);

      // Verify loadHomepageHeroContentFromDb retrieves the saved content
      const loaded = await loadHomepageHeroContentFromDb(db);
      expect(loaded.source).toBe('mongodb');
      expect(loaded.content.headlinePrefixEn).toBe('Pioneering Clinical Research in');
      expect(loaded.content.headlineHighlightEn).toBe('Biomedical Innovation & Therapeutics');
      expect(loaded.content.headlinePrefixAr).toBe('ريادة الأبحاث السريرية في');
    });

    it('retains exact static defaults for any missing or omitted field in a partial MongoDB record (Mock Db)', async () => {
      // Simulate a legacy or partial document in MongoDB where only English headline was saved
      const partialDoc = {
        key: HOMEPAGE_HERO_KEY,
        data: {
          headlinePrefixEn: 'Custom English Prefix',
          headlineHighlightEn: 'Custom English Highlight',
          // Arabic fields and supporting texts are completely missing from data
        },
        updatedAt: new Date(),
        updatedBy: 'Test Operator',
      };

      const { db } = createMockMongoDb({ site_content: [partialDoc] });
      const loaded = await loadHomepageHeroContentFromDb(db);

      expect(loaded.source).toBe('mongodb');
      // Overridden fields take effect:
      expect(loaded.content.headlinePrefixEn).toBe('Custom English Prefix');
      expect(loaded.content.headlineHighlightEn).toBe('Custom English Highlight');

      // Missing fields retain exact static defaults (Arabic and supporting texts are NOT lost):
      expect(loaded.content.badgeEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn);
      expect(loaded.content.badgeAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeAr);
      expect(loaded.content.headlinePrefixAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr);
      expect(loaded.content.headlineHighlightAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightAr);
      expect(loaded.content.supportingTextAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextAr);
    });

    it('fails and does NOT report success when MongoDB write is not acknowledged (Mock Db)', async () => {
      const { db, setAcknowledged } = createMockMongoDb();
      setAcknowledged(false); // Simulate unacknowledged write

      await expect(
        saveHomepageHeroContentToDb(db, DEFAULT_HOMEPAGE_HERO_CONTENT, 'Operator')
      ).rejects.toThrow(/MongoDB did not acknowledge write operation/i);
    });
  });

  // ==========================================================================
  // 3. Database Unavailable & Configuration Failure Behavior
  // ==========================================================================
  describe('3. Database Failure & Offline Graceful Degradation', () => {
    it('fails closed with NOT_CONFIGURED when MIRAGE_CONTENT_BACKEND=mongodb but MONGODB_URI is missing', () => {
      process.env.MIRAGE_CONTENT_BACKEND = 'mongodb';
      delete process.env.MONGODB_URI;

      const storage = resolveHomepageStorage();
      expect(storage.ok).toBe(false);
      if (!storage.ok) {
        expect(storage.mode).toBe('mongodb');
        expect(storage.error).toMatch(/MONGODB_URI is not configured/i);
        expect(storage.missingEnv).toContain('MONGODB_URI');
      }
    });

    it('gracefully degrades to static defaults and sets warning when MongoDB is offline / unreachable on load', async () => {
      process.env.MIRAGE_CONTENT_BACKEND = 'mongodb';
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099'; // Non-existent port
      process.env.MONGODB_CONNECT_TIMEOUT_MS = '200';
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS = '200';

      const loaded = await loadHomepageHeroContent();
      expect(loaded.source).toBe('default');
      expect(loaded.content.headlinePrefixEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn);
      expect(loaded.content.headlinePrefixAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr);
      expect(loaded.warning).toBeDefined();
      expect(loaded.warning).toMatch(/MongoDB unavailable/i);
    });

    it('fails truthfully and throws ContentPersistenceError when saving while MongoDB is offline', async () => {
      process.env.MIRAGE_CONTENT_BACKEND = 'mongodb';
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099'; // Non-existent port
      process.env.MONGODB_CONNECT_TIMEOUT_MS = '200';
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS = '200';

      await expect(
        saveHomepageHeroContent(DEFAULT_HOMEPAGE_HERO_CONTENT, 'Operator')
      ).rejects.toThrow(ContentPersistenceError);
    });
  });

  // ==========================================================================
  // 4. Server Action Permissions & Phase 04 Authentication Guards
  // ==========================================================================
  describe('4. Server Action RBAC Protection & Permissions', () => {
    it('rejects unauthenticated saveHomepageHeroAction calls', async () => {
      setTestSessionCookieForTesting(null);

      const res = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toMatch(/Authentication required/i);
      }
    });

    it('forbids read_only role from mutating homepage content', async () => {
      const readOnlyToken = issueSessionToken(
        {
          sub: 'USR-RO',
          email: 'auditor@miragepharma.com',
          name: 'Auditor',
          role: 'read_only',
        },
        TEST_SECRET
      );
      setTestSessionCookieForTesting(readOnlyToken);

      const res = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toMatch(/Forbidden.*read_only/i);
      }
    });

    it('forbids qa_officer role from mutating homepage CMS (role separation)', async () => {
      const qaToken = issueSessionToken(
        {
          sub: 'USR-QA',
          email: 'qa@miragepharma.com',
          name: 'QA Officer',
          role: 'qa_officer',
        },
        TEST_SECRET
      );
      setTestSessionCookieForTesting(qaToken);

      const res = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toMatch(/Forbidden.*qa_officer/i);
      }
    });

    it('allows read_only role to call getHomepageHeroAction', async () => {
      const readOnlyToken = issueSessionToken(
        {
          sub: 'USR-RO',
          email: 'auditor@miragepharma.com',
          name: 'Auditor',
          role: 'read_only',
        },
        TEST_SECRET
      );
      setTestSessionCookieForTesting(readOnlyToken);

      const res = await getHomepageHeroAction();
      expect(res.content).toBeDefined();
      expect(res.content.headlinePrefixEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn);
    });
  });
});
