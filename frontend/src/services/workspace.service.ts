import { apiClient } from '@/lib/axios';
import {
  AddMemberDto,
  CreateWorkspaceDto,
  MemberStatus,
  UpdateWorkspaceDto,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from '@/types/workspace';
import { PaginatedResponse } from '@/types/api';

export const workspaceService = {
  async getWorkspaces(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Workspace>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<Workspace> } & PaginatedResponse<Workspace>
    >('/workspaces', { params });
    return (res?.data ?? res) as PaginatedResponse<Workspace>;
  },

  async getWorkspace(id: number): Promise<Workspace> {
    const res = await apiClient.get<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}`);
    return (res?.data ?? res) as Workspace;
  },

  async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
    const res = await apiClient.post<
      unknown,
      { data?: Workspace } & Workspace
    >('/workspaces', data);
    return (res?.data ?? res) as Workspace;
  },

  async updateWorkspace(
    id: number,
    data: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const res = await apiClient.patch<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}`, data);
    return (res?.data ?? res) as Workspace;
  },

  async deleteWorkspace(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/workspaces/${id}`);
  },

  // Workspace Members
  async getMembers(
    workspaceId: number,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<WorkspaceMember>> {
    const res = await apiClient.get<
      unknown,
      | { data?: PaginatedResponse<WorkspaceMember> }
      | PaginatedResponse<WorkspaceMember>
    >(`/workspaces/${workspaceId}/members`, { params });
    return ((res as { data?: PaginatedResponse<WorkspaceMember> })?.data ??
      res) as PaginatedResponse<WorkspaceMember>;
  },

  async addMember(
    workspaceId: number,
    data: AddMemberDto,
  ): Promise<WorkspaceMember> {
    const res = await apiClient.post<
      unknown,
      { data?: WorkspaceMember } & WorkspaceMember
    >(`/workspaces/${workspaceId}/members`, data);
    return (res?.data ?? res) as WorkspaceMember;
  },

  async updateMemberRole(
    workspaceId: number,
    memberId: number,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    const res = await apiClient.patch<
      unknown,
      { data?: WorkspaceMember } & WorkspaceMember
    >(`/workspaces/${workspaceId}/members/${memberId}/role`, { role });
    return (res?.data ?? res) as WorkspaceMember;
  },

  async updateMemberStatus(
    workspaceId: number,
    memberId: number,
    status: MemberStatus,
  ): Promise<WorkspaceMember> {
    const res = await apiClient.patch<
      unknown,
      { data?: WorkspaceMember } & WorkspaceMember
    >(`/workspaces/${workspaceId}/members/${memberId}/status`, { status });
    return (res?.data ?? res) as WorkspaceMember;
  },

  async removeMember(
    workspaceId: number,
    memberId: number,
  ): Promise<{ message?: string }> {
    return apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },
};
