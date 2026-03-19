import { z } from 'zod';

export const proposalSchema = z.object({
  talentId: z.number().int().positive(),
  campaignType: z.enum(['Streaming', 'YouTube', 'Social', 'Evento', 'Otro']),
  budgetRange: z.enum(['<5K', '5-10K', '10-25K', '25K+', 'A definir']),
  timeline: z.enum(['1 semana', '2 semanas', '1 mes', '2+ meses', 'Flexible']),
  message: z.string().min(10).max(1000),
});

export type ProposalInput = z.infer<typeof proposalSchema>;
