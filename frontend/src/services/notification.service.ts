import { apiClient } from '@/lib/axios';
import { Notification, UnreadCountResponse } from '@/types/notification';
import { PaginatedResponse } from '@/types/api';

export const notificationService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Notification>> {
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

  async markAllAsRead(): Promise<{ message?: string; count?: number }> {
    const res = await apiClient.patch<
      unknown,
      { data?: { message?: string; count?: number } }
    >('/notifications/read-all');
    return res?.data ?? (res as { message?: string; count?: number });
  },

  async deleteNotification(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/notifications/${id}`);
  },
};

