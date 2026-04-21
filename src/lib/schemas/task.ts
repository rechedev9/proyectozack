import { z } from 'zod';

const priorityEnum = z.enum(['alta', 'media', 'baja']);
const statusEnum = z.enum(['pendiente', 'en_progreso', 'completada']);

export const taskFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable(),
  ownerId: z.string().min(1),
  dueDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .transform((v) => (v === '' ? null : v)),
  priority: priorityEnum,
  status: statusEnum,
  category: z.string().trim().min(1).max(40),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
