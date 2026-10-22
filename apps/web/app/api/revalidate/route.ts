import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation handler for apps/web.
 * Allows the Admin dashboard (or webhook) to trigger instant cache revalidation
 * of public pages without restarting the server.
 */
export function GET() {
  return NextResponse.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const secret =
      request.headers.get('x-revalidate-secret') ||
      request.headers.get('x-revalidation-secret') ||
      body.secret;
    const expectedSecret = process.env.REVALIDATION_SECRET;

    // Fail closed: enforce secret authorization
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized revalidation request' }, { status: 401 });
    }

    const paths: string[] = Array.isArray(body.paths) && body.paths.length > 0 ? body.paths : ['/', '/ar'];

    for (const p of paths) {
      if (typeof p === 'string' && p.startsWith('/')) {
        revalidatePath(p);
      }
    }

    return NextResponse.json({
      ok: true,
      revalidated: paths,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
