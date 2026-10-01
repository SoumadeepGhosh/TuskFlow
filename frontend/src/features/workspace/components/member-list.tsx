'use client';

import React, { useState } from 'react';
import { WorkspaceMember, WorkspaceRole } from '@/types/workspace';
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from '../hooks/use-workspaces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Trash2, UserX, Users } from 'lucide-react';

interface MemberListProps {
  workspaceId: number;
  members?: WorkspaceMember[];
  isLoading: boolean;
  onInviteClick?: () => void;
}

export function MemberList({
  workspaceId,
  members,
  isLoading,
  onInviteClick,
}: MemberListProps) {
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(
    null,
  );
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMemberMutation(workspaceId);
  const { mutate: updateRole } = useUpdateMemberRoleMutation(workspaceId);

  const handleRoleChange = (memberId: number, newRole: WorkspaceRole) => {
    updateRole({ memberId, role: newRole });
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove) return;
    removeMember(memberToRemove.id, {
      onSuccess: () => setMemberToRemove(null),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-[16px] border border-border bg-card"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No members yet"
        description="Invite teammates to start collaborating on tasks and projects."
        actionLabel="Invite Member"
        onAction={onInviteClick}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-3 hover:bg-secondary/40 transition-colors"
            >
              {/* User Profile Info */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-primary text-sm">
                  {member.user?.name
                    ? member.user.name.substring(0, 2).toUpperCase()
                    : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">
                      {member.user?.name ?? 'Unknown User'}
                    </span>
                    {member.role === 'OWNER' && (
                      <Badge variant="default" className="text-[10px]">
                        Owner
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {member.user?.email}
                  </span>
                </div>
              </div>

              {/* Role & Actions */}
              <div className="flex items-center gap-3 ml-13 sm:ml-0">
                {member.role !== 'OWNER' ? (
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(
                        member.id,
                        e.target.value as WorkspaceRole,
                      )
                    }
                    className="h-8 rounded-[10px] border border-border bg-card px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OWNER">Transfer Owner</option>
                  </select>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    Primary Owner
                  </span>
                )}

                {member.role !== 'OWNER' && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setMemberToRemove(member)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove member</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove Member?"
        description={`Are you sure you want to remove "${memberToRemove?.user?.name ?? memberToRemove?.user?.email}" from this workspace? They will lose access to all projects and tasks in this workspace.`}
        confirmLabel="Remove Member"
        isPending={isRemoving}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
