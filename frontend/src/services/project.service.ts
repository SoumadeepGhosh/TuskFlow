import { apiClient } from '@/lib/axios';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  Project,
  ProjectMember,
  ProjectRole,
  ProjectTaskStatistics,
  UpdateProjectDto,
} from '@/types/project';
import { PaginatedResponse } from '@/types/api';

export const projectService = {
  async getProjects(params?: {
    workspaceId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Project>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<Project> } & PaginatedResponse<Project>
    >('/projects', { params });
    return (res?.data ?? res) as PaginatedResponse<Project>;
  },

  async getProject(id: number): Promise<Project> {
    const res = await apiClient.get<
      unknown,
      { data?: Project } & Project
    >(`/projects/${id}`);
    return (res?.data ?? res) as Project;
  },

  async createProject(data: CreateProjectDto): Promise<Project> {
    const res = await apiClient.post<
      unknown,
      { data?: Project } & Project
    >('/projects', data);
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
      | { data?: PaginatedResponse<ProjectMember> }
      | PaginatedResponse<ProjectMember>
    >(`/projects/${projectId}/members`, { params });
    return ((res as { data?: PaginatedResponse<ProjectMember> })?.data ??
      res) as PaginatedResponse<ProjectMember>;
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

