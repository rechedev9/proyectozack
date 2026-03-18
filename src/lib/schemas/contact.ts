import { z } from 'zod';

export const contactBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.string().min(1),
  company: z.string().optional(),
  message: z.string().min(10),
  // Brand-specific
  budget: z.string().optional(),
  timeline: z.string().optional(),
  audience: z.string().optional(),
  // Creator-specific
  platform: z.string().optional(),
  viewers: z.string().optional(),
  monetization: z.string().optional(),
});

export type ContactBody = z.infer<typeof contactBodySchema>;
