'use server';

import { cookies } from 'next/headers';
import {
  ADMIN_SESSION_COOKIE_NAME,
  authenticateAdminCredentials,
  requireAdminSession,
  setTestSessionCookieForTesting,
  type AdminSessionPayload,
  type AuthErrorCode,
} from '@mirage/db/server';

export type LoginAdminActionResult =
  | {
      ok: true;
      session: Pick<AdminSessionPayload, 'email' | 'name' | 'role' | 'exp'>;
    }
  | {
      ok: false;
      code: AuthErrorCode;
      error: string;
    };

export async function loginAdminAction(input: {
  email: string;
  password: string;
}): Promise<LoginAdminActionResult> {
  const result = authenticateAdminCredentials(input);
  if (!result.ok) {
    return {
      ok: false,
      code: result.code,
      error: result.error,
    };
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_SESSION_COOKIE_NAME,
      result.token,
      result.cookieOptions
    );
  } catch {
    if (process.env.NODE_ENV === 'test') {
      setTestSessionCookieForTesting(result.token);
    } else {
      return {
        ok: false,
        code: 'UNAUTHENTICATED',
        error: 'Unable to persist HTTP-only session cookie outside a server request context.',
      };
    }
  }

  if (process.env.NODE_ENV === 'test') {
    setTestSessionCookieForTesting(result.token);
  }

  return {
    ok: true,
    session: {
      email: result.session.email,
      name: result.session.name,
      role: result.session.role,
      exp: result.session.exp,
    },
  };
}

export async function logoutAdminAction(): Promise<{ ok: true }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
  } catch {
    // Ignore outside Next.js request context
  }

  if (process.env.NODE_ENV === 'test') {
    setTestSessionCookieForTesting(null);
  }

  return { ok: true };
}

export async function getAdminAuthStatusAction() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return {
      authenticated: false as const,
      code: auth.code,
      error: auth.error,
    };
  }

  return {
    authenticated: true as const,
    session: auth.session,
  };
}
