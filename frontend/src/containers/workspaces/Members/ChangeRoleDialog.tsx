'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceMember, WorkspaceRole } from '@/types/workspace';
import { useUpdateMemberRole } from '@/hooks/api/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChangeRoleDialogProps {
  workspaceId: number;
  member: WorkspaceMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const updateRoleMutation = useUpdateMemberRole();

  useEffect(() => {
    if (member) {
      setRole(member.role);
    }
  }, [member, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    updateRoleMutation.mutate(
      {
        workspaceId,
        memberId: member.id,
        role,
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
        <DialogTitle>Change Member Role</DialogTitle>
        <DialogDescription>
          Update permission level for {member.user?.name || member.user?.email}.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as WorkspaceRole)}
            disabled={updateRoleMutation.isPending}
            className="w-full h-11 px-3.5 rounded-[14px] border border-border bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="MEMBER">Member (Can create & view tasks)</option>
            <option value="ADMIN">Admin (Can manage projects & invite)</option>
            <option value="OWNER">Owner (Full workspace access)</option>
          </select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={updateRoleMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={updateRoleMutation.isPending}>
            Update Role
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
