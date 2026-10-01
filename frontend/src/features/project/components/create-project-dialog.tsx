'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectFormData,
} from '../schemas/project.schema';
import { useCreateProjectMutation } from '../hooks/use-projects';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultWorkspaceId?: number;
}

const COLOR_PRESETS = [
  '#5B5CEB', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  defaultWorkspaceId,
}: CreateProjectDialogProps) {
  const { data: workspacesData } = useWorkspaces({ limit: 50 });
  const workspaces = workspacesData?.items ?? [];

  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      workspaceId: defaultWorkspaceId || (workspaces[0]?.id ?? 1),
      name: '',
      description: '',
      color: '#5B5CEB',
    },
  });

  const selectedColor = watch('color') || '#5B5CEB';

  React.useEffect(() => {
    if (defaultWorkspaceId) {
      setValue('workspaceId', defaultWorkspaceId);
    } else if (workspaces.length > 0) {
      setValue('workspaceId', workspaces[0].id);
    }
  }, [defaultWorkspaceId, workspaces, setValue]);

  const onSubmit = (data: CreateProjectFormData) => {
    createProject(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          A project contains Kanban boards, tasks, backlog tracking, and team members.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Workspace Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Workspace *
          </label>
          <select
            disabled={isPending || !!defaultWorkspaceId}
            className="w-full h-11 rounded-[14px] border border-border bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
            {...register('workspaceId')}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          {errors.workspaceId && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.workspaceId.message}
            </p>
          )}
        </div>

        {/* Project Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-name"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Project Name *
          </label>
          <Input
            id="project-name"
            placeholder="e.g. Website Redesign, Mobile App v2"
            disabled={isPending}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-desc"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Description (Optional)
          </label>
          <textarea
            id="project-desc"
            rows={3}
            placeholder="What goals does this project accomplish?"
            disabled={isPending}
            className="w-full rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            {...register('description')}
          />
        </div>

        {/* Color Marker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Color Tag
          </label>
          <div className="flex items-center gap-2 pt-1">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`h-7 w-7 rounded-full transition-transform ${
                  selectedColor === color
                    ? 'ring-2 ring-primary ring-offset-2 scale-110'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Creating...
              </span>
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

