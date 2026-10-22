/**
 * SERVER-ONLY MongoDB B2B Lead Repository & Workflow Engine
 *
 * Provides resilient intake, duplicate suppression, abuse protection, and workflow state
 * management for customer inquiries and strategic alliance leads backed by MongoDB.
 *
 * Rules:
 *  - Must NEVER be imported into client components.
 *  - Enforces server-only execution via assertServerContext().
 *  - Enforces strict input validation via SubmitB2BLeadMutationSchema.
 *  - Blocks duplicate submissions within a 10-minute rolling window.
 *  - Rate-limits high-frequency submissions per client/IP.
 *  - Fails closed on database mutations outside test environments.
 *  - Preserves canonical seed leads (INITIAL_B2B_LEADS) as offline fallbacks.
 *  - Enforces 21 CFR Part 11 electronic audit trails on all state mutations.
 */

import type { Db } from 'mongodb';
import { createHash } from 'node:crypto';
import { assertServerContext, getMongoDb, isMongoConfigured } from './mongodb';
import { MONGO_COLLECTIONS } from './mongo-models';
import { INITIAL_B2B_LEADS } from '../seed-data';
import { memoryStore } from '../repository/memory-store';
import { recordAuditLog } from '../repository/audit';
import {
  B2BLeadRecord,
  B2BLeadRecordSchema,
  SubmitB2BLeadInput,
  SubmitB2BLeadMutationSchema,
  LeadStatus,
  LeadStatusSchema,
} from '../schema';

assertServerContext();

import type { ActorContext } from './product-repository';

export class LeadPersistenceError extends Error {
  readonly code:
    | 'VALIDATION_FAILED'
    | 'DUPLICATE_SUBMISSION'
    | 'RATE_LIMITED'
    | 'LEAD_NOT_FOUND'
    | 'WRITE_FAILED'
    | 'DB_UNAVAILABLE';

  constructor(
    code:
      | 'VALIDATION_FAILED'
      | 'DUPLICATE_SUBMISSION'
      | 'RATE_LIMITED'
      | 'LEAD_NOT_FOUND'
      | 'WRITE_FAILED'
      | 'DB_UNAVAILABLE',
    message: string
  ) {
    super(message);
    this.name = 'LeadPersistenceError';
    this.code = code;
  }
}

export interface GetLeadsFilter {
  status?: LeadStatus | undefined;
  archetype?: string | undefined;
  search?: string | undefined;
}

export interface LoadedLeadsResult {
  leads: B2BLeadRecord[];
  source: 'mongodb' | 'default';
  warning?: string | undefined;
}

// =============================================================================
// ABUSE PROTECTION & DUPLICATE TRACKER (In-Memory sliding window)
// =============================================================================

interface SubmissionFingerprint {
  hash: string;
  timestamp: number;
}

interface ClientRateLimit {
  count: number;
  windowStart: number;
}

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;

const recentFingerprints: SubmissionFingerprint[] = [];
const clientRateLimits = new Map<string, ClientRateLimit>();

/**
 * Test helper to clear in-memory rate limits between tests
 */
export function _clearLeadRateLimitsForTesting(): void {
  recentFingerprints.length = 0;
  clientRateLimits.clear();
}

function hashString(str: string): string {
  return createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

function checkAndRecordAbuse(identifier: string, contentSignature: string): void {
  const now = Date.now();

  // 1. Evict expired entries
  while (
    recentFingerprints.length > 0 &&
    now - (recentFingerprints[0]?.timestamp ?? 0) > DUPLICATE_WINDOW_MS
  ) {
    recentFingerprints.shift();
  }

  // 2. Check duplicate submission
  const isDuplicate = recentFingerprints.some(
    (fp) => fp.hash === contentSignature && now - fp.timestamp < DUPLICATE_WINDOW_MS
  );
  if (isDuplicate) {
    throw new LeadPersistenceError(
      'DUPLICATE_SUBMISSION',
      'A recent submission with identical contact information and message was already received. Please allow our medical affairs team time to review.'
    );
  }

  // 3. Check rate limit
  const rateLimit = clientRateLimits.get(identifier);
  if (rateLimit) {
    if (now - rateLimit.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (rateLimit.count >= MAX_SUBMISSIONS_PER_WINDOW) {
        throw new LeadPersistenceError(
          'RATE_LIMITED',
          'Submission limit reached. Please wait a few minutes before submitting another inquiry.'
        );
      }
      rateLimit.count += 1;
    } else {
      clientRateLimits.set(identifier, { count: 1, windowStart: now });
    }
  } else {
    clientRateLimits.set(identifier, { count: 1, windowStart: now });
  }

  // Record fingerprint
  recentFingerprints.push({ hash: contentSignature, timestamp: now });
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

function assertCanMutateWithoutMongo(): void {
  const isTestEnv =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));

  if (!isTestEnv) {
    throw new LeadPersistenceError(
      'DB_UNAVAILABLE',
      'MongoDB is not configured. Customer leads cannot be silently saved to in-memory fallback outside test environments.'
    );
  }
}

/**
 * Persists a new B2B lead to MongoDB with strict validation and write acknowledgment.
 */
export async function submitB2BLeadToDb(
  db: Db,
  input: SubmitB2BLeadInput,
  clientIp?: string | undefined,
  skipAbuseCheck = false
): Promise<{ ok: true; lead: B2BLeadRecord }> {
  // Validate input
  const parseResult = SubmitB2BLeadMutationSchema.safeParse(input);
  if (!parseResult.success) {
    throw new LeadPersistenceError(
      'VALIDATION_FAILED',
      parseResult.error.issues.map((i) => i.message).join('; ')
    );
  }
  const validated = parseResult.data;

  // Abuse & duplicate check
  if (!skipAbuseCheck) {
    const contentSignature = hashString(`${validated.email}:${validated.message || ''}`);
    const clientIdentifier = clientIp ? hashString(clientIp) : hashString(validated.email);
    checkAndRecordAbuse(clientIdentifier, contentSignature);
  }

  const now = new Date().toISOString();
  const leadRecord: B2BLeadRecord = {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    company_name: validated.company_name.trim(),
    contact_name: validated.contact_name.trim(),
    email: validated.email.trim().toLowerCase(),
    phone: validated.phone?.trim() || null,
    partnership_archetype: validated.partnership_archetype.trim(),
    message: validated.message?.trim() || null,
    status: 'NEW',
    created_at: now,
    updated_at: now,
  };

  const col = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
  const res = await col.insertOne(leadRecord);

  if (!res.acknowledged) {
    throw new LeadPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge partner lead insertion.'
    );
  }

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'B2B_PARTNER_LEAD_SUBMITTED',
    actorId: 'ANONYMOUS_PUBLIC_USER',
    actorRole: 'PUBLIC',
    entityType: 'B2B_LEAD',
    entityId: leadRecord.id,
    afterPayload: leadRecord as unknown as Record<string, any>,
  });

  // Keep in-memory store in lockstep for zero-latency retrieval
  try {
    memoryStore.addLead(leadRecord);
  } catch {
    // Already in memory store
  }

  return { ok: true, lead: leadRecord };
}

/**
 * Loads B2B leads from MongoDB, falling back to static defaults if unavailable.
 */
export async function loadB2BLeadsFromDb(
  filter: GetLeadsFilter = {},
  customDb?: Db
): Promise<LoadedLeadsResult> {
  if (!isMongoConfigured() && !customDb) {
    const memoryLeads = memoryStore.getLeads();
    const combined = [...memoryLeads];
    for (const init of INITIAL_B2B_LEADS) {
      if (!combined.some((c) => c.id === init.id)) {
        combined.push(init);
      }
    }
    return {
      leads: applyLeadFilters(combined, filter),
      source: 'default',
    };
  }

  try {
    const db = customDb ?? (await getMongoDb());
    const col = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
    const docs = await col.find({}).sort({ created_at: -1 }).toArray();

    if (!docs || docs.length === 0) {
      const memoryLeads = memoryStore.getLeads();
      const combined = [...memoryLeads];
      for (const init of INITIAL_B2B_LEADS) {
        if (!combined.some((c) => c.id === init.id)) {
          combined.push(init);
        }
      }
      return {
        leads: applyLeadFilters(combined, filter),
        source: 'default',
      };
    }

    const validatedLeads: B2BLeadRecord[] = [];
    for (const d of docs) {
      const parsed = B2BLeadRecordSchema.safeParse(d);
      if (parsed.success) {
        validatedLeads.push(parsed.data);
      }
    }

    return {
      leads: applyLeadFilters(validatedLeads, filter),
      source: 'mongodb',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[lead-repository] MongoDB read failed (${msg}); serving static fallback leads.`);
    const memoryLeads = memoryStore.getLeads();
    const combined = [...memoryLeads];
    for (const init of INITIAL_B2B_LEADS) {
      if (!combined.some((c) => c.id === init.id)) {
        combined.push(init);
      }
    }
    return {
      leads: applyLeadFilters(combined, filter),
      source: 'default',
      warning: `MongoDB read failed (${msg}); serving static fallback leads.`,
    };
  }
}

/**
 * Updates a B2B lead status in MongoDB with write acknowledgment and audit logging.
 */
export async function updateB2BLeadStatusInDb(
  db: Db,
  leadId: string,
  newStatus: LeadStatus,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; lead: B2BLeadRecord }> {
  const safeId = String(leadId).trim();
  const statusCheck = LeadStatusSchema.safeParse(newStatus);
  if (!statusCheck.success) {
    throw new LeadPersistenceError(
      'VALIDATION_FAILED',
      `Invalid lead status: '${newStatus}'. Allowed: ${LeadStatusSchema.options.join(', ')}`
    );
  }

  const col = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
  const existing = await col.findOne({ id: safeId });

  if (!existing) {
    throw new LeadPersistenceError(
      'LEAD_NOT_FOUND',
      `Lead with ID '${safeId}' not found in MongoDB.`
    );
  }

  const now = new Date().toISOString();
  const res = await col.updateOne(
    { id: safeId },
    { $set: { status: newStatus, updated_at: now, updated_by: actor.userId } }
  );

  if (!res.acknowledged) {
    throw new LeadPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge lead status update.'
    );
  }

  const updatedDoc = await col.findOne({ id: safeId });
  const leadRecord = B2BLeadRecordSchema.parse(updatedDoc);

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'UPDATE_LEAD_STATUS',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'B2B_LEAD',
    entityId: safeId,
    beforePayload: existing as unknown as Record<string, any>,
    afterPayload: leadRecord as unknown as Record<string, any>,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.updateLead(safeId, { status: newStatus });
  } catch {
    // If not in memory store
  }

  return { ok: true, lead: leadRecord };
}

/**
 * Deletes a B2B lead from MongoDB with write acknowledgment and audit logging.
 */
export async function deleteB2BLeadFromDb(
  db: Db,
  leadId: string,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; deleted: boolean }> {
  const safeId = String(leadId).trim();
  const col = db.collection(MONGO_COLLECTIONS.B2B_LEADS);
  const existing = await col.findOne({ id: safeId });

  if (!existing) {
    return { ok: true, deleted: false };
  }

  const res = await col.deleteOne({ id: safeId });
  if (!res.acknowledged) {
    throw new LeadPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge lead deletion.'
    );
  }

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'DELETE_LEAD',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'B2B_LEAD',
    entityId: safeId,
    beforePayload: existing as unknown as Record<string, any>,
    afterPayload: null,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.deleteLead(safeId);
  } catch {
    // If not in memory store
  }

  return { ok: true, deleted: true };
}

// -----------------------------------------------------------------------------
// Auto-connecting wrappers that resolve the default MongoDb instance
// -----------------------------------------------------------------------------

export async function submitB2BLead(
  input: SubmitB2BLeadInput,
  clientIp?: string | undefined,
  customDb?: Db
): Promise<{ ok: true; lead: B2BLeadRecord }> {
  // Validate and check abuse / duplicates first
  const validated = SubmitB2BLeadMutationSchema.parse(input);
  const contentSignature = hashString(`${validated.email}:${validated.message || ''}`);
  const clientIdentifier = clientIp ? hashString(clientIp) : hashString(validated.email);
  checkAndRecordAbuse(clientIdentifier, contentSignature);

  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return submitB2BLeadToDb(db, validated, clientIp, true);
  }

  assertCanMutateWithoutMongo();
  const now = new Date().toISOString();
  const leadRecord: B2BLeadRecord = {
    id: `lead-${Date.now()}`,
    company_name: validated.company_name,
    contact_name: validated.contact_name,
    email: validated.email,
    phone: validated.phone || null,
    partnership_archetype: validated.partnership_archetype,
    message: validated.message || null,
    status: 'NEW',
    created_at: now,
    updated_at: now,
  };

  memoryStore.addLead(leadRecord);
  await recordAuditLog({
    action: 'B2B_PARTNER_LEAD_SUBMITTED',
    actorId: 'ANONYMOUS_PUBLIC_USER',
    actorRole: 'PUBLIC',
    entityType: 'B2B_LEAD',
    entityId: leadRecord.id,
    afterPayload: leadRecord as unknown as Record<string, any>,
  });
  return { ok: true, lead: leadRecord };
}

export async function loadB2BLeads(
  filter: GetLeadsFilter = {},
  customDb?: Db
): Promise<LoadedLeadsResult> {
  return loadB2BLeadsFromDb(filter, customDb);
}

export async function updateB2BLeadStatus(
  leadId: string,
  newStatus: LeadStatus,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; lead: B2BLeadRecord }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return updateB2BLeadStatusInDb(db, leadId, newStatus, actor);
  }

  assertCanMutateWithoutMongo();
  const updated = memoryStore.updateLead(leadId, { status: newStatus });
  await recordAuditLog({
    action: 'UPDATE_LEAD_STATUS',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'B2B_LEAD',
    entityId: leadId,
    beforePayload: null,
    afterPayload: updated as unknown as Record<string, any>,
  });
  return { ok: true, lead: updated };
}

export async function deleteB2BLead(
  leadId: string,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; deleted: boolean }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return deleteB2BLeadFromDb(db, leadId, actor);
  }

  assertCanMutateWithoutMongo();
  const deleted = memoryStore.deleteLead(leadId);
  if (deleted) {
    await recordAuditLog({
      action: 'DELETE_LEAD',
      actorId: actor.userId,
      actorRole: actor.role,
      entityType: 'B2B_LEAD',
      entityId: leadId,
      beforePayload: null,
      afterPayload: null,
    });
  }
  return { ok: true, deleted };
}

function applyLeadFilters(leads: B2BLeadRecord[], filter: GetLeadsFilter): B2BLeadRecord[] {
  return leads.filter((l) => {
    if (filter.status && l.status !== filter.status) return false;
    if (
      filter.archetype &&
      filter.archetype !== 'All' &&
      filter.archetype !== 'ALL' &&
      l.partnership_archetype !== filter.archetype
    ) {
      return false;
    }
    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.toLowerCase().trim();
      const matchComp = l.company_name.toLowerCase().includes(q);
      const matchContact = l.contact_name.toLowerCase().includes(q);
      const matchEmail = l.email.toLowerCase().includes(q);
      if (!matchComp && !matchContact && !matchEmail) return false;
    }
    return true;
  });
}
