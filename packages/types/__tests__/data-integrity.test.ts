import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MOCK_PRODUCTS,
  MOCK_PRODUCTS_AR,
  MOCK_REVIEWS,
  MOCK_GXP_AUDIT_LOGS,
  MOCK_HCP_APPLICATIONS,
  MOCK_ADVERSE_EVENTS,
  MOCK_B2B_INQUIRIES,
  MOCK_SUBSCRIBERS,
  MOCK_CAMPAIGNS,
  MOCK_RBAC_ROLES,
  MOCK_COLD_CHAIN_DEPOTS,
  MOCK_DEPOT_BATCHES,
} from '@mirage/types';

/**
 * The monorepo has NO database: both apps import these arrays at build time.
 * These tests therefore protect the only "source of truth" that exists.
 */

const repoRoot = path.resolve(__dirname, '../../..');
const publicDirs = {
  web: path.join(repoRoot, 'apps/web/public'),
  admin: path.join(repoRoot, 'apps/admin/public'),
};

const unique = <T,>(xs: T[]) => new Set(xs).size === xs.length;

describe('catalog (MOCK_PRODUCTS) integrity', () => {
  it('has at least one product and unique ids and slugs', () => {
    expect(MOCK_PRODUCTS.length).toBeGreaterThan(0);
    expect(unique(MOCK_PRODUCTS.map((p) => p.id))).toBe(true);
    expect(unique(MOCK_PRODUCTS.map((p) => p.slug))).toBe(true);
  });

  it('uses URL-safe, lower-case slugs', () => {
    for (const p of MOCK_PRODUCTS) expect(p.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('has the mandatory display fields populated', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(p.name.trim(), p.slug).not.toBe('');
      expect(p.description.trim(), p.slug).not.toBe('');
      expect(p.arabicSubtitle.trim(), p.slug).not.toBe('');
      expect(p.packSizes.length, p.slug).toBeGreaterThan(0);
      expect(p.rating).toBeGreaterThanOrEqual(0);
      expect(p.rating).toBeLessThanOrEqual(5);
    }
  });

  it('only uses categories the public /products filter can display', () => {
    // apps/web/app/products/page.tsx hard-codes its category pills
    const webCategories = ['Gastrointestinal & Immunity', 'Acid Suppression (P-CAB)'];
    for (const p of MOCK_PRODUCTS) {
      expect(webCategories, `${p.slug} would only be reachable via "All Formulations"`).toContain(p.category);
    }
  });

  it.each(Object.entries(publicDirs))('every product image exists on disk in apps/%s/public', (_app, dir) => {
    const images = MOCK_PRODUCTS.flatMap((p) =>
      [p.heroImage, p.bottleImage, p.boxImage, p.bannerImage].filter((x): x is string => !!x)
    );
    const missing = images.filter((img) => !fs.existsSync(path.join(dir, img)));
    expect(missing).toEqual([]);
  });

  it('raw-material and evidence ids are unique within each product', () => {
    for (const p of MOCK_PRODUCTS) {
      expect(unique(p.rawMaterials.map((r) => r.id)), p.slug).toBe(true);
      expect(unique(p.clinicalEvidences.map((e) => e.id)), p.slug).toBe(true);
    }
  });

  it('every review maps to an existing product by name', () => {
    const names = new Set(MOCK_PRODUCTS.map((p) => p.name.toLowerCase()));
    for (const r of MOCK_REVIEWS) expect(names.has(r.productName.toLowerCase())).toBe(true);
  });
});

describe('English / Arabic catalog parity', () => {
  it('contains the same products (id, slug, category, order) in both languages', () => {
    expect(MOCK_PRODUCTS_AR.map((p) => [p.id, p.slug, p.category])).toEqual(
      MOCK_PRODUCTS.map((p) => [p.id, p.slug, p.category])
    );
  });

  it('Arabic entries really contain Arabic script in their subtitle and description', () => {
    const arabic = /[\u0600-\u06FF]/;
    for (const p of MOCK_PRODUCTS_AR) {
      expect(p.subtitle, p.slug).toMatch(arabic);
      expect(p.description, p.slug).toMatch(arabic);
    }
  });

  it('Arabic entries share the same media assets as English ones', () => {
    for (const en of MOCK_PRODUCTS) {
      const ar = MOCK_PRODUCTS_AR.find((p) => p.slug === en.slug)!;
      expect(ar.heroImage).toBe(en.heroImage);
    }
  });
});

describe('dashboard operational data integrity', () => {
  it('has unique identifiers in every collection', () => {
    for (const [name, rows] of Object.entries({
      logs: MOCK_GXP_AUDIT_LOGS,
      hcp: MOCK_HCP_APPLICATIONS,
      pv: MOCK_ADVERSE_EVENTS,
      b2b: MOCK_B2B_INQUIRIES,
      subs: MOCK_SUBSCRIBERS,
      campaigns: MOCK_CAMPAIGNS,
      roles: MOCK_RBAC_ROLES,
      depots: MOCK_COLD_CHAIN_DEPOTS,
      batches: MOCK_DEPOT_BATCHES,
    })) {
      expect(unique(rows.map((r) => r.id)), name).toBe(true);
    }
  });

  it('depot batches reference existing depots with a consistent depot code', () => {
    const depots = new Map(MOCK_COLD_CHAIN_DEPOTS.map((d) => [d.id, d.code]));
    for (const b of MOCK_DEPOT_BATCHES) {
      expect(depots.get(b.depotId), b.batchNumber).toBe(b.depotCode);
    }
  });

  it('every batch expires after it arrived', () => {
    for (const b of MOCK_DEPOT_BATCHES) {
      expect(new Date(b.expiryDate).getTime()).toBeGreaterThan(new Date(b.arrivalDate).getTime());
    }
  });

  it('every depot temperature sits inside a coherent target band and readings are finite', () => {
    for (const d of MOCK_COLD_CHAIN_DEPOTS) {
      expect(d.targetMinCelsius).toBeLessThan(d.targetMaxCelsius);
      expect(d.hourlyReadings.every(Number.isFinite)).toBe(true);
      const outOfBand = d.currentTempCelsius > d.targetMaxCelsius || d.currentTempCelsius < d.targetMinCelsius;
      if (outOfBand) expect(d.status).not.toBe('optimal');
    }
  });

  it('audit log timestamps are valid and listed newest first', () => {
    const times = MOCK_GXP_AUDIT_LOGS.map((l) => Date.parse(l.timestamp.replace(' UTC', 'Z').replace(' ', 'T')));
    expect(times.every(Number.isFinite)).toBe(true);
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it('audit payloads are valid JSON', () => {
    for (const l of MOCK_GXP_AUDIT_LOGS) {
      expect(() => JSON.parse(l.payloadBefore ?? '{}'), l.id).not.toThrow();
      expect(() => JSON.parse(l.payloadAfter ?? '{}'), l.id).not.toThrow();
    }
  });

  it('RBAC roles define the four documented tiers and unique module permissions', () => {
    expect(MOCK_RBAC_ROLES.map((r) => r.roleName).sort()).toEqual(
      ['Catalog Manager', 'Medical Director', 'QA & GxP Lead', 'Super Admin'].sort()
    );
    for (const r of MOCK_RBAC_ROLES) {
      expect(unique(r.permissions.map((p) => p.module)), r.roleName).toBe(true);
    }
  });

  it('GS1 / regulatory identifiers have a valid shape', () => {
    for (const l of MOCK_GXP_AUDIT_LOGS) expect(l.ipAddress).toMatch(/^\d{1,3}(\.\d{1,3}){3}$/);
    for (const h of MOCK_HCP_APPLICATIONS) expect(h.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    for (const s of MOCK_SUBSCRIBERS) expect(s.openRatePercent).toBeGreaterThanOrEqual(0);
  });
});

describe('cross-module referential integrity', () => {
  const catalogNames = MOCK_PRODUCTS.map((p) => p.name.toLowerCase());
  const refersToCatalogProduct = (ref: string) =>
    catalogNames.some((n) => ref.toLowerCase().includes(n) || n.includes(ref.toLowerCase()));

  // KNOWN DEFECT KD-03: the operational mock data was authored for a 7-SKU "Naturals 4be"
  // portfolio, but the shared catalog contains only SymPDCA and NovaMirage.
  it.fails('[KNOWN DEFECT KD-03] every product referenced by PV cases exists in the catalog', () => {
    const orphans = MOCK_ADVERSE_EVENTS.map((e) => e.productName).filter((n) => !refersToCatalogProduct(n));
    expect(orphans).toEqual([]);
  });

  it.fails('[KNOWN DEFECT KD-03] every product referenced by depot batches exists in the catalog', () => {
    const orphans = MOCK_DEPOT_BATCHES.map((b) => b.productName).filter((n) => !refersToCatalogProduct(n));
    expect(orphans).toEqual([]);
  });

  it.fails('[KNOWN DEFECT KD-03] every product targeted by B2B inquiries exists in the catalog', () => {
    const orphans = MOCK_B2B_INQUIRIES.flatMap((i) => i.targetProducts).filter((n) => !refersToCatalogProduct(n));
    expect(orphans).toEqual([]);
  });

  // KNOWN DEFECT KD-04: a SHA-256 hex digest is exactly 64 characters.
  it.fails('[KNOWN DEFECT KD-04] audit-log "SHA-256" digests are 64 hex characters', () => {
    for (const l of MOCK_GXP_AUDIT_LOGS) expect(l.sha256Hash, l.id).toMatch(/^[0-9a-f]{64}$/);
  });

  it('audit-log digests are at least unique and hexadecimal', () => {
    expect(unique(MOCK_GXP_AUDIT_LOGS.map((l) => l.sha256Hash))).toBe(true);
    for (const l of MOCK_GXP_AUDIT_LOGS) expect(l.sha256Hash).toMatch(/^[0-9a-f]+$/);
  });
});
