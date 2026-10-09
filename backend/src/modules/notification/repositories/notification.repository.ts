import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';
import {
  NotificationPaginationDto,
  NotificationStatusFilter,
  UpdateNotificationPreferenceDto,
} from '../dto/request.dto';

const SENDER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
};

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
    actionUrl?: string;
    metadata?: Prisma.InputJsonValue;
    priority?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
        priority: data.priority ?? 'NORMAL',
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  private buildWhereClause(
    recipientId: number,
    filter?: NotificationPaginationDto,
  ): Prisma.NotificationWhereInput {
    const where: Prisma.NotificationWhereInput = {
      recipientId,
      deletedAt: null,
    };

    if (filter?.status === NotificationStatusFilter.UNREAD) {
      where.isRead = false;
      where.archivedAt = null;
    } else if (filter?.status === NotificationStatusFilter.READ) {
      where.isRead = true;
      where.archivedAt = null;
    } else if (filter?.status === NotificationStatusFilter.ARCHIVED) {
      where.archivedAt = { not: null };
    } else {
      // Default ALL: exclude archived unless requested
      where.archivedAt = null;
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.entityType) {
      where.entityType = {
        equals: filter.entityType,
        mode: 'insensitive',
      };
    }

    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  findUserNotifications(
    recipientId: number,
    params: NotificationPaginationDto,
  ) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const where = this.buildWhereClause(recipientId, params);

    return this.prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  countUserNotifications(
    recipientId: number,
    params?: NotificationPaginationDto,
  ) {
    const where = this.buildWhereClause(recipientId, params);
    return this.prisma.notification.count({
      where,
    });
  }

  countUnread(recipientId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId,
        isRead: false,
        deletedAt: null,
        archivedAt: null,
      },
    });
  }

  findById(id: number) {
    return this.prisma.notification.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  markAsUnread(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  archive(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  restore(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        archivedAt: null,
      },
      include: {
        sender: {
          select: SENDER_SELECT,
        },
      },
    });
  }

  softDelete(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  markAllAsRead(recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  clearAll(recipientId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  bulkMarkAsRead(recipientId: number, ids: number[]) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  bulkMarkAsUnread(recipientId: number, ids: number[]) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        isRead: false,
        readAt: null,
      },
    });
  }

  bulkArchive(recipientId: number, ids: number[]) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  bulkDelete(recipientId: number, ids: number[]) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // Preferences
  async findPreferences(userId: number) {
    let pref = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
    if (!pref) {
      pref = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }
    return pref;
  }

  upsertPreferences(userId: number, data: UpdateNotificationPreferenceDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }
}
