'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn } from '@/types/board';
import { Task } from '@/types/task';
import { TaskCard } from '@/features/task/components/task-card';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: number) => void;
  onUpdateColumn: (columnId: number, name: string) => void;
  onDeleteColumn: (columnId: number) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  const handleSaveName = () => {
    if (columnName.trim() && columnName !== column.name) {
      onUpdateColumn(column.id, columnName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-80 shrink-0 flex flex-col max-h-full rounded-2xl bg-secondary/50 border border-border/80 transition-colors',
        isOver && 'ring-2 ring-primary/30 bg-primary/5'
      )}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between gap-2 border-b border-border/50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          {isEditing ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="h-7 text-sm py-1 px-2"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 hover:text-primary text-muted-foreground transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {column.name}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                {tasks.length}
              </span>
            </div>
          )}
        </div>

        {/* Column Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-36 bg-popover text-popover-foreground border border-border rounded-xl shadow-lg p-1 z-30 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Rename
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List / Droppable Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[120px] max-h-[calc(100vh-250px)]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-xl">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-3 pt-1 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(column.id)}
          className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-xl"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Task
        </Button>
      </div>

      {/* Delete Column Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Column"
        description={`Are you sure you want to delete "${column.name}"? All tasks inside it will also be deleted.`}
        confirmText="Delete Column"
        variant="destructive"
        onConfirm={() => onDeleteColumn(column.id)}
      />
    </div>
  );
}

