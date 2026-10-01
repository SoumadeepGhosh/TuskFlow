export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMMENT'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'WORKSPACE_INVITE'
  | 'PROJECT_INVITE'
  | 'SYSTEM';

export interface Notification {
  id: number;
  recipientId: number;
  senderId: number | null;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

