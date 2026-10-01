import { z } from 'zod';

export const createProjectSchema = z.object({
  workspaceId: z.number().min(1, 'Please select a workspace'),
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color').optional().or(z.literal('')),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  color: z.string().optional().or(z.literal('')),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

