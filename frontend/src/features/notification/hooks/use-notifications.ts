import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import {
  Notification,
  NotificationPreference,
  NotificationQueryParams,
} from '@/types/notification';
import { toast } from 'sonner';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  lists: () => [...NOTIFICATION_KEYS.all, 'list'] as const,
  list: (params?: NotificationQueryParams) =>
    [...NOTIFICATION_KEYS.lists(), params] as const,
  infinite: (params?: Omit<NotificationQueryParams, 'page'>) =>
    [...NOTIFICATION_KEYS.all, 'infinite', params] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unread-count'] as const,
  preferences: () => [...NOTIFICATION_KEYS.all, 'preferences'] as const,
};

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationService.getNotifications(params),
  });
}

export function useInfiniteNotifications(
  params?: Omit<NotificationQueryParams, 'page'>,
) {
  return useInfiniteQuery({
    queryKey: NOTIFICATION_KEYS.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      notificationService.getNotifications({
        ...params,
        page: pageParam,
        limit: params?.limit || 15,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta.page;
      const totalPages = lastPage.meta.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(),
    queryFn: () => notificationService.getPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<NotificationPreference>) =>
      notificationService.updatePreferences(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(NOTIFICATION_KEYS.preferences(), updated);
      toast.success('Notification preferences updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences');
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as read');
    },
  });
}

export function useMarkNotificationUnread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markAsUnread(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark as unread');
    },
  });
}

export function useArchiveNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.archiveNotification(id),
    onSuccess: () => {
      toast.success('Notification archived');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive notification');
    },
  });
}

export function useRestoreNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.restoreNotification(id),
    onSuccess: () => {
      toast.success('Notification restored');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore notification');
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as read');
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => {
      toast.success('All notifications cleared');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to clear notifications');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification removed');
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete notification');
    },
  });
}

export function useBulkNotificationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      action,
      ids,
    }: {
      action: 'read' | 'unread' | 'archive' | 'delete';
      ids: number[];
    }) => {
      if (action === 'read') return notificationService.bulkMarkAsRead(ids);
      if (action === 'unread') return notificationService.bulkMarkAsUnread(ids);
      if (action === 'archive') return notificationService.bulkArchive(ids);
      return notificationService.bulkDelete(ids);
    },
    onSuccess: (_, variables) => {
      const label =
        variables.action === 'read'
          ? 'marked as read'
          : variables.action === 'unread'
            ? 'marked as unread'
            : variables.action === 'archive'
              ? 'archived'
              : 'deleted';
      toast.success(`${variables.ids.length} notifications ${label}`);
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Bulk operation failed');
    },
  });
}
