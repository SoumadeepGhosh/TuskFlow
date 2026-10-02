'use client';

import React, { useState } from 'react';
import { Workspace } from '@/types/workspace';
import { useWorkspaces, useDeleteWorkspace } from '@/hooks/api/use-workspaces';
import { WorkspaceList } from './WorkspaceList';
import { WorkspaceForm } from './WorkspaceForm';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Search } from 'lucide-react';

export function WorkspacePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, isError, refetch } = useWorkspaces({
    page,
    limit: 12,
  });

  const deleteMutation = useDeleteWorkspace();

  const rawData = data as unknown;
  const workspaces: Workspace[] = Array.isArray(rawData)
    ? (rawData as Workspace[])
    : (data?.items ?? []);
  const meta = Array.isArray(rawData)
    ? {
        total: rawData.length,
        page: 1,
        limit: rawData.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    : data?.meta;

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setEditingWorkspace(null);
    setShowFormDialog(true);
  };

  const handleOpenEdit = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setShowFormDialog(true);
  };

  const handleOpenDelete = (ws: Workspace) => {
    setDeletingWorkspace(ws);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingWorkspace) return;
    deleteMutation.mutate(deletingWorkspace.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setDeletingWorkspace(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Organize your teams, projects, and Kanban boards across dedicated workspaces."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Workspaces' }]}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Workspace
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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

      {/* Workspace List */}
      <WorkspaceList
        workspaces={filteredWorkspaces}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreateClick={handleOpenCreate}
        isFiltered={Boolean(search.trim())}
      />

      {/* Pagination (if applicable) */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Workspace Dialog */}
      <WorkspaceForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        workspace={editingWorkspace}
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
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
