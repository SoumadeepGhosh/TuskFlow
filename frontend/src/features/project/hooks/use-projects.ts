import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  ProjectRole,
  ProjectStatus,
  UpdateProjectDto,
} from '@/types/project';
import { projectService } from '@/services/project.service';

export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  list: (params?: {
    workspaceId?: number;
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }) => [...PROJECT_KEYS.lists(), params] as const,
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROJECT_KEYS.details(), id] as const,
  stats: (id: number) => [...PROJECT_KEYS.detail(id), 'statistics'] as const,
  members: (id: number, params?: { page?: number; limit?: number }) =>
    [...PROJECT_KEYS.detail(id), 'members', params] as const,
};

export function useProjects(params?: {
  workspaceId?: number;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: PROJECT_KEYS.list(params),
    queryFn: () => projectService.getProjects(params),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => projectService.getProject(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useProjectStatistics(id: number) {
  return useQuery({
    queryKey: PROJECT_KEYS.stats(id),
    queryFn: () => projectService.getProjectStatistics(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useProjectMembers(
  projectId: number,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: PROJECT_KEYS.members(projectId, params),
    queryFn: () => projectService.getMembers(projectId, params),
    enabled: !!projectId && !isNaN(projectId),
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectService.createProject(data),
    onSuccess: (newProject) => {
      toast.success(`Project "${newProject.name}" created!`);
      void queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create project';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateProjectMutation(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectDto) =>
      projectService.updateProject(id, data),
    onSuccess: () => {
      toast.success('Project updated');
      void queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(id) });
      void queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update project';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted');
      void queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete project';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useAddProjectMemberMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddProjectMemberDto) =>
      projectService.addMember(projectId, data),
    onSuccess: () => {
      toast.success('Member added to project');
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.members(projectId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to add member to project';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateProjectMemberRoleMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: number;
      role: ProjectRole;
    }) => projectService.updateMemberRole(projectId, memberId, role),
    onSuccess: () => {
      toast.success('Project role updated');
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.members(projectId),
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update role';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useRemoveProjectMemberMutation(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) =>
      projectService.removeMember(projectId, memberId),
    onSuccess: () => {
      toast.success('Member removed from project');
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.detail(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: PROJECT_KEYS.members(projectId),
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

