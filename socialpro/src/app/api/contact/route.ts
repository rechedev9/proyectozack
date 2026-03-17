import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contactSubmissions } from '@/db/schema';
import { sendContactEmail } from '@/lib/email';
import { contactBodySchema } from '@/lib/schemas/contact';

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

  // Save to DB
  await db.insert(contactSubmissions).values({
    name: data.name,
    email: data.email,
    type: data.type,
    company: data.company,
    message: data.message,
  });

  // Send email (failure doesn't affect 200 response)
  try {
    await sendContactEmail(data);
  } catch (err) {
    console.error('[contact] Resend error:', err);
  }

  return NextResponse.json({ success: true });
}
