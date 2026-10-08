'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBoard } from '@/features/board/hooks/use-boards';
import { KanbanBoard } from '@/features/board/components/kanban-board';
import { CreateTaskDialog } from '@/features/task/components/create-task-dialog';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = React.use(params);
  const boardId = Number(id);

  const { data: board, isLoading, error, refetch } = useBoard(boardId);

  // Modal states
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | undefined>();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsTaskDetailOpen(true);
  };

  const handleAddTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setIsCreateTaskOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="flex-1 flex gap-5 overflow-hidden">
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="py-16 text-center">
        <p className="text-destructive font-semibold mb-3">Failed to load board</p>
        <p className="text-muted-foreground text-sm mb-6">
          {(error as Error)?.message || 'The board could not be found or you do not have permission.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const columns = board.columns || [];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      {/* Board Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={board.projectId ? `/projects/${board.projectId}` : '/projects'}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Project
            </Link>
            <span>•</span>
            <span className="font-medium text-foreground">Kanban Board</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {board.name}
            </h1>
            {board.description && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                ({board.description})
              </span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsAddColumnOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Column
          </Button>

          <Button
            onClick={() => {
              if (columns.length === 0) {
                setIsAddColumnOpen(true);
              } else {
                setSelectedColumnId(columns[0].id);
                setIsCreateTaskOpen(true);
              }
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Main Board Area - Always rendered so canvas and column cards are directly interactive */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          board={board}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          isAddColumnOpen={isAddColumnOpen}
          onOpenAddColumnChange={setIsAddColumnOpen}
        />
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        boardId={board.id}
        columns={columns}
        defaultColumnId={selectedColumnId}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        boardId={board.id}
        projectId={board.projectId}
      />
    </div>
  );
}
