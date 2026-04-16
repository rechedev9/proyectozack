import { notFound } from 'next/navigation';
import { getStatsRollupByToken } from '@/lib/queries/stats';
import { StatsView } from '@/components/stats/StatsView';
import type { Metadata } from 'next';
import type { ReactElement } from 'react';

type Props = {
  readonly params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default async function StatsSharePage({ params }: Props): Promise<ReactElement> {
  const { token } = await params;
  const rollup = await getStatsRollupByToken(token);

  if (!rollup) notFound();

  return (
    <div className="min-h-screen bg-sp-admin-bg p-6 md:p-10">
      <StatsView data={rollup} title="SocialPro Stats" />
    </div>
  );
}
