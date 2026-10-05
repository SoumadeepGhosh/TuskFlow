import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationDispatcherService } from '../notification-dispatcher/notification-dispatcher.service';
import { NotificationType } from '@prisma/client';
import { TaskAssignedEmailData } from '../email/email.service';
import { NotificationPaginationDto } from './dto/request.dto';

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
    },
    emailData?: TaskAssignedEmailData,
  ) {
    // 1. Persist notification to database first
    const notification = await this.notificationRepository.create(data);

    // 2. Dispatch in background (Socket.IO + BullMQ Queue)
    void this.notificationDispatcher.dispatch({
      recipientId: data.recipientId,
      notification,
      emailData,
    });

    return notification;
  }

  async getUserNotifications(
    userId: number,
    pagination: NotificationPaginationDto,
  ) {
    const notifications =
      await this.notificationRepository.findUserNotifications(
        userId,
        pagination.page,
        pagination.limit,
      );

    const total =
      await this.notificationRepository.countUserNotifications(userId);

    return {
      items: notifications,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
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

    await this.notificationRepository.delete(id);
    return {
      message: 'Notification deleted successfully',
    };
  }
}
