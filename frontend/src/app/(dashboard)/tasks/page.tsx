'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import {
  useMyTasks,
  useDueTodayTasks,
  useOverdueTasks,
} from '@/features/task/hooks/use-tasks';
import { Task } from '@/types/task';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'today' | 'overdue'>('my');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: myTasks, isLoading: loadingMy } = useMyTasks();
  const { data: todayTasks, isLoading: loadingToday } = useDueTodayTasks();
  const { data: overdueTasks, isLoading: loadingOverdue } = useOverdueTasks();

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive" className="text-[10px]">URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="warning" className="text-[10px]">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" className="text-[10px]">MEDIUM</Badge>;
      case 'LOW':
      default:
        return <Badge variant="outline" className="text-[10px]">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'DONE':
        return <Badge variant="success" className="text-[10px]">DONE</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="text-[10px]">IN PROGRESS</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="secondary" className="text-[10px]">IN REVIEW</Badge>;
      case 'TODO':
      default:
        return <Badge variant="outline" className="text-[10px]">TO DO</Badge>;
    }
  };

  const isLoading =
    activeTab === 'my'
      ? loadingMy
      : activeTab === 'today'
      ? loadingToday
      : loadingOverdue;

  const currentTasks =
    activeTab === 'my'
      ? myTasks || []
      : activeTab === 'today'
      ? todayTasks || []
      : overdueTasks || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Tasks"
        description="View, track, and manage all tasks assigned to you or requiring your immediate attention."
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('my')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all',
            activeTab === 'my'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Assigned to Me
          {Boolean(myTasks?.length) && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'my'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {myTasks?.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('today')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all',
            activeTab === 'today'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Due Today
          {Boolean(todayTasks?.length) && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'today'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-amber-100 text-amber-800'
              )}
            >
              {todayTasks?.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all',
            activeTab === 'overdue'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue
          {Boolean(overdueTasks?.length) && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'overdue'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-rose-100 text-rose-800'
              )}
            >
              {overdueTasks?.length}
            </span>
          )}
        </button>
      </div>

      {/* Task List Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-[20px]" />
          ))}
        </div>
      ) : currentTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={
            activeTab === 'overdue'
              ? 'No overdue tasks!'
              : activeTab === 'today'
              ? 'No tasks due today'
              : 'No tasks assigned to you'
          }
          description={
            activeTab === 'overdue'
              ? 'Great job keeping up with your deadlines.'
              : 'Enjoy your open schedule or browse boards to pick up work.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className="group p-4 rounded-[20px] bg-card border border-border/80 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                  {task.labels?.map((tl) => (
                    <span
                      key={tl.id}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
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

                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
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

                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:inline" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}

