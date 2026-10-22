import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  authenticateAdminCredentials,
  bytesToBase64Url,
  computeHmacSha256Signature,
  getAdminSessionCookieOptions,
  getCompanyStoryContent,
  getHomepageHeroContent,
  hasAdminPermission,
  hashAdminPasswordScrypt,
  issueSessionToken,
  requireAdminSession,
  setTestSessionCookieForTesting,
  verifySessionToken,
} from '../src/server';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  memoryStore,
} from '../src';

const VALID_SECRET = 'mirage-phase4-unit-test-hmac-sha256-secret-key-2026';
const DIFFERENT_SECRET = 'different-hmac-sha256-secret-key-that-must-fail-9999';

describe('Phase 4 Unit Suite (@mirage/db): Cryptographic Session Tokens, Credentials & RBAC Matrix', () => {
  beforeEach(() => {
    memoryStore.reset();
    setTestSessionCookieForTesting(null);
    process.env.MIRAGE_SESSION_SECRET = VALID_SECRET;
    delete process.env.MIRAGE_ADMIN_EMAIL;
    delete process.env.MIRAGE_ADMIN_PASSWORD;
    delete process.env.MIRAGE_ADMIN_PASSWORD_HASH;
    delete process.env.MIRAGE_ADMIN_ROLE;
    delete process.env.MIRAGE_ADMIN_USERS_JSON;
  });

  afterEach(() => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_ADMIN_EMAIL;
    delete process.env.MIRAGE_ADMIN_PASSWORD;
    delete process.env.MIRAGE_ADMIN_PASSWORD_HASH;
    delete process.env.MIRAGE_ADMIN_ROLE;
    delete process.env.MIRAGE_ADMIN_USERS_JSON;
  });

  describe('1. HMAC-SHA256 Session Token Signing & Verification', () => {
    it('produces bit-for-bit identical HMAC-SHA256 signatures to Node native crypto.createHmac', () => {
      const signingInput = 'v1.eyJzdWIiOiJVU1ItMDEiLCJyb2xlIjoic3VwZXJfYWRtaW4ifQ';
      const edgeSafeSig = computeHmacSha256Signature(signingInput, VALID_SECRET);
      const nodeNativeSig = createHmac('sha256', VALID_SECRET)
        .update(signingInput, 'utf8')
        .digest('base64url');

      expect(edgeSafeSig).toBe(nodeNativeSig);
    });

    it('issues and verifies a valid session token with intact role and claims', () => {
      const token = issueSessionToken(
        {
          sub: 'USR-SUPER-01',
          email: 'director@miragepharma.com',
          name: 'Dr. Tarek El Attar',
          role: 'super_admin',
        },
        VALID_SECRET
      );

      const verified = verifySessionToken(token, VALID_SECRET);
      expect(verified.ok).toBe(true);
      if (verified.ok) {
        expect(verified.session.sub).toBe('USR-SUPER-01');
        expect(verified.session.email).toBe('director@miragepharma.com');
        expect(verified.session.role).toBe('super_admin');
        expect(verified.session.exp).toBeGreaterThan(verified.session.iat);
      }
    });

    it('rejects unsigned legacy JSON cookies', () => {
      const legacyUnsigned = encodeURIComponent(
        JSON.stringify({
          userId: 'usr-super-admin',
          email: 'admin@miragepharma.com',
          role: 'super_admin',
        })
      );

      const res = verifySessionToken(legacyUnsigned, VALID_SECRET);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_TOKEN_FORMAT');
      }
    });

    it('rejects tampered payloads where role is escalated from read_only to super_admin', () => {
      const validReadOnlyToken = issueSessionToken(
        {
          sub: 'USR-AUDITOR',
          email: 'auditor@miragepharma.com',
          name: 'External Auditor',
          role: 'read_only',
        },
        VALID_SECRET
      );

      const [, , originalSignature] = validReadOnlyToken.split('.');
      const forgedPayload = bytesToBase64Url(
        new TextEncoder().encode(
          JSON.stringify({
            sub: 'USR-AUDITOR',
            email: 'auditor@miragepharma.com',
            name: 'External Auditor',
            role: 'super_admin', // Privilege escalation attempt!
            iat: Date.now(),
            exp: Date.now() + 3600_000,
          })
        )
      );

      const tamperedToken = `v1.${forgedPayload}.${originalSignature}`;
      const res = verifySessionToken(tamperedToken, VALID_SECRET);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_SIGNATURE');
      }
    });

    it('rejects tokens signed with a different secret key', () => {
      const tokenFromOtherKey = issueSessionToken(
        {
          sub: 'USR-01',
          email: 'admin@miragepharma.com',
          name: 'Admin',
          role: 'super_admin',
        },
        DIFFERENT_SECRET
      );

      const res = verifySessionToken(tokenFromOtherKey, VALID_SECRET);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('INVALID_SIGNATURE');
      }
    });

    it('rejects expired session tokens', () => {
      const now = 1_700_000_000_000;
      const expiredToken = issueSessionToken(
        {
          sub: 'USR-01',
          email: 'admin@miragepharma.com',
          name: 'Admin',
          role: 'super_admin',
          iat: now - 10_000,
          exp: now - 1,
        },
        VALID_SECRET
      );

      const res = verifySessionToken(expiredToken, VALID_SECRET, now);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('SESSION_EXPIRED');
      }
    });
  });

  describe('2. Fail-Closed Missing Configuration & Operator Credential Verification', () => {
    it('fails closed with AUTH_NOT_CONFIGURED when MIRAGE_SESSION_SECRET is missing or too short', async () => {
      delete process.env.MIRAGE_SESSION_SECRET;

      expect(() =>
        issueSessionToken({
          sub: 'USR-1',
          email: 'admin@miragepharma.com',
          name: 'Admin',
          role: 'super_admin',
        })
      ).toThrow(/MIRAGE_SESSION_SECRET/);

      const verifyRes = verifySessionToken('v1.abc.def');
      expect(verifyRes.ok).toBe(false);
      if (!verifyRes.ok) {
        expect(verifyRes.code).toBe('AUTH_NOT_CONFIGURED');
      }

      const guardRes = await requireAdminSession('cms:write');
      expect(guardRes.ok).toBe(false);
      if (!guardRes.ok) {
        expect(guardRes.code).toBe('AUTH_NOT_CONFIGURED');
      }
    });

    it('fails closed when Admin operator credentials are not configured in server environment', () => {
      const res = authenticateAdminCredentials({
        email: 'admin@miragepharma.com',
        password: 'any-password',
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe('AUTH_NOT_CONFIGURED');
        expect(res.error).toMatch(/Admin credentials are not configured/i);
      }
    });

    it('authenticates valid scrypt-hashed credentials and rejects invalid passwords', () => {
      const passwordHash = hashAdminPasswordScrypt('Clinical-Passphrase-2026!');
      process.env.MIRAGE_ADMIN_EMAIL = 'qa.lead@miragepharma.com';
      process.env.MIRAGE_ADMIN_PASSWORD_HASH = passwordHash;
      process.env.MIRAGE_ADMIN_ROLE = 'qa_officer';
      process.env.MIRAGE_ADMIN_NAME = 'Dr. Salma Mansour';

      // Wrong password must fail
      const badPass = authenticateAdminCredentials({
        email: 'qa.lead@miragepharma.com',
        password: 'Wrong-Password',
      });
      expect(badPass.ok).toBe(false);
      if (!badPass.ok) {
        expect(badPass.code).toBe('INVALID_CREDENTIALS');
      }

      // Correct password must succeed and assign configured role ('qa_officer')
      const loginRes = authenticateAdminCredentials({
        email: 'qa.lead@miragepharma.com',
        password: 'Clinical-Passphrase-2026!',
      });
      expect(loginRes.ok).toBe(true);
      if (loginRes.ok) {
        expect(loginRes.session.email).toBe('qa.lead@miragepharma.com');
        expect(loginRes.session.role).toBe('qa_officer');
        expect(loginRes.session.name).toBe('Dr. Salma Mansour');
        expect(loginRes.cookieOptions.httpOnly).toBe(true);
      }
    });

    it('enforces HttpOnly, SameSite=lax, Path=/, and maxAge cookie options', () => {
      const opts = getAdminSessionCookieOptions(3600);
      expect(opts.httpOnly).toBe(true);
      expect(opts.sameSite).toBe('lax');
      expect(opts.path).toBe('/');
      expect(opts.maxAge).toBe(3600);
    });
  });

  describe('3. RBAC Permission Matrix & Session Guard', () => {
    it('enforces strict role permissions across super_admin, medical_director, qa_officer, and read_only', async () => {
      expect(hasAdminPermission('super_admin', 'cms:write')).toBe(true);
      expect(hasAdminPermission('super_admin', 'products:write')).toBe(true);
      expect(hasAdminPermission('super_admin', 'leads:write')).toBe(true);

      expect(hasAdminPermission('medical_director', 'cms:write')).toBe(true);
      expect(hasAdminPermission('medical_director', 'products:write')).toBe(true);

      expect(hasAdminPermission('qa_officer', 'products:write')).toBe(true);
      expect(hasAdminPermission('qa_officer', 'cms:write')).toBe(false);
      expect(hasAdminPermission('qa_officer', 'leads:write')).toBe(false);

      expect(hasAdminPermission('read_only', 'cms:read')).toBe(true);
      expect(hasAdminPermission('read_only', 'cms:write')).toBe(false);
      expect(hasAdminPermission('read_only', 'products:write')).toBe(false);
      expect(hasAdminPermission('read_only', 'leads:write')).toBe(false);

      const readOnlyToken = issueSessionToken(
        {
          sub: 'USR-RO',
          email: 'auditor@miragepharma.com',
          name: 'Auditor',
          role: 'read_only',
        },
        VALID_SECRET
      );
      setTestSessionCookieForTesting(readOnlyToken);

      const writeAttempt = await requireAdminSession('cms:write');
      expect(writeAttempt.ok).toBe(false);
      if (!writeAttempt.ok) {
        expect(writeAttempt.code).toBe('FORBIDDEN');
      }

      const readAttempt = await requireAdminSession('cms:read');
      expect(readAttempt.ok).toBe(true);
    });

    it('keeps public website content reads accessible without an Admin session', async () => {
      setTestSessionCookieForTesting(null);
      delete process.env.MIRAGE_SESSION_SECRET;

      const publicHero = await getHomepageHeroContent();
      expect(publicHero.badgeEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn);

      const publicCompany = await getCompanyStoryContent();
      expect(publicCompany.workforceEn).toBe('75 + 500');
      expect(publicCompany.workforceAr).toBe('75 + 500');
    });
  });
});
