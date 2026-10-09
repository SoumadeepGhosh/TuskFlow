'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn } from '@/types/board';
import { Task } from '@/types/task';
import { TaskCard } from '@/features/task/components/task-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getColumnColor, COLUMN_COLORS, ColumnColorKey } from '../lib/board-styles';
import { useCreateTask } from '@/features/task/hooks/use-tasks';
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  Palette,
  Sparkles,
  X,
  CornerDownLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  boardId: number;
  projectId: number;
  onTaskClick: (task: Task) => void;
  onAddTask?: (columnId: number) => void;
  onUpdateColumn: (columnId: number, name: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onDeleteTask?: (taskId: number) => void;
  onMoveColumnLeft?: () => void;
  onMoveColumnRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  boardId,
  projectId,
  onTaskClick,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onDeleteTask,
  onMoveColumnLeft,
  onMoveColumnRight,
  canMoveLeft = false,
  canMoveRight = false,
}: KanbanColumnProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorKey, setSelectedColorKey] = useState<ColumnColorKey | undefined>();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Inline Quick Task Add State
  const [isInlineAdding, setIsInlineAdding] = useState(false);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = useMemo(() => (tasks || []).map((t) => t.id), [tasks]);
  const columnColor = getColumnColor(column.name, selectedColorKey);

  const createTaskMutation = useCreateTask(boardId);

  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  useEffect(() => {
    if (isInlineAdding) {
      inlineInputRef.current?.focus();
    }
  }, [isInlineAdding]);

  const handleSaveName = () => {
    if (columnName.trim() && columnName !== column.name) {
      onUpdateColumn(column.id, columnName.trim());
    }
    setIsEditingName(false);
  };

  const handleInlineSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const title = inlineTaskTitle.trim();
    if (!title) return;

    createTaskMutation.mutate(
      {
        columnId: column.id,
        title,
      },
      {
        onSuccess: () => {
          setInlineTaskTitle('');
          toast.success('Task created');
          // Keep input focused for rapid task entry
          inlineInputRef.current?.focus();
        },
      }
    );
  };

  // If column is collapsed into a thin vertical spine (Linear / Jira style)
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        onClick={() => setIsCollapsed(false)}
        className="w-12 shrink-0 flex flex-col items-center py-4 rounded-2xl bg-secondary/30 dark:bg-card/30 border border-border/40 hover:border-primary/40 hover:bg-secondary/50 cursor-pointer transition-all select-none group"
        title={`Expand ${column.name}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={cn('w-2.5 h-2.5 rounded-full', columnColor.dotClass)} />
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        <div className="flex-1 my-6 flex items-center justify-center">
          <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold tracking-wider text-muted-foreground group-hover:text-foreground transition-colors uppercase">
            {column.name}
          </span>
        </div>

        <button
          type="button"
          className="p-1 rounded-md text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(false);
          }}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-[300px] shrink-0 flex flex-col h-full rounded-2xl bg-muted/40 dark:bg-card/40 border border-border/50 hover:border-border/80 transition-all duration-200 shadow-2xs backdrop-blur-xs',
        isOver && 'ring-2 ring-primary/40 border-primary bg-primary/[0.04]',
      )}
    >
      {/* Column Header */}
      <div className="p-3.5 flex items-center justify-between gap-2 border-b border-border/40 select-none">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Status Dot with ambient glow */}
          <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', columnColor.dotClass)} />

          {isEditingName ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="h-7 text-xs py-1 px-2 font-semibold"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 hover:text-primary text-muted-foreground transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 truncate cursor-pointer group/title"
              onDoubleClick={() => setIsEditingName(true)}
              title="Double click to rename"
            >
              <h3 className="font-semibold text-xs text-foreground tracking-tight truncate group-hover/title:text-primary transition-colors">
                {column.name}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-background border border-border/60 text-muted-foreground shadow-2xs">
                {tasks.length}
              </span>
            </div>
          )}
        </div>

        {/* Header Right Actions: Quick Add & Column Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsInlineAdding((prev) => !prev);
              if (onAddTask) onAddTask(column.id);
            }}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
            title="Add task in column"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              aria-expanded={showMenu}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
              title="Column options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 w-44 bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Rename Column</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowColorPicker((prev) => !prev)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Change Color</span>
                  </span>
                  <div className={cn('w-2 h-2 rounded-full', columnColor.dotClass)} />
                </button>

                {showColorPicker && (
                  <div className="p-2 border-t border-border mt-1 grid grid-cols-4 gap-1.5 bg-secondary/30 rounded-lg">
                    {(Object.keys(COLUMN_COLORS) as ColumnColorKey[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedColorKey(key);
                          setShowColorPicker(false);
                          setShowMenu(false);
                        }}
                        className="w-7 h-7 rounded-md flex items-center justify-center hover:scale-110 transition-transform bg-background border border-border"
                        title={COLUMN_COLORS[key].label}
                      >
                        <div className={cn('w-3 h-3 rounded-full', COLUMN_COLORS[key].dotClass)} />
                      </button>
                    ))}
                  </div>
                )}

                {canMoveLeft && onMoveColumnLeft && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveColumnLeft();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Move Left</span>
                  </button>
                )}

                {canMoveRight && onMoveColumnRight && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveColumnRight();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Move Right</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsCollapsed(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Collapse Column</span>
                </button>

                <div className="border-t border-border/80 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Column</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task List / Droppable Body */}
      <div className="flex-1 min-h-0 p-2.5 overflow-y-auto space-y-2 scrollbar-thin">
        {/* Inline Quick Add Card */}
        {isInlineAdding && (
          <form
            onSubmit={handleInlineSubmit}
            className="p-3 rounded-[14px] bg-card border border-primary/50 shadow-md space-y-2.5 animate-in fade-in-0 duration-150"
          >
            <Input
              ref={inlineInputRef}
              value={inlineTaskTitle}
              onChange={(e) => setInlineTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              disabled={createTaskMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsInlineAdding(false);
                  setInlineTaskTitle('');
                }
              }}
              className="text-xs h-8"
            />
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" /> Enter to save • Esc to cancel
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsInlineAdding(false);
                    setInlineTaskTitle('');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inlineTaskTitle.trim()}
                  isLoading={createTaskMutation.isPending}
                  className="h-6 px-2.5 text-xs font-semibold"
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Clean Minimal Empty State */}
        {tasks.length === 0 && !isInlineAdding && (
          <button
            type="button"
            onClick={() => setIsInlineAdding(true)}
            className="w-full py-7 px-3 rounded-xl border border-dashed border-border/50 hover:border-primary/50 hover:bg-background/60 transition-all text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer text-muted-foreground/70 hover:text-foreground"
          >
            <div className="w-7 h-7 rounded-full bg-muted/80 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium">Add task</span>
          </button>
        )}
      </div>

      {/* Column Footer: Only shown when tasks exist */}
      {tasks.length > 0 && !isInlineAdding && (
        <div className="p-2 pt-1 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsInlineAdding(true)}
            className="w-full justify-start text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-xl h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Task
          </Button>
        </div>
      )}

      {/* Delete Column Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${column.name}"?`}
        description="Are you sure you want to delete this column? Note that columns containing tasks cannot be deleted."
        confirmText="Delete Column"
        variant="destructive"
        onConfirm={() => onDeleteColumn(column.id)}
      />
    </div>
  );
}
