import { db } from '@/lib/db';
import { brands, collaborators, teamMembers } from '@/db/schema';
import type {
  Brand,
  Collaborator,
  TeamMember,
} from '@/types';

export async function getBrands(): Promise<Brand[]> {
  return db.query.brands.findMany({
    orderBy: (b, { asc }) => [asc(b.sortOrder)],
  });
}

export async function getCollaborators(): Promise<Collaborator[]> {
  return db.query.collaborators.findMany({
    orderBy: (c, { asc }) => [asc(c.sortOrder)],
  });
}

export async function getTeam(): Promise<TeamMember[]> {
  return db.query.teamMembers.findMany({
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
}

// Re-export for convenience
export { brands, collaborators, teamMembers };
