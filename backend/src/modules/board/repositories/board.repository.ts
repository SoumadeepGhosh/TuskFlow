import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class BoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  createBoard(data: {
    projectId: number;
    name: string;
    description?: string;
    position: number;
    createdBy: number;
  }) {
    return this.prisma.board.create({
      data,
    });
  }

  findProject(projectId: number) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        members: true,
      },
    });
  }

  findWorkspaceMember(workspaceId: number, userId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  findProjectMember(projectId: number, userId: number) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  findBoardByName(projectId: number, name: string) {
    return this.prisma.board.findFirst({
      where: {
        projectId,
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });
  }

  async getMaxPosition(projectId: number): Promise<number> {
    const aggregate = await this.prisma.board.aggregate({
      where: {
        projectId,
      },
      _max: {
        position: true,
      },
    });
    return aggregate._max.position ?? -1;
  }

  findBoards(projectId?: number, page = 1, limit = 10, userId?: number) {
    return this.prisma.board.findMany({
      where: {
        project: {
          deletedAt: null,
          ...(userId && {
            OR: [
              { createdBy: userId },
              { members: { some: { userId } } },
              { workspace: { members: { some: { userId } } } },
              { workspace: { ownerId: userId } },
            ],
          }),
        },
        ...(projectId && { projectId }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        position: 'asc',
      },
      include: {
        _count: {
          select: {
            columns: true,
          },
        },
      },
    });
  }

  countBoards(projectId?: number, userId?: number) {
    return this.prisma.board.count({
      where: {
        project: {
          deletedAt: null,
          ...(userId && {
            OR: [
              { createdBy: userId },
              { members: { some: { userId } } },
              { workspace: { members: { some: { userId } } } },
              { workspace: { ownerId: userId } },
            ],
          }),
        },
        ...(projectId && { projectId }),
      },
    });
  }

  findBoardById(id: number) {
    return this.prisma.board.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
            members: true,
          },
        },
        columns: {
          orderBy: {
            position: 'asc',
          },
          include: {
            tasks: {
              where: {
                deletedAt: null,
              },
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
            },
          },
        },
      },
    });
  }

  updateBoard(
    id: number,
    data: {
      name?: string;
      description?: string;
      position?: number;
    },
  ) {
    return this.prisma.board.update({
      where: {
        id,
      },
      data,
    });
  }

  deleteBoard(id: number) {
    return this.prisma.board.delete({
      where: {
        id,
      },
    });
  }
}
