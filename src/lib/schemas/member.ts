import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['consultant', 'admin'], {
    required_error: 'Please select a role',
  }),
});

export type InviteMemberData = z.infer<typeof inviteMemberSchema>;