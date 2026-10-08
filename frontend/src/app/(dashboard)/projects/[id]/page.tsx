'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useProject,
  useProjectStatistics,
  useProjectMembers,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/features/project/hooks/use-projects';
import type { Project, ProjectMember, ProjectRole, ProjectStatus, UpdateProjectDto } from '@/types/project';
import { useBoards } from '@/features/board/hooks/use-boards';
import { CreateBoardDialog } from '@/features/board/components/create-board-dialog';
import { AddProjectMemberDialog } from '@/features/project/components/add-project-member-dialog';
import { ChangeProjectMemberRoleDialog } from '@/features/project/components/change-project-member-role-dialog';
import { RemoveProjectMemberDialog } from '@/features/project/components/remove-project-member-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
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
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<'boards' | 'statistics' | 'members' | 'settings'>('boards');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Member management states
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<number | null>(null);

  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: stats } = useProjectStatistics(projectId);
  const { data: boardsData, isLoading: isLoadingBoards } = useBoards({ projectId });
  const { data: membersData, isLoading: isLoadingMembers } = useProjectMembers(projectId);

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectMutation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Project not found or you don&apos;t have access.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const boards = boardsData?.items ?? [];
  const rawMembers = membersData as unknown;
  const members: ProjectMember[] = Array.isArray(rawMembers)
    ? (rawMembers as ProjectMember[])
    : (membersData?.items ?? []);

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => router.push('/projects'),
    });
  };

  const handleToggleArchive = () => {
    const nextStatus: ProjectStatus = project.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    updateProject(
      { status: nextStatus },
      {
        onSuccess: () => {
          setShowArchiveConfirm(false);
        },
      },
    );
  };

  const getRoleBadgeVariant = (role: ProjectRole) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'MANAGER':
        return 'info';
      case 'DEVELOPER':
        return 'secondary';
      case 'TESTER':
        return 'warning';
      case 'VIEWER':
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={`/workspaces/${project.workspaceId}`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Workspace
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/projects" className="hover:text-primary transition-colors">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-foreground truncate">{project.name}</span>
      </div>

      {/* Header with Badges */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {project.name}
            </h1>
            <Badge variant="outline" className="text-xs font-mono font-bold uppercase tracking-wide">
              {project.key}
            </Badge>
            <Badge
              variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
              className="text-xs font-semibold"
            >
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {project.description || 'Project dashboard, boards, contributors, and settings.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('boards')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'boards'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Kanban className="h-4 w-4" />
          Boards ({boards.length})
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'statistics'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layout className="h-4 w-4" />
          Task Summary
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'members'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Contributors ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Tab: Boards */}
      {activeTab === 'boards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Kanban Boards</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Workflows and task columns belonging to this project.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowCreateBoard(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Board
            </Button>
          </div>

          {isLoadingBoards ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-[20px]" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <EmptyState
              icon={<Kanban className="h-6 w-6 text-muted-foreground" />}
              title="No boards yet"
              description="Create your first Kanban board to start tracking tasks and pipelines."
              actionLabel="Create Board"
              onAction={() => setShowCreateBoard(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="p-6 rounded-[20px] border border-border bg-card shadow-soft hover:shadow-soft-hover hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-accent text-primary flex items-center justify-center font-bold">
                        <Kanban className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                        {board.name}
                      </h3>
                    </div>
                    {board.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{board._count?.columns ?? 0} columns</span>
                    <span className="text-primary font-medium group-hover:underline">
                      Open Board &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Statistics */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent text-primary flex items-center justify-center">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats?.done ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats?.inProgress ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.total ? `${Math.round((stats.done / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Members / Contributors */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base">Project Contributors</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Teammates assigned to this project and their role permissions.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddMember(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Contributor
            </Button>
          </div>

          {isLoadingMembers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-[20px] border border-border bg-card space-y-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6 text-muted-foreground" />}
              title="No contributors yet"
              description="Assign workspace teammates to collaborate on this project."
              actionLabel="Add Contributor"
              onAction={() => setShowAddMember(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {members.map((member) => {
                const initials = member.user?.name
                  ? member.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'U';

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-[20px] border border-border bg-card flex items-center justify-between gap-3 shadow-xs hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-primary/20">
                        {member.user?.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.user.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {member.user?.name ?? 'Unknown Member'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={getRoleBadgeVariant(member.role)}
                        className="capitalize text-[10px] font-semibold"
                      >
                        {member.role.toLowerCase()}
                      </Badge>

                      {/* Member Actions Menu */}
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMemberMenuId(openMemberMenuId === member.id ? null : member.id)
                          }
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </button>

                        {openMemberMenuId === member.id && (
                          <div
                            className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border shadow-lg p-1 z-30 animate-in fade-in zoom-in-95"
                            onMouseLeave={() => setOpenMemberMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                setOpenMemberMenuId(null);
                                setSelectedMember(member);
                                setShowRoleDialog(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium transition-colors text-foreground"
                            >
                              <Shield className="h-3.5 w-3.5" /> Change Role
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button
                              onClick={() => {
                                setOpenMemberMenuId(null);
                                setSelectedMember(member);
                                setShowRemoveMemberDialog(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove from Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <ProjectSettingsForm
            key={`${project.id}-${project.name}-${project.key}-${project.status}-${project.color ?? ''}`}
            project={project}
            isUpdating={isUpdating}
            onUpdate={updateProject}
          />

          {/* Archive / Restore Action */}
          <div className="p-6 rounded-[20px] border border-border bg-card space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {project.status === 'ACTIVE' ? 'Archive Project' : 'Restore Project'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {project.status === 'ACTIVE'
                ? 'Archiving this project hides it from active boards and filters while preserving all tasks and historical data.'
                : 'Restoring this project brings it back to active workflows and board listings.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchiveConfirm(true)}
              className="gap-2"
            >
              {project.status === 'ACTIVE' ? (
                <>
                  <Archive className="h-3.5 w-3.5" /> Archive Project
                </>
              ) : (
                <>
                  <ArchiveRestore className="h-3.5 w-3.5" /> Restore Project
                </>
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
            <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
            <p className="text-xs text-muted-foreground">
              Permanently delete this project and all associated Kanban boards, task columns, and tasks.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              isLoading={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Project
            </Button>
          </div>
        </div>
      )}

      {/* Add Project Member Dialog */}
      <AddProjectMemberDialog
        projectId={projectId}
        workspaceId={project.workspaceId}
        open={showAddMember}
        onOpenChange={setShowAddMember}
        existingMemberUserIds={members.map((m) => m.userId)}
      />

      {/* Change Member Role Dialog */}
      <ChangeProjectMemberRoleDialog
        projectId={projectId}
        member={selectedMember}
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
      />

      {/* Remove Member Dialog */}
      <RemoveProjectMemberDialog
        projectId={projectId}
        member={selectedMember}
        open={showRemoveMemberDialog}
        onOpenChange={setShowRemoveMemberDialog}
      />

      {/* Create Board Dialog */}
      <CreateBoardDialog
        projectId={projectId}
        open={showCreateBoard}
        onOpenChange={setShowCreateBoard}
      />

      {/* Archive / Restore Confirmation */}
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={project.status === 'ACTIVE' ? 'Archive Project?' : 'Restore Project?'}
        description={
          project.status === 'ACTIVE'
            ? `Are you sure you want to archive "${project.name}"? You can restore it anytime.`
            : `Are you sure you want to restore "${project.name}" back to active projects?`
        }
        confirmText={project.status === 'ACTIVE' ? 'Archive' : 'Restore'}
        variant={project.status === 'ACTIVE' ? 'default' : 'default'}
        isPending={isUpdating}
        onConfirm={handleToggleArchive}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        variant="destructive"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

interface ProjectSettingsFormProps {
  project: Project;
  isUpdating: boolean;
  onUpdate: (data: UpdateProjectDto) => void;
}

const COLOR_PRESETS = [
  '#5B5CEB',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
];

function ProjectSettingsForm({
  project,
  isUpdating,
  onUpdate,
}: ProjectSettingsFormProps) {
  const [name, setName] = useState(project.name);
  const [key, setKey] = useState(project.key);
  const [description, setDescription] = useState(project.description || '');
  const [color, setColor] = useState(project.color || '#5B5CEB');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-[20px] border border-border bg-card space-y-4 shadow-xs">
      <h3 className="font-bold text-base text-foreground">General Settings</h3>

      {/* Project Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Project Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isUpdating}
          required
        />
      </div>

      {/* Project Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Project Key *
        </label>
        <Input
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          disabled={isUpdating}
          required
          maxLength={10}
        />
        <p className="text-[11px] text-muted-foreground">
          Task identifiers prefix (e.g. {key || 'PROJ'}-123).
        </p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isUpdating}
          rows={3}
          className="w-full p-3 rounded-[14px] border border-input bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Color Tag */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          Project Color Tag
        </label>
        <div className="flex items-center gap-2 pt-1">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              className={`h-7 w-7 rounded-full transition-transform ${
                color === preset
                  ? 'ring-2 ring-primary ring-offset-2 scale-110'
                  : 'opacity-80 hover:opacity-100 hover:scale-105'
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={isUpdating}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
