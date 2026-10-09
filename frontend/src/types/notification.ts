export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_REOPENED'
  | 'TASK_COMMENT'
  | 'TASK_ATTACHMENT'
  | 'TASK_LABEL'
  | 'TASK_PRIORITY_CHANGED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'BOARD_CREATED'
  | 'COLUMN_CREATED'
  | 'USER_MENTIONED'
  | 'WORKSPACE_INVITE'
  | 'SYSTEM'
  | 'SECURITY'
  | 'EMAIL'
  | 'COMMENT_ADDED';

export interface NotificationSender {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Notification {
  id: number;
  recipientId: number;
  senderId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: number | null;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string;
  isRead: boolean;
  readAt?: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: NotificationSender | null;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export type NotificationStatusFilter = 'all' | 'unread' | 'read' | 'archived';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  status?: NotificationStatusFilter;
  type?: NotificationType;
  entityType?: string;
  search?: string;
}

export interface NotificationPreference {
  userId: number;
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  taskNotifications: boolean;
  commentNotifications: boolean;
  mentionNotifications: boolean;
  systemNotifications: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkActionRequest {
  ids: number[];
}
