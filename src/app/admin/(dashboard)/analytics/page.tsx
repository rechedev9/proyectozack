import { getSnapshots, countTrackedTalents } from '@/lib/queries/analytics';
import { getTalents } from '@/lib/queries/talents';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export default async function AdminAnalyticsPage() {
  // Fetch last 90 days of data (client can filter further)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const from = ninetyDaysAgo.toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];

  const [snapshots, allTalents, trackedCount] = await Promise.all([
    getSnapshots({ from, to }),
    getTalents(),
    countTrackedTalents(),
  ]);

  const talentList = allTalents.map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  return (
    <AnalyticsDashboard
      snapshots={snapshots}
      talents={talentList}
      trackedCount={trackedCount}
    />
  );
}
