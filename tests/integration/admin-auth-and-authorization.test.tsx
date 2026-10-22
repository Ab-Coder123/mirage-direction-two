import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  hashAdminPasswordScrypt,
  issueSessionToken,
  requireAdminSession,
  setTestSessionCookieForTesting,
} from '@mirage/db/server';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  memoryStore,
} from '@mirage/db';
import {
  getHomepageHeroAction,
  saveHomepageHeroAction,
} from '../../apps/admin/app/settings/homepage-actions';
import {
  getCompanyStoryAction,
  saveCompanyStoryAction,
} from '../../apps/admin/app/settings/company-actions';
import {
  createProductAction,
  deleteProductAction,
  getProductsAction,
  togglePackStockAction,
  updateProductAction,
} from '../../apps/admin/app/products/actions';
import {
  deleteB2BLeadAction,
  getB2BLeadsAction,
  updateB2BLeadStatusAction,
} from '../../apps/admin/app/b2b-leads/actions';
import {
  loginAdminAction,
  logoutAdminAction,
} from '../../apps/admin/app/login/actions';

const VALID_SECRET = 'mirage-phase4-integration-hmac-sha256-secret-key-2026';

describe('Phase 4 Integration Suite: Admin Login Flow & Protected Server Actions', () => {
  let tempHeroFile: string;
  let tempCompanyFile: string;

  beforeEach(() => {
    memoryStore.reset();
    setTestSessionCookieForTesting(null);
    tempHeroFile = path.join(
      os.tmpdir(),
      `mirage-auth-int-hero-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    tempCompanyFile = path.join(
      os.tmpdir(),
      `mirage-auth-int-company-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    process.env.MIRAGE_CONTENT_FILE = tempHeroFile;
    process.env.MIRAGE_COMPANY_CONTENT_FILE = tempCompanyFile;
    delete process.env.MIRAGE_CONTENT_BACKEND;
    delete process.env.MONGODB_URI;
    process.env.MIRAGE_SESSION_SECRET = VALID_SECRET;
    delete process.env.MIRAGE_ADMIN_EMAIL;
    delete process.env.MIRAGE_ADMIN_PASSWORD;
    delete process.env.MIRAGE_ADMIN_PASSWORD_HASH;
    delete process.env.MIRAGE_ADMIN_ROLE;
    delete process.env.MIRAGE_ADMIN_USERS_JSON;
  });

  afterEach(async () => {
    setTestSessionCookieForTesting(null);
    delete process.env.MIRAGE_SESSION_SECRET;
    delete process.env.MIRAGE_ADMIN_EMAIL;
    delete process.env.MIRAGE_ADMIN_PASSWORD;
    delete process.env.MIRAGE_ADMIN_PASSWORD_HASH;
    delete process.env.MIRAGE_ADMIN_ROLE;
    delete process.env.MIRAGE_ADMIN_USERS_JSON;
    delete process.env.MIRAGE_CONTENT_FILE;
    delete process.env.MIRAGE_COMPANY_CONTENT_FILE;
    await fs.unlink(tempHeroFile).catch(() => undefined);
    await fs.unlink(tempCompanyFile).catch(() => undefined);
  });

  describe('1. Server Action Login & Logout Flow', () => {
    it('fails closed when credentials are missing and issues a signed session when valid', async () => {
      const missingConfigRes = await loginAdminAction({
        email: 'admin@miragepharma.com',
        password: 'any',
      });
      expect(missingConfigRes.ok).toBe(false);
      if (!missingConfigRes.ok) {
        expect(missingConfigRes.code).toBe('AUTH_NOT_CONFIGURED');
      }

      process.env.MIRAGE_ADMIN_EMAIL = 'admin@miragepharma.com';
      process.env.MIRAGE_ADMIN_PASSWORD_HASH = hashAdminPasswordScrypt(
        'StrongPassphrase#2026'
      );
      process.env.MIRAGE_ADMIN_ROLE = 'super_admin';

      const loginRes = await loginAdminAction({
        email: 'admin@miragepharma.com',
        password: 'StrongPassphrase#2026',
      });
      expect(loginRes.ok).toBe(true);

      const activeSession = await requireAdminSession('cms:write');
      expect(activeSession.ok).toBe(true);

      await logoutAdminAction();
      const afterLogout = await requireAdminSession();
      expect(afterLogout.ok).toBe(false);
    });
  });

  describe('2. Protected Admin Server Actions & Role Authorization (RBAC)', () => {
    it('rejects unauthenticated calls across every Admin mutation and private read path', async () => {
      setTestSessionCookieForTesting(null);

      const heroRes = await saveHomepageHeroAction(DEFAULT_HOMEPAGE_HERO_CONTENT);
      expect(heroRes.ok).toBe(false);
      if (!heroRes.ok) expect(heroRes.error).toMatch(/Authentication required/i);

      const companyRes = await saveCompanyStoryAction(
        DEFAULT_COMPANY_STORY_CONTENT
      );
      expect(companyRes.ok).toBe(false);
      if (!companyRes.ok)
        expect(companyRes.error).toMatch(/Authentication required/i);

      const createProdRes = await createProductAction({
        name: 'Unauthorized Product',
      });
      expect(createProdRes.ok).toBe(false);
      if (!createProdRes.ok) expect(createProdRes.code).toBe('UNAUTHENTICATED');

      const updateProdRes = await updateProductAction('prod-1', {
        name: 'Hacked',
      });
      expect(updateProdRes.ok).toBe(false);
      if (!updateProdRes.ok) expect(updateProdRes.code).toBe('UNAUTHENTICATED');

      const toggleStockRes = await togglePackStockAction('prod-1', 0, false);
      expect(toggleStockRes.ok).toBe(false);
      if (!toggleStockRes.ok)
        expect(toggleStockRes.code).toBe('UNAUTHENTICATED');

      const deleteProdRes = await deleteProductAction('prod-1');
      expect(deleteProdRes.ok).toBe(false);
      if (!deleteProdRes.ok) expect(deleteProdRes.code).toBe('UNAUTHENTICATED');

      const getProductsRes = await getProductsAction();
      expect(getProductsRes.ok).toBe(false);
      if (!getProductsRes.ok)
        expect(getProductsRes.code).toBe('UNAUTHENTICATED');

      const getLeadsRes = await getB2BLeadsAction();
      expect(getLeadsRes.ok).toBe(false);
      if (!getLeadsRes.ok) expect(getLeadsRes.code).toBe('UNAUTHENTICATED');

      const updateLeadRes = await updateB2BLeadStatusAction(
        'lead-1',
        'TRIAGED'
      );
      expect(updateLeadRes.ok).toBe(false);
      if (!updateLeadRes.ok) expect(updateLeadRes.code).toBe('UNAUTHENTICATED');

      const deleteLeadRes = await deleteB2BLeadAction('lead-1');
      expect(deleteLeadRes.ok).toBe(false);
      if (!deleteLeadRes.ok) expect(deleteLeadRes.code).toBe('UNAUTHENTICATED');
    });

    it('forbids read_only role from executing any CMS, Product, or B2B Lead mutation while allowing reads', async () => {
      const readOnlyToken = issueSessionToken(
        {
          sub: 'USR-AUDITOR-01',
          email: 'auditor@miragepharma.com',
          name: 'GxP Auditor',
          role: 'read_only',
        },
        VALID_SECRET
      );
      setTestSessionCookieForTesting(readOnlyToken);

      // Reads are permitted for read_only
      const heroRead = await getHomepageHeroAction();
      expect(heroRead.warning).toBeUndefined();
      const companyRead = await getCompanyStoryAction();
      expect(companyRead.warning).toBeUndefined();
      const prodRead = await getProductsAction();
      expect(prodRead.ok).toBe(true);
      const leadsRead = await getB2BLeadsAction();
      expect(leadsRead.ok).toBe(true);

      // Mutations are strictly forbidden for read_only
      const heroSave = await saveHomepageHeroAction(
        DEFAULT_HOMEPAGE_HERO_CONTENT
      );
      expect(heroSave.ok).toBe(false);
      if (!heroSave.ok) expect(heroSave.error).toMatch(/Forbidden.*read_only/i);

      const companySave = await saveCompanyStoryAction(
        DEFAULT_COMPANY_STORY_CONTENT
      );
      expect(companySave.ok).toBe(false);
      if (!companySave.ok)
        expect(companySave.error).toMatch(/Forbidden.*read_only/i);

      const prodCreate = await createProductAction({});
      expect(prodCreate.ok).toBe(false);
      if (!prodCreate.ok) expect(prodCreate.code).toBe('FORBIDDEN');

      const prodUpdate = await updateProductAction('prod-1', {});
      expect(prodUpdate.ok).toBe(false);
      if (!prodUpdate.ok) expect(prodUpdate.code).toBe('FORBIDDEN');

      const prodToggle = await togglePackStockAction('prod-1', 0, true);
      expect(prodToggle.ok).toBe(false);
      if (!prodToggle.ok) expect(prodToggle.code).toBe('FORBIDDEN');

      const prodDelete = await deleteProductAction('prod-1');
      expect(prodDelete.ok).toBe(false);
      if (!prodDelete.ok) expect(prodToggle.code).toBe('FORBIDDEN');

      const leadUpdate = await updateB2BLeadStatusAction('lead-1', 'TRIAGED');
      expect(leadUpdate.ok).toBe(false);
      if (!leadUpdate.ok) expect(leadUpdate.code).toBe('FORBIDDEN');
    });

    it('enforces granular role separation for qa_officer (allowed products:write, forbidden cms:write)', async () => {
      const qaToken = issueSessionToken(
        {
          sub: 'USR-QA-01',
          email: 'qa@miragepharma.com',
          name: 'QA Lead',
          role: 'qa_officer',
        },
        VALID_SECRET
      );
      setTestSessionCookieForTesting(qaToken);

      // QA Officer cannot rewrite public corporate CMS
      const heroSave = await saveHomepageHeroAction(
        DEFAULT_HOMEPAGE_HERO_CONTENT
      );
      expect(heroSave.ok).toBe(false);
      if (!heroSave.ok)
        expect(heroSave.error).toMatch(/Forbidden.*qa_officer/i);

      // QA Officer CAN toggle product pack stock
      const productsRes = await getProductsAction();
      expect(productsRes.ok).toBe(true);
      if (productsRes.ok && productsRes.products.length > 0) {
        const firstProduct = productsRes.products[0]!;
        const stockRes = await togglePackStockAction(firstProduct.id, 0, true);
        expect(stockRes.ok).toBe(true);
      }
    });
  });
});
