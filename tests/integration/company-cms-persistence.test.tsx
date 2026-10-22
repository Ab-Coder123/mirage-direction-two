import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';

import OurStoryPage from '../../apps/web/app/our-story/page';
import ArabicOurStoryPage from '../../apps/web/app/ar/our-story/page';
import CompanyStoryEditor from '../../apps/admin/components/cms/CompanyStoryEditor';
import {
  saveCompanyStoryAction,
  getCompanyStoryAction,
} from '../../apps/admin/app/settings/company-actions';
import {
  getCompanyStoryContent,
  saveCompanyStoryContent,
  resolveCompanyStorage,
  issueSessionToken,
  setTestSessionCookieForTesting,
} from '@mirage/db/server';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  type CompanyStoryInput,
  getAuditLogs,
  memoryStore,
} from '@mirage/db';

const TEST_SESSION_SECRET = 'mirage-integration-test-session-secret-key-2026-hmac';

describe('INTEGRATION AUDIT: Company Story & Facts CMS ↔ Public Website Live Synchronization', () => {
  let tempFilePath: string;

  beforeEach(async () => {
    cleanup();
    memoryStore.reset();
    tempFilePath = path.join(
      os.tmpdir(),
      `mirage-company-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    process.env.MIRAGE_COMPANY_CONTENT_FILE = tempFilePath;
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
    delete process.env.MIRAGE_COMPANY_CONTENT_FILE;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    try {
      await fs.unlink(tempFilePath);
    } catch {
      // Ignored if file was not created
    }
  });

  describe('Durable Shared Storage Baseline', () => {
    it('returns default content when no prior save exists', async () => {
      const content = await getCompanyStoryContent();
      expect(content.heroTitleEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn);
      expect(content.heroTitleAr).toBe(DEFAULT_COMPANY_STORY_CONTENT.heroTitleAr);
      expect(content.capitalEn).toBe(DEFAULT_COMPANY_STORY_CONTENT.capitalEn);
      expect(content.capitalAr).toBe(DEFAULT_COMPANY_STORY_CONTENT.capitalAr);
      // Strictly verify static workforce datum is preserved as 75 + 500
      expect(content.workforceEn).toBe('75 + 500');
      expect(content.workforceAr).toBe('75 + 500');
    });

    it('persists changes to local JSON file when backend is file mode', async () => {
      const updates: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        capitalEn: '75 Million EGP',
        capitalAr: '75 مليون جنيه مصري',
      };

      const result = await saveCompanyStoryContent(updates, 'QA Officer (Dr. Tests)');
      expect(result.mode).toBe('file');
      expect(result.content.capitalEn).toBe('75 Million EGP');

      // Verify file physically exists on disk
      const fileData = await fs.readFile(tempFilePath, 'utf8');
      const parsed = JSON.parse(fileData);
      expect(parsed.capitalEn).toBe('75 Million EGP');
      expect(parsed.capitalAr).toBe('75 مليون جنيه مصري');
      expect(parsed.updatedBy).toBe('QA Officer (Dr. Tests)');
    });
  });

  describe('Admin CMS Mutation ↔ Public Website Pages (/our-story & /ar/our-story)', () => {
    it('persists English story copy and displays it on fresh read of public our-story page', async () => {
      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        heroTitleEn: 'MIRAGE PHARMA GLOBAL ENTERPRISES',
        capitalEn: '100 Million EGP',
        visionQuoteEn: 'Pioneering next-generation clinical therapeutics with zero compromise.',
      };

      const saveResult = await saveCompanyStoryAction(payload);
      expect(saveResult.ok).toBe(true);
      if (!saveResult.ok) return;

      // Render public English page Server Component
      const pageUi = await OurStoryPage();
      const { unmount } = render(pageUi);

      expect(screen.getByText('MIRAGE PHARMA GLOBAL ENTERPRISES')).toBeInTheDocument();
      expect(screen.getAllByText('100 Million EGP').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(/Pioneering next-generation clinical therapeutics with zero compromise\./)
      ).toBeInTheDocument();
      unmount();
    });

    it('persists Arabic story copy and displays it on fresh read of public Arabic page', async () => {
      const payload: CompanyStoryInput = {
        ...DEFAULT_COMPANY_STORY_CONTENT,
        heroTitleAr: 'شركة ميراج فارما للصناعات الدوائية الحديثة',
        capitalAr: '100 مليون جنيه مصري',
        visionQuoteAr: 'أن نقود الابتكار في صناعة الدواء العربي بأعلى معايير الجودة العالمية.',
      };

      const saveResult = await saveCompanyStoryAction(payload);
      expect(saveResult.ok).toBe(true);
      if (!saveResult.ok) return;

      // Render public Arabic page Server Component
      const pageUi = await ArabicOurStoryPage();
      const { unmount } = render(pageUi);

      expect(screen.getByText('شركة ميراج فارما للصناعات الدوائية الحديثة')).toBeInTheDocument();
      expect(screen.getAllByText('100 مليون جنيه مصري').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(/أن نقود الابتكار في صناعة الدواء العربي بأعلى معايير الجودة العالمية\./)
      ).toBeInTheDocument();
      unmount();
    });
  });

  describe('CompanyStoryEditor UI Component', () => {
    it('renders the editor with form fields and live preview', async () => {
      render(<CompanyStoryEditor />);

      expect(screen.getByText('Company Story & Corporate Facts CMS')).toBeInTheDocument();
      expect(screen.getByText('English Copy')).toBeInTheDocument();
      expect(screen.getByText('المحتوى العربي (Arabic)')).toBeInTheDocument();
      expect(screen.getByText('Save & Publish Changes')).toBeInTheDocument();
    });
  });
});
