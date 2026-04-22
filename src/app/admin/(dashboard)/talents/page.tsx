import { getAdminRosterWithGrowth } from '@/lib/queries/talents';
import { listAllVerticals } from '@/lib/queries/talentBusiness';
import { RosterSpreadsheet } from '@/components/admin/talents/RosterSpreadsheet';
import type { TalentVertical } from '@/types';

export default async function AdminTalentsPage(): Promise<React.ReactElement> {
  const [creators, verticals] = await Promise.all([
    getAdminRosterWithGrowth(),
    listAllVerticals(),
  ]);

  const platformSet = new Set<string>();
  for (const c of creators)
    for (const s of c.socials) platformSet.add(s.platform);

  const verticalsByTalent: Record<number, TalentVertical[]> = {};
  for (const v of verticals) {
    const list = verticalsByTalent[v.talentId] ?? [];
    list.push(v.vertical);
    verticalsByTalent[v.talentId] = list;
  }

  return (
    <div>
      {/* Compact header */}
      <div className="flex items-baseline gap-4 mb-6">
        <h1 className="font-display text-3xl font-black uppercase text-sp-admin-text">Roster</h1>
        <span className="text-xs text-sp-admin-muted tabular-nums">
          {creators.length} creadores · {platformSet.size} plataformas
        </span>
      </div>

      <RosterSpreadsheet creators={creators} verticalsByTalent={verticalsByTalent} />
    </div>
  );
}
