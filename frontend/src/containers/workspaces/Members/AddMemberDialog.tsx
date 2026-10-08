'use client';

import React, { useState } from 'react';
import { WorkspaceRole } from '@/types/workspace';
import { useInviteMember } from '@/hooks/api/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddMemberDialogProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: AddMemberDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');

  const inviteMemberMutation = useInviteMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMemberMutation.mutate(
      {
        workspaceId,
        data: {
          email: email.trim(),
          role,
        },
      },
      {
        onSuccess: () => {
          setEmail('');
          setRole('MEMBER');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Invite Member to Workspace</DialogTitle>
        <DialogDescription>
          Send an invitation email to collaborate in this workspace. The invitee will receive a link to join.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            User Email *
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            disabled={inviteMemberMutation.isPending}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as WorkspaceRole)}
            disabled={inviteMemberMutation.isPending}
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
            disabled={inviteMemberMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={inviteMemberMutation.isPending}>
            Send Invitation
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
