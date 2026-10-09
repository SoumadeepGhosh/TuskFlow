'use client';

import React, { useState, useRef } from 'react';
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
import { Plus, Kanban } from 'lucide-react';
import { useMoveTask, useDeleteTask } from '@/features/task/hooks/use-tasks';
import {
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from '@/features/board/hooks/use-boards';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface KanbanBoardProps {
  board: Board;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: number) => void;
  isAddColumnOpen?: boolean;
  onOpenAddColumnChange?: (open: boolean) => void;
  filterSearch?: string;
  filterPriority?: string;
  filterStatus?: string;
  filterAssigneeId?: number;
  filterLabelId?: number;
}

export function KanbanBoard({
  board,
  onTaskClick,
  onAddTask,
  isAddColumnOpen: externalAddColumnOpen,
  onOpenAddColumnChange,
  filterSearch = '',
  filterPriority = 'ALL',
  filterStatus = 'ALL',
  filterAssigneeId,
  filterLabelId,
}: KanbanBoardProps) {
  // Local state for optimistic drag-and-drop
  const [columns, setColumns] = useState<BoardColumn[]>(board.columns || []);
  const previousColumnsRef = useRef<BoardColumn[]>(board.columns || []);

  // React 19 pattern: sync state with incoming prop changes during render without touching refs
  const [prevBoardColumns, setPrevBoardColumns] = useState(board.columns);
  if (board.columns !== prevBoardColumns) {
    setPrevBoardColumns(board.columns);
    setColumns(board.columns || []);
  }

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Add column modal state
  const [internalAddColumnOpen, setInternalAddColumnOpen] = useState(false);
  const isAddColumnOpen =
    externalAddColumnOpen !== undefined
      ? externalAddColumnOpen
      : internalAddColumnOpen;
  const setAddColumnOpen = (open: boolean) => {
    if (onOpenAddColumnChange) {
      onOpenAddColumnChange(open);
    } else {
      setInternalAddColumnOpen(open);
    }
  };

  const [newColumnName, setNewColumnName] = useState('');

  // Mutations
  const moveTaskMutation = useMoveTask(board.id);
  const createColumnMutation = useCreateColumn(board.id);
  const updateColumnMutation = useUpdateColumn(board.id);
  const deleteColumnMutation = useDeleteColumn(board.id);
  const deleteTaskMutation = useDeleteTask(board.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    previousColumnsRef.current = columns;

    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    } else {
      const activeId = Number(active.id);
      for (const col of columns) {
        const found = col.tasks?.find((t) => t.id === activeId);
        if (found) {
          setActiveTask(found);
          break;
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    setColumns((currentCols) => {
      const sourceCol = currentCols.find((col) =>
        col.tasks?.some((t) => t.id === activeId),
      );
      let targetCol = currentCols.find((col) => col.id === overId);
      if (!targetCol) {
        targetCol = currentCols.find((col) =>
          col.tasks?.some((t) => t.id === overId),
        );
      }

      if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) {
        return currentCols;
      }

      const sourceTasks = [...(sourceCol.tasks || [])];
      const targetTasks = [...(targetCol.tasks || [])];

      const activeTaskIndex = sourceTasks.findIndex((t) => t.id === activeId);
      if (activeTaskIndex === -1) return currentCols;

      const [movedTask] = sourceTasks.splice(activeTaskIndex, 1);
      const updatedMovedTask = { ...movedTask, columnId: targetCol.id };

      const overTaskIndex = targetTasks.findIndex((t) => t.id === overId);
      if (overTaskIndex >= 0) {
        targetTasks.splice(overTaskIndex, 0, updatedMovedTask);
      } else {
        targetTasks.push(updatedMovedTask);
      }

      return currentCols.map((col) => {
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

    const activeId = Number(active.id);
    const overId = Number(over.id);

    let finalTargetColumnId: number | null = null;
    let finalPosition = 1;

    setColumns((currentCols) => {
      let targetColumn = currentCols.find((col) =>
        col.tasks?.some((t) => t.id === activeId),
      );

      if (!targetColumn) {
        targetColumn = currentCols.find((col) => col.id === overId);
      }

      if (!targetColumn) return currentCols;

      finalTargetColumnId = targetColumn.id;

      const currentTasks = targetColumn.tasks || [];
      const oldIndex = currentTasks.findIndex((t) => t.id === activeId);
      let newIndex = currentTasks.findIndex((t) => t.id === overId);

      if (newIndex === -1) {
        newIndex = oldIndex >= 0 ? oldIndex : currentTasks.length - 1;
      }

      finalPosition = Math.max(1, newIndex + 1);

      if (oldIndex !== newIndex && oldIndex >= 0 && newIndex >= 0) {
        const reorderedTasks = arrayMove(currentTasks, oldIndex, newIndex);
        return currentCols.map((c) =>
          c.id === targetColumn!.id ? { ...c, tasks: reorderedTasks } : c,
        );
      }

      return currentCols;
    });

    if (finalTargetColumnId !== null) {
      moveTaskMutation.mutate(
        {
          id: activeId,
          data: {
            columnId: finalTargetColumnId,
            position: finalPosition,
          },
        },
        {
          onError: () => {
            setColumns(previousColumnsRef.current);
          },
        },
      );
    }
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
        onSuccess: (createdCol) => {
          setAddColumnOpen(false);
          setNewColumnName('');
          if (createdCol && createdCol.id) {
            setColumns((prev) => {
              if (prev.some((c) => c.id === createdCol.id)) return prev;
              return [...prev, { ...createdCol, tasks: [] }];
            });
          }
        },
      },
    );
  };

  const moveColumnPosition = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const reordered = arrayMove(columns, index, newIndex);
    setColumns(reordered);
    // Optimistically reorder and update position of moved column
    const movedCol = reordered[newIndex];
    if (movedCol) {
      updateColumnMutation.mutate({
        id: movedCol.id,
        data: { position: newIndex + 1 },
      });
    }
  };

  // Filter tasks per column based on active header search & filters
  const getFilteredColumnTasks = (tasks: Task[] = []) => {
    return tasks.filter((t) => {
      // Search filter
      if (filterSearch) {
        const query = filterSearch.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Priority filter
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'ALL' && t.status !== filterStatus) {
        return false;
      }

      // Assignee filter
      if (filterAssigneeId && !t.assignees?.some((a) => a.userId === filterAssigneeId)) {
        return false;
      }

      // Label filter
      if (filterLabelId && !t.labels?.some((l) => l.labelId === filterLabelId)) {
        return false;
      }

      return true;
    });
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
        <div className="flex-1 flex gap-4 overflow-x-auto p-4 lg:p-6 pb-6 items-stretch scrollbar-thin select-none">
          {columns.map((column, index) => {
            const filteredTasks = getFilteredColumnTasks(column.tasks || []);

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasks}
                boardId={board.id}
                projectId={board.projectId}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
                onDeleteTask={(taskId) => {
                  deleteTaskMutation.mutate(taskId);
                }}
                onUpdateColumn={(columnId, name) => {
                  setColumns((prev) =>
                    prev.map((c) => (c.id === columnId ? { ...c, name } : c)),
                  );
                  updateColumnMutation.mutate({ id: columnId, data: { name } });
                }}
                onDeleteColumn={(columnId) => {
                  deleteColumnMutation.mutate(columnId, {
                    onSuccess: () => {
                      setColumns((prev) => prev.filter((c) => c.id !== columnId));
                    },
                  });
                }}
                onMoveColumnLeft={() => moveColumnPosition(index, 'left')}
                onMoveColumnRight={() => moveColumnPosition(index, 'right')}
                canMoveLeft={index > 0}
                canMoveRight={index < columns.length - 1}
              />
            );
          })}

          {/* Empty Board State */}
          {columns.length === 0 && (
            <div className="w-80 shrink-0 p-8 rounded-2xl border-2 border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <Kanban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">
                  No columns on this board
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                  Add columns like &ldquo;To Do&rdquo; or &ldquo;In Progress&rdquo; to visualize your work.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setAddColumnOpen(true)}
                className="gap-1.5 mt-2 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" /> Create Column
              </Button>
            </div>
          )}

          {/* Add Column Floating Card Button */}
          {columns.length > 0 && (
            <div className="w-[300px] shrink-0">
              <button
                type="button"
                onClick={() => setAddColumnOpen(true)}
                className="w-full h-11 rounded-2xl border border-dashed border-border/70 hover:border-primary/50 hover:bg-muted/40 text-muted-foreground hover:text-primary transition-all font-medium text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Column
              </button>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add Column Dialog */}
      <Dialog open={isAddColumnOpen} onOpenChange={setAddColumnOpen}>
        <form onSubmit={handleAddColumn} className="p-6">
          <DialogHeader onClose={() => setAddColumnOpen(false)}>
            <DialogTitle>Add Board Column</DialogTitle>
            <DialogDescription>
              Create a new stage for tasks on this board.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Column Title *
            </label>
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g. In Progress, Review, Shipped"
              disabled={createColumnMutation.isPending}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={createColumnMutation.isPending}
              onClick={() => setAddColumnOpen(false)}
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
