import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  togglePackStock,
  deleteProduct,
  getCategories,
  submitB2BLead,
  getB2BLeads,
  getAuditLogs,
  memoryStore,
} from '../src';

describe('@mirage/db — Data Access & Repository Layer', () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  describe('Products Repository', () => {
    it('retrieves initial seed products in English and Arabic', async () => {
      const enProducts = await getProducts({ locale: 'en' });
      expect(enProducts.length).toBeGreaterThanOrEqual(2);
      expect(enProducts.some((p) => p.slug === 'sympdca')).toBe(true);

      const arProducts = await getProducts({ locale: 'ar' });
      expect(arProducts.length).toBeGreaterThanOrEqual(2);
      const symAr = arProducts.find((p) => p.slug === 'sympdca');
      expect(symAr).toBeDefined();
      expect(symAr?.subtitle).toBeDefined();
    });

    it('filters formulations by category and search keyword', async () => {
      const gitProducts = await getProducts({ category: 'Gastrointestinal & Immunity' });
      expect(gitProducts.every((p) => p.category === 'Gastrointestinal & Immunity')).toBe(true);

      const searchResults = await getProducts({ search: 'dual shield' });
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toBe('SymPDCA');
    });

    it('creates a new formulation, persists it in the store, and records a 21 CFR Part 11 audit log', async () => {
      const initialLogs = await getAuditLogs();
      const initialLogCount = initialLogs.length;

      const created = await createProduct({
        id: 'MIR-TEST-999',
        name: 'CardioMax Bio-Lipid',
        category: 'Gastrointestinal & Immunity',
        description: 'Advanced lipid-lowering phytosterol complex.',
        packSizes: [{ quantity: 30, unit: 'capsules', inStock: true }],
      });

      expect(created.id).toBe('MIR-TEST-999');
      expect(created.slug).toBe('cardiomax-bio-lipid');

      // Verify retrieval by slug
      const retrieved = await getProductBySlug('cardiomax-bio-lipid');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('CardioMax Bio-Lipid');

      // Verify Audit Log was appended with standard 64-char SHA-256 hash
      const updatedLogs = await getAuditLogs();
      expect(updatedLogs.length).toBe(initialLogCount + 1);
      const latestLog = updatedLogs[0];
      expect(latestLog.action).toBe('CREATE_FORMULATION');
      expect(latestLog.entity_id).toBe('MIR-TEST-999');
      expect(latestLog.hash).toHaveLength(64);
      expect(latestLog.prev_hash).toBe(initialLogs[0]?.hash);
    });

    it('toggles pack size stock and updates inStock property', async () => {
      const product = await getProductBySlug('sympdca');
      expect(product).toBeDefined();
      expect(product!.packSizes[0].inStock).toBe(true);

      const updated = await togglePackStock(product!.id, 0, false);
      expect(updated.packSizes[0].inStock).toBe(false);

      // Verify persisted in store
      const reFetched = await getProductBySlug('sympdca');
      expect(reFetched!.packSizes[0].inStock).toBe(false);
    });

    it('deletes a formulation and creates an audit trail entry', async () => {
      const product = await getProductBySlug('novamirage');
      expect(product).toBeDefined();

      const deleted = await deleteProduct(product!.id);
      expect(deleted).toBe(true);

      const reFetched = await getProductBySlug('novamirage');
      expect(reFetched).toBeUndefined();

      const logs = await getAuditLogs();
      expect(logs[0].action).toBe('DELETE_FORMULATION');
    });
  });

  describe('B2B Lead Intake & Alliances Repository', () => {
    it('validates and submits a new B2B partnership lead', async () => {
      const initialLeads = await getB2BLeads();
      const countBefore = initialLeads.length;

      const newLead = await submitB2BLead({
        company_name: 'Nile Delta Specialized Hospital',
        contact_name: 'Dr. Mahmoud Zaki',
        email: 'm.zaki@niledelta-hospital.org',
        partnership_archetype: 'Hospital Network',
        message: 'Interested in hospital formulary trial for SymPDCA.',
      });

      expect(newLead.id).toBeDefined();
      expect(newLead.status).toBe('NEW');

      const leadsAfter = await getB2BLeads();
      expect(leadsAfter.length).toBe(countBefore + 1);
      expect(leadsAfter.some((l) => l.company_name === 'Nile Delta Specialized Hospital')).toBe(true);

      // Verify audit log for lead intake
      const logs = await getAuditLogs();
      expect(logs[0].action).toBe('B2B_PARTNER_LEAD_SUBMITTED');
    });

    it('rejects invalid email submission via zod validation', async () => {
      await expect(
        submitB2BLead({
          company_name: 'Test Corp',
          contact_name: 'Tester',
          email: 'not-an-email',
          partnership_archetype: 'Hospital Network',
        })
      ).rejects.toThrow();
    });
  });

  describe('Categories', () => {
    it('returns all pre-configured categories with Arabic translations', async () => {
      const categories = await getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(4);
      expect(categories.every((c) => Boolean(c.name && c.name_ar))).toBe(true);
    });
  });
});
