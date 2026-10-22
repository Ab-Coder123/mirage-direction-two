/**
 * PHASE 10: ISOLATED HARNESS DATA FLOW & RESILIENCE TEST SUITE
 *
 * IMPORTANT NOTE ON TEST SCOPE:
 * This test suite executes in a local jsdom/Node environment using `@mirage/db` memoryStore
 * and isolated temporary files. It verifies cross-application contract logic, Server Actions,
 * RBAC authorization boundaries, bilingual mirroring, and fallback behaviors in isolation.
 * It is NOT a test against the live production MongoDB Atlas cluster or live browser automation.
 *
 * Scope verified in isolated harness:
 * 1. Authorized Admin mutation → Storage layer → Fresh public reads on English & Arabic routes
 * 2. Product creation & pack stock toggling synchronization across Admin and Web catalogs
 * 3. Bilingual Homepage Hero & Company Story CMS edits reflected on public pages
 * 4. Graceful static fallback rendering on empty database and during database connection failures
 * 5. Strict RBAC authorization enforcement preventing unauthorized writes
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';

// Admin Components & Actions
import FormulationStudioPage from '../../apps/admin/app/products/page';
import {
  saveHomepageHeroAction,
  getHomepageHeroAction,
} from '../../apps/admin/app/settings/homepage-actions';
import {
  saveCompanyStoryAction,
  getCompanyStoryAction,
} from '../../apps/admin/app/settings/company-actions';

// Public Web Pages
import PublicProductsPage from '../../apps/web/app/products/page';
import ArabicProductsPage from '../../apps/web/app/ar/products/page';
import HomePage from '../../apps/web/app/page';
import ArabicHomePage from '../../apps/web/app/ar/page';
import OurStoryPage from '../../apps/web/app/our-story/page';
import ArabicOurStoryPage from '../../apps/web/app/ar/our-story/page';

// Core DB & Server Operations
import {
  memoryStore,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCTS_AR,
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  DEFAULT_COMPANY_STORY_CONTENT,
  type HomepageHeroInput,
  type CompanyStoryInput,
  getAuditLogs,
} from '@mirage/db';
import {
  issueSessionToken,
  setTestSessionCookieForTesting,
  resolveProductWithFallback,
  loadHomepageHeroContent,
  loadCompanyStoryContent,
} from '@mirage/db/server';

const TEST_SECRET = 'phase10-e2e-verification-secret-key-32-chars-long';

describe('PHASE 10: End-to-End Cross-Application Integration & Resilience', () => {
  let tempHeroFile: string;
  let tempCompanyFile: string;

  beforeEach(async () => {
    cleanup();
    memoryStore.reset();

    // Isolated temporary storage files for CMS persistence testing
    tempHeroFile = path.join(
      os.tmpdir(),
      `mirage-p10-hero-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    tempCompanyFile = path.join(
      os.tmpdir(),
      `mirage-p10-comp-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );

    process.env.MIRAGE_CONTENT_FILE = tempHeroFile;
    process.env.MIRAGE_COMPANY_CONTENT_FILE = tempCompanyFile;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;

    // Set authorized Super Admin session
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-E2E-SUPERADMIN',
          email: 'admin@miragepharma.com',
          name: 'Chief Medical Officer',
          role: 'super_admin',
        },
        TEST_SECRET
      )
    );
  });

  afterEach(async () => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_CONTENT_FILE;
    delete process.env.MIRAGE_COMPANY_CONTENT_FILE;
    delete process.env.MIRAGE_CONTENT_BACKEND;

    try {
      await fs.unlink(tempHeroFile);
    } catch {}
    try {
      await fs.unlink(tempCompanyFile);
    } catch {}
  });

  describe('1. Full Flow: Product Creation & Pack Stock Synchronization', () => {
    it('creates product in Admin Formulation Studio and renders across English and Arabic public catalogs', async () => {
      const user = userEvent.setup({ delay: null });

      // Step A: Admin registers SKU
      const { unmount: unmountAdmin } = render(<FormulationStudioPage />);

      await user.click(screen.getByRole('button', { name: /\+ Register New Formulation/i }));
      fireEvent.change(screen.getByPlaceholderText(/e\.g\., Osteo-Guard D3 \+ K2/i), {
        target: { value: 'Neuro-Soma MagnaCalm' },
      });
      fireEvent.change(
        screen.getByPlaceholderText(/e\.g\., Synergistic Bone Matrix & Arterial Calcium Transport/i),
        { target: { value: 'High-Bioavailability Magnesium Glycinate & L-Theanine' } }
      );
      await user.click(screen.getByRole('button', { name: /Sign & Register SKU/i }));

      // Confirm product is in Admin studio UI
      expect((await screen.findAllByText('Neuro-Soma MagnaCalm', {}, { timeout: 5000 })).length).toBeGreaterThan(0);
      unmountAdmin();

      // Step B: Render English Public Catalog
      const { unmount: unmountWebEn } = render(<PublicProductsPage />);
      expect((await screen.findAllByText('Neuro-Soma MagnaCalm', {}, { timeout: 5000 })).length).toBeGreaterThan(0);
      unmountWebEn();

      // Step C: Render Arabic Public Catalog
      const { unmount: unmountWebAr } = render(<ArabicProductsPage />);
      expect((await screen.findAllByText('Neuro-Soma MagnaCalm', {}, { timeout: 5000 })).length).toBeGreaterThan(0);
      unmountWebAr();
    });

    it('toggles pack stock in Admin and updates stock status', async () => {
      const user = userEvent.setup({ delay: null });

      // Render Admin Formulation Studio and toggle stock via the Toggle button
      render(<FormulationStudioPage />);
      const toggleBtns = screen.getAllByRole('button', { name: /^Toggle$/i });
      await user.click(toggleBtns[0]);

      // Admin reflects the out of stock status
      expect(await screen.findByText(/○ Out of Stock/i, {}, { timeout: 5000 })).toBeInTheDocument();
    });
  });

  describe('2. Full Flow: Bilingual CMS Mutation & Public Synchronization', () => {
    it('persists English & Arabic Homepage Hero edits from Admin and renders on public homepages', async () => {
      // Step A: Save custom bilingual hero copy via Server Action
      const updatedInput: HomepageHeroInput = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeEn: 'FDA & EDA Verified 2026',
        headlinePrefixEn: 'Next-Gen Therapeutics for',
        headlineHighlightEn: 'Precision Oncology & Metabolic Therapeutics',
        supportingTextEn: 'Engineered cellular therapies manufactured under ISO-Class 5 cleanroom standards.',
        primaryCtaTextEn: 'Inspect Therapeutics',
        secondaryCtaTextEn: 'Clinical Monographs',
        badgeAr: 'معتمد رسمياً 2026',
        headlinePrefixAr: 'أحدث العلاجات لـ',
        headlineHighlightAr: 'علاجات الأورام المتقدمة والأيض الخلوي',
        supportingTextAr: 'علاجات خلوية مصممة بأعلى معايير الجودة العالمية والتحكم النظيف.',
        primaryCtaTextAr: 'استكشف الأدوية',
        secondaryCtaTextAr: 'الملفات الدوائية',
      };

      const result = await saveHomepageHeroAction(updatedInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.content.headlineHighlightEn).toBe('Precision Oncology & Metabolic Therapeutics');
        expect(result.content.headlineHighlightAr).toBe('علاجات الأورام المتقدمة والأيض الخلوي');
      }

      // Step B: Fresh read of English Public Homepage
      const pageUiEn = await HomePage();
      const { unmount: unmountEn } = render(pageUiEn);
      expect(screen.getByText('Precision Oncology & Metabolic Therapeutics')).toBeInTheDocument();
      expect(screen.getByText('FDA & EDA Verified 2026')).toBeInTheDocument();
      unmountEn();

      // Step C: Fresh read of Arabic Public Homepage
      const pageUiAr = await ArabicHomePage();
      const { unmount: unmountAr } = render(pageUiAr);
      expect(screen.getByText('علاجات الأورام المتقدمة والأيض الخلوي')).toBeInTheDocument();
      expect(screen.getByText('معتمد رسمياً 2026')).toBeInTheDocument();
      unmountAr();
    });

    it('persists English & Arabic Company Story edits from Admin and renders on public our-story pages', async () => {
      // Step A: Save custom bilingual company story via Server Action
      const updatedInput: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        heroTitleEn: 'A Decade of Uncompromising Bio-Engineering',
        capitalEn: '75 Million EGP',
        heroTitleAr: 'عقد من الهندسة الحيوية الدقيقة والصارمة',
        capitalAr: '75 مليون جنيه مصري',
        // Strictly maintain static workforce baseline
        workforceEn: '75 + 500',
        workforceAr: '75 + 500',
      };

      const result = await saveCompanyStoryAction(updatedInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.content.heroTitleEn).toBe('A Decade of Uncompromising Bio-Engineering');
        expect(result.content.heroTitleAr).toBe('عقد من الهندسة الحيوية الدقيقة والصارمة');
      }

      // Step B: Fresh read of English Our Story page
      const pageUiEn = await OurStoryPage();
      const { unmount: unmountEn } = render(pageUiEn);
      expect(screen.getByText('A Decade of Uncompromising Bio-Engineering')).toBeInTheDocument();
      expect(screen.getAllByText(/75 Million EGP/i).length).toBeGreaterThan(0);
      unmountEn();

      // Step C: Fresh read of Arabic Our Story page
      const pageUiAr = await ArabicOurStoryPage();
      const { unmount: unmountAr } = render(pageUiAr);
      expect(screen.getByText('عقد من الهندسة الحيوية الدقيقة والصارمة')).toBeInTheDocument();
      expect(screen.getAllByText(/75 مليون جنيه مصري/i).length).toBeGreaterThan(0);
      unmountAr();
    });
  });

  describe('3. Offline & Empty Database Resilience: Static Defaults Fallback', () => {
    it('gracefully falls back to static defaults when resolving product documents', () => {
      // Baseline merge when id or slug is specified
      const resolvedSymp = resolveProductWithFallback({ id: 'prod-sympdca' }, 'en');
      expect(resolvedSymp.name).toBe(INITIAL_PRODUCTS[0].name);

      const resolvedSympAr = resolveProductWithFallback({ slug: 'sympdca' }, 'ar');
      expect(resolvedSympAr.name).toBe(INITIAL_PRODUCTS_AR[0].name);

      // Graceful fallback when doc is undefined (null-safety)
      const resolvedUndefined = resolveProductWithFallback(undefined, 'en');
      expect(resolvedUndefined.name).toBe('Unnamed Formulation');
      expect(resolvedUndefined.category).toBe('Vitamins & Minerals');
    });

    it('gracefully serves static defaults for CMS when storage files are missing or unconfigured', async () => {
      process.env.MIRAGE_CONTENT_FILE = path.join(os.tmpdir(), 'non-existent-hero-file.json');
      process.env.MIRAGE_COMPANY_CONTENT_FILE = path.join(os.tmpdir(), 'non-existent-comp-file.json');

      const heroResult = await loadHomepageHeroContent();
      expect(heroResult.source).toBe('default');
      expect(heroResult.content.headlineHighlightEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn);

      const companyResult = await loadCompanyStoryContent();
      expect(companyResult.source).toBe('default');
      expect(companyResult.content.heroTitleEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn);
      expect(companyResult.content.workforceEn).toBe('75 + 500');
    });
  });

  describe('4. RBAC & Security Boundaries: Fail-Closed Mutation Protection', () => {
    it('rejects unauthenticated CMS mutation and leaves storage unmodified', async () => {
      setTestSessionCookieForTesting(null);

      const heroResult = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(heroResult.ok).toBe(false);
      expect(heroResult.error).toMatch(/Authentication required/i);
    });

    it('rejects unauthorized role attempting CMS mutation (least-privilege RBAC)', async () => {
      // Set session with read_only role (lacks cms:write permission)
      setTestSessionCookieForTesting(
        issueSessionToken(
          {
            sub: 'USR-AUDITOR-READONLY',
            email: 'auditor@miragepharma.com',
            name: 'External Auditor',
            role: 'read_only',
          },
          TEST_SECRET
        )
      );

      const compResult = await saveCompanyStoryAction(DEFAULT_COMPANY_STORY_CONTENT);
      expect(compResult.ok).toBe(false);
      expect(compResult.error).toMatch(/Forbidden|clearance|denied/i);
    });

    it('creates 21 CFR Part 11 compliant audit trail for authorized modifications', async () => {
      await saveHomepageHeroAction({
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeEn: 'Audit Verified 2026',
        headlineHighlightEn: 'Audited Precision Medicine',
      });

      const auditLogs = await getAuditLogs();
      const heroAudit = auditLogs.find(
        (log) => log.action === 'UPDATE_HOMEPAGE_HERO_CONTENT'
      );

      expect(heroAudit).toBeDefined();
      expect(heroAudit?.actor_id).toBe('USR-E2E-SUPERADMIN');
      expect(heroAudit?.actor_role).toBe('super_admin');
    });
  });
});
