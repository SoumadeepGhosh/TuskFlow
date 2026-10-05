'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Paperclip, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  isOverlay?: boolean;
}

export function TaskCard({ task, onClick, isOverlay = false }: TaskCardProps) {
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

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" className="text-[11px] font-semibold tracking-wider">URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="warning" className="text-[11px] font-semibold tracking-wider">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" className="text-[11px] font-semibold tracking-wider">MEDIUM</Badge>;
      case 'LOW':
      default:
        return <Badge variant="outline" className="text-[11px] font-semibold tracking-wider text-muted-foreground">LOW</Badge>;
    }
  };

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'DONE' : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={cn(
        'group relative bg-card text-card-foreground rounded-2xl p-4 border border-border/80 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/40 transition-all select-none',
        isDragging && 'opacity-30 scale-95 shadow-none border-dashed border-primary',
        isOverlay && 'shadow-xl border-primary ring-2 ring-primary/20 scale-[1.02] cursor-grabbing'
      )}
    >
      {/* Top row: Priority & Labels */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {getPriorityBadge(task.priority)}
          {task.labels?.map((tl) => (
            <span
              key={tl.id}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${tl.label.color}15`,
                borderColor: `${tl.label.color}40`,
                color: tl.label.color,
              }}
            >
              {tl.label.name}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
        {task.title}
      </h4>

      {/* Description Preview (if exists) */}
      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer Info: Due Date, Counts & Assignees */}
      <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium',
                isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
              )}
            >
              {isOverdue ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {Boolean(task._count?.comments) && (
            <span className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5" />
              {task._count?.comments}
            </span>
          )}

          {Boolean(task._count?.attachments) && (
            <span className="flex items-center gap-1 text-[11px]">
              <Paperclip className="w-3.5 h-3.5" />
              {task._count?.attachments}
            </span>
          )}
        </div>

        {/* Assignees Avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden items-center ml-auto">
            {task.assignees.slice(0, 3).map((a) => (
              <div
                key={a.id}
                title={a.user?.name || a.user?.email}
                className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background text-[10px] font-bold text-primary flex items-center justify-center uppercase shadow-xs overflow-hidden"
              >
                {a.user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (a.user?.name?.[0] || 'U')
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background text-[9px] font-semibold text-muted-foreground flex items-center justify-center">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

