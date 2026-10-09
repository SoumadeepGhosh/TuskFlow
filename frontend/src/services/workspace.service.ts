import { apiClient } from '@/lib/axios';
import {
  AddMemberDto,
  CreateWorkspaceDto,
  InviteMemberDto,
  MemberStatus,
  UpdateWorkspaceDto,
  Workspace,
  WorkspaceInvitation,
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
      | { data?: PaginatedResponse<Workspace> | Workspace[] }
      | PaginatedResponse<Workspace>
      | Workspace[]
    >('/workspaces', { params });
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<Workspace>
      | Workspace[];
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
      | { data?: PaginatedResponse<WorkspaceMember> | WorkspaceMember[] }
      | PaginatedResponse<WorkspaceMember>
      | WorkspaceMember[]
    >(`/workspaces/${workspaceId}/members`, { params });
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<WorkspaceMember>
      | WorkspaceMember[];
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

  // Workspace Invitations
  async getInvitations(workspaceId: number): Promise<WorkspaceInvitation[]> {
    const res = await apiClient.get<
      unknown,
      { data?: WorkspaceInvitation[] } | WorkspaceInvitation[]
    >(`/workspaces/${workspaceId}/invitations`);
    const payload = ((res as { data?: unknown })?.data ?? res) as WorkspaceInvitation[];
    return Array.isArray(payload) ? payload : [];
  },

  async inviteMember(
    workspaceId: number,
    data: InviteMemberDto,
  ): Promise<WorkspaceInvitation> {
    const res = await apiClient.post<
      unknown,
      { data?: WorkspaceInvitation } & WorkspaceInvitation
    >(`/workspaces/${workspaceId}/invitations`, data);
    return (res?.data ?? res) as WorkspaceInvitation;
  },

  async cancelInvitation(
    workspaceId: number,
    invitationId: number,
  ): Promise<{ message?: string }> {
    return apiClient.delete(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
  },

  async resendInvitation(
    workspaceId: number,
    invitationId: number,
  ): Promise<WorkspaceInvitation> {
    const res = await apiClient.post<
      unknown,
      { data?: WorkspaceInvitation } & WorkspaceInvitation
    >(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`);
    return (res?.data ?? res) as WorkspaceInvitation;
  },

  async getInvitationByToken(token: string): Promise<WorkspaceInvitation> {
    const res = await apiClient.get<
      unknown,
      { data?: WorkspaceInvitation } & WorkspaceInvitation
    >(`/invitations/${token}`);
    return (res?.data ?? res) as WorkspaceInvitation;
  },

  async acceptInvitation(
    token: string,
  ): Promise<{ message?: string; workspaceId?: number; workspaceSlug?: string }> {
    return apiClient.post(`/invitations/${token}/accept`);
  },

  async declineInvitation(token: string): Promise<{ message?: string }> {
    return apiClient.post(`/invitations/${token}/decline`);
  },

  async uploadLogo(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Workspace> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return (res?.data ?? res) as Workspace;
  },

  async removeLogo(id: number): Promise<Workspace> {
    const res = await apiClient.delete<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}/logo`);
    return (res?.data ?? res) as Workspace;
  },

  async uploadCover(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Workspace> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });
    return (res?.data ?? res) as Workspace;
  },

  async removeCover(id: number): Promise<Workspace> {
    const res = await apiClient.delete<
      unknown,
      { data?: Workspace } & Workspace
    >(`/workspaces/${id}/cover`);
    return (res?.data ?? res) as Workspace;
  },
};
