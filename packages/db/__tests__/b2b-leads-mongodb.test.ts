/**
 * PHASE 7: Public Forms & Admin Workflows — MongoDB Persistence & Lead Ingestion Tests
 *
 * Covers:
 *  1. Input Validation: Enforces required fields, email syntax, min-length.
 *  2. Duplicate Detection: Blocks identical contact submissions within 10-minute rolling window.
 *  3. Rate Limiting: Prevents automated form flooding per client IP/email.
 *  4. MongoDB Persistence: Confirmed write acknowledgment and document integrity.
 *  5. Offline Graceful Degradation: Degrades to canonical seed leads (INITIAL_B2B_LEADS) when DB is down.
 *  6. Fail-Closed Write Policy: Disallows unverified memory saves outside test mode.
 *  7. 21 CFR Part 11 Audit Trail: Cryptographic audit logging of intake, triage, and deletion.
 *  8. Role-Based Access Controls: Enforces leads:read and leads:write permissions.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { Db } from 'mongodb';
import {
  submitB2BLeadToDb,
  loadB2BLeadsFromDb,
  updateB2BLeadStatusInDb,
  deleteB2BLeadFromDb,
  submitB2BLead,
  loadB2BLeads,
  updateB2BLeadStatus,
  deleteB2BLead,
  LeadPersistenceError,
  _clearLeadRateLimitsForTesting,
} from '../src/server/lead-repository';
import { MONGO_COLLECTIONS } from '../src/server/mongo-models';
import { INITIAL_B2B_LEADS } from '../src/seed-data';
import { getAuditLogs, memoryStore } from '../src';
import {
  issueSessionToken,
  setTestSessionCookieForTesting,
  requireAdminSession,
} from '../src/server/auth';
import {
  getB2BLeadsAction,
  createB2BLeadAction,
  updateB2BLeadStatusAction,
  deleteB2BLeadAction,
} from '../../../apps/admin/app/b2b-leads/actions';
import { POST as contactApiHandler } from '../../../apps/web/app/api/contact/route';

// In-Memory MongoDB mock collection for isolated unit tests
function createMockDb(): Db {
  const collections = new Map<string, any[]>();

  const getCol = (name: string) => {
    if (!collections.has(name)) {
      collections.set(name, []);
    }
    return collections.get(name)!;
  };

  const db = {
    collection: (name: string) => {
      return {
        insertOne: vi.fn(async (doc: any) => {
          const list = getCol(name);
          list.push({ ...doc });
          return { acknowledged: true, insertedId: doc._id || doc.id };
        }),
        find: vi.fn((_query: any = {}) => {
          const list = getCol(name);
          return {
            sort: (_s: any) => ({
              toArray: async () => [...list],
            }),
            toArray: async () => [...list],
          };
        }),
        findOne: vi.fn(async (query: any) => {
          const list = getCol(name);
          return list.find((item) => {
            if (query.id && item.id === query.id) return true;
            if (query.email && item.email === query.email) return true;
            return false;
          }) ?? null;
        }),
        updateOne: vi.fn(async (query: any, update: any) => {
          const list = getCol(name);
          const idx = list.findIndex((item) => query.id && item.id === query.id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...(update.$set || {}) };
            return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
          }
          return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        }),
        deleteOne: vi.fn(async (query: any) => {
          const list = getCol(name);
          const idx = list.findIndex((item) => query.id && item.id === query.id);
          if (idx !== -1) {
            list.splice(idx, 1);
            return { acknowledged: true, deletedCount: 1 };
          }
          return { acknowledged: true, deletedCount: 0 };
        }),
      };
    },
  } as unknown as Db;

  return db;
}

const TEST_SECRET = 'mirage-test-session-secret-key-at-least-32-chars-long';

describe('PHASE 7: Public Forms & Admin Workflows — MongoDB Persistence Suite', () => {
  beforeEach(() => {
    memoryStore.reset();
    _clearLeadRateLimitsForTesting();
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-TEST-ADMIN',
          email: 'qa.officer@miragepharma.com',
          name: 'QA Officer',
          role: 'super_admin',
        },
        TEST_SECRET
      )
    );
  });

  describe('1. Input Validation & Lead Persistence', () => {
    it('persists a valid B2B inquiry to MongoDB with write acknowledgment', async () => {
      const mockDb = createMockDb();
      const input = {
        company_name: 'Dar Al Fouad Hospital',
        contact_name: 'Dr. Hazem Mansour',
        email: 'hazem.mansour@daralfouad.org',
        phone: '+20 100 234 5678',
        partnership_archetype: 'Hospital Network',
        message: 'Requesting institutional pricing for SymPDCA 60-capsule hospital packs.',
      };

      const result = await submitB2BLeadToDb(mockDb, input);
      expect(result.ok).toBe(true);
      expect(result.lead.id).toMatch(/^lead-/);
      expect(result.lead.company_name).toBe('Dar Al Fouad Hospital');
      expect(result.lead.status).toBe('NEW');

      // Verify read from mockDb
      const readBack = await loadB2BLeadsFromDb({}, mockDb);
      expect(readBack.source).toBe('mongodb');
      expect(readBack.leads.some((l) => l.email === 'hazem.mansour@daralfouad.org')).toBe(true);
    });

    it('rejects submissions with invalid email syntax', async () => {
      const mockDb = createMockDb();
      const input = {
        company_name: 'Cairo Clinic',
        contact_name: 'Dr. Ahmed',
        email: 'invalid-email-format-no-domain',
        partnership_archetype: 'Hospital Network',
        message: 'Looking for distributor pricing.',
      };

      await expect(submitB2BLeadToDb(mockDb, input)).rejects.toThrow(LeadPersistenceError);
      await expect(submitB2BLeadToDb(mockDb, input)).rejects.toMatchObject({
        code: 'VALIDATION_FAILED',
      });
    });

    it('rejects submissions with missing company or contact person', async () => {
      const mockDb = createMockDb();
      const input = {
        company_name: '',
        contact_name: '',
        email: 'doctor@hospital.com',
        partnership_archetype: 'Hospital Network',
        message: 'Sample inquiry',
      };

      await expect(submitB2BLeadToDb(mockDb, input)).rejects.toThrow(LeadPersistenceError);
    });
  });

  describe('2. Abuse Protection & Duplicate Handling', () => {
    it('blocks duplicate submissions with identical email and message within the rolling window', async () => {
      const mockDb = createMockDb();
      const input = {
        company_name: 'El-Gouna Medical Center',
        contact_name: 'Dr. Nader Salama',
        email: 'nader.salama@gouna-clinic.com',
        partnership_archetype: 'Hospital Network',
        message: 'Urgent inquiry regarding cold-chain SymPDCA supply in Red Sea governate.',
      };

      // First submission succeeds
      const first = await submitB2BLeadToDb(mockDb, input, '192.168.1.100');
      expect(first.ok).toBe(true);

      // Immediate duplicate submission is rejected
      await expect(submitB2BLeadToDb(mockDb, input, '192.168.1.100')).rejects.toMatchObject({
        code: 'DUPLICATE_SUBMISSION',
      });
    });

    it('enforces rate limits on excessive submissions from the same client IP', async () => {
      const mockDb = createMockDb();

      // Submit 5 distinct messages within window
      for (let i = 1; i <= 5; i++) {
        await submitB2BLeadToDb(
          mockDb,
          {
            company_name: `Hospital Group ${i}`,
            contact_name: `Contact ${i}`,
            email: `contact${i}@hospital.com`,
            partnership_archetype: 'Commercial Distribution',
            message: `Unique medical inquiry content variant ${i}`,
          },
          '203.0.113.42'
        );
      }

      // 6th submission from the same IP should be blocked by rate limit
      await expect(
        submitB2BLeadToDb(
          mockDb,
          {
            company_name: 'Excessive Hospital',
            contact_name: 'Spammer',
            email: 'excessive@hospital.com',
            partnership_archetype: 'Commercial Distribution',
            message: 'Excessive inquiry exceeding rate limit.',
          },
          '203.0.113.42'
        )
      ).rejects.toMatchObject({
        code: 'RATE_LIMITED',
      });
    });
  });

  describe('3. Offline Fallbacks & Graceful Degradation', () => {
    it('falls back to canonical initial leads when MongoDB returns empty', async () => {
      const mockDb = createMockDb();
      const result = await loadB2BLeadsFromDb({}, mockDb);

      expect(result.source).toBe('default');
      expect(result.leads.length).toBeGreaterThanOrEqual(INITIAL_B2B_LEADS.length);
      expect(result.leads.some((l) => l.id === 'lead-001')).toBe(true);
    });

    it('gracefully degrades to static defaults when MongoDB throws a network error', async () => {
      const faultyDb = {
        collection: () => ({
          find: () => {
            throw new Error('MongoServerSelectionError: Server selection timed out');
          },
        }),
      } as unknown as Db;

      const result = await loadB2BLeadsFromDb({}, faultyDb);
      expect(result.source).toBe('default');
      expect(result.warning).toContain('MongoServerSelectionError');
      expect(result.leads.length).toBeGreaterThan(0);
      expect(result.leads.some((l) => l.company_name.includes('Cairo Cure'))).toBe(true);
    });

    it('fails closed on writes outside test environments when MongoDB is unconfigured', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalVitest = process.env.VITEST;

      try {
        // Simulate production environment
        (process.env as any).NODE_ENV = 'production';
        delete process.env.VITEST;

        await expect(
          submitB2BLead({
            company_name: 'Test Corp',
            contact_name: 'Tester',
            email: 'test@corp.com',
            partnership_archetype: 'Hospital Network',
            message: 'Inquiry without MongoDB',
          })
        ).rejects.toMatchObject({
          code: 'DB_UNAVAILABLE',
        });
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
        if (originalVitest) process.env.VITEST = originalVitest;
      }
    });
  });

  describe('4. Workflow State Transitions & 21 CFR Part 11 Audit Trail', () => {
    it('updates lead status in MongoDB and creates a signed audit ledger record', async () => {
      const mockDb = createMockDb();
      const { lead } = await submitB2BLeadToDb(mockDb, {
        company_name: 'Cleopatra Hospital Group',
        contact_name: 'Dr. Mona Wagdy',
        email: 'mona.wagdy@cleopatra-hospitals.com',
        partnership_archetype: 'Hospital Network',
        message: 'SymPDCA tender evaluation.',
      });

      // Advance stage to CONTRACT_SIGNED
      const updateRes = await updateB2BLeadStatusInDb(mockDb, lead.id, 'CONTRACT_SIGNED', {
        userId: 'USR-QA-CHIEF',
        role: 'super_admin',
      });
      expect(updateRes.ok).toBe(true);
      expect(updateRes.lead.status).toBe('CONTRACT_SIGNED');

      // Verify audit logs
      const logs = await getAuditLogs();
      const updateLog = logs.find(
        (l) => l.action === 'UPDATE_LEAD_STATUS' && l.entity_id === lead.id
      );
      expect(updateLog).toBeDefined();
      expect(updateLog?.actor_id).toBe('USR-QA-CHIEF');
      expect(updateLog?.hash).toHaveLength(64);
    });

    it('deletes lead from MongoDB with write confirmation and audit logging', async () => {
      const mockDb = createMockDb();
      const { lead } = await submitB2BLeadToDb(mockDb, {
        company_name: 'Transient Clinic',
        contact_name: 'Dr. Test',
        email: 'transient@clinic.com',
        partnership_archetype: 'Commercial Distribution',
        message: 'Temporary test lead for deletion audit.',
      });

      const delRes = await deleteB2BLeadFromDb(mockDb, lead.id, {
        userId: 'USR-COMPLIANCE-LEAD',
        role: 'super_admin',
      });
      expect(delRes.ok).toBe(true);
      expect(delRes.deleted).toBe(true);

      const logs = await getAuditLogs();
      const delLog = logs.find((l) => l.action === 'DELETE_LEAD' && l.entity_id === lead.id);
      expect(delLog).toBeDefined();
      expect(delLog?.actor_id).toBe('USR-COMPLIANCE-LEAD');
    });
  });

  describe('5. Role-Based Access Controls for Customer Data', () => {
    it('rejects unauthenticated attempts to read private leads list', async () => {
      setTestSessionCookieForTesting(null);

      const res = await getB2BLeadsAction();
      expect(res.ok).toBe(false);
      expect(res.code).toBe('UNAUTHENTICATED');
    });

    it('rejects read-only operator from performing status mutations (leads:write required)', async () => {
      setTestSessionCookieForTesting(
        issueSessionToken(
          {
            sub: 'USR-READONLY',
            email: 'auditor@miragepharma.com',
            name: 'External Auditor',
            role: 'read_only',
          },
          TEST_SECRET
        )
      );

      const res = await updateB2BLeadStatusAction('lead-001', 'CONTRACT_SIGNED');
      expect(res.ok).toBe(false);
      expect(res.code).toBe('FORBIDDEN');
    });

    it('allows authorized super_admin to read and triage leads', async () => {
      const res = await getB2BLeadsAction();
      expect(res.ok).toBe(true);
      expect(Array.isArray(res.leads)).toBe(true);
    });
  });

  describe('6. Public Contact API Endpoint (POST /api/contact)', () => {
    it('successfully receives a public contact submission and returns 201 with lead ID', async () => {
      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-real-ip': '198.51.100.12' },
        body: JSON.stringify({
          name: 'Dr. Karim Mostafa',
          email: 'karim.mostafa@alex-med.com',
          phone: '+20 122 333 4455',
          subject: 'Physician Sampling',
          message: 'Please send HCP clinical sampling kits for SymPDCA to our oncology ward.',
        }),
      });

      const response = await contactApiHandler(req);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.leadId).toBeDefined();
    });

    it('rejects invalid email submission with HTTP 400', async () => {
      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Dr. Karim',
          email: 'not-an-email',
          message: 'Hello',
        }),
      });

      const response = await contactApiHandler(req);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error).toContain('Valid Email');
    });

    it('rejects duplicate contact submission with HTTP 409 Conflict', async () => {
      const payload = {
        name: 'Dr. Duplicate Check',
        email: 'duplicate.doc@clinic.com',
        message: 'This is an exact inquiry sent twice rapidly.',
      };

      // 1st request
      const req1 = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res1 = await contactApiHandler(req1);
      expect(res1.status).toBe(201);

      // 2nd request (duplicate)
      const req2 = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const res2 = await contactApiHandler(req2);
      expect(res2.status).toBe(409);
      const json = await responseToJson(res2);
      expect(json.ok).toBe(false);
      expect(json.code).toBe('DUPLICATE_SUBMISSION');
    });
  });
});

async function responseToJson(res: Response) {
  return res.json();
}
