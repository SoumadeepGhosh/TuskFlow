import { User } from './auth';
import { Workspace } from './workspace';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectRole = 'OWNER' | 'MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';

export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface ProjectTaskStatistics {
  total: number;
  completed: number;
  byStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
  workspace?: Workspace;
  members?: ProjectMember[];
  _count?: {
    boards: number;
    tasks: number;
    members: number;
  };
}

export interface CreateProjectDto {
  workspaceId: number;
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}

export interface AddProjectMemberDto {
  userId: number;
  role: ProjectRole;
}

