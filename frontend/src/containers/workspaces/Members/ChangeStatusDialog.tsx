'use client';

import React, { useState, useEffect } from 'react';
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

export function ChangeStatusDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const [status, setStatus] = useState<MemberStatus>('ACTIVE');
  const updateStatusMutation = useUpdateMemberStatus();

  useEffect(() => {
    if (member) {
      setStatus(member.status);
    }
  }, [member, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    updateStatusMutation.mutate(
      {
        workspaceId,
        memberId: member.id,
        status,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Update Member Status</DialogTitle>
        <DialogDescription>
          Change status for {member.user?.name || member.user?.email}.
        </DialogDescription>
      </DialogHeader>

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
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={updateStatusMutation.isPending}>
            Update Status
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
