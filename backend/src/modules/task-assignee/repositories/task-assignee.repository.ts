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
      include: {
        project: true,
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

  findAssignee(taskId: number, userId: number) {
    return this.prisma.taskAssignee.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  createAssignee(data: { taskId: number; userId: number; assignedBy: number }) {
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

  deleteAssignee(taskId: number, userId: number) {
    return this.prisma.taskAssignee.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  findAssigneesForTask(taskId: number) {
    return this.prisma.taskAssignee.findMany({
      where: {
        taskId,
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

  findTasksForUser(userId: number) {
    return this.prisma.taskAssignee.findMany({
      where: {
        userId,
        task: {
          deletedAt: null,
        },
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
}
