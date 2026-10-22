import { z } from 'zod';
import { UserRoleSchema, type UserRole } from '../schema';

export const ADMIN_SESSION_COOKIE_NAME = 'mirage_session';
export const DEFAULT_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
export const MIN_SESSION_SECRET_LENGTH = 32;

export type AdminPermission =
  | 'cms:read'
  | 'cms:write'
  | 'products:read'
  | 'products:write'
  | 'leads:read'
  | 'leads:write'
  | 'audit:read';

export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly AdminPermission[]>> = {
  super_admin: [
    'cms:read',
    'cms:write',
    'products:read',
    'products:write',
    'leads:read',
    'leads:write',
    'audit:read',
  ],
  medical_director: [
    'cms:read',
    'cms:write',
    'products:read',
    'products:write',
    'leads:read',
    'leads:write',
    'audit:read',
  ],
  qa_officer: [
    'cms:read',
    'products:read',
    'products:write',
    'leads:read',
    'audit:read',
  ],
  read_only: [
    'cms:read',
    'products:read',
    'leads:read',
    'audit:read',
  ],
};

export function hasAdminPermission(role: UserRole, permission: AdminPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export const AdminSessionPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  iat: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
});

export type AdminSessionPayload = z.infer<typeof AdminSessionPayloadSchema>;

export type AuthErrorCode =
  | 'AUTH_NOT_CONFIGURED'
  | 'UNAUTHENTICATED'
  | 'INVALID_TOKEN_FORMAT'
  | 'INVALID_SIGNATURE'
  | 'SESSION_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'FORBIDDEN';

export type SessionVerificationResult =
  | {
      ok: true;
      session: AdminSessionPayload;
    }
  | {
      ok: false;
      code: AuthErrorCode;
      error: string;
    };

// ============================================================================
// Pure FIPS 180-4 SHA-256 & RFC 2104 HMAC-SHA256 (Node & Edge Runtime Safe)
// ============================================================================

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Bytes(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const bitLenHi = Math.floor((data.length * 8) / 0x100000000);
  const bitLenLo = (data.length * 8) >>> 0;

  const paddedLen = ((data.length + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, bitLenHi, false);
  view.setUint32(paddedLen - 4, bitLenLo, false);

  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const w15 = w[i - 15]!;
      const w2 = w[i - 2]!;
      const s0 = rotr(7, w15) ^ rotr(18, w15) ^ (w15 >>> 3);
      const s1 = rotr(17, w2) ^ rotr(19, w2) ^ (w2 >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i]! + w[i]!) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

export function hmacSha256Bytes(keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
  const blockSize = 64;
  let normalizedKey = keyBytes;
  if (normalizedKey.length > blockSize) {
    normalizedKey = sha256Bytes(normalizedKey);
  }

  const keyBlock = new Uint8Array(blockSize);
  keyBlock.set(normalizedKey);

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    const k = keyBlock[i]!;
    oKeyPad[i] = k ^ 0x5c;
    iKeyPad[i] = k ^ 0x36;
  }

  const innerInput = new Uint8Array(blockSize + messageBytes.length);
  innerInput.set(iKeyPad, 0);
  innerInput.set(messageBytes, blockSize);
  const innerHash = sha256Bytes(innerInput);

  const outerInput = new Uint8Array(blockSize + innerHash.length);
  outerInput.set(oKeyPad, 0);
  outerInput.set(innerHash, blockSize);
  return sha256Bytes(outerInput);
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64Url(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i]!;
    const b1 = i + 1 < len ? bytes[i + 1]! : 0;
    const b2 = i + 2 < len ? bytes[i + 2]! : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;
    result += BASE64_ALPHABET[(triplet >> 18) & 0x3f];
    result += BASE64_ALPHABET[(triplet >> 12) & 0x3f];
    if (i + 1 < len) {
      result += BASE64_ALPHABET[(triplet >> 6) & 0x3f];
    }
    if (i + 2 < len) {
      result += BASE64_ALPHABET[triplet & 0x3f];
    }
  }

  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

export function base64UrlToBytes(base64Url: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(base64Url)) {
    return null;
  }

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  if (padLen === 3) {
    return null; // Invalid base64url length
  }
  const padded = base64 + '='.repeat(padLen);

  const lookup = new Int16Array(128).fill(-1);
  for (let i = 0; i < BASE64_ALPHABET.length; i++) {
    lookup[BASE64_ALPHABET.charCodeAt(i)] = i;
  }

  const outLen = Math.floor((base64Url.length * 3) / 4);
  const out = new Uint8Array(outLen);
  let outIdx = 0;

  for (let i = 0; i < padded.length; i += 4) {
    const c0 = padded.charCodeAt(i);
    const c1 = padded.charCodeAt(i + 1);
    const c2 = padded.charCodeAt(i + 2);
    const c3 = padded.charCodeAt(i + 3);

    const v0 = c0 < 128 ? lookup[c0]! : -1;
    const v1 = c1 < 128 ? lookup[c1]! : -1;
    const v2 = c2 === 61 ? 0 : c2 < 128 ? lookup[c2]! : -1;
    const v3 = c3 === 61 ? 0 : c3 < 128 ? lookup[c3]! : -1;

    if (v0 < 0 || v1 < 0 || v2 < 0 || v3 < 0) {
      return null;
    }

    const triplet = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    if (outIdx < outLen) out[outIdx++] = (triplet >> 16) & 0xff;
    if (outIdx < outLen) out[outIdx++] = (triplet >> 8) & 0xff;
    if (outIdx < outLen) out[outIdx++] = triplet & 0xff;
  }

  return out;
}

/**
 * Constant-time byte array comparison to prevent timing side-channel attacks.
 */
export function constantTimeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

export function computeHmacSha256Signature(signingInput: string, secret: string): string {
  const encoder = new TextEncoder();
  const sigBytes = hmacSha256Bytes(encoder.encode(secret), encoder.encode(signingInput));
  return bytesToBase64Url(sigBytes);
}

/**
 * Issues a cryptographically signed HMAC-SHA256 session token (`v1.<payload>.<signature>`).
 * Throws if the secret is missing or shorter than MIN_SESSION_SECRET_LENGTH (32 chars).
 */
export function issueSessionToken(
  input: {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
    iat?: number;
    exp?: number;
    ttlMs?: number;
  },
  secret?: string
): string {
  const resolvedSecret = (secret ?? process.env.MIRAGE_SESSION_SECRET ?? '').trim();
  if (resolvedSecret.length < MIN_SESSION_SECRET_LENGTH) {
    throw new Error(
      `Authentication configuration missing: MIRAGE_SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters.`
    );
  }

  const now = input.iat ?? Date.now();
  const exp = input.exp ?? now + (input.ttlMs ?? DEFAULT_SESSION_TTL_MS);

  const payload: AdminSessionPayload = AdminSessionPayloadSchema.parse({
    sub: input.sub,
    email: input.email,
    name: input.name,
    role: input.role,
    iat: now,
    exp,
  });

  const encoder = new TextEncoder();
  const payloadBase64Url = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `v1.${payloadBase64Url}`;
  const signatureBase64Url = computeHmacSha256Signature(signingInput, resolvedSecret);

  return `${signingInput}.${signatureBase64Url}`;
}

/**
 * Verifies a signed `mirage_session` token using constant-time HMAC-SHA256 signature comparison,
 * schema validation, and expiration checks.
 */
export function verifySessionToken(
  token: string | undefined | null,
  secret?: string,
  nowMs: number = Date.now()
): SessionVerificationResult {
  const resolvedSecret = (secret ?? process.env.MIRAGE_SESSION_SECRET ?? '').trim();
  if (resolvedSecret.length < MIN_SESSION_SECRET_LENGTH) {
    return {
      ok: false,
      code: 'AUTH_NOT_CONFIGURED',
      error: `Server authentication is not configured. Set MIRAGE_SESSION_SECRET (minimum ${MIN_SESSION_SECRET_LENGTH} characters) in server environment variables.`,
    };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      ok: false,
      code: 'UNAUTHENTICATED',
      error: 'Authentication required: no session token provided.',
    };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') {
    return {
      ok: false,
      code: 'INVALID_TOKEN_FORMAT',
      error: 'Invalid session token format. Unsigned or malformed session cookies are rejected.',
    };
  }

  const [, payloadPart, providedSigPart] = parts as [string, string, string];
  if (!payloadPart || !providedSigPart) {
    return {
      ok: false,
      code: 'INVALID_TOKEN_FORMAT',
      error: 'Invalid session token structure.',
    };
  }

  const signingInput = `v1.${payloadPart}`;
  const encoder = new TextEncoder();
  const expectedSigBytes = hmacSha256Bytes(
    encoder.encode(resolvedSecret),
    encoder.encode(signingInput)
  );
  const providedSigBytes = base64UrlToBytes(providedSigPart);

  if (
    !providedSigBytes ||
    !constantTimeEqualBytes(expectedSigBytes, providedSigBytes)
  ) {
    return {
      ok: false,
      code: 'INVALID_SIGNATURE',
      error: 'Session signature verification failed: token has been tampered with or signed with a different key.',
    };
  }

  const payloadBytes = base64UrlToBytes(payloadPart);
  if (!payloadBytes) {
    return {
      ok: false,
      code: 'INVALID_TOKEN_FORMAT',
      error: 'Session payload encoding is invalid.',
    };
  }

  let rawJson: unknown;
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    rawJson = JSON.parse(decoder.decode(payloadBytes));
  } catch {
    return {
      ok: false,
      code: 'INVALID_TOKEN_FORMAT',
      error: 'Session payload is not valid JSON.',
    };
  }

  const parsedPayload = AdminSessionPayloadSchema.safeParse(rawJson);
  if (!parsedPayload.success) {
    return {
      ok: false,
      code: 'INVALID_TOKEN_FORMAT',
      error: `Session payload failed schema validation: ${parsedPayload.error.issues[0]?.message ?? 'invalid claims'}`,
    };
  }

  const session = parsedPayload.data;
  if (session.exp <= nowMs) {
    return {
      ok: false,
      code: 'SESSION_EXPIRED',
      error: 'Session has expired. Please sign in again.',
    };
  }

  return {
    ok: true,
    session,
  };
}
