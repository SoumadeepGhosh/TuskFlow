/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { TaskSearchDto } from '../dto/request.dto';

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTask(data: {
    columnId: number;
    projectId: number;
    reporterId: number;
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    position: number;
    startDate?: Date;
    dueDate?: Date;
    estimatedHours?: number;
  }) {
    return this.prisma.task.create({
      data,
    });
  }

  findColumn(columnId: number) {
    return this.prisma.boardColumn.findUnique({
      where: {
        id: columnId,
      },
      include: {
        board: true,
      },
    });
  }

  findTasks(columnId: number, page: number, limit: number) {
    return this.prisma.task.findMany({
      where: {
        columnId,
        deletedAt: null,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        position: 'asc',
      },
      include: {
        reporter: {
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

  countTasks(columnId: number) {
    return this.prisma.task.count({
      where: {
        columnId,
        deletedAt: null,
      },
    });
  }

  findTaskById(id: number) {
    return this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        reporter: {
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

  updateTask(
    id: number,
    data: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
      position?: number;
      startDate?: Date;
      dueDate?: Date;
      estimatedHours?: number;
      completedAt?: Date | null;
    },
  ) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data,
    });
  }
  updateTaskStatus(id: number, status: TaskStatus, completedAt?: Date | null) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        status,
        completedAt,
      },
    });
  }

  updateTaskPriority(id: number, priority: TaskPriority) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        priority,
      },
    });
  }

  updateTaskPosition(id: number, position: number) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        position,
      },
    });
  }

  moveTask(id: number, columnId: number, position: number) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        columnId,
        position,
      },
    });
  }

  completeTask(id: number) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        status: TaskStatus.DONE,
        completedAt: new Date(),
      },
    });
  }

  reopenTask(id: number) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        status: TaskStatus.TODO,
        completedAt: null,
      },
    });
  }

  searchTasks(projectId: number, dto: TaskSearchDto) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,

        ...(dto.keyword && {
          OR: [
            {
              title: {
                contains: dto.keyword,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: dto.keyword,
                mode: 'insensitive',
              },
            },
          ],
        }),

        ...(dto.status && {
          status: dto.status,
        }),

        ...(dto.priority && {
          priority: dto.priority,
        }),
      },

      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        reporter: {
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

  countSearchTasks(projectId: number, dto: TaskSearchDto) {
    return this.prisma.task.count({
      where: {
        projectId,
        deletedAt: null,

        ...(dto.keyword && {
          OR: [
            {
              title: {
                contains: dto.keyword,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: dto.keyword,
                mode: 'insensitive',
              },
            },
          ],
        }),

        ...(dto.status && {
          status: dto.status,
        }),

        ...(dto.priority && {
          priority: dto.priority,
        }),
      },
    });
  }

  findProject(projectId: number) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });
  }

  findMyTasks(userId: number) {
    return this.prisma.task.findMany({
      where: {
        reporterId: userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reporter: {
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

  findDueToday() {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        reporter: {
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

  findOverdueTasks() {
    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        status: {
          not: TaskStatus.DONE,
        },
        dueDate: {
          lt: new Date(),
        },
      },

      orderBy: {
        dueDate: 'asc',
      },

      include: {
        reporter: {
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

  async getProjectTaskStatistics(projectId: number) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      select: {
        status: true,
        priority: true,
      },
    });

    return tasks;
  }
  deleteTask(id: number) {
    return this.prisma.task.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
