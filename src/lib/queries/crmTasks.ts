import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { crmTasks, user } from '@/db/schema';
import type { CrmTask, NewCrmTask, CrmTaskStatus, TeamTasksSummary } from '@/types';

type UpdatableFields = Pick<CrmTask, 'title' | 'description' | 'dueDate' | 'priority' | 'status' | 'category'>;

const PRIORITY_ORDER = sql`CASE ${crmTasks.priority}
  WHEN 'alta' THEN 0
  WHEN 'media' THEN 1
  WHEN 'baja' THEN 2
END`;

export async function getTasksForWeek(weekLabel: string): Promise<readonly CrmTask[]> {
  return db
    .select()
    .from(crmTasks)
    .where(eq(crmTasks.weekLabel, weekLabel))
    .orderBy(asc(PRIORITY_ORDER), asc(crmTasks.dueDate), desc(crmTasks.createdAt));
}

export async function getMyTasks(ownerId: string, weekLabel: string): Promise<readonly CrmTask[]> {
  return db
    .select()
    .from(crmTasks)
    .where(and(eq(crmTasks.ownerId, ownerId), eq(crmTasks.weekLabel, weekLabel)))
    .orderBy(asc(PRIORITY_ORDER), asc(crmTasks.dueDate), desc(crmTasks.createdAt));
}

export async function getTeamTasksSummary(weekLabel: string): Promise<readonly TeamTasksSummary[]> {
  // Today in Madrid-civil date for the overdue comparison — due_date is a DATE.
  const todayMadrid = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      completed: sql<number>`COALESCE(SUM(CASE WHEN ${crmTasks.weekLabel} = ${weekLabel} AND ${crmTasks.status} = 'completada' THEN 1 ELSE 0 END), 0)::int`,
      pending: sql<number>`COALESCE(SUM(CASE WHEN ${crmTasks.weekLabel} = ${weekLabel} AND ${crmTasks.status} IN ('pendiente','en_progreso') THEN 1 ELSE 0 END), 0)::int`,
      overdue: sql<number>`COALESCE(SUM(CASE WHEN ${crmTasks.weekLabel} = ${weekLabel} AND ${crmTasks.status} IN ('pendiente','en_progreso') AND ${crmTasks.dueDate} IS NOT NULL AND ${crmTasks.dueDate} < ${todayMadrid}::date THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(user)
    .leftJoin(crmTasks, eq(crmTasks.ownerId, user.id))
    .where(inArray(user.role, ['admin', 'staff']))
    .groupBy(user.id, user.name, user.email, user.role)
    .orderBy(asc(user.name));

  return rows;
}

export async function getUsedCategories(): Promise<readonly string[]> {
  const rows = await db
    .select({
      category: crmTasks.category,
      uses: sql<number>`count(*)::int`,
    })
    .from(crmTasks)
    .groupBy(crmTasks.category)
    .orderBy(desc(sql`count(*)`));
  return rows.map((r) => r.category);
}

export async function createTask(
  input: Omit<NewCrmTask, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'rolledOver' | 'rolledFromWeek'>,
): Promise<CrmTask> {
  const [row] = await db.insert(crmTasks).values(input).returning();
  return row!;
}

export async function updateTask(id: number, patch: Partial<UpdatableFields>): Promise<CrmTask> {
  const completedAt = patch.status === 'completada' ? { completedAt: new Date() } : {};
  const [row] = await db
    .update(crmTasks)
    .set({ ...patch, ...completedAt, updatedAt: new Date() })
    .where(eq(crmTasks.id, id))
    .returning();
  return row!;
}

export async function completeTask(id: number): Promise<CrmTask> {
  const [row] = await db
    .update(crmTasks)
    .set({ status: 'completada', completedAt: new Date(), updatedAt: new Date() })
    .where(eq(crmTasks.id, id))
    .returning();
  return row!;
}

export async function deleteTask(id: number): Promise<void> {
  await db.delete(crmTasks).where(eq(crmTasks.id, id));
}

/**
 * Moves every pending/in_progress task from `fromWeek` into `toWeek`, stamping
 * `rolled_over=true` and `rolled_from_week=fromWeek`. Idempotent across the
 * same week pair: a second run has no rows to match.
 */
export async function rollOverPendingTasks(
  fromWeek: string,
  toWeek: string,
): Promise<{ readonly rolled: number }> {
  const rolled = await db
    .update(crmTasks)
    .set({
      weekLabel: toWeek,
      rolledOver: true,
      rolledFromWeek: fromWeek,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(crmTasks.weekLabel, fromWeek),
        inArray(crmTasks.status, ['pendiente', 'en_progreso'] as const satisfies readonly CrmTaskStatus[]),
      ),
    )
    .returning({ id: crmTasks.id });

  return { rolled: rolled.length };
}

export async function getRolledOverCount(ownerId: string, weekLabel: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(crmTasks)
    .where(
      and(
        eq(crmTasks.ownerId, ownerId),
        eq(crmTasks.weekLabel, weekLabel),
        eq(crmTasks.rolledOver, true),
      ),
    );
  return row?.count ?? 0;
}
