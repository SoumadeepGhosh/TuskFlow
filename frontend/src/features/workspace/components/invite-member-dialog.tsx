'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  inviteMemberSchema,
  InviteMemberFormData,
} from '../schemas/workspace.schema';
import { useAddMemberMutation } from '../hooks/use-workspaces';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { WorkspaceRole } from '@/types/workspace';

interface InviteMemberDialogProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { mutate: addMember, isPending } = useAddMemberMutation(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = (data: InviteMemberFormData) => {
    addMember(
      {
        email: data.email,
        role: data.role as WorkspaceRole,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogDescription>
          Add a team member to this workspace by their registered email address.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="member-email"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Email Address *
          </label>
          <Input
            id="member-email"
            type="email"
            placeholder="colleague@taskflow.dev"
            disabled={isPending}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="member-role"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Role
          </label>
          <select
            id="member-role"
            disabled={isPending}
            className="w-full h-11 rounded-[14px] border border-border bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
            {...register('role')}
          >
            <option value="MEMBER">Member (Can edit tasks and projects)</option>
            <option value="ADMIN">Admin (Can manage settings and members)</option>
            <option value="OWNER">Owner (Full control)</option>
          </select>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" className="text-white" />
                Inviting...
              </span>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
