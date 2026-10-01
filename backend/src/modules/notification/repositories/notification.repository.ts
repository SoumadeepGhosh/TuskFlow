import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    recipientId: number;
    senderId?: number;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: string;
    entityId?: number;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  findUserNotifications(recipientId: number, page = 1, limit = 20) {
    return this.prisma.notification.findMany({
      where: {
        recipientId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  countUserNotifications(recipientId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId,
      },
    });
  }

  countUnread(recipientId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
      },
    });
  }

  findById(id: number) {
    return this.prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  markAsRead(id: number) {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  markAllAsRead(recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  delete(id: number) {
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}
