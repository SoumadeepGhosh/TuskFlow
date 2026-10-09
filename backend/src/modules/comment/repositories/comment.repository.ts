import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
      include: {
        assignees: { select: { userId: true } },
        project: { select: { id: true, workspaceId: true } },
      },
    });
  }

  createComment(data: { taskId: number; userId: number; content: string }) {
    return this.prisma.comment.create({
      data,
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

  findComments(taskId: number, page = 1, limit = 20) {
    return this.prisma.comment.findMany({
      where: {
        taskId,
        deletedAt: null,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'asc',
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
}
