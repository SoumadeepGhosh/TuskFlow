import { apiClient } from '@/lib/axios';
import {
  Notification,
  NotificationPreference,
  NotificationQueryParams,
  UnreadCountResponse,
} from '@/types/notification';
import { PaginatedResponse } from '@/types/api';

export const notificationService = {
  async getNotifications(
    params?: NotificationQueryParams,
  ): Promise<PaginatedResponse<Notification>> {
    const res = await apiClient.get<
      unknown,
      { data?: PaginatedResponse<Notification> } & PaginatedResponse<Notification>
    >('/notifications', { params });
    return (res?.data ?? res) as PaginatedResponse<Notification>;
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await apiClient.get<
      unknown,
      { data?: UnreadCountResponse } & UnreadCountResponse
    >('/notifications/unread-count');
    return (res?.data ?? res) as UnreadCountResponse;
  },

  async markAsRead(id: number): Promise<Notification> {
    const res = await apiClient.patch<
      unknown,
      { data?: Notification } & Notification
    >(`/notifications/${id}/read`);
    return (res?.data ?? res) as Notification;
  },

  async markAsUnread(id: number): Promise<Notification> {
    const res = await apiClient.patch<
      unknown,
      { data?: Notification } & Notification
    >(`/notifications/${id}/unread`);
    return (res?.data ?? res) as Notification;
  },

  async archiveNotification(id: number): Promise<Notification> {
    const res = await apiClient.patch<
      unknown,
      { data?: Notification } & Notification
    >(`/notifications/${id}/archive`);
    return (res?.data ?? res) as Notification;
  },

  async restoreNotification(id: number): Promise<Notification> {
    const res = await apiClient.patch<
      unknown,
      { data?: Notification } & Notification
    >(`/notifications/${id}/restore`);
    return (res?.data ?? res) as Notification;
  },

  async markAllAsRead(): Promise<{ message?: string; count?: number }> {
    const res = await apiClient.patch<
      unknown,
      { data?: { message?: string; count?: number } }
    >('/notifications/read-all');
    return res?.data ?? (res as { message?: string; count?: number });
  },

  async clearAll(): Promise<{ message?: string }> {
    return apiClient.delete('/notifications/clear-all');
  },

  async deleteNotification(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/notifications/${id}`);
  },

  async bulkMarkAsRead(ids: number[]): Promise<{ message?: string }> {
    const res = await apiClient.post<unknown, { message?: string }>(
      '/notifications/bulk-read',
      { ids },
    );
    return res as { message?: string };
  },

  async bulkMarkAsUnread(ids: number[]): Promise<{ message?: string }> {
    const res = await apiClient.post<unknown, { message?: string }>(
      '/notifications/bulk-unread',
      { ids },
    );
    return res as { message?: string };
  },

  async bulkArchive(ids: number[]): Promise<{ message?: string }> {
    const res = await apiClient.post<unknown, { message?: string }>(
      '/notifications/bulk-archive',
      { ids },
    );
    return res as { message?: string };
  },

  async bulkDelete(ids: number[]): Promise<{ message?: string }> {
    const res = await apiClient.post<unknown, { message?: string }>(
      '/notifications/bulk-delete',
      { ids },
    );
    return res as { message?: string };
  },

  // Preferences
  async getPreferences(): Promise<NotificationPreference> {
    const res = await apiClient.get<
      unknown,
      { data?: NotificationPreference } & NotificationPreference
    >('/notifications/preferences');
    return (res?.data ?? res) as NotificationPreference;
  },

  async updatePreferences(
    data: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const res = await apiClient.patch<
      unknown,
      { data?: NotificationPreference } & NotificationPreference
    >('/notifications/preferences', data);
    return (res?.data ?? res) as NotificationPreference;
  },
};
