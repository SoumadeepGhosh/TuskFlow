'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkspaceSchema,
  CreateWorkspaceFormData,
} from '../schemas/workspace.schema';
import { useCreateWorkspaceMutation } from '../hooks/use-workspaces';
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

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: CreateWorkspaceDialogProps) {
  const { mutate: createWorkspace, isPending } = useCreateWorkspaceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: CreateWorkspaceFormData) => {
    createWorkspace(data, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogDescription>
          A workspace holds projects, boards, tasks, and team members.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="workspace-name"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Workspace Name *
          </label>
          <Input
            id="workspace-name"
            placeholder="e.g. Engineering, Acme Corp"
            disabled={isPending}
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="workspace-desc"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Description (Optional)
          </label>
          <textarea
            id="workspace-desc"
            rows={3}
            placeholder="What is this workspace focused on?"
            disabled={isPending}
            className="w-full rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:opacity-50"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.description.message}
            </p>
          )}
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
              'Create Workspace'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
