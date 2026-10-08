import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
  TaskStatus,
  TaskPriority,
  CreateLabelDto,
} from '@/types/task';
import { toast } from 'sonner';

export function useTask(id: number, enabled = true) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.getTask(id),
    enabled: Boolean(id) && enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: () => taskService.getMyTasks(),
  });
}

export function useDueTodayTasks() {
  return useQuery({
    queryKey: ['tasks', 'due-today'],
    queryFn: () => taskService.getDueToday(),
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: () => taskService.getOverdue(),
  });
}

export function useCreateTask(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
    onSuccess: () => {
      toast.success('Task created successfully');
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      taskService.updateTask(id, data),
    onSuccess: (updated) => {
      toast.success('Task updated');
      void queryClient.invalidateQueries({ queryKey: ['tasks', updated.id] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task');
    },
  });
}

export function useDeleteTask(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      toast.success('Task deleted');
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });
}

export function useMoveTask(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MoveTaskDto }) =>
      taskService.moveTask(id, data),
    onSuccess: () => {
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to move task');
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useUpdateTaskStatus(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskService.updateStatus(id, status),
    onSuccess: (updated) => {
      toast.success('Status updated');
      void queryClient.invalidateQueries({ queryKey: ['tasks', updated.id] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    },
  });
}

export function useUpdateTaskPriority(boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: TaskPriority }) =>
      taskService.updatePriority(id, priority),
    onSuccess: (updated) => {
      toast.success('Priority updated');
      void queryClient.invalidateQueries({ queryKey: ['tasks', updated.id] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update priority');
    },
  });
}

// Assignee hooks
export function useAssignUser(taskId: number, boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => taskService.assignUser(taskId, userId),
    onSuccess: () => {
      toast.success('Member assigned');
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign user');
    },
  });
}

export function useRemoveUser(taskId: number, boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => taskService.removeUser(taskId, userId),
    onSuccess: () => {
      toast.success('Member unassigned');
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user');
    },
  });
}

// Labels hooks
export function useLabels(projectId?: number) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: () => taskService.getLabels(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateLabel(projectId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLabelDto) => taskService.createLabel(data),
    onSuccess: () => {
      toast.success('Label created');
      void queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create label');
    },
  });
}

export function useAssignLabel(taskId: number, boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: number) => taskService.assignLabel(taskId, labelId),
    onSuccess: () => {
      toast.success('Label added');
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add label');
    },
  });
}

export function useRemoveLabel(taskId: number, boardId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: number) => taskService.removeLabel(taskId, labelId),
    onSuccess: () => {
      toast.success('Label removed');
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      if (boardId) {
        void queryClient.invalidateQueries({ queryKey: ['boards', 'detail', boardId] });
      }
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove label');
    },
  });
}

// Comments hooks
export function useComments(taskId: number) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => taskService.getComments(taskId),
    enabled: Boolean(taskId),
  });
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => taskService.createComment(taskId, content),
    onSuccess: () => {
      toast.success('Comment posted');
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.deleteComment(id),
    onSuccess: () => {
      toast.success('Comment deleted');
      void queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}

// Attachments hooks
export function useAttachments(taskId: number) {
  return useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => taskService.getAttachments(taskId),
    enabled: Boolean(taskId),
  });
}

export function useUploadAttachment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => taskService.uploadAttachment(taskId, file),
    onSuccess: () => {
      toast.success('File uploaded');
      void queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload attachment');
    },
  });
}

export function useDeleteAttachment(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.deleteAttachment(id),
    onSuccess: () => {
      toast.success('Attachment deleted');
      void queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attachment');
    },
  });
}
