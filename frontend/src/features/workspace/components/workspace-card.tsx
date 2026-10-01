'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Workspace } from '@/types/workspace';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteWorkspaceMutation } from '../hooks/use-workspaces';
import { FolderKanban, MoreVertical, Trash2, Users } from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit?: (workspace: Workspace) => void;
}

export function WorkspaceCard({ workspace, onEdit }: WorkspaceCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspaceMutation();

  const projectCount = workspace._count?.projects ?? 0;
  const memberCount = workspace._count?.members ?? 0;

  const handleDelete = () => {
    deleteWorkspace(workspace.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  return (
    <>
      <Card className="group relative hover:border-primary/40 hover:shadow-soft-hover transition-all duration-200">
        <Link
          href={`/workspaces/${workspace.id}`}
          className="absolute inset-0 z-0"
        />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                {workspace.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">
                  {workspace.name}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  /{workspace.slug}
                </span>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 rounded-[14px] border border-border bg-card p-1.5 shadow-xl">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit(workspace);
                        }}
                        className="w-full rounded-[10px] px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        Edit Details
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {workspace.description && (
            <p className="mt-3.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {workspace.description}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                {projectCount} {projectCount === 1 ? 'project' : 'projects'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>

            <Badge variant="secondary" className="text-[10px]">
              Workspace
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${workspace.name}"?`}
        description="This will permanently delete this workspace, including all of its projects, Kanban boards, and task history. This action cannot be undone."
        confirmLabel="Delete Workspace"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
