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

export type InvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface WorkspaceInvitation {
  id: number;
  workspaceId: number;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  token?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  inviter?: {
    id: number;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  workspace?: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
  };
}

export interface InviteMemberDto {
  email: string;
  role?: WorkspaceRole;
}
