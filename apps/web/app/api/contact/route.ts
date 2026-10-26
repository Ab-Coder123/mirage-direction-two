import { NextResponse } from 'next/server';
import { submitB2BLead, LeadPersistenceError } from '@mirage/db/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ ok: false, error: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request payload: expected JSON body' },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Full Name is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { ok: false, error: 'Valid Email Address is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Inquiry details / message is required' },
        { status: 400 }
      );
    }

    // Extract client IP for abuse and duplicate rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0]?.trim() : realIp) || undefined;

    const leadInput = {
      company_name: `${name.trim()} (${(subject || 'General Inquiry').trim()})`,
      contact_name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : undefined,
      partnership_archetype: 'Hospital Network',
      message: message.trim(),
    };

    const result = await submitB2BLead(leadInput, clientIp);

    // Return non-sensitive confirmation ID to anonymous client
    return NextResponse.json(
      { ok: true, leadId: result.lead.id },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof LeadPersistenceError) {
      if (err.code === 'DUPLICATE_SUBMISSION') {
        return NextResponse.json(
          { ok: false, code: err.code, error: err.message },
          { status: 409 }
        );
      }
      if (err.code === 'RATE_LIMITED') {
        return NextResponse.json(
          { ok: false, code: err.code, error: err.message },
          { status: 429 }
        );
      }
      if (err.code === 'VALIDATION_FAILED') {
        return NextResponse.json(
          { ok: false, code: err.code, error: err.message },
          { status: 400 }
        );
      }
      if (err.code === 'DB_UNAVAILABLE' || err.code === 'WRITE_FAILED') {
        return NextResponse.json(
          { ok: false, code: err.code, error: err.message },
          { status: 503 }
        );
      }
    }

    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error('[contact-api] Submission failure:', errorDetails);
    return NextResponse.json(
      {
        ok: false,
        error: errorDetails.includes('MongoDB')
          ? errorDetails
          : 'Internal service error while processing inquiry. Please try again later.',
      },
      { status: 500 }
    );
  }
}
