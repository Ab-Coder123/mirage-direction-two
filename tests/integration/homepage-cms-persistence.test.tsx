import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';

import HomePage from '../../apps/web/app/page';
import ArabicHomePage from '../../apps/web/app/ar/page';
import HomepageHeroEditor from '../../apps/admin/components/cms/HomepageHeroEditor';
import SecurityRBACSettingsPage from '../../apps/admin/app/settings/page';
import {
  saveHomepageHeroAction,
  getHomepageHeroAction,
} from '../../apps/admin/app/settings/homepage-actions';
import {
  getHomepageHeroContent,
  saveHomepageHeroContent,
  resolveHomepageStorage,
  getHomepageContentFilePath,
  issueSessionToken,
  setTestSessionCookieForTesting,
} from '@mirage/db/server';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  type HomepageHeroInput,
  getAuditLogs,
  memoryStore,
} from '@mirage/db';

const TEST_SESSION_SECRET = 'mirage-integration-test-session-secret-key-2026-hmac';

describe('INTEGRATION AUDIT: Homepage Hero CMS ↔ Public Website Live Synchronization', () => {
  let tempFilePath: string;

  beforeEach(async () => {
    cleanup();
    memoryStore.reset();
    // Isolate test data into a unique temp file on disk
    tempFilePath = path.join(
      os.tmpdir(),
      `mirage-hero-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    process.env.MIRAGE_CONTENT_FILE = tempFilePath;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    process.env.MIRAGE_SESSION_SECRET = TEST_SESSION_SECRET;
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-ADMIN-TEST',
          email: 'admin@miragepharma.com',
          name: 'Test Super Admin',
          role: 'super_admin',
        },
        TEST_SESSION_SECRET
      )
    );
  });

  afterEach(async () => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_CONTENT_FILE;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignored if file was not created
    }
  });

  describe('Durable Shared Storage Baseline', () => {
    it('returns default content when no prior save exists', async () => {
      const content = await getHomepageHeroContent();
      expect(content.badgeEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn);
      expect(content.badgeAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeAr);
      expect(content.headlineHighlightEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn);
      expect(content.headlineHighlightAr).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightAr);
    });

    it('resolves the shared file storage path deterministically', () => {
      expect(getHomepageContentFilePath()).toBe(tempFilePath);
      const resolution = resolveHomepageStorage();
      expect(resolution.ok).toBe(true);
      if (resolution.ok) {
        expect(resolution.mode).toBe('file');
      }
    });
  });

  describe('Admin CMS Mutation ↔ Public English Homepage (apps/web /)', () => {
    it('persists English copy changes and displays them on a fresh read of the public homepage', async () => {
      const updatedInput: HomepageHeroInput = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeEn: 'Mirage Pharma • Clinical Innovation 2026',
        headlinePrefixEn: 'Next-Generation Therapeutics for',
        headlineHighlightEn: 'Precision Medicine & Life Sciences',
        supportingTextEn:
          'Advancing biomedical formulation standards across Egypt and MENA with certified cold-chain and pharmaceutical integrity.',
        primaryCtaTextEn: 'Discover Formulations',
        secondaryCtaTextEn: 'Scientific Portfolio',
      };

      // Step 1: Save via Admin Server Action
      const saveResult = await saveHomepageHeroAction(updatedInput);
      expect(saveResult.ok).toBe(true);
      if (saveResult.ok) {
        expect(saveResult.content.headlineHighlightEn).toBe('Precision Medicine & Life Sciences');
        expect(saveResult.storage.mode).toBe('file');
      }

      // Step 2: Verify file actually exists on disk (durable persistence, not memory)
      const fileData = await fs.readFile(tempFilePath, 'utf8');
      const parsedDisk = JSON.parse(fileData);
      expect(parsedDisk.headlineHighlightEn).toBe('Precision Medicine & Life Sciences');
      expect(parsedDisk.updatedBy).toBeDefined();

      // Step 3: Render public English homepage (apps/web/app/page.tsx)
      const pageUi = await HomePage();
      render(pageUi);

      expect(
        screen.getByText('Mirage Pharma • Clinical Innovation 2026')
      ).toBeInTheDocument();
      expect(screen.getByText('Next-Generation Therapeutics for')).toBeInTheDocument();
      expect(
        screen.getByText('Precision Medicine & Life Sciences')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Advancing biomedical formulation standards across Egypt and MENA/i
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Discover Formulations')).toBeInTheDocument();
      expect(screen.getByText('Scientific Portfolio')).toBeInTheDocument();
    });
  });

  describe('Admin CMS Mutation ↔ Public Arabic Homepage (apps/web /ar)', () => {
    it('persists Arabic copy changes and displays them on a fresh read of the Arabic homepage', async () => {
      const updatedInput: HomepageHeroInput = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeAr: 'ميراج فارما • التميز الدوائي والأبحاث السريرية 2026',
        headlinePrefixAr: 'آفاق علاجية مبتكرة في',
        headlineHighlightAr: 'المستحضرات الحيوية والأدوية المتقدمة',
        supportingTextAr:
          'ريادة مصرية وإقليمية متخصصة في تطوير وتصنيع المستحضرات الدوائية المتقدمة وسلاسل الإمداد المبردة المعتمدة عالمياً.',
        primaryCtaTextAr: 'تصفح المستحضرات الطبية',
        secondaryCtaTextAr: 'الرؤية والملف التعريفي',
      };

      // Step 1: Save via Admin Server Action
      const saveResult = await saveHomepageHeroAction(updatedInput);
      expect(saveResult.ok).toBe(true);

      // Step 2: Render public Arabic homepage (apps/web/app/ar/page.tsx)
      const arabicPageUi = await ArabicHomePage();
      render(arabicPageUi);

      expect(
        screen.getByText('ميراج فارما • التميز الدوائي والأبحاث السريرية 2026')
      ).toBeInTheDocument();
      expect(screen.getByText('آفاق علاجية مبتكرة في')).toBeInTheDocument();
      expect(
        screen.getByText('المستحضرات الحيوية والأدوية المتقدمة')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/ريادة مصرية وإقليمية متخصصة في تطوير وتصنيع المستحضرات الدوائية/i)
      ).toBeInTheDocument();
      expect(screen.getByText('تصفح المستحضرات الطبية')).toBeInTheDocument();
      expect(screen.getByText('الرؤية والملف التعريفي')).toBeInTheDocument();
    });
  });

  describe('Admin CMS UI Component (<HomepageHeroEditor />)', () => {
    it('switches to Homepage & Brand CMS tab and renders the live editor', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SecurityRBACSettingsPage />);

      // Verify the tab is present
      const cmsTabBtn = screen.getByRole('button', { name: /Homepage & Brand CMS/i });
      expect(cmsTabBtn).toBeInTheDocument();

      // Switch to CMS tab
      await user.click(cmsTabBtn);

      expect(
        screen.getByRole('heading', { name: /Homepage Hero Content CMS/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Hero Pill Badge \(EN\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/شارة الهيدر \(عربي\)/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Save to Durable Storage/i })).toBeInTheDocument();
    });

    it('submits valid changes through the form and shows success notice', async () => {
      const user = userEvent.setup({ delay: null });
      render(<HomepageHeroEditor />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(screen.getByLabelText(/Hero Pill Badge \(EN\)/i)).toHaveValue(
          DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn
        );
      });

      // Modify English badge
      const badgeInput = screen.getByLabelText(/Hero Pill Badge \(EN\)/i);
      fireEvent.change(badgeInput, {
        target: { value: 'Mirage Pharma • Verified Efficacy 2026' },
      });

      // Click save
      const saveBtn = screen.getByRole('button', { name: /Save to Durable Storage/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/Homepage content saved and persisted successfully/i)
        ).toBeInTheDocument();
      });

      // Verify persistence on disk
      const contentOnDisk = await getHomepageHeroContent();
      expect(contentOnDisk.badgeEn).toBe('Mirage Pharma • Verified Efficacy 2026');
    });
  });

  describe('Negative Tests: Resilience & Truthful Failure Reporting', () => {
    it('rejects invalid empty fields server-side and returns actionable field errors without reporting success', async () => {
      const invalidInput: any = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        badgeEn: '', // Required field empty
        headlinePrefixAr: '', // Required field empty
      };

      const result = await saveHomepageHeroAction(invalidInput);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/Validation failed/i);
        expect(result.fieldErrors?.badgeEn).toBeDefined();
        expect(result.fieldErrors?.headlinePrefixAr).toBeDefined();
      }

      // Verify that disk storage was NOT corrupted
      const current = await getHomepageHeroContent();
      expect(current.badgeEn).toBe(DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn);
    });

    it('truthfully rejects Supabase and confirms it cannot be selected as a runtime persistence backend', async () => {
      process.env.MIRAGE_CONTENT_BACKEND = 'supabase';

      const result = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/MIRAGE_CONTENT_BACKEND must be "mongodb" or "file"/i);
        expect(result.error).toMatch(/Supabase is not supported as an active runtime persistence backend/i);
      }
    });

    it('rejects atomic write if directory cannot be written and throws ContentPersistenceError', async () => {
      // Create a file at a path, then try to treat it as a directory
      const blockingFile = path.join(os.tmpdir(), `blocking-file-${Date.now()}.txt`);
      await fs.writeFile(blockingFile, 'blocking', 'utf8');
      process.env.MIRAGE_CONTENT_FILE = path.join(blockingFile, 'impossible-subfolder', 'test.json');

      try {
        await expect(
          saveHomepageHeroContent(DEFAULT_HOMEPAGE_HERO_CONTENT, 'Operator')
        ).rejects.toThrow();
      } finally {
        await fs.unlink(blockingFile).catch(() => undefined);
      }
    });
  });

  describe('GxP Audit Trail Compliance (21 CFR Part 11)', () => {
    it('records an immutable audit log when homepage content is updated', async () => {
      const input: HomepageHeroInput = {
        ...DEFAULT_HOMEPAGE_HERO_CONTENT,
        headlineHighlightEn: 'Precision Therapeutics',
      };

      await saveHomepageHeroAction(input);

      const logs = await getAuditLogs();
      const auditLog = logs.find((l) => l.action === 'UPDATE_HOMEPAGE_HERO_CONTENT');
      expect(auditLog).toBeDefined();
      expect(auditLog?.entity_type).toBe('SITE_CONTENT');
      expect(auditLog?.entity_id).toBe('homepage_hero');
      expect(auditLog?.hash).toHaveLength(64);
    });
  });
});
