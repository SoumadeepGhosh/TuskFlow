'use client';

import React from 'react';
import { Workspace } from '@/types/workspace';
import { WorkspaceCard } from './WorkspaceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

interface WorkspaceListProps {
  workspaces: Workspace[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
  onCreateClick: () => void;
  isFiltered?: boolean;
}

export function WorkspaceList({
  workspaces,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onCreateClick,
  isFiltered = false,
}: WorkspaceListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-[20px] border border-border bg-card space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2 flex-1">
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
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Failed to load workspaces. Please check your connection.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={isFiltered ? 'No matching workspaces' : 'No workspaces yet'}
        description={
          isFiltered
            ? 'Try adjusting your search criteria.'
            : 'Get started by creating your first workspace to collaborate with your team.'
        }
        action={
          !isFiltered
            ? {
                label: 'Create Workspace',
                onClick: onCreateClick,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
