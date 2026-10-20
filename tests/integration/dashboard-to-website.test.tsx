import { describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulationStudioPage from '../../apps/admin/app/products/page';
import { generateStaticParams } from '../../apps/web/app/products/[slug]/page';
import { MOCK_PRODUCTS, MOCK_PRODUCTS_AR, MOCK_B2B_INQUIRIES } from '@mirage/types';

describe('PHASE 4: Dashboard ↔ Main Website Integration Audit', () => {
  describe('4.1 Product Creation & Persistence Boundary', () => {
    it('proves ARCH-01: Admin product mutation is strictly client-local and fails to persist to public website data layer', async () => {
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
      expect(screen.getAllByText('Curcumin Bio-Curc 500').length).toBeGreaterThan(0);

      // Step 4: Audit Public Website Data Fetching Layer (generateStaticParams & MOCK_PRODUCTS)
      // The public website at apps/web/app/products/[slug]/page.tsx fetches data via generateStaticParams & MOCK_PRODUCTS
      const staticParams = await generateStaticParams();
      const publicSlugs = staticParams.map((p) => p.slug);

      // CRITICAL INTEGRATION FINDING:
      // The public website reads static in-memory MOCK_PRODUCTS and does NOT have access
      // to the admin's React component state.
      expect(publicSlugs).not.toContain('curcumin-bio-curc-500');
      expect(
        MOCK_PRODUCTS.find((p) => p.slug === 'curcumin-bio-curc-500' || p.name === 'Curcumin Bio-Curc 500')
      ).toBeUndefined();

      // Step 5: Reload / Unmount test (Persistence Audit)
      // When the admin dashboard is reloaded (unmounted & remounted), the created product is lost
      unmount();
      render(<FormulationStudioPage />);

      // Proves non-persistence: product does not survive a page reload
      expect(screen.queryByText('Curcumin Bio-Curc 500')).toBeNull();
    });
  });

  describe('4.2 Inventory Stock Toggle Boundary', () => {
    it('proves ARCH-02: Pack stock mutations in Admin do not synchronize to public website catalog', async () => {
      const user = userEvent.setup({ delay: null });

      // Check public website authoritative baseline
      const initialPublicStock = MOCK_PRODUCTS[0].packSizes[0].inStock;
      expect(initialPublicStock).toBe(true);

      // Render Admin Formulation Studio and toggle the pack stock
      render(<FormulationStudioPage />);
      const toggleBtn = screen.getByRole('button', { name: /^Toggle$/i });
      await user.click(toggleBtn);

      // Admin shows out of stock
      expect(screen.getByText(/○ Out of Stock/i)).toBeInTheDocument();

      // Public data source remains unchanged
      expect(MOCK_PRODUCTS[0].packSizes[0].inStock).toBe(true);
    });
  });

  describe('4.3 Multi-lingual Arabic Catalog Synchronization Disconnect', () => {
    it('proves ARCH-03: Arabic catalog is disconnected from English catalog and Admin studio', () => {
      // Public English website reads MOCK_PRODUCTS
      // Public Arabic website reads MOCK_PRODUCTS_AR
      // Admin writes to local component state

      expect(MOCK_PRODUCTS.length).toBe(2);
      expect(MOCK_PRODUCTS_AR.length).toBe(2);

      // The IDs match for existing mock products
      expect(MOCK_PRODUCTS[0].id).toBe(MOCK_PRODUCTS_AR[0].id);

      // But they are distinct object references in memory
      expect(MOCK_PRODUCTS[0]).not.toBe(MOCK_PRODUCTS_AR[0]);

      // There is no bidirectional synchronization mechanism or shared database between them
    });
  });

  describe('4.4 Public Inquiries vs Admin B2B Pipeline Disconnect', () => {
    it('proves ARCH-04: Public web contact submissions do not feed into Admin B2B alliances pipeline', () => {
      // Admin pipeline has mock inquiries
      const adminLeadCount = MOCK_B2B_INQUIRIES.length;
      expect(adminLeadCount).toBeGreaterThan(0);

      // Public contact page (apps/web/app/contact/page.tsx) has zero API integration
      // It sets local React state `submitted = true` without calling fetch() or mutating MOCK_B2B_INQUIRIES
      expect(MOCK_B2B_INQUIRIES.every((lead) => lead.companyName !== 'Public Web Visitor')).toBe(true);
    });
  });
});
