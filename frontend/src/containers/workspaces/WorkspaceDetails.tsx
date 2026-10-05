'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace, useDeleteWorkspace } from '@/hooks/api/use-workspaces';
import { useProjects } from '@/features/project/hooks/use-projects';
import { Project } from '@/types/project';
import { CreateProjectDialog } from '@/features/project/components/create-project-dialog';
import { MembersTable } from './Members/MembersTable';
import { WorkspaceForm } from './WorkspaceForm';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  ArrowLeft,
  ChevronRight,
  FolderKanban,
  Pencil,
  Plus,
  Settings,
  Trash2,
  User,
  Users,
} from 'lucide-react';

interface WorkspaceDetailsProps {
  workspaceId: number;
}

export function WorkspaceDetails({ workspaceId }: WorkspaceDetailsProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({
    workspaceId,
    limit: 20,
  });

  const deleteMutation = useDeleteWorkspace();

  const rawProjects = projectsData as unknown;
  const projects: Project[] = Array.isArray(rawProjects)
    ? (rawProjects as Project[])
    : (projectsData?.items ?? []);
  const memberCount =
    workspace?._count?.members ?? workspace?.members?.length ?? 1;
  const projectCount =
    workspace?._count?.projects ?? projects.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Workspace not found or you don&apos;t have access.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push('/workspaces')}>
          Back to Workspaces
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(workspaceId, {
      onSuccess: () => router.push('/workspaces'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/workspaces"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Workspaces
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-foreground truncate">{workspace.name}</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={workspace.name}
          description={workspace.description || `Slug: /${workspace.slug}`}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Workspace
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards: Owner, Member Count, Project Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Owner */}
        <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Workspace Owner
            </p>
            <p className="text-sm font-bold text-foreground truncate">
              {workspace.owner?.name || workspace.owner?.email || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Member Count */}
        <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Members
            </p>
            <p className="text-2xl font-bold text-foreground">{memberCount}</p>
          </div>
        </div>

        {/* Project Count */}
        <div className="p-5 rounded-[20px] bg-card border border-border shadow-soft flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projects
            </p>
            <p className="text-2xl font-bold text-foreground">{projectCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          Projects ({projects.length})
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
          Members ({memberCount})
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

      {/* Tab: Overview / Projects */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground">Projects</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage development cycles, roadmaps, and Kanban pipelines.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowCreateProjectDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 rounded-[20px]" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center rounded-[20px] border border-dashed border-border bg-card/50">
              <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Create your first project within this workspace to start building Kanban boards.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setShowCreateProjectDialog(true)}
              >
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-6 rounded-[20px] border border-border bg-card shadow-soft hover:shadow-soft-hover hover:border-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-accent text-primary flex items-center justify-center font-bold">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project._count?.boards ?? 0} boards</span>
                    <span className="text-primary font-medium group-hover:underline">
                      Open Project &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Members Table */}
      {activeTab === 'members' && (
        <MembersTable workspaceId={workspaceId} />
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div className="p-6 rounded-[20px] border border-border bg-card space-y-4">
            <h3 className="font-bold text-base text-foreground">Workspace Settings</h3>
            <p className="text-xs text-muted-foreground">
              Modify workspace details or remove this workspace permanently.
            </p>

            <Button
              onClick={() => setShowEditDialog(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit Name & Description
            </Button>
          </div>

          <div className="p-6 rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
            <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
            <p className="text-xs text-muted-foreground">
              Permanently delete this workspace and all associated projects, Kanban boards, and task data.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              isLoading={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Workspace
            </Button>
          </div>
        </div>
      )}

      {/* Edit Workspace Dialog */}
      <WorkspaceForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        workspace={workspace}
      />

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={showCreateProjectDialog}
        onOpenChange={setShowCreateProjectDialog}
        defaultWorkspaceId={workspaceId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Workspace?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
