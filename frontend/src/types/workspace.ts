import { User } from './auth';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'REMOVED';

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  status: MemberStatus;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  owner?: User;
  members?: WorkspaceMember[];
  _count?: {
    projects: number;
    members: number;
  };
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  avatar?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  avatar?: string;
}

export interface AddMemberDto {
  email: string;
  role?: WorkspaceRole;
}
