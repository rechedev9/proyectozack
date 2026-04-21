import { NextRequest, NextResponse } from 'next/server';
import { rollOverPendingTasks } from '@/lib/queries/crmTasks';
import { getIsoWeekLabel, previousWeek } from '@/lib/week';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const curr = getIsoWeekLabel(new Date());
  const prev = previousWeek(curr);

  try {
    const { rolled } = await rollOverPendingTasks(prev, curr);
    return NextResponse.json({ success: true, rolled, from: prev, to: curr });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('rollover-tasks error:', msg);
    return NextResponse.json({ success: false, error: msg, from: prev, to: curr }, { status: 500 });
  }
}
