import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import {
  AddMemberDto,
  CreateWorkspaceDto,
  InviteMemberDto,
  MemberStatus,
  UpdateWorkspaceDto,
  WorkspaceRole,
} from '@/types/workspace';
import { workspaceService } from '@/services/workspace.service';

export function useWorkspaces(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['workspaces', params],
    queryFn: () => workspaceService.getWorkspaces(params),
  });
}

export function useWorkspace(id: number) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceService.getWorkspace(id),
    enabled: Boolean(id) && !isNaN(id),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) =>
      workspaceService.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      toast.success(`Workspace "${newWorkspace.name}" created!`);
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create workspace';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkspaceDto }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (updated) => {
      toast.success('Workspace updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      void queryClient.invalidateQueries({ queryKey: ['workspace', updated.id] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update workspace';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      toast.success('Workspace deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete workspace';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useMembers(
  workspaceId: number,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId, params],
    queryFn: () => workspaceService.getMembers(workspaceId, params),
    enabled: Boolean(workspaceId) && !isNaN(workspaceId),
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number;
      data: AddMemberDto;
    }) => workspaceService.addMember(workspaceId, data),
    onSuccess: (_, variables) => {
      toast.success('Member added successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-members', variables.workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['workspace', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to add member';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      memberId,
      role,
    }: {
      workspaceId: number;
      memberId: number;
      role: WorkspaceRole;
    }) => workspaceService.updateMemberRole(workspaceId, memberId, role),
    onSuccess: (_, variables) => {
      toast.success('Member role updated successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-members', variables.workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['workspace', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update member role';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      memberId,
      status,
    }: {
      workspaceId: number;
      memberId: number;
      status: MemberStatus;
    }) => workspaceService.updateMemberStatus(workspaceId, memberId, status),
    onSuccess: (_, variables) => {
      toast.success('Member status updated successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-members', variables.workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['workspace', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update member status';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      memberId,
    }: {
      workspaceId: number;
      memberId: number;
    }) => workspaceService.removeMember(workspaceId, memberId),
    onSuccess: (_, variables) => {
      toast.success('Member removed successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-members', variables.workspaceId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['workspace', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to remove member';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useWorkspaceInvitations(workspaceId: number) {
  return useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: () => workspaceService.getInvitations(workspaceId),
    enabled: Boolean(workspaceId) && !isNaN(workspaceId),
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number;
      data: InviteMemberDto;
    }) => workspaceService.inviteMember(workspaceId, data),
    onSuccess: (_, variables) => {
      toast.success('Invitation sent successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-invitations', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to send invitation';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: number;
      invitationId: number;
    }) => workspaceService.cancelInvitation(workspaceId, invitationId),
    onSuccess: (_, variables) => {
      toast.success('Invitation cancelled');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-invitations', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel invitation';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: number;
      invitationId: number;
    }) => workspaceService.resendInvitation(workspaceId, invitationId),
    onSuccess: (_, variables) => {
      toast.success('Invitation resent successfully');
      void queryClient.invalidateQueries({
        queryKey: ['workspace-invitations', variables.workspaceId],
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to resend invitation';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useInvitationByToken(token: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => workspaceService.getInvitationByToken(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspaceService.acceptInvitation(token),
    onSuccess: (data) => {
      toast.success('Invitation accepted! Welcome to the workspace.');
      void queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (data?.workspaceId) {
        void queryClient.invalidateQueries({
          queryKey: ['workspace', data.workspaceId],
        });
        void queryClient.invalidateQueries({
          queryKey: ['workspace-members', data.workspaceId],
        });
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to accept invitation';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useDeclineInvitation() {
  return useMutation({
    mutationFn: (token: string) => workspaceService.declineInvitation(token),
    onSuccess: () => {
      toast.info('Invitation declined');
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to decline invitation';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}
