'use client';

import React, { useState } from 'react';
import { useCreateBoardMutation } from '../hooks/use-boards';
import { useProjects } from '@/features/project/hooks/use-projects';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface CreateBoardDialogProps {
  projectId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBoardDialog({
  projectId: initialProjectId,
  open,
  onOpenChange,
}: CreateBoardDialogProps) {
  const [userSelectedProjectId, setUserSelectedProjectId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({ limit: 50 });
  const projects = React.useMemo(() => projectsData?.items || [], [projectsData?.items]);

  const targetProjectId = initialProjectId || userSelectedProjectId || (projects[0]?.id ?? 0);
  const selectedProject = projects.find((p) => p.id === targetProjectId);

  const { mutate: createBoard, isPending } = useCreateBoardMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetProjectId) return;

    createBoard(
      {
        projectId: targetProjectId,
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          setUserSelectedProjectId(null);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Create Kanban Board</DialogTitle>
        <DialogDescription>
          Kanban boards let your team visualize workflows across customizable columns.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialProjectId && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project *
            </label>
            {isLoadingProjects ? (
              <div className="h-11 rounded-[14px] border border-border bg-card/60 flex items-center px-3.5 text-xs text-muted-foreground animate-pulse">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="h-11 rounded-[14px] border border-destructive/20 bg-destructive/5 flex items-center px-3.5 text-xs text-destructive">
                No active projects found. Please create a project first.
              </div>
            ) : (
              <Select
                value={targetProjectId ? String(targetProjectId) : ''}
                onValueChange={(val) => setUserSelectedProjectId(Number(val))}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project">
                    {selectedProject ? selectedProject.name : 'Select a project'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} {p.key ? `(${p.key})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Board Name *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 1, Product Roadmap"
            disabled={isPending}
            required
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
            placeholder="What tasks belong on this board?"
            disabled={isPending}
            className="w-full rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
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
          <Button
            type="submit"
            disabled={isPending || (!initialProjectId && projects.length === 0)}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Creating...
              </span>
            ) : (
              'Create Board'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
