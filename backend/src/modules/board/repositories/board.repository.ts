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
    });
  }

  findBoards(projectId?: number, page = 1, limit = 10) {
    return this.prisma.board.findMany({
      where: {
        ...(projectId && { projectId }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        position: 'asc',
      },
    });
  }

  countBoards(projectId?: number) {
    return this.prisma.board.count({
      where: {
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
