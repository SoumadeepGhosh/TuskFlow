'use client';

import React, { useState } from 'react';
import { ProjectMember, ProjectRole } from '@/types/project';
import { useUpdateProjectMemberRoleMutation } from '../hooks/use-projects';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChangeProjectMemberRoleDialogProps {
  projectId: number;
  member: ProjectMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChangeRoleFormProps {
  projectId: number;
  member: ProjectMember;
  onClose: () => void;
}

function ChangeRoleForm({ projectId, member, onClose }: ChangeRoleFormProps) {
  const [role, setRole] = useState<ProjectRole>(member.role);
  const updateRoleMutation = useUpdateProjectMemberRoleMutation(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate(
      {
        memberId: member.id,
        role,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Change Project Role</DialogTitle>
        <DialogDescription>
          Update contributor role for{' '}
          <span className="font-semibold text-foreground">
            {member.user?.name || member.user?.email}
          </span>
          .
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            disabled={updateRoleMutation.isPending}
            className="w-full h-11 px-3.5 rounded-[14px] border border-border bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="DEVELOPER">Developer (Create & update tasks)</option>
            <option value="MANAGER">Manager (Manage boards & tasks)</option>
            <option value="TESTER">Tester (QA & task review)</option>
            <option value="VIEWER">Viewer (Read-only access)</option>
            <option value="OWNER">Owner (Full project control)</option>
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
    </>
  );
}

export function ChangeProjectMemberRoleDialog({
  projectId,
  member,
  open,
  onOpenChange,
}: ChangeProjectMemberRoleDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ChangeRoleForm
        key={member.id}
        projectId={projectId}
        member={member}
        onClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

