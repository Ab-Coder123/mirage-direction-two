import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { UserRoleSchema } from '../schema';
import {
  ADMIN_SESSION_COOKIE_NAME,
  DEFAULT_SESSION_TTL_MS,
  MIN_SESSION_SECRET_LENGTH,
  hasAdminPermission,
  issueSessionToken,
  verifySessionToken,
  type AdminPermission,
  type AdminSessionPayload,
  type AuthErrorCode,
} from './auth-token';

export * from './auth-token';

const ConfiguredAdminOperatorSchema = z.object({
  id: z.string().min(1).optional(),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: UserRoleSchema.default('super_admin'),
  passwordHash: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
});

export type ConfiguredAdminOperator = z.infer<typeof ConfiguredAdminOperatorSchema>;

export interface AdminCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

export function getAdminSessionCookieOptions(
  maxAgeSeconds: number = Math.floor(DEFAULT_SESSION_TTL_MS / 1000)
): AdminCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * Generates an scrypt password hash string formatted as `scrypt:<saltHex>:<hashHex>`.
 */
export function hashAdminPasswordScrypt(password: string, saltHex?: string): string {
  const resolvedSalt = saltHex ?? randomBytes(16).toString('hex');
  const derived = scryptSync(password, resolvedSalt, 64).toString('hex');
  return `scrypt:${resolvedSalt}:${derived}`;
}

/**
 * Verifies a plaintext password against either an `scrypt:<saltHex>:<hashHex>` hash,
 * a `sha256:<hashHex>` hash, or a server-configured plaintext secret using constant-time comparison.
 */
export function verifyAdminPassword(
  candidatePassword: string,
  operator: { passwordHash?: string | undefined; password?: string | undefined }
): boolean {
  if (!candidatePassword) return false;

  if (operator.passwordHash) {
    const hashSpec = operator.passwordHash.trim();
    if (hashSpec.startsWith('scrypt:')) {
      const parts = hashSpec.split(':');
      if (parts.length !== 3) return false;
      const [, saltHex, expectedHex] = parts as [string, string, string];
      if (!saltHex || !expectedHex) return false;
      try {
        const expectedBuf = Buffer.from(expectedHex, 'hex');
        const actualBuf = scryptSync(candidatePassword, saltHex, expectedBuf.length);
        if (expectedBuf.length !== actualBuf.length) return false;
        return timingSafeEqual(expectedBuf, actualBuf);
      } catch {
        return false;
      }
    }

    if (hashSpec.startsWith('sha256:')) {
      const expectedHex = hashSpec.slice('sha256:'.length).trim();
      try {
        const expectedBuf = Buffer.from(expectedHex, 'hex');
        const actualBuf = createHash('sha256').update(candidatePassword, 'utf8').digest();
        if (expectedBuf.length !== actualBuf.length) return false;
        return timingSafeEqual(expectedBuf, actualBuf);
      } catch {
        return false;
      }
    }

    return false;
  }

  if (operator.password) {
    const expectedDigest = createHash('sha256').update(operator.password, 'utf8').digest();
    const actualDigest = createHash('sha256').update(candidatePassword, 'utf8').digest();
    return timingSafeEqual(expectedDigest, actualDigest);
  }

  return false;
}

/**
 * Loads configured Admin operators strictly from server-only environment variables.
 * Never invents or falls back to hardcoded default production credentials.
 */
export function loadConfiguredAdminOperators():
  | { ok: true; operators: ConfiguredAdminOperator[] }
  | { ok: false; code: 'AUTH_NOT_CONFIGURED'; error: string } {
  const sessionSecret = (process.env.MIRAGE_SESSION_SECRET ?? '').trim();
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    return {
      ok: false,
      code: 'AUTH_NOT_CONFIGURED',
      error: `Authentication is not configured: set MIRAGE_SESSION_SECRET (minimum ${MIN_SESSION_SECRET_LENGTH} characters) in server environment variables.`,
    };
  }

  const operators: ConfiguredAdminOperator[] = [];

  const usersJsonRaw = (process.env.MIRAGE_ADMIN_USERS_JSON ?? '').trim();
  if (usersJsonRaw) {
    try {
      const parsed = JSON.parse(usersJsonRaw);
      const arrResult = z.array(ConfiguredAdminOperatorSchema).safeParse(parsed);
      if (!arrResult.success) {
        return {
          ok: false,
          code: 'AUTH_NOT_CONFIGURED',
          error: `Invalid MIRAGE_ADMIN_USERS_JSON configuration: ${arrResult.error.issues[0]?.message ?? 'schema error'}`,
        };
      }
      for (const op of arrResult.data) {
        if (op.passwordHash || op.password) {
          operators.push(op);
        }
      }
    } catch {
      return {
        ok: false,
        code: 'AUTH_NOT_CONFIGURED',
        error: 'Invalid MIRAGE_ADMIN_USERS_JSON configuration: must be valid JSON.',
      };
    }
  }

  const primaryEmail = (process.env.MIRAGE_ADMIN_EMAIL ?? '').trim();
  const primaryPasswordHash = (process.env.MIRAGE_ADMIN_PASSWORD_HASH ?? '').trim();
  const primaryPassword = process.env.MIRAGE_ADMIN_PASSWORD ?? '';
  const primaryRoleRaw = (process.env.MIRAGE_ADMIN_ROLE ?? 'super_admin').trim();
  const primaryName = (process.env.MIRAGE_ADMIN_NAME ?? 'Mirage Admin Operator').trim();

  if (primaryEmail && (primaryPasswordHash || primaryPassword)) {
    const roleCheck = UserRoleSchema.safeParse(primaryRoleRaw);
    if (!roleCheck.success) {
      return {
        ok: false,
        code: 'AUTH_NOT_CONFIGURED',
        error: `Invalid MIRAGE_ADMIN_ROLE '${primaryRoleRaw}'. Allowed roles: super_admin, medical_director, qa_officer, read_only.`,
      };
    }

    const emailCheck = z.string().email().safeParse(primaryEmail);
    if (!emailCheck.success) {
      return {
        ok: false,
        code: 'AUTH_NOT_CONFIGURED',
        error: 'Invalid MIRAGE_ADMIN_EMAIL format in server environment configuration.',
      };
    }

    operators.push({
      id: 'USR-ADMIN-PRIMARY',
      email: primaryEmail,
      name: primaryName || 'Mirage Admin Operator',
      role: roleCheck.data,
      passwordHash: primaryPasswordHash || undefined,
      password: primaryPassword || undefined,
    });
  }

  if (operators.length === 0) {
    return {
      ok: false,
      code: 'AUTH_NOT_CONFIGURED',
      error:
        'Admin credentials are not configured on the server. Set MIRAGE_SESSION_SECRET, MIRAGE_ADMIN_EMAIL, and MIRAGE_ADMIN_PASSWORD_HASH (or MIRAGE_ADMIN_PASSWORD) in your server environment.',
    };
  }

  return { ok: true, operators };
}

export type AuthenticateAdminResult =
  | {
      ok: true;
      token: string;
      session: AdminSessionPayload;
      cookieOptions: AdminCookieOptions;
    }
  | {
      ok: false;
      code: AuthErrorCode;
      error: string;
    };

/**
 * Authenticates an Admin operator against server-configured credentials and issues
 * a signed HMAC-SHA256 session token. Never accepts client-selected roles.
 */
export function authenticateAdminCredentials(input: {
  email: string;
  password: string;
}): AuthenticateAdminResult {
  const configResult = loadConfiguredAdminOperators();
  if (!configResult.ok) {
    return configResult;
  }

  const normalizedInputEmail = (input.email ?? '').trim().toLowerCase();
  const candidatePassword = input.password ?? '';

  if (!normalizedInputEmail || !candidatePassword) {
    return {
      ok: false,
      code: 'INVALID_CREDENTIALS',
      error: 'Email and password are required.',
    };
  }

  const matchedOperator = configResult.operators.find((op) => {
    const opEmailDigest = createHash('sha256')
      .update(op.email.trim().toLowerCase(), 'utf8')
      .digest();
    const inputEmailDigest = createHash('sha256')
      .update(normalizedInputEmail, 'utf8')
      .digest();
    return timingSafeEqual(opEmailDigest, inputEmailDigest);
  });

  if (!matchedOperator || !verifyAdminPassword(candidatePassword, matchedOperator)) {
    return {
      ok: false,
      code: 'INVALID_CREDENTIALS',
      error: 'Invalid operator email or password.',
    };
  }

  const token = issueSessionToken({
    sub: matchedOperator.id ?? `USR-${matchedOperator.role.toUpperCase()}`,
    email: matchedOperator.email.trim().toLowerCase(),
    name: matchedOperator.name ?? 'Mirage Admin Operator',
    role: matchedOperator.role,
  });

  const verified = verifySessionToken(token);
  if (!verified.ok) {
    return verified;
  }

  return {
    ok: true,
    token,
    session: verified.session,
    cookieOptions: getAdminSessionCookieOptions(),
  };
}

// ============================================================================
// Server Action Session Guard (with strict verification in both Prod & Test)
// ============================================================================

let testRawSessionCookie: string | null = null;
let customCookieReader: (() => Promise<string | undefined> | string | undefined) | null = null;

/**
 * Allows registering a custom cookie provider (e.g. for server frameworks or wrappers).
 */
export function registerSessionCookieReader(
  reader: (() => Promise<string | undefined> | string | undefined) | null
): void {
  customCookieReader = reader;
}

/**
 * Test-only helper for injecting a raw `mirage_session` cookie value when running
 * Vitest Server Action tests outside a Next.js HTTP request scope.
 * IMPORTANT: The injected value is still verified cryptographically via `verifySessionToken`
 * against `process.env.MIRAGE_SESSION_SECRET` and checked against `ROLE_PERMISSIONS`.
 */
export function setTestSessionCookieForTesting(rawCookieValue: string | null): void {
  testRawSessionCookie = rawCookieValue;
}

async function readRawSessionCookieFromRequest(explicitToken?: string): Promise<string | undefined> {
  if (explicitToken && typeof explicitToken === 'string' && explicitToken.trim()) {
    return explicitToken.trim();
  }

  if (customCookieReader) {
    try {
      const val = await customCookieReader();
      if (val && typeof val === 'string' && val.trim()) {
        return val.trim();
      }
    } catch {
      // ignore custom reader failure
    }
  }

  try {
    const nextHeadersModule = 'next/headers';
    const nextHeaders = (await import(/* webpackIgnore: true */ nextHeadersModule).catch(() => null)) as unknown as {
      cookies?: () => Promise<{ get: (name: string) => { value?: string } | undefined }>;
    } | null;
    if (nextHeaders && typeof nextHeaders.cookies === 'function') {
      const cookieStore = await nextHeaders.cookies();
      const cookieVal = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
      if (cookieVal !== undefined && cookieVal.trim()) {
        return cookieVal.trim();
      }
    }
  } catch {
    // Outside a Next.js HTTP request scope or Next.js headers unavailable
  }

  if ((process.env.NODE_ENV === 'test' || process.env.VITEST) && testRawSessionCookie !== null) {
    return testRawSessionCookie;
  }

  return undefined;
}

export type RequireAdminSessionResult =
  | {
      ok: true;
      session: AdminSessionPayload;
    }
  | {
      ok: false;
      code: AuthErrorCode;
      error: string;
    };

/**
 * Verifies the active Admin session cookie and enforces server-side RBAC permission checks.
 * Fails closed when configuration is missing, the session is missing/unsigned/tampered/expired,
 * or the authenticated role lacks the required permission.
 *
 * @param requiredPermission Optional specific permission to verify.
 * @param options Optional options including an explicitly provided session token from request cookies.
 */
export async function requireAdminSession(
  requiredPermission?: AdminPermission,
  options?: { sessionToken?: string | undefined }
): Promise<RequireAdminSessionResult> {
  const sessionSecret = (process.env.MIRAGE_SESSION_SECRET ?? '').trim();
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) {
    return {
      ok: false,
      code: 'AUTH_NOT_CONFIGURED',
      error: `Authentication is not configured: set MIRAGE_SESSION_SECRET (minimum ${MIN_SESSION_SECRET_LENGTH} characters) in server environment variables.`,
    };
  }

  const rawCookie = await readRawSessionCookieFromRequest(options?.sessionToken);
  const verification = verifySessionToken(rawCookie, sessionSecret);
  if (!verification.ok) {
    return verification;
  }

  if (requiredPermission && !hasAdminPermission(verification.session.role, requiredPermission)) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      error: `Forbidden: role '${verification.session.role}' does not have '${requiredPermission}' clearance.`,
    };
  }

  return {
    ok: true,
    session: verification.session,
  };
}
