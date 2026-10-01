import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import {
  AddMemberDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceRole,
} from '@/types/workspace';
import { workspaceService } from '@/services/workspace.service';

export const WORKSPACE_KEYS = {
  all: ['workspaces'] as const,
  lists: () => [...WORKSPACE_KEYS.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...WORKSPACE_KEYS.lists(), params] as const,
  details: () => [...WORKSPACE_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...WORKSPACE_KEYS.details(), id] as const,
  members: (workspaceId: number, params?: { page?: number; limit?: number }) =>
    [...WORKSPACE_KEYS.detail(workspaceId), 'members', params] as const,
};

export function useWorkspaces(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.list(params),
    queryFn: () => workspaceService.getWorkspaces(params),
  });
}

export function useWorkspace(id: number) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.detail(id),
    queryFn: () => workspaceService.getWorkspace(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useWorkspaceMembers(
  workspaceId: number,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.members(workspaceId, params),
    queryFn: () => workspaceService.getMembers(workspaceId, params),
    enabled: !!workspaceId && !isNaN(workspaceId),
  });
}

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) =>
      workspaceService.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      toast.success(`Workspace "${newWorkspace.name}" created!`);
      void queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
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

export function useUpdateWorkspaceMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceDto) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (updated) => {
      toast.success('Workspace updated successfully');
      void queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
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

export function useDeleteWorkspaceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      toast.success('Workspace deleted successfully');
      void queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.lists() });
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

export function useAddMemberMutation(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberDto) =>
      workspaceService.addMember(workspaceId, data),
    onSuccess: () => {
      toast.success('Member added successfully');
      void queryClient.invalidateQueries({
        queryKey: WORKSPACE_KEYS.detail(workspaceId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to add member to workspace';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateMemberRoleMutation(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: number;
      role: WorkspaceRole;
    }) => workspaceService.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      toast.success('Member role updated');
      void queryClient.invalidateQueries({
        queryKey: WORKSPACE_KEYS.detail(workspaceId),
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

export function useRemoveMemberMutation(workspaceId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) =>
      workspaceService.removeMember(workspaceId, memberId),
    onSuccess: () => {
      toast.success('Member removed');
      void queryClient.invalidateQueries({
        queryKey: WORKSPACE_KEYS.detail(workspaceId),
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
