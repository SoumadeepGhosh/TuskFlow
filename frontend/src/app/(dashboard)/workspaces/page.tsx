'use client';

import React, { useState } from 'react';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { WorkspaceCard } from '@/features/workspace/components/workspace-card';
import { CreateWorkspaceDialog } from '@/features/workspace/components/create-workspace-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Briefcase, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';

export default function WorkspacesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data, isLoading, isError, refetch } = useWorkspaces({
    page,
    limit: 9,
  });

  const workspaces = data?.items ?? [];
  const meta = data?.meta;

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Organize your teams, projects, and Kanban boards across dedicated workspaces."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Workspaces' }]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workspace
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces by name..."
            className="w-full h-10 pl-10 pr-4 rounded-[14px] border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground self-start sm:self-auto">
            Showing {filteredWorkspaces.length} of {meta.total} workspaces
          </p>
        )}
      </div>

      {/* Main Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-[20px] border border-border bg-card space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-2xl" />
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
            Failed to load workspaces. Please check your connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-6 w-6" />}
          title={search ? 'No matching workspaces' : 'No workspaces yet'}
          description={
            search
              ? `No workspaces found matching "${search}".`
              : 'Create your first workspace to start grouping projects and boards.'
          }
          actionLabel={search ? undefined : 'Create Workspace'}
          onAction={search ? undefined : () => setShowCreateDialog(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
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

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
