import { NextResponse } from 'next/server';
import { loadProductsFromDb } from '@mirage/db/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') as 'en' | 'ar') || 'en';
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await loadProductsFromDb({ locale, category, search });
    return NextResponse.json({
      ok: true,
      products: result.products,
      source: result.source,
      warning: result.warning,
    });
  } catch (err: any) {
    console.error('[products-api] Query failure:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { ok: false, error: 'Failed to load products' },
      { status: 500 }
    );
  }
}
