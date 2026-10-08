import { z } from 'zod';

export const createProjectSchema = z.object({
  workspaceId: z.number().min(1, 'Please select a workspace'),
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
  key: z
    .string()
    .regex(/^[A-Za-z0-9]{2,10}$/, 'Project key must be 2-10 alphanumeric characters')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color')
    .optional()
    .or(z.literal('')),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100).optional(),
  key: z
    .string()
    .regex(/^[A-Za-z0-9]{2,10}$/, 'Project key must be 2-10 alphanumeric characters')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  color: z.string().optional().or(z.literal('')),
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export const addProjectMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['OWNER', 'MANAGER', 'DEVELOPER', 'TESTER', 'VIEWER']),
});

export type AddProjectMemberFormData = z.infer<typeof addProjectMemberSchema>;

