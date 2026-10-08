import { apiClient } from '@/lib/axios';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  Project,
  ProjectMember,
  ProjectRole,
  ProjectStatus,
  ProjectTaskStatistics,
  UpdateProjectDto,
} from '@/types/project';
import { PaginatedResponse } from '@/types/api';

export const projectService = {
  async getProjects(params?: {
    workspaceId?: number;
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Project>> {
    const res = await apiClient.get<
      unknown,
      | { data?: PaginatedResponse<Project> | Project[] }
      | PaginatedResponse<Project>
      | Project[]
    >('/projects', { params });
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<Project>
      | Project[];
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          total: payload.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? payload.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    return payload;
  },

  async getProject(id: number): Promise<Project> {
    const res = await apiClient.get<
      unknown,
      { data?: Project } & Project
    >(`/projects/${id}`);
    return (res?.data ?? res) as Project;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const rawKey = data.key?.trim();
    const fallbackKey =
      data.name
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'PROJ';
    const payload = {
      ...data,
      key: (rawKey && rawKey.length >= 2) ? rawKey.toUpperCase() : fallbackKey,
      icon: data.icon || '📁',
      color: data.color || '#5B5CEB',
      status: data.status || 'ACTIVE',
    };
    const res = await apiClient.post<
      unknown,
      { data?: Project } & Project
    >('/projects', payload);
    return (res?.data ?? res) as Project;
  },

  async updateProject(
    id: number,
    data: UpdateProjectDto,
  ): Promise<Project> {
    const res = await apiClient.patch<
      unknown,
      { data?: Project } & Project
    >(`/projects/${id}`, data);
    return (res?.data ?? res) as Project;
  },

  async deleteProject(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/projects/${id}`);
  },

  async getProjectStatistics(
    projectId: number,
  ): Promise<ProjectTaskStatistics> {
    const res = await apiClient.get<
      unknown,
      { data?: ProjectTaskStatistics } & ProjectTaskStatistics
    >(`/projects/${projectId}/tasks/statistics`);
    return (res?.data ?? res) as ProjectTaskStatistics;
  },

  // Project Members
  async getMembers(
    projectId: number,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<ProjectMember>> {
    const res = await apiClient.get<
      unknown,
      | { data?: PaginatedResponse<ProjectMember> | ProjectMember[] }
      | PaginatedResponse<ProjectMember>
      | ProjectMember[]
    >(`/projects/${projectId}/members`, { params });
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<ProjectMember>
      | ProjectMember[];
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          total: payload.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? payload.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    return payload;
  },

  async addMember(
    projectId: number,
    data: AddProjectMemberDto,
  ): Promise<ProjectMember> {
    const res = await apiClient.post<
      unknown,
      { data?: ProjectMember } & ProjectMember
    >(`/projects/${projectId}/members`, data);
    return (res?.data ?? res) as ProjectMember;
  },

  async updateMemberRole(
    projectId: number,
    memberId: number,
    role: ProjectRole,
  ): Promise<ProjectMember> {
    const res = await apiClient.patch<
      unknown,
      { data?: ProjectMember } & ProjectMember
    >(`/projects/${projectId}/members/${memberId}/role`, { role });
    return (res?.data ?? res) as ProjectMember;
  },

  async removeMember(
    projectId: number,
    memberId: number,
  ): Promise<{ message?: string }> {
    return apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  },
};

