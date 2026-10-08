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

  async getMaxPosition(columnId: number): Promise<number> {
    const aggregate = await this.prisma.task.aggregate({
      where: {
        columnId,
        deletedAt: null,
      },
      _max: {
        position: true,
      },
    });
    return aggregate._max.position ?? -1;
  }

  findTasks(columnId?: number, page = 1, limit = 10, projectId?: number) {
    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        ...(columnId && { columnId }),
        ...(projectId && { projectId }),
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
        assignees: {
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
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });
  }

  countTasks(columnId?: number, projectId?: number) {
    return this.prisma.task.count({
      where: {
        deletedAt: null,
        ...(columnId && { columnId }),
        ...(projectId && { projectId }),
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
        column: true,
        project: true,
        assignees: {
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
        },
        labels: {
          include: {
            label: true,
          },
        },
        comments: {
          where: {
            deletedAt: null,
          },
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
        },
        attachments: {
          orderBy: {
            createdAt: 'desc',
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

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
        dueDate: {
          gte: start,
          lte: end,
        },
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
  findProject(projectId: number) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
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
    const [total, todo, inProgress, inReview, done] = await Promise.all([
      this.prisma.task.count({
        where: {
          projectId,
          deletedAt: null,
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          status: TaskStatus.TODO,
          deletedAt: null,
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          status: TaskStatus.IN_PROGRESS,
          deletedAt: null,
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          status: TaskStatus.IN_REVIEW,
          deletedAt: null,
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          status: TaskStatus.DONE,
          deletedAt: null,
        },
      }),
    ]);

    return {
      total,
      todo,
      inProgress,
      inReview,
      done,
    };
  }
}
