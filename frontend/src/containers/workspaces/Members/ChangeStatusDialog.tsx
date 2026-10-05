'use client';

import React, { useState } from 'react';
import { MemberStatus, WorkspaceMember } from '@/types/workspace';
import { useUpdateMemberStatus } from '@/hooks/api/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChangeStatusDialogProps {
  workspaceId: number;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChangeStatusFormProps {
  workspaceId: number;
  member: WorkspaceMember;
  onClose: () => void;
}

function ChangeStatusForm({ workspaceId, member, onClose }: ChangeStatusFormProps) {
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const updateStatusMutation = useUpdateMemberStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateStatusMutation.mutate(
      {
        workspaceId,
        memberId: member.id,
        status,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MemberStatus)}
          disabled={updateStatusMutation.isPending}
          className="w-full h-11 px-3.5 rounded-[14px] border border-border bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="ACTIVE">ACTIVE (Active contributor)</option>
          <option value="PENDING">PENDING (Awaiting confirmation)</option>
          <option value="REMOVED">REMOVED (Access revoked)</option>
        </select>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={updateStatusMutation.isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={updateStatusMutation.isPending}>
          Update Status
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ChangeStatusDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Update Member Status</DialogTitle>
        <DialogDescription>
          Change status for {member.user?.name || member.user?.email}.
        </DialogDescription>
      </DialogHeader>

      <ChangeStatusForm
        key={`${member.id}-${member.status}`}
        workspaceId={workspaceId}
        member={member}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
