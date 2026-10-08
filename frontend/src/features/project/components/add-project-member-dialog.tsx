'use client';

import React, { useState } from 'react';
import { ProjectRole } from '@/types/project';
import { useAddProjectMemberMutation } from '../hooks/use-projects';
import { useMembers } from '@/hooks/api/use-workspaces';
import { WorkspaceMember } from '@/types/workspace';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddProjectMemberDialogProps {
  projectId: number;
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMemberUserIds?: number[];
}

export function AddProjectMemberDialog({
  projectId,
  workspaceId,
  open,
  onOpenChange,
  existingMemberUserIds = [],
}: AddProjectMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('DEVELOPER');

  const { data: workspaceMembersData } = useMembers(workspaceId, { limit: 100 });
  const rawWsMembers = workspaceMembersData as unknown;
  const workspaceMembers: WorkspaceMember[] = Array.isArray(rawWsMembers)
    ? (rawWsMembers as WorkspaceMember[])
    : (workspaceMembersData?.items ?? []);

  // Filter workspace members who are active and not already in this project
  const eligibleWorkspaceMembers = workspaceMembers.filter(
    (wm) =>
      wm.status === 'ACTIVE' &&
      wm.user?.email &&
      !existingMemberUserIds.includes(wm.userId),
  );

  const addMemberMutation = useAddProjectMemberMutation(projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    addMemberMutation.mutate(
      {
        email: email.trim().toLowerCase(),
        role,
      },
      {
        onSuccess: () => {
          setEmail('');
          setRole('DEVELOPER');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Add Project Contributor</DialogTitle>
        <DialogDescription>
          Assign a member from this workspace to contribute to tasks and boards in this project.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick select from workspace members */}
        {eligibleWorkspaceMembers.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Workspace Member
            </label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={addMemberMutation.isPending}
              className="w-full h-11 px-3.5 rounded-[14px] border border-border bg-card text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">-- Choose a teammate or type below --</option>
              {eligibleWorkspaceMembers.map((m) => (
                <option key={m.id} value={m.user.email}>
                  {m.user.name || m.user.email} ({m.user.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Manual Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Teammate Email *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            disabled={addMemberMutation.isPending}
            required
            autoFocus={eligibleWorkspaceMembers.length === 0}
          />
        </div>

        {/* Role Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectRole)}
            disabled={addMemberMutation.isPending}
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
            disabled={addMemberMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={addMemberMutation.isPending}>
            Add Contributor
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

