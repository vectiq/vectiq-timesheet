import { z } from 'zod';

export const projectRoleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Role name is required'),
  costRate: z.number().min(0, 'Cost rate must be positive'),
  sellRate: z.number().min(0, 'Sell rate must be positive'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  clientId: z.string(),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  requiresApproval: z.boolean(),
  roles: z.array(projectRoleSchema),
});