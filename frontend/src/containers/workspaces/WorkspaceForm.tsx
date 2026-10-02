'use client';

import React, { useState, useEffect } from 'react';
import { Workspace } from '@/types/workspace';
import {
  useCreateWorkspace,
  useUpdateWorkspace,
} from '@/hooks/api/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WorkspaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: Workspace | null;
}

export function WorkspaceForm({
  open,
  onOpenChange,
  workspace,
}: WorkspaceFormProps) {
  const isEditing = Boolean(workspace);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [workspace, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && workspace) {
      updateMutation.mutate(
        {
          id: workspace.id,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setName('');
            setDescription('');
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>
          {isEditing ? 'Edit Workspace' : 'Create Workspace'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Update the workspace name and description.'
            : 'Workspaces are the top-level home for your team, projects, and Kanban boards.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp, Engineering Team"
            disabled={isPending}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this workspace do?"
            disabled={isPending}
            className="w-full rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/60 resize-none"
          />
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
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Save Changes' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
