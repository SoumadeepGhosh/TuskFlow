/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findNotifications(recipientId: number, page: number, limit: number) {
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

  countNotifications(recipientId: number) {
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

  markRead(id: number) {
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

  markAllRead(recipientId: number) {
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
