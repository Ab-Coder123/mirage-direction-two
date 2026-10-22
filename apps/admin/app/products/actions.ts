'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  loadProductsFromDb,
  saveProduct,
  updateProduct,
  togglePackStock,
  deleteProduct,
  requireAdminSession,
  ADMIN_SESSION_COOKIE_NAME,
} from '@mirage/db/server';

async function getSessionTokenFromRequest(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  } catch {
    return undefined;
  }
}

async function notifyWebRevalidation(paths: string[]) {
  const webBaseUrl =
    process.env.WEB_APP_URL ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    'http://localhost:3000';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    await fetch(`${webBaseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.REVALIDATION_SECRET
          ? {
              'x-revalidation-secret': process.env.REVALIDATION_SECRET,
              'x-revalidate-secret': process.env.REVALIDATION_SECRET,
            }
          : {}),
      },
      body: JSON.stringify({ paths }),
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timeout);
  } catch {
    // web app may be offline in dev/test
  }
}

function safeRevalidatePaths(paths: string[]) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      // Ignore outside Next.js HTTP request scope (e.g., Vitest runner)
    }
  }
}

export async function getProductsAction(filter: {
  locale?: 'en' | 'ar';
  category?: string;
  search?: string;
} = {}) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('products:read', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const { products, source, warning } = await loadProductsFromDb(filter);
    return { ok: true as const, products, source, warning };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to fetch products',
    };
  }
}

export async function createProductAction(input: any) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('products:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await saveProduct(input, {
      userId: auth.session.sub,
      role: auth.session.role,
    });
    const created = result.product;

    const paths = [
      '/products',
      '/ar/products',
      `/products/${created.slug}`,
      `/ar/products/${created.slug}`,
    ];
    safeRevalidatePaths(paths);
    await notifyWebRevalidation(paths);

    return { ok: true as const, product: created };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to create formulation',
    };
  }
}

export async function togglePackStockAction(
  productId: string,
  packIndex: number,
  inStock?: boolean
) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('products:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await togglePackStock(productId, packIndex, inStock, {
      userId: auth.session.sub,
      role: auth.session.role,
    });
    const updated = result.product;

    const paths = [
      '/products',
      '/ar/products',
      `/products/${updated.slug}`,
      `/ar/products/${updated.slug}`,
    ];
    safeRevalidatePaths(paths);
    await notifyWebRevalidation(paths);

    return { ok: true as const, product: updated };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to toggle pack stock',
    };
  }
}

export async function updateProductAction(productId: string, updates: any) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('products:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await updateProduct(productId, updates, {
      userId: auth.session.sub,
      role: auth.session.role,
    });
    const updated = result.product;

    const paths = [
      '/products',
      '/ar/products',
      `/products/${updated.slug}`,
      `/ar/products/${updated.slug}`,
    ];
    safeRevalidatePaths(paths);
    await notifyWebRevalidation(paths);

    return { ok: true as const, product: updated };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to update formulation',
    };
  }
}

export async function deleteProductAction(productId: string) {
  const sessionToken = await getSessionTokenFromRequest();
  const auth = await requireAdminSession('products:write', { sessionToken });
  if (!auth.ok) {
    return { ok: false as const, code: auth.code, error: auth.error };
  }

  try {
    const result = await deleteProduct(productId, {
      userId: auth.session.sub,
      role: auth.session.role,
    });

    const paths = ['/products', '/ar/products'];
    safeRevalidatePaths(paths);
    await notifyWebRevalidation(paths);

    return { ok: true as const, deleted: result.deleted };
  } catch (err: any) {
    return {
      ok: false as const,
      error: err?.message || 'Failed to delete formulation',
    };
  }
}
