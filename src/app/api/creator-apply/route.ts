import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { creatorApplications } from '@/db/schema';

const creatorApplySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  platform: z.string().min(1).max(50),
  handle: z.string().min(1).max(100),
  followers: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = creatorApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 });
  }

  await db.insert(creatorApplications).values(parsed.data);

  return NextResponse.json({ success: true });
}
