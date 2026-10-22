import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Db, Collection } from 'mongodb';
import {
  loadProductsFromDb,
  loadProductBySlugFromDb,
  saveProductToDb,
  updateProductInDb,
  togglePackStockInDb,
  deleteProductFromDb,
  resolveProductWithFallback,
  ProductPersistenceError,
} from '../src/server/product-repository';
import {
  INITIAL_PRODUCTS,
  INITIAL_PRODUCTS_AR,
} from '../src/seed-data';
import { memoryStore } from '../src/repository/memory-store';
import { MONGO_COLLECTIONS } from '../src/server/mongo-models';
import type { Product } from '@mirage/types';

/**
 * Creates an in-memory mock MongoDB Db instance with an internal store.
 */
function createMockDb(initialProducts: any[] = []): { db: Db; store: Map<string, any> } {
  const store = new Map<string, any>();
  for (const p of initialProducts) {
    store.set(p.id, JSON.parse(JSON.stringify(p)));
  }

  const auditLogStore: any[] = [];

  const productsCollection = {
    find: vi.fn((query = {}) => ({
      toArray: vi.fn(async () => {
        return Array.from(store.values());
      }),
    })),
    findOne: vi.fn(async (filter: any) => {
      if (filter.id) {
        return store.get(filter.id) || null;
      }
      if (filter.slug) {
        return (
          Array.from(store.values()).find((p) => p.slug === filter.slug) || null
        );
      }
      if (filter.$or) {
        for (const cond of filter.$or) {
          if (cond.id && store.has(cond.id)) return store.get(cond.id);
          const bySlug = Array.from(store.values()).find(
            (p) => cond.slug && p.slug === cond.slug
          );
          if (bySlug) return bySlug;
        }
        return null;
      }
      return null;
    }),
    insertOne: vi.fn(async (doc: any) => {
      store.set(doc.id, JSON.parse(JSON.stringify(doc)));
      return { acknowledged: true, insertedId: doc.id };
    }),
    updateOne: vi.fn(async (filter: any, update: any) => {
      const existing = filter.id
        ? store.get(filter.id)
        : Array.from(store.values()).find((p) => p.slug === filter.slug);
      if (!existing) {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      }
      if (update.$set) {
        Object.assign(existing, JSON.parse(JSON.stringify(update.$set)));
      }
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    }),
    deleteOne: vi.fn(async (filter: any) => {
      const had = store.delete(filter.id);
      return { acknowledged: true, deletedCount: had ? 1 : 0 };
    }),
  };

  const auditCollection = {
    insertOne: vi.fn(async (doc: any) => {
      auditLogStore.push(doc);
      return { acknowledged: true, insertedId: doc.id };
    }),
  };

  const db = {
    collection: vi.fn((name: string) => {
      if (name === MONGO_COLLECTIONS.PRODUCTS) {
        return productsCollection as unknown as Collection;
      }
      if (name === MONGO_COLLECTIONS.AUDIT_LOGS) {
        return auditCollection as unknown as Collection;
      }
      throw new Error(`Unexpected collection in mock: ${name}`);
    }),
  } as unknown as Db;

  return { db, store };
}

describe('PHASE 6: Product Catalog Synchronization & MongoDB Runtime Persistence', () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  describe('1. Field-by-Field Fallback & Locale Resolution', () => {
    it('merges partial MongoDB document with static baseline so no fields are dropped', () => {
      // Partial override of SymPDCA
      const partialDoc: Partial<Product> = {
        id: 'prod-sympdca',
        slug: 'sympdca',
        tagline: 'Custom Live Tagline Override',
      };

      const resolved = resolveProductWithFallback(partialDoc, 'en');
      expect(resolved.id).toBe('prod-sympdca');
      expect(resolved.tagline).toBe('Custom Live Tagline Override');
      // Must retain baseline properties
      expect(resolved.name).toBe('SymPDCA');
      expect(resolved.category).toBe('Gastrointestinal & Immunity');
      expect(resolved.packSizes.length).toBeGreaterThan(0);
      expect(resolved.rawMaterials.length).toBeGreaterThan(0);
      expect(resolved.clinicalEvidences.length).toBeGreaterThan(0);
    });

    it('resolves Arabic localized fields for baseline products in Arabic locale', () => {
      const partialDoc: Partial<Product> = {
        id: 'prod-sympdca',
        slug: 'sympdca',
      };

      const resolved = resolveProductWithFallback(partialDoc, 'ar');
      expect(resolved.subtitle).toContain('المسار الموثوق');
      expect(resolved.arabicSubtitle).toContain('مكمل غذائي');
    });

    it('returns default static products when MongoDB collection is empty', async () => {
      const { db } = createMockDb([]);
      const result = await loadProductsFromDb({ locale: 'en' }, db);

      expect(result.source).toBe('default');
      expect(result.products.length).toBe(INITIAL_PRODUCTS.length);
      expect(result.products.map((p) => p.slug)).toContain('sympdca');
      expect(result.products.map((p) => p.slug)).toContain('novamirage');
    });

    it('returns products from MongoDB when present', async () => {
      const { db } = createMockDb(INITIAL_PRODUCTS);
      const result = await loadProductsFromDb({ locale: 'en' }, db);

      expect(result.source).toBe('mongodb');
      expect(result.products.length).toBe(INITIAL_PRODUCTS.length);
    });

    it('filters products by category and search keyword', async () => {
      const { db } = createMockDb(INITIAL_PRODUCTS);
      const categoryFilter = await loadProductsFromDb(
        { category: 'Gastrointestinal & Immunity' },
        db
      );
      expect(categoryFilter.products.every((p) => p.category === 'Gastrointestinal & Immunity')).toBe(true);

      const searchFilter = await loadProductsFromDb({ search: 'Vonoprazan' }, db);
      expect(searchFilter.products.length).toBe(1);
      expect(searchFilter.products[0].slug).toBe('novamirage');
    });
  });

  describe('2. Single Product Lookup by Slug', () => {
    it('returns product from MongoDB when found by slug', async () => {
      const { db } = createMockDb(INITIAL_PRODUCTS);
      const result = await loadProductBySlugFromDb('sympdca', 'en', db);

      expect(result.source).toBe('mongodb');
      expect(result.product).toBeDefined();
      expect(result.product?.name).toBe('SymPDCA');
    });

    it('falls back to static defaults when slug is not found in MongoDB', async () => {
      const { db } = createMockDb([]);
      const result = await loadProductBySlugFromDb('sympdca', 'en', db);

      expect(result.source).toBe('default');
      expect(result.product).toBeDefined();
      expect(result.product?.slug).toBe('sympdca');
    });

    it('returns undefined when slug does not exist anywhere', async () => {
      const { db } = createMockDb([]);
      const result = await loadProductBySlugFromDb('non-existent-sku-xyz', 'en', db);

      expect(result.product).toBeUndefined();
    });
  });

  describe('3. Product Creation via saveProductToDb', () => {
    it('inserts new product into MongoDB with write acknowledgment and GxP audit log', async () => {
      const { db, store } = createMockDb(INITIAL_PRODUCTS);

      const newProduct: Product = {
        id: 'prod-curcumin-95',
        slug: 'curcumin-bio-curc-500',
        name: 'Curcumin Bio-Curc 500',
        brandLine: 'Naturals 4be',
        category: 'Vitamins & Minerals',
        subtitle: 'Standardized 95% Curcuminoids with Piperine',
        arabicSubtitle: 'كركمين فائق الامتصاص',
        tagline: 'High Purity Curcumin Complex',
        description: 'Advanced anti-inflammatory bio-enhanced curcumin extract.',
        packSizes: [{ quantity: 60, unit: 'capsules', inStock: true }],
        heroImage: '/brand/products/folate-b12.jpg',
        rawMaterials: [],
        clinicalEvidences: [],
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true,
      };

      const result = await saveProductToDb(db, newProduct, {
        userId: 'USR-OPERATOR',
        role: 'super_admin',
      });

      expect(result.ok).toBe(true);
      expect(result.product.id).toBe('prod-curcumin-95');
      expect(store.has('prod-curcumin-95')).toBe(true);

      // Verify audit log was recorded in memoryStore
      const auditLogs = memoryStore.getAuditLogs();
      const creationLog = auditLogs.find(
        (l) => l.action === 'CREATE_FORMULATION' && l.entity_id === 'prod-curcumin-95'
      );
      expect(creationLog).toBeDefined();
      expect(creationLog?.actor_id).toBe('USR-OPERATOR');
    });

    it('rejects duplicate product creation with DUPLICATE_PRODUCT code', async () => {
      const { db } = createMockDb(INITIAL_PRODUCTS);

      await expect(
        saveProductToDb(
          db,
          {
            id: 'prod-sympdca', // existing ID
            slug: 'sympdca-new',
            name: 'Duplicate SKU',
            brandLine: 'Mirage',
            category: 'Vitamins & Minerals',
            subtitle: 'Sub',
            arabicSubtitle: 'عربي',
            tagline: 'Tag',
            description: 'Desc',
            packSizes: [{ quantity: 30, unit: 'capsules', inStock: true }],
            heroImage: '/img.jpg',
            rawMaterials: [],
            clinicalEvidences: [],
            rating: 5,
            reviewsCount: 0,
            isFeatured: false,
          },
          { userId: 'USR-OP', role: 'super_admin' }
        )
      ).rejects.toThrowError(ProductPersistenceError);
    });

    it('fails closed when MongoDB write is not acknowledged', async () => {
      const unacknowledgedDb = {
        collection: vi.fn(() => ({
          findOne: vi.fn(async () => null),
          insertOne: vi.fn(async () => ({ acknowledged: false })),
        })),
      } as unknown as Db;

      await expect(
        saveProductToDb(
          unacknowledgedDb,
          {
            id: 'prod-test-fail',
            slug: 'test-fail',
            name: 'Test Fail',
            brandLine: 'Mirage',
            category: 'Vitamins & Minerals',
            subtitle: 'Sub',
            arabicSubtitle: 'عربي',
            tagline: 'Tag',
            description: 'Desc',
            packSizes: [{ quantity: 30, unit: 'capsules', inStock: true }],
            heroImage: '/img.jpg',
            rawMaterials: [],
            clinicalEvidences: [],
            rating: 5,
            reviewsCount: 0,
            isFeatured: false,
          },
          { userId: 'USR-OP', role: 'super_admin' }
        )
      ).rejects.toThrowError(/not acknowledge formulation insertion/i);
    });
  });

  describe('4. Inventory Stock Toggle via togglePackStockInDb', () => {
    it('toggles pack size stock and updates MongoDB and audit trail', async () => {
      const { db, store } = createMockDb(INITIAL_PRODUCTS);

      // Toggle SymPDCA pack 0 from inStock: true to false
      const result = await togglePackStockInDb(db, 'prod-sympdca', 0, false, {
        userId: 'USR-LOGISTICS',
        role: 'super_admin',
      });

      expect(result.ok).toBe(true);
      expect(result.product.packSizes[0].inStock).toBe(false);

      // Verify in stored doc
      const updatedDoc = store.get('prod-sympdca');
      expect(updatedDoc.packSizes[0].inStock).toBe(false);

      // Verify audit log
      const logs = memoryStore.getAuditLogs();
      const toggleLog = logs.find(
        (l) => l.action === 'TOGGLE_PACK_STOCK' && l.entity_id === 'prod-sympdca'
      );
      expect(toggleLog).toBeDefined();
    });

    it('throws INVALID_PACK_INDEX if packIndex is out of range', async () => {
      const { db } = createMockDb(INITIAL_PRODUCTS);

      await expect(
        togglePackStockInDb(db, 'prod-sympdca', 99, false)
      ).rejects.toThrowError(/out of bounds/i);
    });
  });

  describe('5. Formulation Update and Deletion', () => {
    it('updates product fields in MongoDB via updateProductInDb', async () => {
      const { db, store } = createMockDb(INITIAL_PRODUCTS);

      const result = await updateProductInDb(
        db,
        'prod-sympdca',
        { subtitle: 'Updated Symbiotic Gastro Shield' },
        { userId: 'USR-DIRECTOR', role: 'medical_director' }
      );

      expect(result.ok).toBe(true);
      expect(result.product.subtitle).toBe('Updated Symbiotic Gastro Shield');
      expect(store.get('prod-sympdca').subtitle).toBe('Updated Symbiotic Gastro Shield');
    });

    it('deletes formulation from MongoDB via deleteProductFromDb', async () => {
      const { db, store } = createMockDb(INITIAL_PRODUCTS);

      const result = await deleteProductFromDb(db, 'prod-novamirage', {
        userId: 'USR-ADMIN',
        role: 'super_admin',
      });

      expect(result.ok).toBe(true);
      expect(result.deleted).toBe(true);
      expect(store.has('prod-novamirage')).toBe(false);
    });
  });

  describe('6. Offline Graceful Degradation', () => {
    it('gracefully degrades to static defaults when MongoDB throws connection error', async () => {
      const throwingDb = {
        collection: vi.fn(() => ({
          find: vi.fn(() => ({
            toArray: vi.fn(async () => {
              throw new Error("MongoNetworkTimeoutException: Socket timed out");
            }),
          })),
        })),
      } as unknown as Db;

      const result = await loadProductsFromDb({ locale: 'en' }, throwingDb);
      expect(result.source).toBe('default');
      expect(result.warning).toContain('MongoNetworkTimeoutException');
      expect(result.products.length).toBe(INITIAL_PRODUCTS.length);
    });
  });
});
