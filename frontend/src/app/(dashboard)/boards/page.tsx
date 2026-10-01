'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useBoards } from '@/features/board/hooks/use-boards';
import { BoardCard } from '@/features/board/components/board-card';
import { CreateBoardDialog } from '@/features/board/components/create-board-dialog';
import { Kanban, Plus } from 'lucide-react';

export default function BoardsPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useBoards({
    page,
    limit: 12,
  });

  const boards = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Boards"
          description="Track tasks, stages, and execution flow across customizable Kanban columns."
        />
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Board
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-16 text-center">
          <p className="text-destructive font-semibold mb-2">Failed to load boards</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No boards found"
          description="Create your first Kanban board to start organizing and moving tasks with your team."
          action={{
            label: 'Create Board',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground border-t border-border">
              <span>
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total boards)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateBoardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}

