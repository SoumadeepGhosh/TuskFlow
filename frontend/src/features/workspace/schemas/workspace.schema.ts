import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
});

export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50).optional(),
  description: z.string().max(500).optional().or(z.literal('')),
});

export type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
