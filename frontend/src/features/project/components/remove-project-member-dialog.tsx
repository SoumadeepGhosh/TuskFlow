'use client';

import React from 'react';
import { ProjectMember } from '@/types/project';
import { useRemoveProjectMemberMutation } from '../hooks/use-projects';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface RemoveProjectMemberDialogProps {
  projectId: number;
  member: ProjectMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveProjectMemberDialog({
  projectId,
  member,
  open,
  onOpenChange,
}: RemoveProjectMemberDialogProps) {
  const removeMutation = useRemoveProjectMemberMutation(projectId);

  const handleConfirm = () => {
    if (!member) return;
    removeMutation.mutate(member.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Contributor"
      description={`Are you sure you want to remove ${member?.user?.name || member?.user?.email} from this project? They will lose access to project boards and assigned tasks.`}
      confirmText="Remove Contributor"
      variant="destructive"
      isPending={removeMutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}

