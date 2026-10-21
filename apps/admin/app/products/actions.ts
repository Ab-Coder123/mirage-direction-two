'use server';

import { revalidatePath } from 'next/cache';
import {
  getProducts as dbGetProducts,
  createProduct as dbCreateProduct,
  togglePackStock as dbTogglePackStock,
  deleteProduct as dbDeleteProduct,
} from '@mirage/db';

export async function getProductsAction(filter = {}) {
  try {
    const products = await dbGetProducts(filter);
    return { ok: true, products };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to fetch products' };
  }
}

export async function createProductAction(input: any) {
  try {
    const created = await dbCreateProduct(input, {
      userId: 'USR-ADMIN',
      role: 'SUPER_ADMIN',
    });

    // On-demand Next.js cache revalidation across both admin and web
    revalidatePath('/products');
    revalidatePath('/ar/products');
    revalidatePath(`/products/${created.slug}`);

    return { ok: true, product: created };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to create formulation' };
  }
}

export async function togglePackStockAction(productId: string, packIndex: number, inStock?: boolean) {
  try {
    const updated = await dbTogglePackStock(productId, packIndex, inStock, {
      userId: 'USR-ADMIN',
      role: 'SUPER_ADMIN',
    });

    revalidatePath('/products');
    revalidatePath('/ar/products');
    revalidatePath(`/products/${updated.slug}`);

    return { ok: true, product: updated };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to toggle pack stock' };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const deleted = await dbDeleteProduct(productId, {
      userId: 'USR-ADMIN',
      role: 'SUPER_ADMIN',
    });

    revalidatePath('/products');
    revalidatePath('/ar/products');

    return { ok: true, deleted };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Failed to delete formulation' };
  }
}
