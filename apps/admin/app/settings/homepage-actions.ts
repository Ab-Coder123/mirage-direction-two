'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  HomepageHeroInputSchema,
  recordAuditLog,
  type HomepageHeroInput,
  type SaveHomepageHeroResult,
} from '@mirage/db';
import {
  saveHomepageHeroContent,
  loadHomepageHeroContent,
  describeHomepageStorage,
  requireAdminSession,
  ADMIN_SESSION_COOKIE_NAME,
  type LoadedHomepageHero,
} from '@mirage/db/server';

async function getSessionTokenFromRequest(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

/**
 * Fetches the latest saved hero content along with storage status for authenticated Admin readers.
 */
export async function getHomepageHeroAction(): Promise<{
  content: LoadedHomepageHero['content'];
  source: LoadedHomepageHero['source'];
  storage: ReturnType<typeof describeHomepageStorage>;
  warning?: string | undefined;
}> {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('cms:read', { sessionToken });
  const storage = describeHomepageStorage();
  if (!auth.ok) {
    return {
      content: DEFAULT_HOMEPAGE_HERO_CONTENT,
      source: 'default',
      storage,
      warning: auth.error,
    };
  }

  const loaded = await loadHomepageHeroContent();
  return {
    content: loaded.content,
    source: loaded.source,
    storage,
    warning: loaded.warning,
  };
}

/**
 * Persists updated homepage hero content to durable storage,
 * logs GxP 21 CFR Part 11 audit trail using the cryptographically verified session,
 * and triggers route revalidation.
 * Rejects unauthenticated, expired, tampered, or unauthorized (`read_only` / `qa_officer`) callers.
 */
export async function saveHomepageHeroAction(input: unknown): Promise<SaveHomepageHeroResult> {
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
  const parsed = HomepageHeroInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof HomepageHeroInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof HomepageHeroInput;
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
    // 3. Save to durable repository (atomic write)
    const saved = await saveHomepageHeroContent(parsed.data, actorLabel);

    // 4. Invalidate Admin route cache
    try {
      revalidatePath('/settings');
    } catch {
      // Ignore if called in non-HTTP test environment
    }

    // 5. Notify the public website (apps/web) via revalidation endpoint
    let revalidationStatus: 'ok' | 'skipped' | 'failed' = 'skipped';
    let revalidationMessage = 'Shared storage updated; web reads fresh data on next request.';

    const webBaseUrl = process.env.WEB_APP_URL || process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
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
        body: JSON.stringify({ paths: ['/', '/ar'] }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeout);

      if (res && res.ok) {
        revalidationStatus = 'ok';
        revalidationMessage = 'Instant revalidation succeeded across public English (/) and Arabic (/ar) pages.';
      }
    } catch {
      // apps/web may not be running during build/test; graceful skip
    }

    // 6. Record 21 CFR Part 11 Audit Trail
    try {
      await recordAuditLog({
        action: 'UPDATE_HOMEPAGE_HERO_CONTENT',
        actorId: auth.session.sub,
        actorRole: auth.session.role,
        entityType: 'SITE_CONTENT',
        entityId: 'homepage_hero',
        afterPayload: saved.content as unknown as Record<string, any>,
      });
    } catch (auditErr) {
      console.warn('[saveHomepageHeroAction] Audit log write warning:', auditErr);
    }

    return {
      ok: true,
      content: saved.content,
      storage: {
        mode: saved.mode,
        label: saved.label,
      },
      revalidation: {
        status: revalidationStatus,
        message: revalidationMessage,
      },
    };
  } catch (err: any) {
    const message = err?.message || 'Failed to save homepage content to durable storage';
    return {
      ok: false,
      error: message,
    };
  }
}
