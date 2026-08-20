/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class TaskAssigneeRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    });
  }

  findUser(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  findAssignment(taskId: number, userId: number) {
    return this.prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  assignUser(data: { taskId: number; userId: number; assignedBy: number }) {
    return this.prisma.taskAssignee.create({
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

  findTaskAssignees(taskId: number, page: number, limit: number) {
    return this.prisma.taskAssignee.findMany({
      where: {
        taskId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        assignedAt: 'desc',
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

  countTaskAssignees(taskId: number) {
    return this.prisma.taskAssignee.count({
      where: {
        taskId,
      },
    });
  }

  removeAssignment(taskId: number, userId: number) {
    return this.prisma.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  findUserAssignedTasks(userId: number, page: number, limit: number) {
    return this.prisma.taskAssignee.findMany({
      where: {
        userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        assignedAt: 'desc',
      },
      include: {
        task: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            column: true,
            project: true,
          },
        },
      },
    });
  }

  countUserAssignedTasks(userId: number) {
    return this.prisma.taskAssignee.count({
      where: {
        userId,
      },
    });
  }
}
