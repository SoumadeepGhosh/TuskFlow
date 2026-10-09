'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getChecklistStats, formatRelativeTime } from '@/features/board/lib/board-styles';
import { toast } from 'sonner';
import {
  MessageSquare,
  Paperclip,
  Calendar,
  Clock,
  CheckSquare,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Trash2,
  AlertCircle,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  isOverlay?: boolean;
}

export function TaskCard({
  task,
  onClick,
  onDelete,
  isOverlay = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isOverlay,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checklist = getChecklistStats(task.description);
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'DONE' : false;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/tasks/${task.id}` : '';
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        toast.success('Task link copied to clipboard');
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(task.id);
  };

  const renderPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Medium
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-md border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={cn(
        'group relative bg-card text-card-foreground rounded-[14px] p-3.5 border border-border/70 dark:border-border/40 shadow-xs cursor-grab active:cursor-grabbing select-none transition-all duration-150',
        'hover:shadow-md hover:border-border hover:-translate-y-0.5',
        isDragging && 'opacity-25 scale-95 shadow-none border-dashed border-2 border-primary/50 bg-primary/5',
        isOverlay && 'shadow-2xl border-primary ring-2 ring-primary/30 scale-[1.03] rotate-1 cursor-grabbing bg-card/95 backdrop-blur-md z-50'
      )}
    >
      {/* Top Header Row: Priority, Labels, and Hover Quick Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {renderPriorityBadge(task.priority)}

          {task.labels?.slice(0, 2).map((tl) => (
            <span
              key={tl.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md border truncate max-w-[100px]"
              style={{
                backgroundColor: `${tl.label.color}15`,
                borderColor: `${tl.label.color}30`,
                color: tl.label.color,
              }}
              title={tl.label.name}
            >
              {tl.label.name}
            </span>
          ))}

          {task.labels && task.labels.length > 2 && (
            <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-secondary">
              +{task.labels.length - 2}
            </span>
          )}
        </div>

        {/* Hover Quick Action Menu Trigger */}
        <div
          className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-expanded={showMenu}
            className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="More actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-7 w-36 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onClick?.(task);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Open Task</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-accent text-left font-medium transition-colors"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold tracking-tight text-foreground/95 group-hover:text-primary transition-colors leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Description Preview (if present) */}
      {task.description && (
        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {task.description.replace(/- \[[ xX]\] /g, '')}
        </p>
      )}

      {/* Checklist Progress Bar (if task contains checklist markdown) */}
      {checklist && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1 text-[10px]">
              <CheckSquare className="w-3 h-3 text-primary" />
              {checklist.completed}/{checklist.total} items
            </span>
            <span className="text-[10px] font-semibold">{checklist.percentage}%</span>
          </div>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${checklist.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Due Date, Counts, Updated Time, and Assignees Stack */}
      <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Due Date */}
          {task.dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium',
                isOverdue ? 'text-rose-500 font-semibold' : 'text-muted-foreground'
              )}
              title={isOverdue ? 'Task is overdue' : 'Due date'}
            >
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {/* Estimated Hours */}
          {Boolean(task.estimatedHours) && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" title="Estimated time">
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h
            </span>
          )}

          {/* Comments count */}
          {Boolean(task._count?.comments) && (
            <span className="inline-flex items-center gap-1 text-[11px]" title="Comments">
              <MessageSquare className="w-3 h-3" />
              {task._count?.comments}
            </span>
          )}

          {/* Attachments count */}
          {Boolean(task._count?.attachments) && (
            <span className="inline-flex items-center gap-1 text-[11px]" title="Attachments">
              <Paperclip className="w-3 h-3" />
              {task._count?.attachments}
            </span>
          )}

          {/* Updated relative time */}
          {task.updatedAt && !task.dueDate && (
            <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
              {formatRelativeTime(task.updatedAt)}
            </span>
          )}
        </div>

        {/* Assignees Stack with Tooltip & Overlap */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden items-center ml-auto shrink-0">
            {task.assignees.slice(0, 3).map((a) => (
              <div
                key={a.id}
                title={a.user?.name || a.user?.email}
                className="relative transition-transform hover:scale-110 hover:z-10"
              >
                <UserAvatar
                  user={a.user}
                  size="xs"
                  className="ring-2 ring-card shadow-2xs"
                />
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div
                title={`${task.assignees.length - 3} more assignees`}
                className="w-5 h-5 rounded-full bg-secondary text-muted-foreground ring-2 ring-card text-[9px] font-bold flex items-center justify-center cursor-default shadow-2xs"
              >
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
