'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  loadB2BLeads,
  updateB2BLeadStatus,
  deleteB2BLead,
  submitB2BLead,
  requireAdminSession,
  ADMIN_SESSION_COOKIE_NAME,
  type GetLeadsFilter,
} from '@mirage/db/server';
import type { LeadStatus, SubmitB2BLeadInput } from '@mirage/db';

async function getSessionTokenFromRequest(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

export async function getB2BLeadsAction(filter: GetLeadsFilter = {}) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('leads:read', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await loadB2BLeads(filter);
    return {
      ok: true as const,
      leads: result.leads,
      source: result.source,
      warning: result.warning,
    };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to read B2B leads',
    };
  }
}

export async function createB2BLeadAction(input: SubmitB2BLeadInput) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('leads:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await submitB2BLead(input);
    try {
      revalidatePath('/b2b-leads');
    } catch {
      // test runner
    }
    return { ok: true as const, lead: result.lead };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to register partner inquiry',
    };
  }
}

export async function updateB2BLeadStatusAction(
  leadId: string,
  status: LeadStatus
) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('leads:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await updateB2BLeadStatus(leadId, status, {
      userId: auth.session.sub,
      role: auth.session.role,
    });
    try {
      revalidatePath('/b2b-leads');
    } catch {
      // test runner
    }
    return { ok: true as const, lead: result.lead };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to update B2B lead status',
    };
  }
}

export async function deleteB2BLeadAction(leadId: string) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('leads:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await deleteB2BLead(leadId, {
      userId: auth.session.sub,
      role: auth.session.role,
    });
    try {
      revalidatePath('/b2b-leads');
    } catch {
      // test runner
    }
    return { ok: true as const, deleted: result.deleted };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to delete B2B lead',
    };
  }
}
