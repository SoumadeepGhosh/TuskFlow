import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ProjectRole, ProjectStatus } from '@prisma/client';

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

  async findWorkspaceMember(workspaceId: number, userId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findProjectMember(projectId: number, userId: number) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
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

  async createProjectWithSetup(data: {
    workspaceId: number;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
    logoUrl?: string;
    coverUrl?: string;
    status: ProjectStatus;
    startDate?: Date;
    endDate?: Date;
    createdBy: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create project
      const project = await tx.project.create({
        data,
      });

      // 2. Automatically enroll creator as OWNER in ProjectMember
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: data.createdBy,
          role: ProjectRole.OWNER,
          joinedAt: new Date(),
        },
      });

      // 3. Automatically provision initial default Kanban Board and columns
      const defaultBoard = await tx.board.create({
        data: {
          projectId: project.id,
          name: 'Main Board',
          description: 'Default project Kanban board',
          position: 0,
          createdBy: data.createdBy,
        },
      });

      await tx.boardColumn.createMany({
        data: [
          {
            boardId: defaultBoard.id,
            name: 'To Do',
            position: 0,
            color: '#94A3B8',
          },
          {
            boardId: defaultBoard.id,
            name: 'In Progress',
            position: 1,
            color: '#3B82F6',
          },
          {
            boardId: defaultBoard.id,
            name: 'Done',
            position: 2,
            color: '#10B981',
          },
        ],
      });

      return project;
    });
  }

  async findAllByWorkspace(
    workspaceId: number,
    page: number,
    limit: number,
    status?: ProjectStatus,
  ) {
    return this.prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        ...(status && { status }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            boards: true,
            tasks: {
              where: {
                deletedAt: null,
              },
            },
            members: true,
          },
        },
      },
    });
  }

  async countByWorkspace(workspaceId: number, status?: ProjectStatus) {
    return this.prisma.project.count({
      where: {
        workspaceId,
        deletedAt: null,
        ...(status && { status }),
      },
    });
  }

  async findAll(
    page: number,
    limit: number,
    workspaceId?: number,
    userId?: number,
    status?: ProjectStatus,
  ) {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        ...(workspaceId && { workspaceId }),
        ...(status && { status }),
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
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            boards: true,
            tasks: {
              where: {
                deletedAt: null,
              },
            },
            members: true,
          },
        },
      },
    });
  }

  async countAll(
    workspaceId?: number,
    userId?: number,
    status?: ProjectStatus,
  ) {
    return this.prisma.project.count({
      where: {
        deletedAt: null,
        ...(workspaceId && { workspaceId }),
        ...(status && { status }),
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
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
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
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
            boards: true,
            members: true,
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
      logoUrl?: string | null;
      coverUrl?: string | null;
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
