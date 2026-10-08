'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { BoardColumn } from '@/types/board';
import { TaskPriority, TaskStatus } from '@/types/task';
import { useCreateTask } from '../hooks/use-tasks';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: number;
  columns: BoardColumn[];
  defaultColumnId?: number;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  boardId,
  columns,
  defaultColumnId,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userSelectedColumnId, setUserSelectedColumnId] = useState<number | null>(null);
  const targetColumnId = userSelectedColumnId ?? (defaultColumnId || columns[0]?.id || 0);

  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');

  const createTaskMutation = useCreateTask(boardId);

  const selectedColumn = columns.find((c) => c.id === targetColumnId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetColumnId) return;

    createTaskMutation.mutate(
      {
        columnId: targetColumnId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle('');
          setDescription('');
          setUserSelectedColumnId(null);
          setDueDate('');
          setEstimatedHours('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="p-6">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your Kanban pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design authentication workflow"
              disabled={createTaskMutation.isPending}
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Column *
              </label>
              <Select
                value={String(targetColumnId)}
                onValueChange={(val) => setUserSelectedColumnId(Number(val))}
                disabled={createTaskMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column">
                    {selectedColumn ? selectedColumn.name : 'Select column'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={String(col.id)}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as TaskPriority)}
                disabled={createTaskMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority">
                    {priority}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as TaskStatus)}
                disabled={createTaskMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status">
                    {status === 'TODO'
                      ? 'To Do'
                      : status === 'IN_PROGRESS'
                      ? 'In Progress'
                      : status === 'IN_REVIEW'
                      ? 'In Review'
                      : 'Done'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={createTaskMutation.isPending}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, criteria, or context for this task..."
              rows={3}
              disabled={createTaskMutation.isPending}
              className="w-full p-3 rounded-[14px] border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={createTaskMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={createTaskMutation.isPending}>
            Create Task
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
