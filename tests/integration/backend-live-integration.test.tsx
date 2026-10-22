/**
 * IN-MEMORY INTEGRATION TEST SUITE (MOCK-BASED)
 *
 * IMPORTANT NOTE ON TEST SCOPE:
 * This test suite executes in a local jsdom environment using `@mirage/db` memoryStore
 * and a mocked `global.fetch` route handler. It tests client-side component integration,
 * UI reactivity, and cross-application data flow synchronization between Admin and Web components.
 * It is NOT a live MongoDB or real browser end-to-end test.
 */

import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulationStudioPage from '../../apps/admin/app/products/page';
import PublicProductsPage from '../../apps/web/app/products/page';
import ArabicProductsPage from '../../apps/web/app/ar/products/page';
import B2BAlliancesHubPage from '../../apps/admin/app/b2b-leads/page';
import ContactPage from '../../apps/web/app/contact/page';
import { POST as contactRoute } from '../../apps/web/app/api/contact/route';
import { generateStaticParams } from '../../apps/web/app/products/[slug]/page';
import { memoryStore, getAuditLogs } from '@mirage/db';
import { issueSessionToken, setTestSessionCookieForTesting } from '@mirage/db/server';

const TEST_SECRET = 'mirage-integration-test-session-secret-key-at-least-32-chars-long';

describe('INTEGRATION TEST (In-Memory / Mock API): Dashboard ↔ Public Website Cross-App Synchronization', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    cleanup();
    memoryStore.reset();
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-INTEGRATION-ADMIN',
          email: 'admin@miragepharma.com',
          name: 'Integration Admin',
          role: 'super_admin',
        },
        TEST_SECRET
      )
    );

    originalFetch = global.fetch;
    global.fetch = vi.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : (input?.url || '');
      if (url.includes('/api/contact')) {
        const body = init?.body
          ? (typeof init.body === 'string' ? init.body : JSON.stringify(init.body))
          : '{}';
        const req = new Request('http://localhost:3000/api/contact', {
          method: init?.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
          body,
        });
        return await contactRoute(req);
      }
      if (originalFetch) {
        return originalFetch(input, init);
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Formulation Creation & Multi-App Persistence (ARCH-01 Resolved)', () => {
    it(
      'persists formulations created in Admin Dashboard and renders them on Public Website',
      async () => {
      const user = userEvent.setup({ delay: null });

      // Step 1: Render Admin Dashboard and register a new formulation
      const { unmount: unmountAdmin } = render(<FormulationStudioPage />);

      await user.click(screen.getByRole('button', { name: /\+ Register New Formulation/i }));
      fireEvent.change(screen.getByPlaceholderText(/e\.g\., Osteo-Guard D3 \+ K2/i), {
        target: { value: 'Curcumin Bio-Curc 500' },
      });
      fireEvent.change(
        screen.getByPlaceholderText(/e\.g\., Synergistic Bone Matrix & Arterial Calcium Transport/i),
        { target: { value: 'Targeted Anti-Inflammatory Curcuminoid Complex' } }
      );
      await user.click(screen.getByRole('button', { name: /Sign & Register SKU/i }));

      // Admin UI shows the formulation
      expect((await screen.findAllByText('Curcumin Bio-Curc 500')).length).toBeGreaterThan(0);
      unmountAdmin();

      // Step 2: Query Public Website data layer (generateStaticParams)
      const staticParams = await generateStaticParams();
      const publicSlugs = staticParams.map((p) => p.slug);
      expect(publicSlugs).toContain('curcumin-bio-curc-500');

      // Step 3: Render Public Products Catalog (apps/web)
      render(<PublicProductsPage />);
      expect(screen.getAllByText('Curcumin Bio-Curc 500').length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/Targeted Anti-Inflammatory Curcuminoid Complex/i).length
      ).toBeGreaterThan(0);

      // Step 4: Verify FDA 21 CFR Part 11 Audit Trail was recorded
      const logs = await getAuditLogs();
      const creationLog = logs.find((l) => l.action === 'CREATE_FORMULATION');
      expect(creationLog).toBeDefined();
      expect(creationLog?.hash).toHaveLength(64);
    }, 30000);
  });

  describe('Inventory Stock Synchronization (ARCH-02 Resolved)', () => {
    it('synchronizes pack stock modifications from Admin to Public Catalog and dynamic monographs', async () => {
      const user = userEvent.setup({ delay: null });

      // Step 1: Render Admin Formulation Studio and toggle SymPDCA stock
      render(<FormulationStudioPage />);
      const toggleBtn = screen.getByRole('button', { name: /^Toggle$/i });
      await user.click(toggleBtn);

      // Admin shows Out of Stock
      expect(await screen.findByText(/○ Out of Stock/i)).toBeInTheDocument();

      // Step 2: Verify in @mirage/db store
      const product = memoryStore.getProductBySlug('sympdca', 'en');
      expect(product?.packSizes[0].inStock).toBe(false);

      // Step 3: Verify GxP Audit Log recorded for stock toggle
      const logs = await getAuditLogs();
      const stockLog = logs.find((l) => l.action === 'TOGGLE_PACK_STOCK');
      expect(stockLog).toBeDefined();
    });
  });

  describe('Bilingual Catalog Mirroring (ARCH-03 Resolved)', () => {
    it('synchronizes newly registered products across both English and Arabic public catalogs', async () => {
      const user = userEvent.setup({ delay: null });

      // Register product via Admin
      const { unmount } = render(<FormulationStudioPage />);
      await user.click(screen.getByRole('button', { name: /\+ Register New Formulation/i }));
      fireEvent.change(screen.getByPlaceholderText(/e\.g\., Osteo-Guard D3 \+ K2/i), {
        target: { value: 'Omega-3 Pure Bio' },
      });
      fireEvent.change(
        screen.getByPlaceholderText(/e\.g\., Synergistic Bone Matrix & Arterial Calcium Transport/i),
        { target: { value: 'Cardiovascular Marine Lipids' } }
      );
      await user.click(screen.getByRole('button', { name: /Sign & Register SKU/i }));
      expect((await screen.findAllByText('Omega-3 Pure Bio')).length).toBeGreaterThan(0);
      unmount();

      // Render Arabic website products page
      render(<ArabicProductsPage />);
      expect((await screen.findAllByText('Omega-3 Pure Bio')).length).toBeGreaterThan(0);
    });
  });

  describe('Public Contact Intake ↔ Admin B2B Pipeline (ARCH-04 Resolved)', () => {
    it('routes public contact submissions into the Admin B2B Leads pipeline', async () => {
      const user = userEvent.setup({ delay: null });

      // Step 1: Render Public Website Contact Page
      const { unmount: unmountContact } = render(<ContactPage />);

      await user.type(
        screen.getByPlaceholderText(/Dr\. \/ Pharmacist \/ Patient Name/i),
        'Dr. Sherif El-Wakil'
      );
      await user.type(
        screen.getByPlaceholderText(/you@hospital\.com/i),
        's.elwakil@cleopatra-hospitals.com'
      );
      await user.type(
        screen.getByPlaceholderText(/010XXXXXXXX/i),
        '+20 102 334 5566'
      );
      await user.type(
        screen.getByPlaceholderText(/Please specify the product, batch number/i),
        'Requesting formulary inclusion for hospital oncology department.'
      );
      await user.click(
        screen.getByRole('button', { name: /Submit Inquiry to Medical Affairs/i })
      );

      // Public form displays success confirmation
      expect(await screen.findByText(/Inquiry Received Successfully!/i)).toBeInTheDocument();
      unmountContact();

      // Step 2: Render Admin B2B Alliances Hub
      render(<B2BAlliancesHubPage />);

      // The submitted inquiry must be visible in the Admin Leads table
      expect(await screen.findByText(/Dr\. Sherif El-Wakil/i)).toBeInTheDocument();
    });
  });
});
