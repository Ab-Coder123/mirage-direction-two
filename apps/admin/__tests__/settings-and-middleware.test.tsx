import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecurityRBACSettingsPage from '../app/settings/page';
import { middleware } from '../middleware';
import { NextRequest } from 'next/server';
import { MOCK_RBAC_ROLES } from '@mirage/types';

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

  it('exposes critical security defect SEC-01: middleware enforces no authentication guard', () => {
    // Unauthenticated request without session cookie or bearer token
    const unauthReq = new NextRequest('http://localhost:3001/settings');
    const res = middleware(unauthReq);

    // Architectural defect: middleware lets unauthorized traffic straight through without 401 or redirect to login
    expect(res.status).toBe(200);
    expect(res.headers.get('Location')).toBeNull();
  });
});
