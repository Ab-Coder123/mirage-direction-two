import { B2BLeadRecord, SubmitB2BLeadInput, SubmitB2BLeadMutationSchema, LeadStatus } from '../schema';
import { memoryStore } from './memory-store';
import { recordAuditLog } from './audit';

export interface GetLeadsFilter {
  status?: LeadStatus;
  archetype?: string;
}

export async function submitB2BLead(input: SubmitB2BLeadInput): Promise<B2BLeadRecord> {
  const validated = SubmitB2BLeadMutationSchema.parse(input);
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

  // Immediately store in local memory for zero-latency retrieval
  memoryStore.addLead(leadRecord);

  // Record audit event for lead intake
  await recordAuditLog({
    action: 'B2B_PARTNER_LEAD_SUBMITTED',
    actorId: 'ANONYMOUS_PUBLIC_USER',
    actorRole: 'PUBLIC',
    entityType: 'B2B_LEAD',
    entityId: leadRecord.id,
    afterPayload: leadRecord as unknown as Record<string, any>,
  });

  return leadRecord;
}

export async function getB2BLeads(filter: GetLeadsFilter = {}): Promise<B2BLeadRecord[]> {
  const leads: B2BLeadRecord[] = memoryStore.getLeads();

  return leads.filter((l) => {
    if (filter.status && l.status !== filter.status) return false;
    if (filter.archetype && filter.archetype !== 'ALL' && l.partnership_archetype !== filter.archetype) return false;
    return true;
  });
}

export async function updateLeadStatus(
  id: string,
  newStatus: LeadStatus,
  actor = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<B2BLeadRecord> {
  const current = memoryStore.getLeads().find((l) => l.id === id);
  const updated = memoryStore.updateLead(id, { status: newStatus });

  await recordAuditLog({
    action: 'UPDATE_LEAD_STATUS',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'B2B_LEAD',
    entityId: id,
    beforePayload: current as unknown as Record<string, any>,
    afterPayload: updated as unknown as Record<string, any>,
  });

  return updated;
}

export async function deleteLead(
  id: string,
  actor = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<boolean> {
  const current = memoryStore.getLeads().find((l) => l.id === id);
  const deleted = memoryStore.deleteLead(id);

  if (current) {
    await recordAuditLog({
      action: 'DELETE_B2B_LEAD',
      actorId: actor.userId,
      actorRole: actor.role,
      entityType: 'B2B_LEAD',
      entityId: id,
      beforePayload: current as unknown as Record<string, any>,
    });
  }

  return deleted;
}
