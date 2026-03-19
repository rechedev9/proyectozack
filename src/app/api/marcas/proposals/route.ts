import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { talentProposals, talents } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { proposalSchema } from '@/lib/schemas/proposal';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string | null }).role;
  if (userRole !== 'brand') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = proposalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  const data = parsed.data;

  // Verify talent exists
  const talent = await db.select({ id: talents.id }).from(talents).where(eq(talents.id, data.talentId));
  if (talent.length === 0) {
    return NextResponse.json({ error: 'Talent not found' }, { status: 400 });
  }

  // Check for duplicate proposal (application-level check for UX)
  const existing = await db
    .select({ id: talentProposals.id })
    .from(talentProposals)
    .where(
      and(
        eq(talentProposals.brandUserId, session.user.id),
        eq(talentProposals.talentId, data.talentId),
        eq(talentProposals.status, 'pendiente'),
      ),
    );
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Ya tienes una propuesta pendiente para este talento' }, { status: 409 });
  }

  // Insert with try/catch to handle race condition (concurrent duplicate)
  try {
    await db.insert(talentProposals).values({
      brandUserId: session.user.id,
      talentId: data.talentId,
      campaignType: data.campaignType,
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      message: data.message,
    });
  } catch (err) {
    // If concurrent request already inserted, return 409 instead of 500
    const message = err instanceof Error ? err.message : '';
    if (message.includes('unique') || message.includes('duplicate')) {
      return NextResponse.json({ error: 'Ya tienes una propuesta pendiente para este talento' }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
