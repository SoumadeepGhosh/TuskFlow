import { User } from './auth';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Label {
  id: number;
  projectId?: number;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAssignee {
  id: number;
  taskId: number;
  userId: number;
  assignedAt: string;
  user: User;
}

export interface TaskLabel {
  id: number;
  taskId: number;
  labelId: number;
  assignedAt: string;
  label: Label;
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  userId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  createdAt: string;
  user?: User;
}

export interface Task {
  id: number;
  columnId: number;
  projectId: number;
  reporterId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  startDate: string | null;
  estimatedHours: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: User;
  assignees?: TaskAssignee[];
  labels?: TaskLabel[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface TaskDetail extends Task {
  column?: {
    id: number;
    name: string;
    board?: {
      id: number;
      name: string;
    };
  };
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

export interface CreateTaskDto {
  columnId: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  position?: number;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
}

export interface MoveTaskDto {
  columnId: number;
  position: number;
}

export interface CreateCommentDto {
  taskId: number;
  content: string;
}

export interface CreateLabelDto {
  projectId: number;
  name: string;
  color: string;
}

