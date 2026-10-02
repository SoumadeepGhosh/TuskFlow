'use client';

import React from 'react';
import { WorkspaceMember } from '@/types/workspace';
import { useRemoveMember } from '@/hooks/api/use-workspaces';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface RemoveMemberDialogProps {
  workspaceId: number;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const removeMutation = useRemoveMember();

  if (!member) return null;

  const handleConfirm = () => {
    removeMutation.mutate(
      {
        workspaceId,
        memberId: member.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Member?"
      description={`Are you sure you want to remove "${member.user?.name || member.user?.email}" from this workspace? This action cannot be undone.`}
      confirmText="Remove"
      cancelLabel="Cancel"
      variant="destructive"
      isPending={removeMutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}
