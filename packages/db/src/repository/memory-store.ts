import type { Product } from '@mirage/types';
import type { Category, B2BLeadRecord, AuditLogRecord } from '../schema';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCTS_AR,
  INITIAL_B2B_LEADS,
  INITIAL_AUDIT_LOGS,
} from '../seed-data';

interface MirageStoreState {
  categories: Category[];
  products: Product[];
  productsAr: Product[];
  leads: B2BLeadRecord[];
  auditLogs: AuditLogRecord[];
}

declare global {
  // eslint-disable-next-line no-var
  var __mirage_store__: MirageStoreState | undefined;
}

function getStore(): MirageStoreState {
  if (!globalThis.__mirage_store__) {
    globalThis.__mirage_store__ = {
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      productsAr: JSON.parse(JSON.stringify(INITIAL_PRODUCTS_AR)),
      leads: JSON.parse(JSON.stringify(INITIAL_B2B_LEADS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    };
  }
  return globalThis.__mirage_store__;
}

export const memoryStore = {
  getCategories(): Category[] {
    return [...getStore().categories];
  },

  getProducts(locale: 'en' | 'ar' = 'en'): Product[] {
    const store = getStore();
    return [...(locale === 'ar' ? store.productsAr : store.products)];
  },

  getProductById(id: string, locale: 'en' | 'ar' = 'en'): Product | undefined {
    return this.getProducts(locale).find((p) => p.id === id);
  },

  getProductBySlug(slug: string, locale: 'en' | 'ar' = 'en'): Product | undefined {
    return this.getProducts(locale).find((p) => p.slug === slug);
  },

  addProduct(product: Product): Product {
    const store = getStore();
    const existingIndex = store.products.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (existingIndex >= 0) {
      throw new Error(`Product with SKU '${product.id}' or slug '${product.slug}' already exists.`);
    }
    // Add to English products
    store.products.unshift(product);
    // Also mirror to Arabic store so it appears in both catalogs
    store.productsAr.unshift({
      ...product,
      arabicSubtitle: product.arabicSubtitle || product.subtitle,
    });
    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product '${id}' not found`);
    }
    const current = store.products[index];
    const updated: Product = Object.assign({}, current, updates);
    store.products[index] = updated;

    // Mirror to Arabic store
    const arIndex = store.productsAr.findIndex((p) => p.id === id);
    if (arIndex >= 0) {
      store.productsAr[arIndex] = Object.assign({}, store.productsAr[arIndex], updates);
    }
    return updated;
  },

  deleteProduct(id: string): boolean {
    const store = getStore();
    const index = store.products.findIndex((p) => p.id === id);
    if (index >= 0) {
      store.products.splice(index, 1);
      const arIndex = store.productsAr.findIndex((p) => p.id === id);
      if (arIndex >= 0) store.productsAr.splice(arIndex, 1);
      return true;
    }
    return false;
  },

  togglePackStock(productId: string, packIndex: number, inStock?: boolean): Product {
    const store = getStore();
    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error(`Product '${productId}' not found`);
    }

    const nextPacks = product.packSizes.map((pack, idx) => {
      if (idx === packIndex) {
        return { ...pack, inStock: inStock !== undefined ? inStock : !pack.inStock };
      }
      return pack;
    });

    const updated = this.updateProduct(productId, { packSizes: nextPacks });
    return updated;
  },

  getLeads(): B2BLeadRecord[] {
    return [...getStore().leads];
  },

  addLead(lead: B2BLeadRecord): B2BLeadRecord {
    const store = getStore();
    store.leads.unshift(lead);
    return lead;
  },

  updateLead(id: string, updates: Partial<B2BLeadRecord>): B2BLeadRecord {
    const store = getStore();
    const index = store.leads.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error(`Lead '${id}' not found`);
    }
    const current = store.leads[index];
    const updated: B2BLeadRecord = Object.assign({}, current, updates, {
      updated_at: new Date().toISOString(),
    });
    store.leads[index] = updated;
    return updated;
  },

  deleteLead(id: string): boolean {
    const store = getStore();
    const index = store.leads.findIndex((l) => l.id === id);
    if (index >= 0) {
      store.leads.splice(index, 1);
      return true;
    }
    return false;
  },

  getAuditLogs(): AuditLogRecord[] {
    return [...getStore().auditLogs];
  },

  addAuditLog(log: AuditLogRecord): AuditLogRecord {
    const store = getStore();
    store.auditLogs.unshift(log);
    return log;
  },

  reset(): void {
    globalThis.__mirage_store__ = {
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      productsAr: JSON.parse(JSON.stringify(INITIAL_PRODUCTS_AR)),
      leads: JSON.parse(JSON.stringify(INITIAL_B2B_LEADS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    };
  },
};
