import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulationStudioPage from '../../apps/admin/app/products/page';
import PublicProductsPage from '../../apps/web/app/products/page';
import ArabicProductsPage from '../../apps/web/app/ar/products/page';
import B2BAlliancesHubPage from '../../apps/admin/app/b2b-leads/page';
import ContactPage from '../../apps/web/app/contact/page';
import { generateStaticParams } from '../../apps/web/app/products/[slug]/page';
import { memoryStore, getAuditLogs } from '@mirage/db';

describe('BACKEND INTEGRATION: Dashboard ↔ Public Website Live Synchronization', () => {
  beforeEach(() => {
    cleanup();
    memoryStore.reset();
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
      expect(screen.getAllByText('Curcumin Bio-Curc 500').length).toBeGreaterThan(0);
      unmountAdmin();

      // Step 2: Query Public Website data layer (generateStaticParams)
      const staticParams = await generateStaticParams();
      const publicSlugs = staticParams.map((p) => p.slug);
      expect(publicSlugs).toContain('curcumin-bio-curc-500');

      // Step 3: Render Public Products Catalog (apps/web)
      render(<PublicProductsPage />);
      expect(screen.getByText('Curcumin Bio-Curc 500')).toBeInTheDocument();
      expect(
        screen.getByText(/Targeted Anti-Inflammatory Curcuminoid Complex/i)
      ).toBeInTheDocument();

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
      expect(screen.getByText(/○ Out of Stock/i)).toBeInTheDocument();

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
      unmount();

      // Render Arabic website products page
      render(<ArabicProductsPage />);
      expect(screen.getByText('Omega-3 Pure Bio')).toBeInTheDocument();
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
      expect(screen.getByText(/Inquiry Received Successfully!/i)).toBeInTheDocument();
      unmountContact();

      // Step 2: Render Admin B2B Alliances Hub
      render(<B2BAlliancesHubPage />);

      // The submitted inquiry must be visible in the Admin Leads table
      expect(screen.getByText(/Dr\. Sherif El-Wakil/i)).toBeInTheDocument();
    });
  });
});
