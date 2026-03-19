import { db } from '../src/lib/db';
import { caseCreators, talents } from '../src/db/schema';
import { eq, isNull } from 'drizzle-orm';

async function backfill(): Promise<void> {
  const allCreators = await db.select().from(caseCreators).where(isNull(caseCreators.talentId));
  const allTalents = await db.select({ id: talents.id, name: talents.name }).from(talents);

  const nameToId = new Map(allTalents.map((t) => [t.name.toUpperCase(), t.id]));

  let updated = 0;
  for (const creator of allCreators) {
    const talentId = nameToId.get(creator.creatorName.toUpperCase());
    if (talentId) {
      await db.update(caseCreators).set({ talentId }).where(eq(caseCreators.id, creator.id));
      updated++;
      console.log(`  Linked "${creator.creatorName}" → talent_id=${talentId}`);
    } else {
      console.log(`  No match for "${creator.creatorName}"`);
    }
  }
  console.log(`Done. Updated ${updated}/${allCreators.length} rows.`);
  process.exit(0);
}

backfill();
