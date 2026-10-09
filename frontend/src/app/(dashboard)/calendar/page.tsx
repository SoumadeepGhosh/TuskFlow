'use client';

import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { useTasks, useUpdateTask } from '@/features/task/hooks/use-tasks';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useAuth } from '@/providers/auth-provider';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Filter,
  User,
  Plus,
  Layers,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ViewMode = 'month' | 'week' | 'day';
type FilterType = 'all' | 'my' | 'due-today' | 'overdue' | 'completed';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<number | 'ALL'>('ALL');

  // Task Detail Modal State
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Hover card tooltip state
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Queries
  const { data: tasksData, isLoading, isError } = useTasks({ limit: 100 });
  const { data: projectsData } = useProjects({ limit: 50 });
  const updateTaskMutation = useUpdateTask();

  const allTasks: Task[] = tasksData?.items || [];
  const projects = projectsData?.items || [];

  // Helper date math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Filter by Quick Type
      if (filterType === 'my') {
        const isAssigned = task.assignees?.some((a) => a.userId === user?.id);
        const isReporter = task.reporterId === user?.id;
        if (!isAssigned && !isReporter) return false;
      } else if (filterType === 'due-today') {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        const now = new Date();
        if (
          due.getFullYear() !== now.getFullYear() ||
          due.getMonth() !== now.getMonth() ||
          due.getDate() !== now.getDate()
        ) {
          return false;
        }
      } else if (filterType === 'overdue') {
        if (!task.dueDate || task.status === 'DONE') return false;
        const due = new Date(task.dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (due >= now) return false;
      } else if (filterType === 'completed') {
        if (task.status !== 'DONE') return false;
      }

      // Filter by Priority
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
        return false;
      }

      // Filter by Project
      if (selectedProjectId !== 'ALL' && task.projectId !== selectedProjectId) {
        return false;
      }

      return true;
    });
  }, [allTasks, filterType, selectedPriority, selectedProjectId, user?.id]);

  // Top Summary Cards
  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let completedThisWeek = 0;

    allTasks.forEach((t) => {
      if (t.status === 'DONE') {
        if (t.completedAt) {
          const comp = new Date(t.completedAt);
          if (comp >= startOfWeek) completedThisWeek++;
        } else {
          completedThisWeek++;
        }
        return;
      }

      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d >= today && d <= endOfToday) {
          dueToday++;
        } else if (d < today) {
          overdue++;
        } else {
          upcoming++;
        }
      }
    });

    return { dueToday, overdue, upcoming, completedThisWeek };
  }, [allTasks]);

  // Drag and drop task onto date cell
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDate = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    const taskId = Number(taskIdStr);
    if (!taskId) return;

    // Set target date due time to 18:00
    const updatedDate = new Date(targetDate);
    updatedDate.setHours(18, 0, 0, 0);

    updateTaskMutation.mutate(
      {
        id: taskId,
        data: {
          dueDate: updatedDate.toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Rescheduled to ${updatedDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}`,
          );
        },
      },
    );
  };

  // Hover card handlers
  const handleTaskMouseEnter = (e: React.MouseEvent, task: Task) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: Math.min(rect.left, window.innerWidth - 300),
      y: rect.bottom + 8,
    });
    setHoveredTask(task);
  };

  const handleTaskMouseLeave = () => {
    setHoveredTask(null);
    setHoverPosition(null);
  };

  const openTaskModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  // Priority color styling
  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    }
  };

  // Month Grid Calculation
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay(); // 0 is Sun
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Week Grid Calculation
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Helper to filter tasks for a given date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTasks.filter((task) => {
      if (!task.dueDate) return false;
      const tDate = new Date(task.dueDate).toISOString().split('T')[0];
      return tDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Calendar & Timeline"
          description="Schedule, track deadlines, and organize tasks across your projects."
        />

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary border border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('month')}
            className={cn(
              'h-7 px-3 text-xs font-semibold rounded-lg',
              viewMode === 'month' && 'bg-card text-foreground shadow-xs',
            )}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('week')}
            className={cn(
              'h-7 px-3 text-xs font-semibold rounded-lg',
              viewMode === 'week' && 'bg-card text-foreground shadow-xs',
            )}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('day')}
            className={cn(
              'h-7 px-3 text-xs font-semibold rounded-lg',
              viewMode === 'day' && 'bg-card text-foreground shadow-xs',
            )}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Due Today</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">
              {summary.dueToday}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Overdue</p>
            <h3 className="text-xl font-bold text-rose-500 mt-0.5">
              {summary.overdue}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">
              {summary.upcoming}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Completed
            </p>
            <h3 className="text-xl font-bold text-emerald-500 mt-0.5">
              {summary.completedThisWeek}
            </h3>
          </div>
        </div>
      </div>

      {/* Calendar Controls & Filters Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card space-y-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Navigation & Title */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs font-semibold"
            >
              Today
            </Button>

            <div className="flex items-center gap-1 border border-border rounded-xl p-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handlePrev}
                title="Previous"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleNext}
                title="Next"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-2 ml-1">
              <select
                value={month}
                onChange={(e) => {
                  const newM = Number(e.target.value);
                  setCurrentDate(new Date(year, newM, 1));
                }}
                className="h-8 rounded-xl border border-border bg-secondary px-2.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => {
                  const newY = Number(e.target.value);
                  setCurrentDate(new Date(newY, month, 1));
                }}
                className="h-8 rounded-xl border border-border bg-secondary px-2.5 text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {[year - 2, year - 1, year, year + 1, year + 2].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'my', label: 'Assigned to Me' },
              { id: 'due-today', label: 'Due Today' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as FilterType)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all',
                  filterType === f.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-7 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) =>
                setSelectedProjectId(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value),
                )
              }
              className="h-7 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-muted-foreground text-[11px]">
            Tip: Drag tasks across dates to reschedule instantly.
          </span>
        </div>
      </div>

      {/* Main Calendar View Container */}
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(28)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-sm text-destructive border border-destructive/20 rounded-2xl bg-destructive/5">
          Failed to load calendar events. Please try again.
        </div>
      ) : viewMode === 'month' ? (
        /* Monthly View */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-secondary/50 text-center py-2 text-xs font-bold text-muted-foreground">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {monthDays.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const current = isToday(cell.date);

              return (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDate(e, cell.date)}
                  className={cn(
                    'min-h-[110px] p-2 flex flex-col transition-colors group',
                    cell.isCurrentMonth
                      ? 'bg-card hover:bg-secondary/20'
                      : 'bg-secondary/30 text-muted-foreground/50',
                    current && 'bg-primary/[0.04]',
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        'text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center',
                        current
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-foreground',
                      )}
                    >
                      {cell.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[90px] scrollbar-none">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => openTaskModal(task.id)}
                        onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                        onMouseLeave={handleTaskMouseLeave}
                        className={cn(
                          'p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer truncate flex items-center gap-1.5 group/item shadow-xs hover:scale-[1.01]',
                          task.status === 'DONE'
                            ? 'bg-card/40 border-border text-muted-foreground line-through'
                            : 'bg-card hover:bg-accent border-border/80 text-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            task.priority === 'URGENT'
                              ? 'bg-rose-500'
                              : task.priority === 'HIGH'
                                ? 'bg-amber-500'
                                : task.priority === 'MEDIUM'
                                  ? 'bg-blue-500'
                                  : 'bg-emerald-500',
                          )}
                        />
                        <span className="truncate font-medium text-[11px] leading-tight flex-1">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* Weekly View */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="grid grid-cols-7 border-b border-border bg-secondary/50 text-center py-2.5 text-xs font-bold divide-x divide-border">
            {weekDays.map((d) => (
              <div key={d.toISOString()} className="space-y-0.5">
                <div className="text-muted-foreground">
                  {DAYS_OF_WEEK[d.getDay()]}
                </div>
                <div
                  className={cn(
                    'inline-block h-6 w-6 rounded-full leading-6 text-center text-xs font-bold',
                    isToday(d)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground',
                  )}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-border min-h-[460px]">
            {weekDays.map((d) => {
              const dayTasks = getTasksForDate(d);
              return (
                <div
                  key={d.toISOString()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDate(e, d)}
                  className="p-2 space-y-2 bg-card hover:bg-secondary/20 transition-colors"
                >
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => openTaskModal(task.id)}
                      onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                      onMouseLeave={handleTaskMouseLeave}
                      className="p-2 rounded-xl border border-border bg-card hover:border-primary/40 shadow-xs cursor-pointer text-left space-y-1.5 transition-all"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            'px-1.5 py-0.2 rounded text-[10px] font-bold border',
                            getPriorityBadgeClass(task.priority),
                          )}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h5 className="text-xs font-semibold text-foreground line-clamp-2">
                        {task.title}
                      </h5>

                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {task.labels.slice(0, 2).map((l) => (
                            <span
                              key={l.labelId}
                              className="px-1.5 py-0.2 rounded-full text-[9px] bg-secondary text-foreground"
                            >
                              {l.label.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Daily View */
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {currentDate.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTasksForDate(currentDate).length} tasks scheduled for this day
              </p>
            </div>
            {isToday(currentDate) && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                Today
              </span>
            )}
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnDate(e, currentDate)}
            className="space-y-3 min-h-[300px]"
          >
            {getTasksForDate(currentDate).length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No tasks scheduled"
                description="There are no tasks due on this date. Drag a task here to schedule it."
              />
            ) : (
              getTasksForDate(currentDate).map((task) => (
                <div
                  key={task.id}
                  onClick={() => openTaskModal(task.id)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between gap-4 cursor-pointer transition-all shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-bold border',
                          getPriorityBadgeClass(task.priority),
                        )}
                      >
                        {task.priority}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">
                        {task.title}
                      </h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-secondary text-foreground">
                      {task.status.replace('_', ' ')}
                    </span>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Task
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Hover Card Preview */}
      {hoveredTask && hoverPosition && (
        <div
          style={{ top: hoverPosition.y, left: hoverPosition.x }}
          className="fixed z-50 w-72 p-3.5 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl space-y-2 pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[10px] font-bold border',
                getPriorityBadgeClass(hoveredTask.priority),
              )}
            >
              {hoveredTask.priority}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {hoveredTask.status.replace('_', ' ')}
            </span>
          </div>

          <h4 className="text-xs font-bold text-foreground leading-snug">
            {hoveredTask.title}
          </h4>

          {hoveredTask.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              {hoveredTask.description}
            </p>
          )}

          <div className="pt-1.5 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              Due:{' '}
              {hoveredTask.dueDate
                ? new Date(hoveredTask.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No date'}
            </span>
            {hoveredTask.assignees && hoveredTask.assignees.length > 0 && (
              <span>{hoveredTask.assignees.length} assigned</span>
            )}
          </div>
        </div>
      )}

      {/* Shared Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setSelectedTaskId(null);
        }}
      />
    </div>
  );
}
