import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationDispatcherService } from '../notification-dispatcher/notification-dispatcher.service';
import { NotificationType, Prisma } from '@prisma/client';
import { TaskAssignedEmailData } from '../email/email.service';
import {
  BulkActionDto,
  NotificationPaginationDto,
  UpdateNotificationPreferenceDto,
} from './dto/request.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationDispatcher: NotificationDispatcherService,
  ) {}

  async createAndDispatch(
    data: {
      recipientId: number;
      senderId?: number;
      type: NotificationType;
      title: string;
      message: string;
      entityType?: string;
      entityId?: number;
      actionUrl?: string;
      metadata?: Prisma.InputJsonValue;
      priority?: string;
    },
    emailData?: TaskAssignedEmailData,
  ) {
    // 1. Fetch recipient preferences
    const preferences = await this.notificationRepository.findPreferences(
      data.recipientId,
    );

    // Check category preferences
    if (
      (data.type === NotificationType.TASK_ASSIGNED ||
        data.type === NotificationType.TASK_UPDATED ||
        data.type === NotificationType.TASK_COMPLETED ||
        data.type === NotificationType.TASK_PRIORITY_CHANGED ||
        data.type === NotificationType.TASK_STATUS_CHANGED ||
        data.type === NotificationType.TASK_DUE) &&
      preferences?.taskNotifications === false
    ) {
      return null;
    }

    if (
      (data.type === NotificationType.TASK_COMMENT ||
        data.type === NotificationType.COMMENT_ADDED) &&
      preferences?.commentNotifications === false
    ) {
      return null;
    }

    if (
      data.type === NotificationType.USER_MENTIONED &&
      preferences?.mentionNotifications === false
    ) {
      return null;
    }

    // 2. Persist notification to database
    const notification = await this.notificationRepository.create(data);

    // 3. Dispatch in background (Socket.IO + BullMQ Queue)
    const shouldSendEmail =
      preferences?.emailNotifications !== false ? emailData : undefined;

    void this.notificationDispatcher.dispatch({
      recipientId: data.recipientId,
      notification,
      emailData: shouldSendEmail,
    });

    return notification;
  }

  async getUserNotifications(
    userId: number,
    query: NotificationPaginationDto,
  ) {
    const notifications =
      await this.notificationRepository.findUserNotifications(userId, query);

    const total = await this.notificationRepository.countUserNotifications(
      userId,
      query,
    );

    const limit = query.limit || 20;
    const page = query.page || 1;

    return {
      items: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getUnreadCount(userId: number) {
    const unreadCount = await this.notificationRepository.countUnread(userId);
    return {
      unreadCount,
    };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationRepository.markAsRead(id);
  }

  async markAsUnread(id: number, userId: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationRepository.markAsUnread(id);
  }

  async archive(id: number, userId: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationRepository.archive(id);
  }

  async restore(id: number, userId: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.notificationRepository.restore(id);
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.markAllAsRead(userId);
    return {
      message: 'All notifications marked as read',
    };
  }

  async remove(id: number, userId: number) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.notificationRepository.softDelete(id);
    return {
      message: 'Notification deleted successfully',
    };
  }

  async clearAll(userId: number) {
    await this.notificationRepository.clearAll(userId);
    return {
      message: 'All notifications cleared',
    };
  }

  async bulkMarkAsRead(userId: number, dto: BulkActionDto) {
    await this.notificationRepository.bulkMarkAsRead(userId, dto.ids);
    return { message: `${dto.ids.length} notifications marked as read` };
  }

  async bulkMarkAsUnread(userId: number, dto: BulkActionDto) {
    await this.notificationRepository.bulkMarkAsUnread(userId, dto.ids);
    return { message: `${dto.ids.length} notifications marked as unread` };
  }

  async bulkArchive(userId: number, dto: BulkActionDto) {
    await this.notificationRepository.bulkArchive(userId, dto.ids);
    return { message: `${dto.ids.length} notifications archived` };
  }

  async bulkDelete(userId: number, dto: BulkActionDto) {
    await this.notificationRepository.bulkDelete(userId, dto.ids);
    return { message: `${dto.ids.length} notifications deleted` };
  }

  // Preferences
  getPreferences(userId: number) {
    return this.notificationRepository.findPreferences(userId);
  }

  updatePreferences(userId: number, dto: UpdateNotificationPreferenceDto) {
    return this.notificationRepository.upsertPreferences(userId, dto);
  }
}
