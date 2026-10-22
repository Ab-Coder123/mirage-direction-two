import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Db } from 'mongodb';

import {
  assertServerContext,
  maskMongoUri,
  getMongoConfig,
  validateMongoConfig,
} from '../src/server/mongodb';
import {
  issueSessionToken,
  verifySessionToken,
  hasAdminPermission,
  setTestSessionCookieForTesting,
  requireAdminSession,
} from '../src/server/auth';
import {
  loadProductBySlugFromDb,
  saveProductToDb,
  updateProductInDb,
  togglePackStockInDb,
  deleteProductFromDb,
} from '../src/server/product-repository';
import {
  submitB2BLeadToDb,
  updateB2BLeadStatusInDb,
  deleteB2BLeadFromDb,
  _clearLeadRateLimitsForTesting,
} from '../src/server/lead-repository';
import { getAuditLogs, memoryStore } from '../src/index';

const TEST_SECRET = 'mirage-test-session-secret-key-32-chars-long!';

function createMockDb(): Db {
  const store: Record<string, any[]> = {
    products: [
      {
        id: 'sympdca',
        slug: 'sympdca',
        name: 'SymPDCA',
        category: 'Respiratory',
        packSizes: [{ quantity: 30, unit: 'capsules', inStock: true }],
      },
    ],
    b2b_leads: [
      {
        id: 'lead-test-01',
        company_name: 'Test Hospital',
        contact_name: 'Dr. Test',
        email: 'drtest@hospital.org',
        partnership_archetype: 'Hospital Network',
        status: 'NEW',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    site_content: [],
    audit_logs: [],
  };

  const collection = (name: string) => ({
    find: vi.fn(() => ({
      toArray: async () => store[name] || [],
      sort: () => ({ toArray: async () => store[name] || [] }),
    })),
    findOne: vi.fn(async (filter: any) => {
      const items = store[name] || [];
      return items.find((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      ) || null;
    }),
    insertOne: vi.fn(async (doc: any) => {
      store[name] = store[name] || [];
      store[name].push(doc);
      return { acknowledged: true, insertedId: doc._id || 'mock-id' };
    }),
    updateOne: vi.fn(async (filter: any, update: any) => {
      store[name] = store[name] || [];
      const idx = store[name].findIndex((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      );
      if (idx >= 0 && update.$set) {
        store[name][idx] = { ...store[name][idx], ...update.$set };
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
      }
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
    }),
    deleteOne: vi.fn(async (filter: any) => {
      store[name] = store[name] || [];
      const idx = store[name].findIndex((item) =>
        Object.entries(filter).every(([k, v]) => item[k] === v)
      );
      if (idx >= 0) {
        store[name].splice(idx, 1);
        return { acknowledged: true, deletedCount: 1 };
      }
      return { acknowledged: true, deletedCount: 0 };
    }),
  });

  return { collection } as unknown as Db;
}

describe('PHASE 9: Security, Reliability & Data-Integrity Audit Suite', () => {
  beforeEach(() => {
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    _clearLeadRateLimitsForTesting();
  });

  afterEach(() => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
  });

  describe('1. Server-Only Execution Boundary Protection', () => {
    it('throws a security violation if evaluated in a browser/window context', () => {
      const mockWindow = {};
      expect(() => assertServerContext(mockWindow)).toThrow(
        /Security Violation: MongoDB client must only be imported in server-side contexts/i
      );
    });

    it('passes safely in valid server runtime contexts', () => {
      expect(() => assertServerContext(undefined)).not.toThrow();
    });
  });

  describe('2. Credential Protection & Secret Masking', () => {
    it('masks database passwords in standard mongodb:// URIs', () => {
      const rawUri = 'mongodb://app_user:SuperSecretP@ss123@cluster0.net:27017/mirage_pharma';
      const masked = maskMongoUri(rawUri);
      expect(masked).not.toContain('SuperSecretP@ss123');
      expect(masked).toBe('mongodb://app_user:***@cluster0.net:27017/mirage_pharma');
    });

    it('masks credentials in mongodb+srv:// Atlas URIs', () => {
      const atlasUri = 'mongodb+srv://admin_user:P%40ssw0rd!@mirage.cluster.mongodb.net/mirage_pharma?retryWrites=true';
      const masked = maskMongoUri(atlasUri);
      expect(masked).not.toContain('P%40ssw0rd!');
      expect(masked).toContain('admin_user:***@');
    });

    it('handles null, undefined, or empty URIs safely without throwing', () => {
      expect(maskMongoUri(null)).toBe('<empty>');
      expect(maskMongoUri(undefined)).toBe('<empty>');
      expect(maskMongoUri('')).toBe('<empty>');
    });
  });

  describe('3. Cryptographic Token Tampering & RBAC Enforcement', () => {
    it('rejects tampered session tokens with modified role payloads', () => {
      const validToken = issueSessionToken(
        {
          sub: 'USR-001',
          email: 'operator@mirage.com',
          name: 'Operator',
          role: 'read_only',
        },
        TEST_SECRET
      );

      // Attempt to tamper payload from read_only to super_admin
      const [headerB64, payloadB64, sig] = validToken.split('.');
      const payloadObj = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      payloadObj.role = 'super_admin';
      const tamperedPayloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
      const tamperedToken = `${headerB64}.${tamperedPayloadB64}.${sig}`;

      const verified = verifySessionToken(tamperedToken, TEST_SECRET);
      expect(verified.ok).toBe(false);
      if (!verified.ok) {
        expect(verified.code).toBe('INVALID_SIGNATURE');
      }
    });

    it('enforces least-privilege role matrix (read_only role lacks write permissions)', () => {
      expect(hasAdminPermission('read_only', 'products:read')).toBe(true);
      expect(hasAdminPermission('read_only', 'products:write')).toBe(false);
      expect(hasAdminPermission('read_only', 'leads:write')).toBe(false);
      expect(hasAdminPermission('read_only', 'cms:write')).toBe(false);
      expect(hasAdminPermission('read_only', 'audit:read')).toBe(true);

      expect(hasAdminPermission('super_admin', 'products:write')).toBe(true);
      expect(hasAdminPermission('super_admin', 'cms:write')).toBe(true);
      expect(hasAdminPermission('super_admin', 'leads:write')).toBe(true);
    });
  });

  describe('4. Input Parameter Sanitization & NoSQL Injection Hardening', () => {
    it('gracefully handles non-string or malformed slug parameters', async () => {
      const db = createMockDb();
      const resultEmpty = await loadProductBySlugFromDb('', 'en', db);
      expect(resultEmpty.product).toBeUndefined();

      const resultWhitespace = await loadProductBySlugFromDb('   ', 'en', db);
      expect(resultWhitespace.product).toBeUndefined();
    });

    it('normalizes string identifiers before querying product and lead documents', async () => {
      const db = createMockDb();
      const updateResult = await updateProductInDb(
        db,
        '  sympdca  ',
        { subtitle: 'Hardened Subtitle' },
        { userId: 'USR-SEC', role: 'SUPER_ADMIN' }
      );
      expect(updateResult.ok).toBe(true);
      expect(updateResult.product.id).toBe('sympdca');

      const leadUpdateResult = await updateB2BLeadStatusInDb(
        db,
        '  lead-test-01  ',
        'TRIAGED',
        { userId: 'USR-SEC', role: 'SUPER_ADMIN' }
      );
      expect(leadUpdateResult.ok).toBe(true);
      expect(leadUpdateResult.lead.status).toBe('TRIAGED');
    });
  });

  describe('5. Abuse Prevention & 21 CFR Part 11 Audit Trail Verification', () => {
    it('blocks duplicate submissions within rolling time window', async () => {
      const db = createMockDb();
      const payload = {
        company_name: 'Security Test Pharma Ltd',
        contact_name: 'Chief Compliance Officer',
        email: 'compliance@sectest.com',
        partnership_archetype: 'Hospital Network',
        message: 'Duplicate submission test inquiry.',
      };

      const first = await submitB2BLeadToDb(db, payload, '192.168.1.100');
      expect(first.ok).toBe(true);

      await expect(
        submitB2BLeadToDb(db, payload, '192.168.1.100')
      ).rejects.toThrow(/identical contact information and message/i);
    });

    it('records 21 CFR Part 11 audit trails for all sensitive operations', async () => {
      const db = createMockDb();
      const initialLogs = await getAuditLogs();
      const initialLogsCount = initialLogs.length;

      await togglePackStockInDb(
        db,
        'sympdca',
        0,
        false,
        { userId: 'USR-AUDIT-01', role: 'QA_OFFICER' }
      );

      const logsAfter = await getAuditLogs();
      expect(logsAfter.length).toBeGreaterThan(initialLogsCount);
      const latest = logsAfter[0];
      expect(latest.action).toBe('TOGGLE_PACK_STOCK');
      expect(latest.actor_id).toBe('USR-AUDIT-01');
      expect(latest.entity_type).toBe('PRODUCT');
      expect(latest.entity_id).toBe('sympdca');
    });
  });
});
