'use client';

import React, { useState } from 'react';
import { WorkspaceMember } from '@/types/workspace';
import { useMembers } from '@/hooks/api/use-workspaces';
import { AddMemberDialog } from './AddMemberDialog';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { ChangeStatusDialog } from './ChangeStatusDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { PendingInvitations } from './PendingInvitations';
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
import { EmptyState } from '@/components/ui/empty-state';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  MoreHorizontal,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

interface MembersTableProps {
  workspaceId: number;
}

export function MembersTable({ workspaceId }: MembersTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useMembers(workspaceId);

  const rawData = data as unknown;
  const members: WorkspaceMember[] = Array.isArray(rawData)
    ? (rawData as WorkspaceMember[])
    : (data?.items ?? []);

  const getRoleBadgeVariant = (role: WorkspaceMember['role']) => {
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

  const getStatusBadgeVariant = (status: WorkspaceMember['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REMOVED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-foreground">Workspace Members</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage contributors, access roles, and invitation status.
          </p>
        </div>

        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="rounded-[20px] border border-border bg-card p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load members. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite your teammates to join this workspace and begin assigning work."
          action={{
            label: 'Invite Member',
            onClick: () => setShowAddDialog(true),
          }}
        />
      ) : (
        <div className="rounded-[20px] border border-border bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const userInitials = member.user?.name
                  ? member.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'U';

                const joinedDate = member.joinedAt || member.createdAt;

                return (
                  <TableRow key={member.id} className="group">
                    {/* Avatar */}
                    <TableCell>
                      <UserAvatar user={member.user} size="sm" />
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-semibold text-foreground truncate max-w-[180px]">
                      {member.user?.name || 'Unnamed Member'}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">
                      {member.user?.email}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize text-[11px] font-semibold">
                        {member.role.toLowerCase()}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(member.status)} className="capitalize text-[11px] font-semibold">
                        {member.status.toLowerCase()}
                      </Badge>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {joinedDate
                        ? new Date(joinedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === member.id ? null : member.id)
                          }
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </button>

                        {openMenuId === member.id && (
                          <div
                            className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border shadow-lg p-1 z-30 animate-in fade-in zoom-in-95"
                            onMouseLeave={() => setOpenMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedMember(member);
                                setShowRoleDialog(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium transition-colors text-foreground"
                            >
                              <Shield className="h-3.5 w-3.5" /> Change Role
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedMember(member);
                                setShowStatusDialog(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium transition-colors text-foreground"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Change Status
                            </button>
                            <div className="h-px bg-border my-1" />
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setSelectedMember(member);
                                setShowRemoveDialog(true);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove Member
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pending Workspace Invitations */}
      <PendingInvitations workspaceId={workspaceId} />

      {/* Add Member Dialog */}
      <AddMemberDialog
        workspaceId={workspaceId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        workspaceId={workspaceId}
        member={selectedMember}
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
      />

      {/* Change Status Dialog */}
      <ChangeStatusDialog
        workspaceId={workspaceId}
        member={selectedMember}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
      />

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        workspaceId={workspaceId}
        member={selectedMember}
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
      />
    </div>
  );
}
