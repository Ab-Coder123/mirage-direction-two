/**
 * IN-MEMORY INTEGRATION AUDIT SUITE (MOCK-BASED)
 *
 * NOTE: This suite tests component interaction and data structures in a jsdom environment
 * with memory stores and test sessions. It does NOT connect to live MongoDB or execute
 * real HTTP network requests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulationStudioPage from '../../apps/admin/app/products/page';
import { generateStaticParams } from '../../apps/web/app/products/[slug]/page';
import { MOCK_PRODUCTS, MOCK_PRODUCTS_AR, MOCK_B2B_INQUIRIES } from '@mirage/types';
import { issueSessionToken, setTestSessionCookieForTesting } from '@mirage/db/server';

const TEST_SECRET = 'mirage-integration-test-session-secret-key-at-least-32-chars-long';

describe('INTEGRATION TEST (In-Memory Mock): Dashboard ↔ Main Website Data Flow', () => {
  beforeEach(() => {
    cleanup();
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
  });

  describe('Product Creation & Persistence Boundary (In-Memory)', () => {
    it('verifies formulation created in Admin Formulation Studio persists to public data layer (ARCH-01 Resolved)', async () => {
      const user = userEvent.setup({ delay: null });

      // Step 1: Render Admin Dashboard
      const { unmount } = render(<FormulationStudioPage />);

      // Step 2: Create a new product in Admin Formulation Studio
      await user.click(screen.getByRole('button', { name: /\+ Register New Formulation/i }));
      await user.type(
        screen.getByPlaceholderText(/e\.g\., Osteo-Guard D3 \+ K2/i),
        'Curcumin Bio-Curc 500'
      );
      await user.type(
        screen.getByPlaceholderText(/e\.g\., Synergistic Bone Matrix & Arterial Calcium Transport/i),
        'Clinical Curcumin Formulation'
      );
      await user.click(screen.getByRole('button', { name: /Sign & Register SKU/i }));

      // Step 3: Verify the newly created product is visible in the Admin UI
      expect((await screen.findAllByText('Curcumin Bio-Curc 500')).length).toBeGreaterThan(0);

      // Step 4: Audit Public Website Data Fetching Layer (generateStaticParams)
      const staticParams = await generateStaticParams();
      const publicSlugs = staticParams.map((p) => p.slug);

      // Verified: The public website data layer sees the created product slug.
      expect(publicSlugs).toContain('curcumin-bio-curc-500');

      // Step 5: Reload / Unmount test (Persistence Audit)
      unmount();
      render(<FormulationStudioPage />);

      // Formulation is persisted in the shared store across remounts
      expect((await screen.findAllByText('Curcumin Bio-Curc 500')).length).toBeGreaterThan(0);
    });
  });

  describe('Inventory Stock Toggle Boundary (In-Memory)', () => {
    it('verifies pack stock toggling updates the local product state', async () => {
      const user = userEvent.setup({ delay: null });

      // Check authoritative initial state
      const initialPublicStock = MOCK_PRODUCTS[0].packSizes[0].inStock;
      expect(initialPublicStock).toBe(true);

      // Render Admin Formulation Studio and toggle the pack stock
      render(<FormulationStudioPage />);
      const toggleBtns = screen.getAllByRole('button', { name: /^Toggle$/i });
      await user.click(toggleBtns[0]);

      // Admin reflects the toggled out of stock state
      expect(await screen.findByText(/○ Out of Stock/i)).toBeInTheDocument();
    });
  });

  describe('Multi-lingual Product Catalog Reference Baseline', () => {
    it('verifies mock catalog definitions for English and Arabic', () => {
      expect(MOCK_PRODUCTS.length).toBe(2);
      expect(MOCK_PRODUCTS_AR.length).toBe(2);
      expect(MOCK_PRODUCTS[0].id).toBe(MOCK_PRODUCTS_AR[0].id);
    });
  });

  describe('Public Inquiries & Admin B2B Baseline Data', () => {
    it('verifies initial mock inquiries baseline structure', () => {
      const adminLeadCount = MOCK_B2B_INQUIRIES.length;
      expect(adminLeadCount).toBeGreaterThan(0);
    });
  });
});
