import { apiClient } from '@/lib/axios';
import {
  Task,
  TaskDetail,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskStatus,
  TaskPriority,
  TaskComment,
  TaskAttachment,
  TaskAssignee,
  TaskLabel,
  Label,
  CreateLabelDto,
} from '@/types/task';
import { PaginatedResponse } from '@/types/api';

export const taskService = {
  // Tasks CRUD
  async getTasks(params?: {
    columnId?: number;
    projectId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<Task> } & PaginatedResponse<Task>
    >('/tasks', { params });
    return (res?.data ?? res) as PaginatedResponse<Task>;
  },

  async getMyTasks(): Promise<Task[]> {
    const res = await apiClient.get<unknown, { data?: Task[] } & Task[]>('/tasks/my');
    return (res?.data ?? res) as Task[];
  },

  async getDueToday(): Promise<Task[]> {
    const res = await apiClient.get<unknown, { data?: Task[] } & Task[]>('/tasks/due-today');
    return (res?.data ?? res) as Task[];
  },

  async getOverdue(): Promise<Task[]> {
    const res = await apiClient.get<unknown, { data?: Task[] } & Task[]>('/tasks/overdue');
    return (res?.data ?? res) as Task[];
  },

  async getTask(id: number): Promise<TaskDetail> {
    const res = await apiClient.get<
      unknown,
      { data?: TaskDetail } & TaskDetail
    >(`/tasks/${id}`);
    return (res?.data ?? res) as TaskDetail;
  },

  async createTask(data: CreateTaskDto): Promise<Task> {
    const res = await apiClient.post<
      unknown,
      { data?: Task } & Task
    >('/tasks', data);
    return (res?.data ?? res) as Task;
  },

  async updateTask(id: number, data: UpdateTaskDto): Promise<Task> {
    const res = await apiClient.patch<
      unknown,
      { data?: Task } & Task
    >(`/tasks/${id}`, data);
    return (res?.data ?? res) as Task;
  },

  async deleteTask(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/tasks/${id}`);
  },

  async moveTask(id: number, data: MoveTaskDto): Promise<Task> {
    const res = await apiClient.patch<
      unknown,
      { data?: Task } & Task
    >(`/tasks/${id}/move`, data);
    return (res?.data ?? res) as Task;
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const res = await apiClient.patch<
      unknown,
      { data?: Task } & Task
    >(`/tasks/${id}/status`, { status });
    return (res?.data ?? res) as Task;
  },

  async updatePriority(id: number, priority: TaskPriority): Promise<Task> {
    const res = await apiClient.patch<
      unknown,
      { data?: Task } & Task
    >(`/tasks/${id}/priority`, { priority });
    return (res?.data ?? res) as Task;
  },

  // Assignees
  async assignUser(taskId: number, userId: number): Promise<TaskAssignee> {
    const res = await apiClient.post<
      unknown,
      { data?: TaskAssignee } & TaskAssignee
    >(`/tasks/${taskId}/assignees`, { userId });
    return (res?.data ?? res) as TaskAssignee;
  },

  async removeUser(taskId: number, userId: number): Promise<{ message?: string }> {
    return apiClient.delete(`/tasks/${taskId}/assignees/${userId}`);
  },

  async getTaskAssignees(taskId: number): Promise<TaskAssignee[]> {
    const res = await apiClient.get<
      unknown,
      { data?: TaskAssignee[] } & TaskAssignee[]
    >(`/tasks/${taskId}/assignees`);
    return (res?.data ?? res) as TaskAssignee[];
  },

  // Labels
  async getLabels(projectId?: number): Promise<PaginatedResponse<Label>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<Label> } & PaginatedResponse<Label>
    >('/labels', {
      params: { projectId, limit: 50 },
    });
    return (res?.data ?? res) as PaginatedResponse<Label>;
  },

  async createLabel(data: CreateLabelDto): Promise<Label> {
    const res = await apiClient.post<
      unknown,
      { data?: Label } & Label
    >('/labels', data);
    return (res?.data ?? res) as Label;
  },

  async deleteLabel(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/labels/${id}`);
  },

  async assignLabel(taskId: number, labelId: number): Promise<TaskLabel> {
    const res = await apiClient.post<
      unknown,
      { data?: TaskLabel } & TaskLabel
    >(`/tasks/${taskId}/labels`, { labelId });
    return (res?.data ?? res) as TaskLabel;
  },

  async removeLabel(taskId: number, labelId: number): Promise<{ message?: string }> {
    return apiClient.delete(`/tasks/${taskId}/labels/${labelId}`);
  },

  // Comments
  async getComments(taskId: number): Promise<PaginatedResponse<TaskComment>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<TaskComment> } & PaginatedResponse<TaskComment>
    >('/comments', {
      params: { taskId, limit: 50 },
    });
    return (res?.data ?? res) as PaginatedResponse<TaskComment>;
  },

  async createComment(taskId: number, content: string): Promise<TaskComment> {
    const res = await apiClient.post<
      unknown,
      { data?: TaskComment } & TaskComment
    >('/comments', { taskId, content });
    return (res?.data ?? res) as TaskComment;
  },

  async deleteComment(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/comments/${id}`);
  },

  // Attachments
  async getAttachments(taskId: number): Promise<PaginatedResponse<TaskAttachment>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<TaskAttachment> } & PaginatedResponse<TaskAttachment>
    >('/attachments', {
      params: { taskId, limit: 50 },
    });
    return (res?.data ?? res) as PaginatedResponse<TaskAttachment>;
  },

  async uploadAttachment(taskId: number, file: File): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId.toString());

    const res = await apiClient.post<
      unknown,
      { data?: TaskAttachment } & TaskAttachment
    >('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return (res?.data ?? res) as TaskAttachment;
  },

  async deleteAttachment(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/attachments/${id}`);
  },
};

