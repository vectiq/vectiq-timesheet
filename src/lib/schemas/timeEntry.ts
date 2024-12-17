import { z } from 'zod';

export const timeEntrySchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.number()
    .min(0.25, 'Minimum time entry is 15 minutes')
    .max(24, 'Maximum time entry is 24 hours'),
  description: z.string().min(1, 'Description is required'),
});

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;