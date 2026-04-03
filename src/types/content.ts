import type { InferSelectModel } from 'drizzle-orm';
import type {
  collaborators,
  teamMembers,
  portfolioItems,
  posts,
  contactSubmissions,
} from '@/db/schema';

export type Collaborator = InferSelectModel<typeof collaborators>;
export type TeamMember = InferSelectModel<typeof teamMembers>;
export type PortfolioItem = InferSelectModel<typeof portfolioItems>;
export type Post = InferSelectModel<typeof posts>;
export type ContactSubmission = InferSelectModel<typeof contactSubmissions>;
