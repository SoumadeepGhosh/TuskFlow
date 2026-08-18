/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  createComment(data: { taskId: number; userId: number; content: string }) {
    return this.prisma.comment.create({
      data,
    });
  }

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    });
  }

  findComments(taskId: number, page: number, limit: number) {
    return this.prisma.comment.findMany({
      where: {
        taskId,
        deletedAt: null,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  countComments(taskId: number) {
    return this.prisma.comment.count({
      where: {
        taskId,
        deletedAt: null,
      },
    });
  }

  findCommentById(id: number) {
    return this.prisma.comment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  updateComment(id: number, content: string) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        content,
        editedAt: new Date(),
      },
    });
  }

  deleteComment(id: number) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  findMyComments(userId: number) {
    return this.prisma.comment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findRecentComments() {
    return this.prisma.comment.findMany({
      where: {
        deletedAt: null,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
