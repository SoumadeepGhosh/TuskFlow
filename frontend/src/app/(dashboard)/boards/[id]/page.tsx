'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useBoard,
  useUploadBoardCover,
  useRemoveBoardCover,
} from '@/features/board/hooks/use-boards';
import { useProjectMembers } from '@/features/project/hooks/use-projects';
import { KanbanBoard } from '@/features/board/components/kanban-board';
import { CreateTaskDialog } from '@/features/task/components/create-task-dialog';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { UserAvatar } from '@/components/ui/user-avatar';
import { getAssetUrl } from '@/lib/assets';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Camera,
  Trash2,
  Kanban,
  LayoutGrid,
  List,
  Calendar,
  GanttChart,
  Table2,
  Search,
  X,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
  Users,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

type ViewMode = 'board' | 'list' | 'calendar' | 'timeline' | 'table';

export default function BoardPage({ params }: BoardPageProps) {
  const { id } = React.use(params);
  const boardId = Number(id);
  const router = useRouter();

  const { data: board, isLoading, error, refetch } = useBoard(boardId);
  const { data: projectMembersData } = useProjectMembers(board?.projectId || 0, { limit: 50 });

  // Modals & view states
  const [activeView, setActiveView] = useState<ViewMode>('board');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | undefined>();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<number | undefined>(undefined);
  const [labelFilter, setLabelFilter] = useState<number | undefined>(undefined);

  // Filter dropdown toggles
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [isLabelMenuOpen, setIsLabelMenuOpen] = useState(false);

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const uploadCoverMutation = useUploadBoardCover(boardId);
  const removeCoverMutation = useRemoveBoardCover(boardId);

  // Extract collaborators and labels across all tasks in board
  const { boardMembers, boardLabels } = useMemo(() => {
    if (!board?.columns) return { boardMembers: [], boardLabels: [] };

    const memberMap = new Map<number, { id: number; name?: string | null; email?: string | null; avatarUrl?: string | null }>();
    const labelMap = new Map<number, { id: number; name: string; color: string }>();

    // Add members from project if available
    if (projectMembersData?.items) {
      projectMembersData.items.forEach((m) => {
        if (m.user) {
          memberMap.set(m.user.id, {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
          });
        }
      });
    }

    // Add members & labels from tasks
    board.columns.forEach((col) => {
      col.tasks?.forEach((task) => {
        task.assignees?.forEach((a) => {
          if (a.user && !memberMap.has(a.user.id)) {
            memberMap.set(a.user.id, {
              id: a.user.id,
              name: a.user.name,
              email: a.user.email,
              avatarUrl: a.user.avatarUrl,
            });
          }
        });
        task.labels?.forEach((tl) => {
          if (tl.label && !labelMap.has(tl.label.id)) {
            labelMap.set(tl.label.id, tl.label);
          }
        });
      });
    });

    return {
      boardMembers: Array.from(memberMap.values()),
      boardLabels: Array.from(labelMap.values()),
    };
  }, [board, projectMembersData]);

  // Active filter count
  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (priorityFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (assigneeFilter !== undefined ? 1 : 0) +
    (labelFilter !== undefined ? 1 : 0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setAssigneeFilter(undefined);
    setLabelFilter(undefined);
  };

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
      <div className="h-[calc(100vh-80px)] flex flex-col space-y-4 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-8 w-64 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex-1 flex gap-5 overflow-hidden pt-2">
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
          <Skeleton className="w-80 h-full rounded-2xl shrink-0" />
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Kanban className="w-6 h-6" />
        </div>
        <p className="text-destructive font-semibold text-lg mb-1">Failed to load board</p>
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {(error as Error)?.message || 'The board could not be found or you do not have permission to view it.'}
        </p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl shadow-xs">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const columns = board.columns || [];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Hidden Cover File Input */}
      <input
        type="file"
        ref={coverInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadCoverMutation.mutate(file);
            e.target.value = '';
          }
        }}
      />

      {/* Board Cover Banner if present */}
      {board.coverUrl && (
        <div className="h-28 sm:h-36 w-full relative group/cover overflow-hidden bg-muted shrink-0 border-b border-border/40">
          <img
            src={getAssetUrl(board.coverUrl)}
            alt={`${board.name} Cover`}
            className="w-full h-full object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-500"
            onClick={() => setLightboxSrc(getAssetUrl(board.coverUrl!))}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md p-1 rounded-xl border border-border/60 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadCoverMutation.isPending}
              className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeCoverMutation.mutate()}
              disabled={removeCoverMutation.isPending}
              className="h-7 px-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg"
              title="Remove Cover"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Board Header Bar */}
      <div className="shrink-0 px-4 lg:px-6 pt-3 pb-2.5 border-b border-border/50 bg-background/95 backdrop-blur-md">
        {/* Top Breadcrumb & Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={board.projectId ? `/projects/${board.projectId}` : '/projects'}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md hover:bg-muted/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Project</span>
            </Link>

            <span className="text-muted-foreground/40 text-xs">/</span>

            {/* Board Icon + Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                {board.icon ? (
                  <img
                    src={getAssetUrl(board.icon)}
                    alt=""
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Kanban className="w-4 h-4" />
                )}
              </div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-foreground truncate">
                {board.name}
              </h1>
              {board.description && (
                <span className="text-xs text-muted-foreground hidden md:inline truncate max-w-xs">
                  • {board.description}
                </span>
              )}
            </div>
          </div>

          {/* Top Actions: Members Avatars + Cover + Add Column + New Task */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Board Member Stack */}
            {boardMembers.length > 0 && (
              <>
                <div className="hidden sm:flex items-center -space-x-2">
                  {boardMembers.slice(0, 4).map((member) => (
                    <div key={member.id} title={member.name || member.email || 'Member'}>
                      <UserAvatar
                        user={member}
                        size="sm"
                        className="ring-2 ring-background ring-offset-0 hover:z-10 hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                  {boardMembers.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                      +{boardMembers.length - 4}
                    </div>
                  )}
                </div>
                <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
              </>
            )}

            {!board.coverUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadCoverMutation.isPending}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 rounded-lg border-border/80 shadow-2xs hover:bg-muted/60"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cover</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddColumnOpen(true)}
              className="h-8 px-3 text-xs font-medium gap-1.5 rounded-lg border-border/80 shadow-2xs hover:bg-muted/60"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Column</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (columns.length === 0) {
                  setIsAddColumnOpen(true);
                } else {
                  setSelectedColumnId(columns[0].id);
                  setIsCreateTaskOpen(true);
                }
              }}
              className="h-8 px-3.5 text-xs font-semibold gap-1.5 rounded-lg shadow-xs transition-all hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs & Filter Controls Row */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 mt-1.5 overflow-x-auto no-scrollbar select-none">
          {/* View Switcher Pill Tabs (Linear / Notion style) */}
          <div className="flex items-center gap-0.5 p-0.5 bg-muted/60 dark:bg-muted/30 border border-border/50 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('board')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                activeView === 'board'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                activeView === 'list'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/calendar')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-background/40 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('timeline')}
              className={cn(
                'hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                activeView === 'timeline'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <GanttChart className="w-3.5 h-3.5" />
              <span>Timeline</span>
              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-primary/10 text-primary font-bold">Beta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('table')}
              className={cn(
                'hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                activeView === 'table'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Filter Bar Toolbar - strictly single row, never wraps */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            {/* Live Search Input with smooth expansion */}
            <div className="relative w-36 sm:w-44 focus-within:w-56 transition-all duration-200 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="h-7 pl-8 pr-7 text-xs rounded-lg border-border/70 bg-card/60 focus:bg-background shadow-2xs w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Priority Filter Dropdown */}
            <div className="relative shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPriorityMenuOpen(!isPriorityMenuOpen);
                  setIsAssigneeMenuOpen(false);
                  setIsLabelMenuOpen(false);
                }}
                className={cn(
                  'h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border/70 shrink-0',
                  priorityFilter !== 'ALL' && 'border-primary/50 bg-primary/5 text-primary'
                )}
              >
                <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
                <span>
                  {priorityFilter === 'ALL'
                    ? 'Priority'
                    : priorityFilter.charAt(0) + priorityFilter.slice(1).toLowerCase()}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>

              {isPriorityMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsPriorityMenuOpen(false)}
                  />
                  <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-40 p-1 bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-xl z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setPriorityFilter('ALL');
                        setIsPriorityMenuOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left',
                        priorityFilter === 'ALL' && 'font-semibold text-primary'
                      )}
                    >
                      <span>All Priorities</span>
                      {priorityFilter === 'ALL' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as TaskPriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPriorityFilter(p);
                          setIsPriorityMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left capitalize',
                          priorityFilter === p && 'font-semibold text-primary'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              p === 'URGENT' && 'bg-rose-500',
                              p === 'HIGH' && 'bg-amber-500',
                              p === 'MEDIUM' && 'bg-blue-500',
                              p === 'LOW' && 'bg-slate-400'
                            )}
                          />
                          <span>{p.toLowerCase()}</span>
                        </div>
                        {priorityFilter === p && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Assignee Filter Dropdown */}
            {boardMembers.length > 0 && (
              <div className="relative shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAssigneeMenuOpen(!isAssigneeMenuOpen);
                    setIsPriorityMenuOpen(false);
                    setIsLabelMenuOpen(false);
                  }}
                  className={cn(
                    'h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border/70 shrink-0',
                    assigneeFilter !== undefined && 'border-primary/50 bg-primary/5 text-primary'
                  )}
                >
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span>
                    {assigneeFilter === undefined
                      ? 'Assignee'
                      : boardMembers.find((m) => m.id === assigneeFilter)?.name || 'Assigned'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>

                {isAssigneeMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsAssigneeMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-48 p-1 bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-xl z-40 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setAssigneeFilter(undefined);
                          setIsAssigneeMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left',
                          assigneeFilter === undefined && 'font-semibold text-primary'
                        )}
                      >
                        <span>All Assignees</span>
                        {assigneeFilter === undefined && <Check className="w-3.5 h-3.5" />}
                      </button>
                      {boardMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setAssigneeFilter(member.id);
                            setIsAssigneeMenuOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left',
                            assigneeFilter === member.id && 'font-semibold text-primary'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserAvatar user={member} size="xs" />
                            <span className="truncate">{member.name || member.email}</span>
                          </div>
                          {assigneeFilter === member.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Label Filter Dropdown */}
            {boardLabels.length > 0 && (
              <div className="relative shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLabelMenuOpen(!isLabelMenuOpen);
                    setIsPriorityMenuOpen(false);
                    setIsAssigneeMenuOpen(false);
                  }}
                  className={cn(
                    'h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border/70 shrink-0',
                    labelFilter !== undefined && 'border-primary/50 bg-primary/5 text-primary'
                  )}
                >
                  <Tag className="w-3 h-3 text-muted-foreground" />
                  <span>
                    {labelFilter === undefined
                      ? 'Label'
                      : boardLabels.find((l) => l.id === labelFilter)?.name || 'Labeled'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>

                {isLabelMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsLabelMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-44 p-1 bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-xl z-40 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setLabelFilter(undefined);
                          setIsLabelMenuOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left',
                          labelFilter === undefined && 'font-semibold text-primary'
                        )}
                      >
                        <span>All Labels</span>
                        {labelFilter === undefined && <Check className="w-3.5 h-3.5" />}
                      </button>
                      {boardLabels.map((lbl) => (
                        <button
                          key={lbl.id}
                          type="button"
                          onClick={() => {
                            setLabelFilter(lbl.id);
                            setIsLabelMenuOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-left',
                            labelFilter === lbl.id && 'font-semibold text-primary'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: lbl.color || '#3b82f6' }}
                            />
                            <span className="truncate">{lbl.name}</span>
                          </div>
                          {labelFilter === lbl.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 rounded-lg shrink-0"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
                <span className="ml-0.5 px-1 py-0.2 rounded-full bg-muted text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Board Canvas Area */}
      <div className="flex-1 overflow-hidden min-h-0 bg-background/50">
        <KanbanBoard
          board={board}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          isAddColumnOpen={isAddColumnOpen}
          onOpenAddColumnChange={setIsAddColumnOpen}
          filterSearch={searchQuery}
          filterPriority={priorityFilter}
          filterStatus={statusFilter}
          filterAssigneeId={assigneeFilter}
          filterLabelId={labelFilter}
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

      {/* Task Details Sliding Drawer (Sheet) */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        boardId={board.id}
        projectId={board.projectId}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxSrc || ''}
        alt={board.name}
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  );
}
