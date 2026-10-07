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
import type { Project } from '@/types/project';
import { useBoards } from '@/features/board/hooks/use-boards';
import { CreateBoardDialog } from '@/features/board/components/create-board-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<'boards' | 'statistics' | 'members' | 'settings'>('boards');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: stats } = useProjectStatistics(projectId);
  const { data: boardsData, isLoading: isLoadingBoards } = useBoards({ projectId });
  const { data: membersData } = useProjectMembers(projectId);

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectMutation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
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

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => router.push('/projects'),
    });
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

      <PageHeader
        title={project.name}
        description={project.description || 'Project dashboard, boards, and statistics.'}
      />

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
          Members ({membersData?.items?.length ?? 0})
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
            <h2 className="text-lg font-bold text-foreground">Kanban Boards</h2>
            <Button size="sm" onClick={() => setShowCreateBoard(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
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
            <div className="p-8 text-center rounded-[20px] border border-dashed border-border bg-card/50">
              <Kanban className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No boards yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Create a Kanban board to begin adding task columns and moving work forward.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setShowCreateBoard(true)}>
                Create First Board
              </Button>
            </div>
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
                <p className="text-xs font-semibold text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{stats?.done ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats?.inProgress ?? 0}</p>
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.total ? `${Math.round((stats.done / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">Project Contributors</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {membersData?.items?.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-[20px] border border-border bg-card flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xs">
                  {member.user?.name ? member.user.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="truncate flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {member.user?.name ?? 'Unknown Member'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {member.role.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <ProjectSettingsForm
            key={`${project.id}-${project.name}-${project.description ?? ''}`}
            project={project}
            isUpdating={isUpdating}
            onUpdate={updateProject}
          />

          <div className="pt-6 border-t border-border">
            <h4 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Permanently delete this project and all associated Kanban boards and tasks.
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

      {/* Create Board Dialog */}
      <CreateBoardDialog
        projectId={projectId}
        open={showCreateBoard}
        onOpenChange={setShowCreateBoard}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

interface ProjectSettingsFormProps {
  project: Project;
  isUpdating: boolean;
  onUpdate: (data: { name: string; description?: string }) => void;
}

function ProjectSettingsForm({
  project,
  isUpdating,
  onUpdate,
}: ProjectSettingsFormProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
          Project Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isUpdating}
          required
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1">
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

      <Button type="submit" isLoading={isUpdating}>
        Save Changes
      </Button>
    </form>
  );
}

