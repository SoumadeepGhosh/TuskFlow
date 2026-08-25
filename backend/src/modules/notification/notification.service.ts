/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { NotificationPaginationDto } from './dto/request.dto';

import { NotificationRepository } from './repositories/notification.repository';
import { NotificationDispatcherService } from '../notification-dispatcher/notification-dispatcher.service';
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  async findAll(user: JwtPayload, pagination: NotificationPaginationDto) {
    const notifications = await this.notificationRepository.findNotifications(
      user.sub,
      pagination.page,
      pagination.limit,
    );

    const total = await this.notificationRepository.countNotifications(
      user.sub,
    );

    return {
      items: notifications,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findUnreadCount(user: JwtPayload) {
    const unreadCount = await this.notificationRepository.countUnread(user.sub);

    return {
      unreadCount,
    };
  }

  async markRead(id: number, user: JwtPayload) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to access this notification',
      );
    }

    return this.notificationRepository.markRead(id);
  }

  async markAllRead(user: JwtPayload) {
    await this.notificationRepository.markAllRead(user.sub);

    return {
      message: 'All notifications marked as read',
    };
  }

  async remove(id: number, user: JwtPayload) {
    const notification = await this.notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipientId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to delete this notification',
      );
    }

    await this.notificationRepository.delete(id);

    return {
      message: 'Notification deleted successfully',
    };
  }

  async createNotification(data: {
    recipientId: number;
    senderId?: number;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: number;

    recipientEmail?: string;
    recipientName?: string;
    senderName?: string;
  }) {
    const notification = await this.notificationRepository.create({
      recipientId: data.recipientId,
      senderId: data.senderId,
      type: data.type,
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    await this.dispatcher.dispatch({
      notification,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      senderName: data.senderName,
    });

    return notification;
  }
}
