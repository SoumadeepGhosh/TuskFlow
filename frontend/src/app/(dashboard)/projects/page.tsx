'use client';

import React, { useState } from 'react';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { ProjectCard } from '@/features/project/components/project-card';
import { CreateProjectDialog } from '@/features/project/components/create-project-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ChevronLeft, ChevronRight, FolderKanban, Plus, Search } from 'lucide-react';

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | undefined>(undefined);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: workspacesData } = useWorkspaces({ limit: 50 });
  const workspaces = workspacesData?.items ?? [];

  const { data, isLoading, isError, refetch } = useProjects({
    workspaceId: selectedWorkspaceId,
    page,
    limit: 9,
  });

  const projects = data?.items ?? [];
  const meta = data?.meta;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize your team goals, Kanban boards, and task backlogs."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full h-10 pl-10 pr-4 rounded-[14px] border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Workspace Filter */}
          <select
            value={selectedWorkspaceId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setSelectedWorkspaceId(val);
              setPage(1);
            }}
            className="w-full sm:w-56 h-10 rounded-[14px] border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Workspaces</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground self-start sm:self-auto">
            Showing {filteredProjects.length} of {meta.total} projects
          </p>
        )}
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-[20px] border border-border bg-card space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="pt-4 border-t border-border flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load projects.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title={search ? 'No matching projects' : 'No projects created yet'}
          description={
            search
              ? `No projects found matching "${search}".`
              : 'Create a project to start setting up boards and tasks.'
          }
          actionLabel={search ? undefined : 'Create Project'}
          onAction={search ? undefined : () => setShowCreateDialog(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
          <p className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultWorkspaceId={selectedWorkspaceId}
      />
    </div>
  );
}

