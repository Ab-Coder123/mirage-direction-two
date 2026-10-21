import { B2BLeadRecord, SubmitB2BLeadInput, SubmitB2BLeadMutationSchema, LeadStatus } from '../schema';
import { memoryStore } from './memory-store';
import { recordAuditLog } from './audit';
import { getSupabaseClient, isSupabaseConfigured } from '../client';

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

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from('b2b_leads').insert([leadRecord]);
      if (error) {
        console.error('[LeadsRepo] Supabase insert error:', error);
      }
    }
  }

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
  let leads: B2BLeadRecord[] = [];

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('b2b_leads').select('*').order('created_at', { ascending: false });
      if (filter.status) query = query.eq('status', filter.status);
      if (filter.archetype && filter.archetype !== 'ALL') query = query.eq('partnership_archetype', filter.archetype);
      const { data, error } = await query;
      if (!error && data) leads = data as B2BLeadRecord[];
    }
  }

  if (leads.length === 0) {
    leads = memoryStore.getLeads();
  }

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

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('b2b_leads').update({ status: newStatus }).eq('id', id);
    }
  }

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
