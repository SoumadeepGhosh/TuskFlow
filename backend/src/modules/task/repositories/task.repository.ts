/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

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
