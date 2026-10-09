'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useProject,
  useProjectStatistics,
  useProjectMembers,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadProjectLogo,
  useRemoveProjectLogo,
  useUploadProjectCover,
  useRemoveProjectCover,
} from '@/features/project/hooks/use-projects';
import type { Project, ProjectMember, ProjectRole, ProjectStatus, UpdateProjectDto } from '@/types/project';
import { useBoards } from '@/features/board/hooks/use-boards';
import { useTasks } from '@/features/task/hooks/use-tasks';
import { CreateBoardDialog } from '@/features/board/components/create-board-dialog';
import { AddProjectMemberDialog } from '@/features/project/components/add-project-member-dialog';
import { ChangeProjectMemberRoleDialog } from '@/features/project/components/change-project-member-role-dialog';
import { RemoveProjectMemberDialog } from '@/features/project/components/remove-project-member-dialog';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { getAssetUrl } from '@/lib/assets';
import {
  CheckCircle2,
  Clock,
  Kanban,
  Layout,
  Plus,
  Settings,
  Trash2,
  Users,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
  UserPlus,
  Archive,
  ArchiveRestore,
  Star,
  Activity,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  ExternalLink,
  MessageSquare,
  Paperclip,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'boards' | 'tasks' | 'members' | 'activity' | 'settings'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Edit Project State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<number | null>(null);

  // Task Detail Modal
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  // Hidden file inputs
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  // Queries
  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: stats } = useProjectStatistics(projectId);
  const { data: boardsData, isLoading: isLoadingBoards } = useBoards({ projectId });
  const { data: membersData, isLoading: isLoadingMembers } = useProjectMembers(projectId);
  const { data: tasksData, isLoading: isLoadingTasks } = useTasks({ projectId, limit: 30 });

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectMutation();

  const uploadLogoMutation = useUploadProjectLogo(projectId);
  const removeLogoMutation = useRemoveProjectLogo(projectId);
  const uploadCoverMutation = useUploadProjectCover(projectId);
  const removeCoverMutation = useRemoveProjectCover(projectId);

  const boards = boardsData?.items ?? [];
  const members = membersData?.items ?? [];
  const tasks = tasksData?.items ?? [];

  // Statistics & Progress calculations
  const totalTasks = stats?.total ?? tasks.length;
  const completedTasks = stats?.completed ?? tasks.filter((t) => t.status === 'DONE').length;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue count
  const overdueCount = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return tasks.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length;
  }, [tasks]);

  // Hours estimations
  const estimatedHours = useMemo(() => {
    return tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  }, [tasks]);
  const workedHours = Math.round(estimatedHours * (completionPercentage / 100));

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-14 w-80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3 max-w-xl mx-auto my-12">
        <p className="text-sm font-semibold text-destructive">
          Project not found or you don&apos;t have access.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditName(project.name);
    setEditDescription(project.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    updateProject(
      { name: editName.trim(), description: editDescription.trim() || undefined },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const handleArchiveToggle = () => {
    const nextStatus: ProjectStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    updateProject(
      { status: nextStatus },
      {
        onSuccess: () => {
          setShowArchiveConfirm(false);
          toast.success(`Project ${nextStatus === 'ARCHIVED' ? 'archived' : 'restored'}`);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => {
        router.push('/projects');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Link href="/projects" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">{project.name}</span>
        </div>

        {/* Favorite & Quick Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setIsFavorite((prev) => !prev);
              toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
            }}
            title={isFavorite ? 'Remove favorite' : 'Add to favorites'}
            className={cn('h-8 w-8', isFavorite ? 'text-amber-500' : 'text-muted-foreground')}
          >
            <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEdit}
            className="text-xs"
          >
            Edit Project
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchiveConfirm(true)}
            className="text-xs"
          >
            <Archive className="h-3.5 w-3.5 mr-1" />
            {project.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Hidden File Inputs for quick upload */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadLogoMutation.mutate(file);
            e.target.value = '';
          }
        }}
      />
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

      {/* Project Header Banner & Hero Cover */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
        {project.coverUrl ? (
          <div className="h-44 sm:h-52 w-full relative group/cover overflow-hidden bg-muted">
            <img
              src={getAssetUrl(project.coverUrl)}
              alt={`${project.name} Cover`}
              className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              onClick={() => {
                setLightboxSrc(getAssetUrl(project.coverUrl));
                setLightboxTitle(`${project.name} Cover`);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

            {/* Cover Action Buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-background/80 backdrop-blur-md p-1 rounded-xl border border-border/60 shadow-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadCoverMutation.isPending}
                className="h-7 px-2 text-[11px] font-semibold gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Cover</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCoverMutation.mutate()}
                disabled={removeCoverMutation.isPending}
                className="h-7 px-2 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="h-32 sm:h-40 w-full relative group/cover flex items-center justify-end p-4"
            style={{
              background: `linear-gradient(135deg, ${project.color || '#5B5CEB'} 0%, #3B82F6 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadCoverMutation.isPending}
              className="relative z-10 h-8 text-xs font-semibold gap-1.5 bg-background/90 hover:bg-background text-foreground shadow-md"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Add Cover Image</span>
            </Button>
          </div>
        )}

        <div className="p-5 sm:p-6 pt-0 relative space-y-4">
          {/* Overlapping Logo */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-2">
            <div className="relative group/logo">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-card bg-card shadow-xl overflow-hidden flex items-center justify-center font-bold text-xl sm:text-2xl text-white select-none shrink-0"
                style={{ backgroundColor: project.color || '#5B5CEB' }}
              >
                {project.logoUrl ? (
                  <img
                    src={getAssetUrl(project.logoUrl)}
                    alt={project.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setLightboxSrc(getAssetUrl(project.logoUrl));
                      setLightboxTitle(`${project.name} Logo`);
                    }}
                  />
                ) : (
                  project.name.substring(0, 2).toUpperCase()
                )}
              </div>

              {/* Logo Upload Hover Badge */}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadLogoMutation.isPending}
                title="Update project logo"
                className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover/logo:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Change</span>
              </button>
            </div>
          </div>
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Project Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-bold text-base"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                <Badge
                  variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-[11px] font-bold"
                >
                  {project.status}
                </Badge>
                {project.key && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-secondary font-bold text-muted-foreground">
                    {project.key}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.description || 'No description provided for this project.'}
              </p>

              <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground flex-wrap">
                <span>
                  Created:{' '}
                  {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>
                  Updated:{' '}
                  {new Date(project.updatedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {members.length} Members
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateBoard(true)}
                className="text-xs font-semibold shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> New Board
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMember(true)}
                className="text-xs font-semibold"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Tasks
          </p>
          <h3 className="text-xl font-bold text-foreground">{totalTasks}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Completed
          </p>
          <h3 className="text-xl font-bold text-emerald-500">{completedTasks}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pending
          </p>
          <h3 className="text-xl font-bold text-foreground">{pendingTasks}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Overdue
          </p>
          <h3 className="text-xl font-bold text-rose-500">{overdueCount}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Progress
          </p>
          <h3 className="text-xl font-bold text-primary">{completionPercentage}%</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Hours
          </p>
          <h3 className="text-xl font-bold text-foreground">
            {workedHours} / {estimatedHours || 0}h
          </h3>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Overall Project Delivery</span>
          <span className="text-primary">{completionPercentage}% Completed</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-border pb-1 text-xs">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
          { id: 'boards', label: `Boards (${boards.length})`, icon: Kanban },
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckCircle2 },
          { id: 'members', label: `Team Members (${members.length})`, icon: Users },
          { id: 'activity', label: 'Activity Log', icon: Activity },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts & Distributions (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Breakdown */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Task Status Distribution
              </h3>

              <div className="space-y-3">
                {[
                  {
                    label: 'To Do',
                    count: stats?.byStatus?.TODO ?? tasks.filter((t) => t.status === 'TODO').length,
                    color: 'bg-zinc-500',
                  },
                  {
                    label: 'In Progress',
                    count: stats?.byStatus?.IN_PROGRESS ?? tasks.filter((t) => t.status === 'IN_PROGRESS').length,
                    color: 'bg-blue-500',
                  },
                  {
                    label: 'In Review',
                    count: stats?.byStatus?.IN_REVIEW ?? tasks.filter((t) => t.status === 'IN_REVIEW').length,
                    color: 'bg-amber-500',
                  },
                  {
                    label: 'Done',
                    count: stats?.byStatus?.DONE ?? tasks.filter((t) => t.status === 'DONE').length,
                    color: 'bg-emerald-500',
                  },
                ].map((s) => {
                  const pct = totalTasks > 0 ? Math.round((s.count / totalTasks) * 100) : 0;
                  return (
                    <div key={s.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{s.label}</span>
                        <span className="text-muted-foreground">
                          {s.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn('h-full transition-all duration-300 rounded-full', s.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Priority Distribution
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Urgent', count: stats?.byPriority?.URGENT ?? tasks.filter((t) => t.priority === 'URGENT').length, badge: 'text-rose-500 bg-rose-500/10' },
                  { label: 'High', count: stats?.byPriority?.HIGH ?? tasks.filter((t) => t.priority === 'HIGH').length, badge: 'text-amber-500 bg-amber-500/10' },
                  { label: 'Medium', count: stats?.byPriority?.MEDIUM ?? tasks.filter((t) => t.priority === 'MEDIUM').length, badge: 'text-blue-500 bg-blue-500/10' },
                  { label: 'Low', count: stats?.byPriority?.LOW ?? tasks.filter((t) => t.priority === 'LOW').length, badge: 'text-emerald-500 bg-emerald-500/10' },
                ].map((p) => (
                  <div key={p.label} className="p-3 rounded-xl border border-border bg-secondary/30 text-center space-y-1">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', p.badge)}>
                      {p.label}
                    </span>
                    <h4 className="text-lg font-bold text-foreground mt-1">{p.count}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Recent Tasks
                </h3>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  View All Tasks →
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No tasks created in this project.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          {task.title}
                        </h5>
                        <p className="text-[10px] text-muted-foreground">
                          {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No deadline'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Boards & Members Previews */}
          <div className="space-y-6">
            {/* Boards Shortcut */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-primary" /> Boards ({boards.length})
                </h3>
                <button
                  onClick={() => setActiveTab('boards')}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  All →
                </button>
              </div>

              {boards.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">No boards yet.</p>
                  <Button size="sm" onClick={() => setShowCreateBoard(true)} className="text-xs">
                    Create Board
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {boards.slice(0, 3).map((b) => (
                    <Link
                      key={b.id}
                      href={`/boards/${b.id}`}
                      className="p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all flex items-center justify-between gap-2 block"
                    >
                      <span className="text-xs font-semibold text-foreground truncate">{b.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Team ({members.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddMember(true)} className="text-xs h-7 px-2">
                  + Add
                </Button>
              </div>

              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No members added.</p>
              ) : (
                <div className="space-y-2">
                  {members.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(m.user?.name || m.user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground truncate">
                          {m.user?.name || m.user?.email}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {m.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOARDS */}
      {activeTab === 'boards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Project Kanban Boards</h3>
            <Button size="sm" onClick={() => setShowCreateBoard(true)} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Board
            </Button>
          </div>

          {boards.length === 0 ? (
            <EmptyState
              icon={Kanban}
              title="No boards created"
              description="Create a kanban board to organize tasks with custom columns and workflows."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-foreground">{b.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {b.description || 'Custom kanban workflow for this project.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {b.columns?.length || 0} Columns
                    </span>
                    <Link href={`/boards/${b.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Open Board →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Project Tasks ({tasks.length})</h3>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No tasks in this project"
              description="Open a board to start creating and assigning tasks."
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsTaskModalOpen(true);
                  }}
                  className="p-3.5 sm:p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          task.priority === 'URGENT'
                            ? 'bg-rose-500'
                            : task.priority === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-blue-500',
                        )}
                      />
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description || 'No description'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No date'}
                    </span>
                    <Badge variant={task.status === 'DONE' ? 'default' : 'secondary'} className="text-[10px]">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TEAM MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Project Members ({members.length})</h3>
            <Button size="sm" onClick={() => setShowAddMember(true)} className="text-xs">
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Member
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={member.user} size="md" />
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">
                      {member.user?.name || member.user?.email}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">{member.user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowRoleDialog(true);
                    }}
                    className="text-xs text-muted-foreground"
                  >
                    Role
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setShowRemoveMemberDialog(true);
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
            Project Event History
          </h3>

          <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            <div className="relative space-y-0.5">
              <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
              <p className="text-xs font-semibold text-foreground">Project &quot;{project.name}&quot; initialized</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(project.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {tasks.slice(0, 5).map((t) => (
              <div key={t.id} className="relative space-y-0.5">
                <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                <p className="text-xs font-semibold text-foreground">
                  Task &quot;{t.title}&quot; added ({t.status})
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">General Settings</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Project Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button size="sm" onClick={handleSaveEdit} isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Project Branding</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize your project logo and banner cover image to personalize your team workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">Project Logo</label>
                <div className="max-w-xs">
                  <ImageUpload
                    value={project.logoUrl}
                    onUpload={async (file) => {
                      await uploadLogoMutation.mutateAsync(file);
                    }}
                    onRemove={async () => {
                      await removeLogoMutation.mutateAsync();
                    }}
                    aspectRatio="logo"
                    label="Project Logo"
                    helperText="PNG, JPG, WEBP or SVG up to 10MB"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <label className="text-xs font-semibold text-foreground block mb-2">Cover Banner</label>
                <ImageUpload
                  value={project.coverUrl}
                  onUpload={async (file) => {
                    await uploadCoverMutation.mutateAsync(file);
                  }}
                  onRemove={async () => {
                    await removeCoverMutation.mutateAsync();
                  }}
                  aspectRatio="banner"
                  label="Cover Banner"
                  helperText="Recommended size: 1920×1080 (16:9). PNG, JPG, WEBP up to 10MB"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
            <h3 className="text-sm font-bold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">
              Deleting this project permanently removes all boards, tasks, comments, and files associated with it.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Project
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateBoardDialog
        projectId={projectId}
        open={showCreateBoard}
        onOpenChange={setShowCreateBoard}
      />

      <AddProjectMemberDialog
        projectId={projectId}
        workspaceId={project.workspaceId}
        open={showAddMember}
        onOpenChange={setShowAddMember}
      />

      {selectedMember && (
        <>
          <ChangeProjectMemberRoleDialog
            projectId={projectId}
            member={selectedMember}
            open={showRoleDialog}
            onOpenChange={setShowRoleDialog}
          />
          <RemoveProjectMemberDialog
            projectId={projectId}
            member={selectedMember}
            open={showRemoveMemberDialog}
            onOpenChange={setShowRemoveMemberDialog}
          />
        </>
      )}

      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={project.status === 'ARCHIVED' ? 'Restore Project' : 'Archive Project'}
        description={`Are you sure you want to ${project.status === 'ARCHIVED' ? 'restore' : 'archive'} "${project.name}"?`}
        confirmText={project.status === 'ARCHIVED' ? 'Restore' : 'Archive'}
        onConfirm={handleArchiveToggle}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        projectId={projectId}
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setSelectedTaskId(null);
        }}
      />

      {/* Lightbox Modal */}
      <ImageLightbox
        src={lightboxSrc || ''}
        alt={lightboxTitle}
        open={Boolean(lightboxSrc)}
        onClose={() => setLightboxSrc(null)}
      />
    </div>
  );
}
