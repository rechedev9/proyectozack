import { z } from 'zod';

export const contactBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  type: z.string().min(1),
  company: z.string().optional(),
  message: z.string().min(10),
});

export type ContactBody = z.infer<typeof contactBodySchema>;
