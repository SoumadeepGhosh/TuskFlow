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
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
}

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  key: string;
  slug?: string;
  description: string | null;
  status: ProjectStatus;
  color?: string | null;
  icon?: string | null;
  startDate?: string | null;
  endDate?: string | null;
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
  key?: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectDto {
  name?: string;
  key?: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}

export interface AddProjectMemberDto {
  email: string;
  role: ProjectRole;
}

