'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  CompanyStoryInputSchema,
  recordAuditLog,
  type SaveCompanyStoryResult,
} from '@mirage/db';
import {
  saveCompanyStoryContent,
  loadCompanyStoryContent,
  describeCompanyStorage,
  requireAdminSession,
  ADMIN_SESSION_COOKIE_NAME,
  type LoadedCompanyStory,
} from '@mirage/db/server';

async function getSessionTokenFromRequest(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

export async function getCompanyStoryAction(): Promise<{
  content: LoadedCompanyStory['content'];
  source: LoadedCompanyStory['source'];
  storage: ReturnType<typeof describeCompanyStorage>;
  warning?: string | undefined;
}> {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('cms:read', { sessionToken });
  const storage = describeCompanyStorage();
  if (!auth.ok) {
    return {
      content: DEFAULT_COMPANY_STORY_CONTENT,
      source: 'default',
      storage,
      warning: auth.error,
    };
  }

  const loaded = await loadCompanyStoryContent();
  return {
    content: loaded.content,
    source: loaded.source,
    storage,
    warning: loaded.warning,
  };
}

export async function saveCompanyStoryAction(input: unknown): Promise<SaveCompanyStoryResult> {
  // 1. Verify server-side session signature, expiry, and 'cms:write' role permission
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('cms:write', { sessionToken });
  if (!auth.ok) {
    return {
      ok: false,
      error: auth.error,
    };
  }

  // 2. Server-side schema validation
  const parsed = CompanyStoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      error: 'Validation failed. Please correct the highlighted fields.',
      fieldErrors,
    };
  }

  const actorLabel = `${auth.session.name} <${auth.session.email}> (${auth.session.role})`;

  try {
    const saved = await saveCompanyStoryContent(parsed.data, actorLabel);

    try {
      revalidatePath('/settings');
    } catch {
      // test environment
    }

    const webBaseUrl = process.env.WEB_APP_URL || process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
    let revalidationStatus: 'ok' | 'skipped' | 'failed' = 'ok';
    let revalidationMessage = 'Public routes (/our-story, /ar/our-story) revalidated successfully.';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${webBaseUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.REVALIDATION_SECRET
            ? {
                'x-revalidation-secret': process.env.REVALIDATION_SECRET,
                'x-revalidate-secret': process.env.REVALIDATION_SECRET,
              }
            : {}),
        },
        body: JSON.stringify({ paths: ['/our-story', '/ar/our-story'] }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        revalidationStatus = 'failed';
        revalidationMessage = `Web revalidation returned status ${res.status}. Content is persisted.`;
      }
    } catch {
      revalidationStatus = 'skipped';
      revalidationMessage =
        'Web app is offline or unreachable on localhost:3000. Changes will be visible on next request.';
    }

    try {
      recordAuditLog({
        action: 'UPDATE_COMPANY_STORY',
        actorId: auth.session.sub,
        actorRole: auth.session.role,
        entityType: 'SITE_CONTENT',
        entityId: 'company_story',
        afterPayload: {
          label: actorLabel,
          mode: saved.mode,
        },
      });
    } catch {
      // audit log non-fatal
    }

    return {
      ok: true,
      content: saved.content,
      storage: { mode: saved.mode, label: saved.label },
      revalidation: { status: revalidationStatus, message: revalidationMessage },
    };
  } catch (err: any) {
    return {
      ok: false,
      error: err?.message || 'Failed to save company story content',
      missingEnv: err?.missingEnv,
    };
  }
}
