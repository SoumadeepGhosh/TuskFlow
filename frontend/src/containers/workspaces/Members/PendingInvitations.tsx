'use client';

import React, { useState } from 'react';
import { WorkspaceInvitation, WorkspaceRole } from '@/types/workspace';
import {
  useWorkspaceInvitations,
  useCancelInvitation,
  useResendInvitation,
} from '@/hooks/api/use-workspaces';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Mail, RotateCcw, Trash2, Clock } from 'lucide-react';

interface PendingInvitationsProps {
  workspaceId: number;
}

export function PendingInvitations({ workspaceId }: PendingInvitationsProps) {
  const { data: rawInvitations, isLoading, isError, refetch } =
    useWorkspaceInvitations(workspaceId);

  const cancelMutation = useCancelInvitation();
  const resendMutation = useResendInvitation();

  const [invitationToCancel, setInvitationToCancel] =
    useState<WorkspaceInvitation | null>(null);

  const invitations: WorkspaceInvitation[] = Array.isArray(rawInvitations)
    ? rawInvitations
    : [];

  const getRoleBadgeVariant = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'info';
      case 'MEMBER':
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: WorkspaceInvitation['status']) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'success';
      case 'DECLINED':
      case 'CANCELLED':
      case 'EXPIRED':
      default:
        return 'secondary';
    }
  };

  const handleConfirmCancel = () => {
    if (!invitationToCancel) return;
    cancelMutation.mutate(
      {
        workspaceId,
        invitationId: invitationToCancel.id,
      },
      {
        onSuccess: () => {
          setInvitationToCancel(null);
        },
      },
    );
  };

  const handleResend = (invitation: WorkspaceInvitation) => {
    resendMutation.mutate({
      workspaceId,
      invitationId: invitation.id,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-36" />
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-2">
        <p className="text-xs font-semibold text-destructive">
          Failed to load pending invitations.
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // When there are no invitations, keep view clean
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Workspace Invitations ({invitations.length})
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invitations waiting to be accepted or previously processed.
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-secondary/40">
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Invited Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const isPending = invitation.status === 'PENDING';
              const isExpired = invitation.status === 'EXPIRED';
              const canResend = isPending || isExpired;
              const canCancel = isPending;

              return (
                <TableRow key={invitation.id} className="group">
                  <TableCell className="font-medium text-xs text-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {invitation.email}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(invitation.role)}
                      className="capitalize text-[11px] font-semibold"
                    >
                      {invitation.role.toLowerCase()}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(invitation.status)}
                      className="capitalize text-[11px] font-semibold"
                    >
                      {invitation.status.toLowerCase()}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground truncate max-w-[180px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <UserAvatar user={invitation.inviter} size="xs" />
                      <span className="truncate">
                        {invitation.inviter?.name ||
                          invitation.inviter?.email ||
                          'Administrator'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(invitation.createdAt).toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {new Date(invitation.expiresAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                        },
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canResend && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(invitation)}
                          isLoading={
                            resendMutation.isPending &&
                            resendMutation.variables?.invitationId ===
                              invitation.id
                          }
                          title="Resend invitation email"
                          className="h-8 px-2 text-xs gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Resend</span>
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInvitationToCancel(invitation)}
                          title="Cancel invitation"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={Boolean(invitationToCancel)}
        onOpenChange={(open) => {
          if (!open) setInvitationToCancel(null);
        }}
        title="Cancel Invitation"
        description={`Are you sure you want to cancel the invitation sent to ${invitationToCancel?.email}?`}
        confirmText="Cancel Invitation"
        cancelLabel="Keep Invitation"
        variant="destructive"
        isPending={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

