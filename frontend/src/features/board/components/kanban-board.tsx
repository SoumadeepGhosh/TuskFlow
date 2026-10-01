'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Board, BoardColumn } from '@/types/board';
import { Task } from '@/types/task';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from '@/features/task/components/task-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useMoveTask } from '@/features/task/hooks/use-tasks';
import { useCreateColumn, useUpdateColumn, useDeleteColumn } from '@/features/board/hooks/use-boards';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface KanbanBoardProps {
  board: Board;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: number) => void;
}

export function KanbanBoard({ board, onTaskClick, onAddTask }: KanbanBoardProps) {
  // Local state for smooth optimistic drag-and-drop
  const [columns, setColumns] = useState<BoardColumn[]>(board.columns || []);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Add column modal state
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Mutations
  const moveTaskMutation = useMoveTask(board.id);
  const createColumnMutation = useCreateColumn(board.id);
  const updateColumnMutation = useUpdateColumn(board.id);
  const deleteColumnMutation = useDeleteColumn(board.id);

  // Sync columns with board updates from query
  useEffect(() => {
    setColumns(board.columns || []);
  }, [board.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumnOfTask = (taskId: number): BoardColumn | undefined => {
    return columns.find((col) => col.tasks?.some((t) => t.id === taskId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const sourceCol = findColumnOfTask(activeId);
    let targetCol = columns.find((c) => c.id === overId);

    if (!targetCol) {
      targetCol = findColumnOfTask(overId);
    }

    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) {
      return;
    }

    // Move task between columns in local state
    setColumns((prev) => {
      const sourceTasks = [...(sourceCol.tasks || [])];
      const targetTasks = [...(targetCol.tasks || [])];

      const activeTaskIndex = sourceTasks.findIndex((t) => t.id === activeId);
      if (activeTaskIndex === -1) return prev;

      const [movedTask] = sourceTasks.splice(activeTaskIndex, 1);
      const updatedMovedTask = { ...movedTask, columnId: targetCol.id };

      const overTaskIndex = targetTasks.findIndex((t) => t.id === overId);
      if (overTaskIndex >= 0) {
        targetTasks.splice(overTaskIndex, 0, updatedMovedTask);
      } else {
        targetTasks.push(updatedMovedTask);
      }

      return prev.map((col) => {
        if (col.id === sourceCol.id) return { ...col, tasks: sourceTasks };
        if (col.id === targetCol.id) return { ...col, tasks: targetTasks };
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const currentColumn = findColumnOfTask(activeId);
    if (!currentColumn) return;

    const currentTasks = currentColumn.tasks || [];
    const oldIndex = currentTasks.findIndex((t) => t.id === activeId);
    let newIndex = currentTasks.findIndex((t) => t.id === overId);

    if (newIndex === -1) {
      newIndex = currentTasks.length - 1;
    }

    if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
      const reorderedTasks = arrayMove(currentTasks, oldIndex, newIndex);
      setColumns((prev) =>
        prev.map((c) => (c.id === currentColumn.id ? { ...c, tasks: reorderedTasks } : c))
      );
    }

    // Calculate 1-indexed position
    const position = Math.max(1, newIndex + 1);

    moveTaskMutation.mutate({
      id: activeId,
      data: {
        columnId: currentColumn.id,
        position,
      },
    });
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    createColumnMutation.mutate(
      {
        boardId: board.id,
        name: newColumnName.trim(),
        position: columns.length + 1,
      },
      {
        onSuccess: () => {
          setIsAddColumnOpen(false);
          setNewColumnName('');
        },
      }
    );
  };

  return (
    <div className="h-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-5 overflow-x-auto pb-6 items-start">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks || []}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              onUpdateColumn={(columnId, name) =>
                updateColumnMutation.mutate({ id: columnId, data: { name } })
              }
              onDeleteColumn={(columnId) => deleteColumnMutation.mutate(columnId)}
            />
          ))}

          {/* New Column Button */}
          <div className="w-80 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsAddColumnOpen(true)}
              className="w-full h-12 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all font-medium"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Column
            </Button>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <form onSubmit={handleAddColumn} className="p-6">
          <DialogHeader>
            <DialogTitle>Add Board Column</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Column Title
            </label>
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g. In Progress, Review, Done"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddColumnOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createColumnMutation.isPending}>
              Create Column
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

