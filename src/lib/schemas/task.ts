import { z } from 'zod';

export const CRM_TASK_PRIORITIES = ['alta', 'media', 'baja'] as const;
export const CRM_TASK_STATUSES = ['pendiente', 'en_progreso', 'completada'] as const;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable(),
  ownerId: z.string().min(1),
  dueDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .transform((v) => (v === '' ? null : v)),
  priority: z.enum(CRM_TASK_PRIORITIES),
  status: z.enum(CRM_TASK_STATUSES),
  category: z.string().trim().min(1).max(40),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;

export const taskPatchSchema = taskFormSchema.partial();
export type TaskPatchInput = z.infer<typeof taskPatchSchema>;
