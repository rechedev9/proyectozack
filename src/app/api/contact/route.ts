import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/db/schema';
import { sendContactEmail } from '@/lib/email';
import { contactBodySchema } from '@/lib/schemas/contact';

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  // Hash client IP for audit trail (never store raw IP)
  const rawIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '127.0.0.1';
  const ipHash = await hashIp(rawIp);

  // Save to DB
  await db.insert(contactSubmissions).values({
    name: data.name,
    email: data.email,
    phone: data.phone,
    type: data.type,
    company: data.company,
    message: data.message,
    budget: data.budget,
    timeline: data.timeline,
    audience: data.audience,
    platform: data.platform,
    viewers: data.viewers,
    monetization: data.monetization,
    ipHash,
  });

  // Send email (failure doesn't affect 200 response)
  try {
    await sendContactEmail(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[contact] Resend error:', msg);
  }

  return NextResponse.json({ success: true });
}
