import { slugify, validateNewSlug } from '@mirage/utils';
import type { Product } from '@mirage/types';
import { Category, CreateProductInput, CreateProductMutationSchema } from '../schema';
import { memoryStore } from './memory-store';
import { recordAuditLog } from './audit';
import { getSupabaseClient, isSupabaseConfigured } from '../client';

export interface GetProductsFilter {
  category?: string;
  locale?: 'en' | 'ar';
  search?: string;
}

export interface ActorContext {
  userId: string;
  role: string;
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data as Category[];
    }
  }
  return memoryStore.getCategories();
}

export async function getProducts(filter: GetProductsFilter = {}): Promise<Product[]> {
  const locale = filter.locale || 'en';
  const products = memoryStore.getProducts(locale);

  return products.filter((p) => {
    if (filter.category && filter.category !== 'All' && filter.category !== 'All Formulations') {
      if (p.category !== filter.category) return false;
    }
    if (filter.search && filter.search.trim().length > 0) {
      const q = filter.search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSubtitle = p.subtitle.toLowerCase().includes(q) || (p.arabicSubtitle && p.arabicSubtitle.includes(q));
      const matchTagline = Boolean(p.tagline && p.tagline.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchSubtitle && !matchTagline) return false;
    }
    return true;
  });
}

export async function getProductBySlug(slug: string, locale: 'en' | 'ar' = 'en'): Promise<Product | undefined> {
  return memoryStore.getProductBySlug(slug, locale);
}

export async function createProduct(
  input: CreateProductInput | Product,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<Product> {
  const existingProducts = memoryStore.getProducts();
  const existingSlugs = existingProducts.map((p) => p.slug);

  let productToSave: Product;

  if ('brandLine' in input && 'clinicalIndications' in input) {
    // Already full Product entity
    productToSave = input as Product;
  } else {
    const validated = CreateProductMutationSchema.parse(input);
    const candidateSlug = slugify(validated.name);
    const validation = validateNewSlug(candidateSlug, existingSlugs);
    if (!validation.ok) {
      throw new Error(validation.message);
    }

    productToSave = {
      id: validated.id || `prod-${Date.now()}`,
      slug: candidateSlug,
      name: validated.name,
      brandLine: validated.brandLine || 'Mirage Pharma',
      category: validated.category as any,
      subtitle: validated.subtitle || 'Clinical Formulation',
      arabicSubtitle: validated.arabicSubtitle || 'مكمل غذائي سريري',
      tagline: validated.tagline || `${validated.name} — High Purity Formulation`,
      description: validated.description,
      priceInfo: validated.priceInfo || 'Price upon medical inquiry',
      packagingDetails: validated.packagingDetails || '30 capsules per container',
      packSizes: validated.packSizes && validated.packSizes.length > 0
        ? validated.packSizes
        : [{ quantity: 30, unit: 'capsules', inStock: true }],
      heroImage: validated.heroImage || '/brand/products/folate-b12.jpg',
      dosageInstructions: validated.dosageInstructions || 'As directed by a licensed physician.',
      rawMaterials: [],
      clinicalEvidences: [],
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
    };
  }

  // Persist to memory store
  const created = memoryStore.addProduct(productToSave);

  // If Supabase is configured, also persist to Supabase Postgres
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('products').insert([
        {
          id: created.id,
          slug: created.slug,
          name: created.name,
          category_id: created.category,
          indication: created.description,
          status: 'published',
          in_stock: created.packSizes.some((p) => p.inStock),
        },
      ]);
    }
  }

  // Record 21 CFR Part 11 Audit Trail
  await recordAuditLog({
    action: 'CREATE_FORMULATION',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: created.id,
    beforePayload: null,
    afterPayload: created as unknown as Record<string, any>,
  });

  return created;
}

export async function togglePackStock(
  productId: string,
  packIndex: number,
  inStock?: boolean,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<Product> {
  const current = memoryStore.getProductById(productId);
  if (!current) {
    throw new Error(`Product '${productId}' not found`);
  }

  const beforePayload = JSON.parse(JSON.stringify(current));
  const updated = memoryStore.togglePackStock(productId, packIndex, inStock);

  await recordAuditLog({
    action: 'TOGGLE_PACK_STOCK',
    actorId: actor.userId,
    actorRole: actor.role,
    entityType: 'PRODUCT',
    entityId: productId,
    beforePayload,
    afterPayload: updated as unknown as Record<string, any>,
  });

  return updated;
}

export async function deleteProduct(
  id: string,
  actor: ActorContext = { userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }
): Promise<boolean> {
  const current = memoryStore.getProductById(id);
  if (!current) return false;

  const deleted = memoryStore.deleteProduct(id);

  if (deleted) {
    await recordAuditLog({
      action: 'DELETE_FORMULATION',
      actorId: actor.userId,
      actorRole: actor.role,
      entityType: 'PRODUCT',
      entityId: id,
      beforePayload: current as unknown as Record<string, any>,
      afterPayload: null,
    });
  }

  return deleted;
}
