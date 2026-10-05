import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWorkspace(workspaceId: number) {
    return this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });
  }

  async findByKey(workspaceId: number, key: string) {
    return this.prisma.project.findUnique({
      where: {
        workspaceId_key: {
          workspaceId,
          key,
        },
      },
    });
  }

  async createProject(data: {
    workspaceId: number;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
    status: ProjectStatus;
    startDate?: Date;
    endDate?: Date;
    createdBy: number;
  }) {
    return this.prisma.project.create({
      data,
    });
  }

  async findAllByWorkspace(workspaceId: number, page: number, limit: number) {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countByWorkspace(workspaceId: number) {
    return this.prisma.project.count({
      where: {
        workspaceId,
        deletedAt: null,
      },
    });
  }

  async findAll(
    page: number,
    limit: number,
    workspaceId?: number,
    userId?: number,
  ) {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(workspaceId && { workspaceId }),
        ...(userId && {
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } },
            { workspace: { members: { some: { userId } } } },
          ],
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countAll(workspaceId?: number, userId?: number) {
    return this.prisma.project.count({
      where: {
        deletedAt: null,
        ...(workspaceId && { workspaceId }),
        ...(userId && {
          OR: [
            { createdBy: userId },
            { members: { some: { userId } } },
            { workspace: { members: { some: { userId } } } },
          ],
        }),
      },
    });
  }

  async findById(id: number) {
    return this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        boards: {
          include: {
            columns: {
              orderBy: {
                position: 'asc',
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        members: {
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
        _count: {
          select: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      key?: string;
      description?: string;
      icon?: string;
      color?: string;
      status?: ProjectStatus;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    return this.prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.project.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
