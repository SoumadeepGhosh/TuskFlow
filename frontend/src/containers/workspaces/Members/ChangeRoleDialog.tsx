'use client';

import React, { useState } from 'react';
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

interface ChangeRoleFormProps {
  workspaceId: number;
  member: WorkspaceMember;
  onClose: () => void;
}

function ChangeRoleForm({ workspaceId, member, onClose }: ChangeRoleFormProps) {
  const [role, setRole] = useState<WorkspaceRole>(member.role);
  const updateRoleMutation = useUpdateMemberRole();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateRoleMutation.mutate(
      {
        workspaceId,
        memberId: member.id,
        role,
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
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={updateRoleMutation.isPending}>
          Update Role
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ChangeRoleDialog({
  workspaceId,
  member,
  open,
  onOpenChange,
}: ChangeRoleDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Change Member Role</DialogTitle>
        <DialogDescription>
          Update permission level for {member.user?.name || member.user?.email}.
        </DialogDescription>
      </DialogHeader>

      <ChangeRoleForm
        key={`${member.id}-${member.role}`}
        workspaceId={workspaceId}
        member={member}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
