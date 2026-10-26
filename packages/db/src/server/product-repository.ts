/**
 * SERVER-ONLY MongoDB Product Repository & Fallback Engine
 *
 * Provides resilient, bilingual CRUD and stock management operations for the
 * product catalog backed by MongoDB with zero-data-loss static fallbacks.
 *
 * Rules:
 *  - Must NEVER be imported into client components.
 *  - Writes fail closed and throw ContentPersistenceError if MongoDB rejects or fails.
 *  - Reads gracefully degrade to static defaults (INITIAL_PRODUCTS / INITIAL_PRODUCTS_AR)
 *    if MongoDB is unreachable, reporting a warning without crashing.
 *  - Missing fields in persisted products merge field-by-field with static defaults.
 *  - Enforces 21 CFR Part 11 audit trails on all mutations.
 */

import type { Db } from 'mongodb';
import { assertServerContext, getMongoDb, isMongoConfigured } from './mongodb';
import { MONGO_COLLECTIONS } from './mongo-models';
import {
  INITIAL_PRODUCTS,
  INITIAL_PRODUCTS_AR,
} from '../seed-data';
import { memoryStore } from '../repository/memory-store';
import { recordAuditLog } from '../repository/audit';
import type { Product, PackSize } from '@mirage/types';
import {
  CreateProductMutationSchema,
  type CreateProductInput,
} from '../schema';
import { slugify } from '@mirage/utils';

assertServerContext();

export class ProductPersistenceError extends Error {
  readonly code:
    | 'VALIDATION_FAILED'
    | 'DUPLICATE_PRODUCT'
    | 'PRODUCT_NOT_FOUND'
    | 'INVALID_PACK_INDEX'
    | 'WRITE_FAILED'
    | 'DB_UNAVAILABLE';

  constructor(
    code:
      | 'VALIDATION_FAILED'
      | 'DUPLICATE_PRODUCT'
      | 'PRODUCT_NOT_FOUND'
      | 'INVALID_PACK_INDEX'
      | 'WRITE_FAILED'
      | 'DB_UNAVAILABLE',
    message: string
  ) {
    super(message);
    this.name = 'ProductPersistenceError';
    this.code = code;
  }
}

export interface ActorContext {
  userId: string;
  role: string;
}

export interface ProductFilterOptions {
  locale?: 'en' | 'ar' | undefined;
  category?: string | undefined;
  search?: string | undefined;
}

export interface LoadedProductsResult {
  products: Product[];
  source: 'mongodb' | 'default';
  warning?: string;
}

export interface LoadedProductResult {
  product: Product | undefined;
  source: 'mongodb' | 'default';
  warning?: string;
}

/**
 * Resolves a product document against canonical static defaults field-by-field.
 * Guarantees that baseline monograph data (images, facts, raw materials)
 * are never lost even if a partial database document was written.
 */
export function resolveProductWithFallback(
  doc: Partial<Product> = {},
  locale: 'en' | 'ar' = 'en'
): Product {
  const { _id, ...safeDoc } = (doc || {}) as any;
  const baselineList = locale === 'ar' ? INITIAL_PRODUCTS_AR : INITIAL_PRODUCTS;
  const baseline = baselineList.find(
    (p) => (safeDoc.id && p.id === safeDoc.id) || (safeDoc.slug && p.slug === safeDoc.slug)
  );

  if (!baseline) {
    // Custom product created via Admin Studio
    const packSizes: PackSize[] =
      Array.isArray(safeDoc.packSizes) && safeDoc.packSizes.length > 0
        ? (safeDoc.packSizes as PackSize[])
        : [{ quantity: 30, unit: 'capsules', inStock: true }];

    const custom: Product = {
      id: safeDoc.id || `prod-${Date.now()}`,
      slug: safeDoc.slug || 'unnamed-formulation',
      name: safeDoc.name || 'Unnamed Formulation',
      brandLine: safeDoc.brandLine || 'Mirage Pharma',
      category: safeDoc.category || 'Vitamins & Minerals',
      subtitle:
        locale === 'ar'
          ? safeDoc.arabicSubtitle || safeDoc.subtitle || 'مكمل غذائي معتمد'
          : safeDoc.subtitle || 'Clinical Formulation',
      arabicSubtitle: safeDoc.arabicSubtitle || 'مكمل غذائي معتمد',
      tagline: safeDoc.tagline || `${safeDoc.name || 'Formulation'} — High Purity`,
      description:
        safeDoc.description ||
        'Newly registered clinical formulation engineered under EDA & ISO 9001:2015 quality assurance protocols.',
      packSizes,
      heroImage: safeDoc.heroImage || '/brand/products/folate-b12.jpg',
      rawMaterials: Array.isArray(safeDoc.rawMaterials) ? safeDoc.rawMaterials : [],
      clinicalEvidences: Array.isArray(safeDoc.clinicalEvidences)
        ? safeDoc.clinicalEvidences
        : [],
      rating: typeof safeDoc.rating === 'number' ? safeDoc.rating : 5.0,
      reviewsCount: typeof safeDoc.reviewsCount === 'number' ? safeDoc.reviewsCount : 1,
      isFeatured: safeDoc.isFeatured ?? true,
    };

    if (safeDoc.priceInfo) custom.priceInfo = safeDoc.priceInfo;
    if (safeDoc.packagingDetails) custom.packagingDetails = safeDoc.packagingDetails;
    if (safeDoc.bottleImage) custom.bottleImage = safeDoc.bottleImage;
    if (safeDoc.boxImage) custom.boxImage = safeDoc.boxImage;
    if (safeDoc.bannerImage) custom.bannerImage = safeDoc.bannerImage;
    if (safeDoc.dosageInstructions) custom.dosageInstructions = safeDoc.dosageInstructions;
    if (safeDoc.supplementFacts) custom.supplementFacts = safeDoc.supplementFacts;
    if (safeDoc.clinicalIndications) custom.clinicalIndications = safeDoc.clinicalIndications;
    if (safeDoc.synergyBanner) custom.synergyBanner = safeDoc.synergyBanner;

    return custom;
  }

  // Baseline product (e.g. SymPDCA or NovaMirage) with field-level fallbacks
  const merged: Product = {
    ...baseline,
    ...safeDoc,
    subtitle:
      locale === 'ar'
        ? doc.arabicSubtitle || baseline.subtitle
        : doc.subtitle || baseline.subtitle,
    arabicSubtitle: doc.arabicSubtitle || baseline.arabicSubtitle,
    packSizes:
      Array.isArray(doc.packSizes) && doc.packSizes.length > 0
        ? (doc.packSizes as PackSize[])
        : baseline.packSizes,
    rawMaterials:
      Array.isArray(doc.rawMaterials) && doc.rawMaterials.length > 0
        ? doc.rawMaterials
        : baseline.rawMaterials,
    clinicalEvidences:
      Array.isArray(doc.clinicalEvidences) && doc.clinicalEvidences.length > 0
        ? doc.clinicalEvidences
        : baseline.clinicalEvidences,
  };

  if (doc.clinicalIndications) {
    merged.clinicalIndications = doc.clinicalIndications;
  } else if (baseline.clinicalIndications) {
    merged.clinicalIndications = baseline.clinicalIndications;
  } else {
    delete merged.clinicalIndications;
  }

  if (doc.synergyBanner) {
    merged.synergyBanner = doc.synergyBanner;
  } else if (baseline.synergyBanner) {
    merged.synergyBanner = baseline.synergyBanner;
  } else {
    delete merged.synergyBanner;
  }

  delete (merged as any)._id;

  return merged;
}

/**
 * Filter products array according to category and search query.
 */
function applyFilters(products: Product[], options: ProductFilterOptions): Product[] {
  return products.filter((p) => {
    if (
      options.category &&
      options.category !== 'All' &&
      options.category !== 'All Formulations' &&
      options.category !== 'all'
    ) {
      if (p.category !== options.category) return false;
    }

    if (options.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSubtitle =
        p.subtitle.toLowerCase().includes(q) ||
        (p.arabicSubtitle && p.arabicSubtitle.includes(q));
      const matchTagline = Boolean(p.tagline && p.tagline.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchSubtitle && !matchTagline) return false;
    }

    return true;
  });
}

interface CachedProductsEntry {
  docs: any[];
  timestamp: number;
}

let productsMemoryCache: CachedProductsEntry | null = null;
let inFlightProductsQuery: Promise<any[]> | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds burst coalescing cache

/**
 * Invalidates the read cache immediately upon any write/mutation operation.
 */
export function invalidateProductsCache(): void {
  productsMemoryCache = null;
  inFlightProductsQuery = null;
}

/**
 * Loads products from MongoDB, falling back to static defaults if MongoDB is unavailable or empty.
 */
export async function loadProductsFromDb(
  options: ProductFilterOptions = {},
  customDb?: Db
): Promise<LoadedProductsResult> {
  const locale = options.locale || 'en';

  if (!isMongoConfigured() && !customDb) {
    const defaults = memoryStore.getProducts(locale);
    return {
      products: applyFilters(defaults, options),
      source: 'default',
    };
  }

  const isTest =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));

  try {
    let docs: any[];

    // Fast path: serve from active memory burst cache if within TTL (outside unit tests)
    if (
      !customDb &&
      !isTest &&
      productsMemoryCache &&
      Date.now() - productsMemoryCache.timestamp < CACHE_TTL_MS
    ) {
      docs = productsMemoryCache.docs;
    } else if (!customDb && !isTest && inFlightProductsQuery) {
      // Coalesce concurrent burst requests into the active in-flight database query
      docs = await inFlightProductsQuery;
    } else {
      const db = customDb ?? (await getMongoDb());
      const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);

      const queryPromise = col.find({}).toArray();
      if (!customDb && !isTest) {
        inFlightProductsQuery = queryPromise;
      }

      try {
        docs = await queryPromise;
        if (!customDb && !isTest) {
          productsMemoryCache = { docs, timestamp: Date.now() };
        }
      } finally {
        if (!customDb && !isTest) {
          inFlightProductsQuery = null;
        }
      }
    }

    if (!docs || docs.length === 0) {
      const defaults = memoryStore.getProducts(locale);
      return {
        products: applyFilters(defaults, options),
        source: 'default',
      };
    }

    const resolved = docs.map((d) =>
      resolveProductWithFallback(d as unknown as Partial<Product>, locale)
    );
    return {
      products: applyFilters(resolved, options),
      source: 'mongodb',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[product-repository] MongoDB read failed (${msg}); serving static defaults.`);
    const defaults = memoryStore.getProducts(locale);
    return {
      products: applyFilters(defaults, options),
      source: 'default',
      warning: `MongoDB read failed (${msg}); serving static defaults.`,
    };
  }
}

/**
 * Loads a single product by slug from MongoDB, falling back to static defaults.
 */
export async function loadProductBySlugFromDb(
  slug: string,
  locale: 'en' | 'ar' = 'en',
  customDb?: Db
): Promise<LoadedProductResult> {
  if (typeof slug !== 'string' || !slug.trim()) {
    return { product: undefined, source: 'default' };
  }
  const safeSlug = String(slug).trim().toLowerCase();

  if (!isMongoConfigured() && !customDb) {
    const defaultProduct = memoryStore.getProductBySlug(safeSlug, locale);
    return { product: defaultProduct, source: 'default' };
  }

  try {
    const db = customDb ?? (await getMongoDb());
    const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);
    const doc = await col.findOne({ slug: safeSlug });

    if (!doc) {
      const defaultProduct = memoryStore.getProductBySlug(safeSlug, locale);
      return { product: defaultProduct, source: 'default' };
    }

    const resolved = resolveProductWithFallback(doc as unknown as Partial<Product>, locale);
    return { product: resolved, source: 'mongodb' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[product-repository] MongoDB read by slug '${safeSlug}' failed (${msg}); serving static defaults.`);
    const defaultProduct = memoryStore.getProductBySlug(safeSlug, locale);
    return {
      product: defaultProduct,
      source: 'default',
      warning: `MongoDB read failed (${msg}); serving static defaults.`,
    };
  }
}

/**
 * Persists a new product to MongoDB with strict validation and write acknowledgment.
 */
export async function saveProductToDb(
  db: Db,
  input: CreateProductInput | Product,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; product: Product }> {
  let productToSave: Product;

  if ('brandLine' in input && 'packSizes' in input) {
    productToSave = input as Product;
  } else {
    const validated = CreateProductMutationSchema.parse(input);
    const candidateSlug = slugify(validated.name);

    productToSave = {
      id: validated.id || `prod-${Date.now()}`,
      slug: candidateSlug,
      name: validated.name,
      brandLine: validated.brandLine || 'Mirage Pharma',
      category: validated.category as any,
      subtitle: validated.subtitle || 'Clinical Formulation',
      arabicSubtitle: validated.arabicSubtitle || 'مكمل غذائي معتمد',
      tagline: validated.tagline || `${validated.name} — High Purity Formulation`,
      description: validated.description,
      priceInfo: validated.priceInfo || 'Price upon medical inquiry',
      packagingDetails: validated.packagingDetails || '30 capsules per container',
      packSizes:
        validated.packSizes && validated.packSizes.length > 0
          ? (validated.packSizes as PackSize[])
          : [{ quantity: 30, unit: 'capsules', inStock: true }],
      heroImage: validated.heroImage || '/brand/products/folate-b12.jpg',
      dosageInstructions:
        validated.dosageInstructions || 'As directed by a licensed physician.',
      rawMaterials: [],
      clinicalEvidences: [],
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
    };
  }

  const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  const existing = await col.findOne({
    $or: [{ id: productToSave.id }, { slug: productToSave.slug }],
  });

  if (existing) {
    throw new ProductPersistenceError(
      'DUPLICATE_PRODUCT',
      `Product with SKU '${productToSave.id}' or slug '${productToSave.slug}' already exists.`
    );
  }

  const now = new Date().toISOString();
  const doc = {
    ...productToSave,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.userId,
  };

  const res = await col.insertOne(doc);
  if (!res.acknowledged) {
    throw new ProductPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge formulation insertion.'
    );
  }

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'CREATE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: productToSave.id,
    beforePayload: null,
    afterPayload: productToSave as unknown as Record<string, any>,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.addProduct(productToSave);
  } catch {
    // Already in memory store
  }

  invalidateProductsCache();
  return { ok: true, product: productToSave };
}

/**
 * Updates an existing product in MongoDB with write acknowledgment.
 */
export async function updateProductInDb(
  db: Db,
  id: string,
  updates: Partial<Product>,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; product: Product }> {
  const safeId = String(id).trim();
  const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  const existing = await col.findOne({ id: safeId });

  if (!existing) {
    throw new ProductPersistenceError(
      'PRODUCT_NOT_FOUND',
      `Product with ID '${safeId}' not found.`
    );
  }

  const now = new Date().toISOString();
  const cleanUpdates = {
    ...updates,
    updatedAt: now,
    updatedBy: actor.userId,
  };

  const res = await col.updateOne({ id: safeId }, { $set: cleanUpdates });
  if (!res.acknowledged) {
    throw new ProductPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge formulation update.'
    );
  }

  const updatedDoc = await col.findOne({ id: safeId });
  const resolved = resolveProductWithFallback(
    updatedDoc as unknown as Partial<Product>,
    'en'
  );

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'UPDATE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: safeId,
    beforePayload: existing as unknown as Record<string, any>,
    afterPayload: resolved as unknown as Record<string, any>,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.updateProduct(safeId, updates);
  } catch {
    // If not found in memoryStore
  }

  invalidateProductsCache();
  return { ok: true, product: resolved };
}

/**
 * Toggles or updates pack size availability in MongoDB with write acknowledgment.
 */
export async function togglePackStockInDb(
  db: Db,
  productId: string,
  packIndex: number,
  inStock?: boolean,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; product: Product }> {
  const safeId = String(productId).trim();
  const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  const existing = await col.findOne({ id: safeId });

  if (!existing) {
    throw new ProductPersistenceError(
      'PRODUCT_NOT_FOUND',
      `Product with ID '${safeId}' not found.`
    );
  }

  const currentPacks: PackSize[] = Array.isArray(existing.packSizes)
    ? [...existing.packSizes]
    : [];

  if (packIndex < 0 || packIndex >= currentPacks.length) {
    throw new ProductPersistenceError(
      'INVALID_PACK_INDEX',
      `Pack index ${packIndex} is out of bounds (0..${currentPacks.length - 1}).`
    );
  }

  const targetPack = currentPacks[packIndex];
  if (!targetPack) {
    throw new ProductPersistenceError(
      'INVALID_PACK_INDEX',
      `Pack index ${packIndex} is out of bounds.`
    );
  }

  const nextInStock = inStock !== undefined ? inStock : !targetPack.inStock;
  currentPacks[packIndex] = {
    quantity: targetPack.quantity,
    unit: targetPack.unit,
    inStock: nextInStock,
  };

  const now = new Date().toISOString();
  const res = await col.updateOne(
    { id: safeId },
    { $set: { packSizes: currentPacks, updatedAt: now, updatedBy: actor.userId } }
  );

  if (!res.acknowledged) {
    throw new ProductPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge pack stock update.'
    );
  }

  const updatedDoc = await col.findOne({ id: safeId });
  const resolved = resolveProductWithFallback(
    updatedDoc as unknown as Partial<Product>,
    'en'
  );

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'TOGGLE_PACK_STOCK',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: safeId,
    beforePayload: existing as unknown as Record<string, any>,
    afterPayload: resolved as unknown as Record<string, any>,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.togglePackStock(safeId, packIndex, inStock);
  } catch {
    // If not found in memoryStore
  }

  invalidateProductsCache();
  return { ok: true, product: resolved };
}

/**
 * Deletes a product from MongoDB with write acknowledgment.
 */
export async function deleteProductFromDb(
  db: Db,
  id: string,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<{ ok: true; deleted: boolean }> {
  const safeId = String(id).trim();
  const col = db.collection(MONGO_COLLECTIONS.PRODUCTS);
  const existing = await col.findOne({ id: safeId });

  if (!existing) {
    return { ok: true, deleted: false };
  }

  const res = await col.deleteOne({ id: safeId });
  if (!res.acknowledged) {
    throw new ProductPersistenceError(
      'WRITE_FAILED',
      'MongoDB did not acknowledge formulation deletion.'
    );
  }

  // 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'DELETE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: safeId,
    beforePayload: existing as unknown as Record<string, any>,
    afterPayload: null,
  });

  // Keep in-memory store in lockstep
  try {
    memoryStore.deleteProduct(safeId);
  } catch {
    // If not found in memoryStore
  }

  invalidateProductsCache();
  return { ok: true, deleted: true };
}

// -----------------------------------------------------------------------------
// Auto-connecting wrappers that resolve the default MongoDb instance
// -----------------------------------------------------------------------------

function assertCanMutateWithoutMongo(): void {
  const isTestEnv =
    typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));

  if (!isTestEnv) {
    throw new ProductPersistenceError(
      'DB_UNAVAILABLE',
      'MongoDB is not configured. Writes cannot be silently saved to in-memory fallback outside test environments.'
    );
  }
}

export async function saveProduct(
  input: CreateProductInput | Product,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; product: Product }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return saveProductToDb(db, input, actor);
  }
  assertCanMutateWithoutMongo();
  const created = memoryStore.addProduct(
    'brandLine' in input && 'packSizes' in input
      ? (input as Product)
      : resolveProductWithFallback(input as Partial<Product>, 'en')
  );
  await recordAuditLog({
    action: 'CREATE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: created.id,
    beforePayload: null,
    afterPayload: created as unknown as Record<string, any>,
  });
  return { ok: true, product: created };
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; product: Product }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return updateProductInDb(db, id, updates, actor);
  }
  assertCanMutateWithoutMongo();
  const updated = memoryStore.updateProduct(id, updates);
  await recordAuditLog({
    action: 'UPDATE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: id,
    beforePayload: null,
    afterPayload: updated as unknown as Record<string, any>,
  });
  return { ok: true, product: updated };
}

export async function togglePackStock(
  productId: string,
  packIndex: number,
  inStock?: boolean,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; product: Product }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return togglePackStockInDb(db, productId, packIndex, inStock, actor);
  }
  assertCanMutateWithoutMongo();
  const updated = memoryStore.togglePackStock(productId, packIndex, inStock);
  await recordAuditLog({
    action: 'TOGGLE_PACK_STOCK',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: productId,
    beforePayload: null,
    afterPayload: updated as unknown as Record<string, any>,
  });
  return { ok: true, product: updated };
}

export async function deleteProduct(
  id: string,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' },
  customDb?: Db
): Promise<{ ok: true; deleted: boolean }> {
  if (customDb || isMongoConfigured()) {
    const db = customDb ?? (await getMongoDb());
    return deleteProductFromDb(db, id, actor);
  }
  assertCanMutateWithoutMongo();
  const deleted = memoryStore.deleteProduct(id);
  if (deleted) {
    await recordAuditLog({
      action: 'DELETE_FORMULATION',
      actorId: actor.userId,
      actorRole: actor.role,
      entityType: 'PRODUCT',
      entityId: id,
      beforePayload: null,
      afterPayload: null,
    });
  }
  return { ok: true, deleted };
}
