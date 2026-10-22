import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecurityRBACSettingsPage from '../app/settings/page';
import { resolveSettingsTab } from '../app/settings/tab-utils';
import { middleware } from '../middleware';
import { NextRequest } from 'next/server';
import { MOCK_RBAC_ROLES } from '@mirage/types';
import {
  ADMIN_SESSION_COOKIE_NAME,
  issueSessionToken,
} from '@mirage/db/auth-token';

describe('SecurityRBACSettingsPage (Settings & Permissions Hub)', () => {
  it('renders the RBAC role permission matrix and security policy switches', () => {
    render(<SecurityRBACSettingsPage />);

    expect(
      screen.getByRole('heading', {
        name: /Role-Based Access Control \(RBAC\) & GxP Security Policies/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Configure multi-tier operator clearance levels/i)
    ).toBeInTheDocument();

    // Verify key action buttons
    expect(
      screen.getByRole('button', { name: /Monorepo Diagnostic Suite/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Export Security Matrix/i })
    ).toBeInTheDocument();

    // Verify initial roles are rendered in the role selector
    for (const role of MOCK_RBAC_ROLES) {
      expect(screen.getAllByText(role.roleName).length).toBeGreaterThan(0);
    }
  });

  it('switches active role and displays its specific clearance permissions', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SecurityRBACSettingsPage />);

    // Click "QA & GxP Lead" role
    const qaRoleBtn = screen.getByRole('button', { name: /QA & GxP Lead/i });
    await user.click(qaRoleBtn);

    // Active role header should reflect QA & GxP Lead
    expect(
      screen.getAllByText(/Granular Permission Matrix — QA & GxP Lead/i).length
    ).toBeGreaterThan(0);
  });

  it('toggles permission bit inside the RBAC matrix and notifies GxP signature', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SecurityRBACSettingsPage />);

    // Find permission toggle buttons in the matrix table by aria-label
    const permButtons = screen.getAllByRole('button', { name: /Toggle read/i });
    expect(permButtons.length).toBeGreaterThan(0);

    const firstBtn = permButtons[0];
    await user.click(firstBtn);

    // Toast notification should appear
    expect(
      screen.getByText(/RBAC Matrix updated.*21 CFR Part 11 Electronic Signature recorded/i)
    ).toBeInTheDocument();
  });

  it('opens and executes monorepo diagnostic certification suite modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SecurityRBACSettingsPage />);

    const diagBtn = screen.getByRole('button', { name: /Monorepo Diagnostic Suite/i });
    await user.click(diagBtn);

    // Diagnostic modal should open
    expect(
      screen.getByText(/Executing Monorepo Package Verification Suite/i)
    ).toBeInTheDocument();
  });
});

describe('Next.js Edge Middleware Security & Auth Audit', () => {
  it('applies GxP and browser security headers to incoming requests', () => {
    const req = new NextRequest('http://localhost:3001/products');
    const res = middleware(req);

    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()'
    );
    expect(res.headers.get('X-GxP-Compliance-Mode')).toBe(
      'FDA-21-CFR-PART-11-EDA-VERIFIED'
    );
  });

  it('resolves security defect SEC-01: middleware enforces verified session guard and redirects unauthenticated traffic, unsigned cookies, and arbitrary Bearer tokens to /login', () => {
    const secret = 'mirage-middleware-test-session-secret-key-2026';
    process.env.MIRAGE_SESSION_SECRET = secret;
    try {
      // 1. Unauthenticated request without session cookie
      const unauthReq = new NextRequest('http://localhost:3001/settings');
      const unauthRes = middleware(unauthReq);
      expect(unauthRes.status).toBe(307);
      expect(unauthRes.headers.get('location')).toContain('/login?from=%2Fsettings&reason=UNAUTHENTICATED');

      // 2. Arbitrary Bearer token (must NOT be accepted as super_admin)
      const bearerReq = new NextRequest('http://localhost:3001/products', {
        headers: {
          Authorization: 'Bearer arbitrary-unverified-token',
          'X-User-Role': 'super_admin',
        },
      });
      const bearerRes = middleware(bearerReq);
      expect(bearerRes.status).toBe(307);
      expect(bearerRes.headers.get('location')).toContain('/login?from=%2Fproducts&reason=UNAUTHENTICATED');

      // 3. Unsigned JSON cookie
      const unsignedCookie = encodeURIComponent(
        JSON.stringify({ email: 'hacker@example.com', role: 'super_admin' })
      );
      const unsignedReq = new NextRequest('http://localhost:3001/settings', {
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE_NAME}=${unsignedCookie}`,
        },
      });
      const unsignedRes = middleware(unsignedReq);
      expect(unsignedRes.status).toBe(307);
      expect(unsignedRes.headers.get('location')).toContain('reason=INVALID_TOKEN_FORMAT');

      // 4. Valid HMAC-SHA256 signed session cookie passes and strips spoofed client role header
      const validToken = issueSessionToken(
        {
          sub: 'USR-MD-01',
          email: 'medical@miragepharma.com',
          name: 'Medical Director',
          role: 'medical_director',
        },
        secret
      );
      const validReq = new NextRequest('http://localhost:3001/settings', {
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE_NAME}=${validToken}`,
          'X-User-Role': 'super_admin',
        },
      });
      const validRes = middleware(validReq);
      expect(validRes.status).toBe(200);
      expect(validRes.headers.get('X-Authenticated')).toBe('true');
      expect(validRes.headers.get('X-User-Role')).toBe('medical_director');
    } finally {
      delete process.env.MIRAGE_SESSION_SECRET;
    }
  });

  describe('Settings Tab Deep-Linking & Parameter Resolution', () => {
    it('correctly resolves valid and invalid tab parameters', () => {
      expect(resolveSettingsTab('cms')).toBe('cms');
      expect(resolveSettingsTab('company')).toBe('company');
      expect(resolveSettingsTab('security')).toBe('security');
      expect(resolveSettingsTab(null)).toBe('security');
      expect(resolveSettingsTab(undefined)).toBe('security');
      expect(resolveSettingsTab('')).toBe('security');
      expect(resolveSettingsTab('invalid-tab-value')).toBe('security');
      expect(resolveSettingsTab('unknown')).toBe('security');
    });

    it('renders the CMS tab when ?tab=cms is provided', async () => {
      delete (window as any).location;
      window.location = new URL('http://localhost:3001/settings?tab=cms') as any;

      render(<SecurityRBACSettingsPage />);

      expect(
        await screen.findByRole('heading', { name: /Homepage Hero Content CMS/i })
      ).toBeInTheDocument();
    });

    it('renders the Company Story tab when ?tab=company is provided', async () => {
      delete (window as any).location;
      window.location = new URL('http://localhost:3001/settings?tab=company') as any;

      render(<SecurityRBACSettingsPage />);

      expect(
        await screen.findByRole('heading', { name: /Company Story & Corporate Facts CMS/i })
      ).toBeInTheDocument();
    });

    it('renders the default Security tab when ?tab=invalid is provided', async () => {
      delete (window as any).location;
      window.location = new URL('http://localhost:3001/settings?tab=invalid') as any;

      render(<SecurityRBACSettingsPage />);

      expect(
        screen.getByRole('heading', {
          name: /Role-Based Access Control \(RBAC\) & GxP Security Policies/i,
        })
      ).toBeInTheDocument();
    });
  });
});
