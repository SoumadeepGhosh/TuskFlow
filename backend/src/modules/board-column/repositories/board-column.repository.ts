import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class BoardColumnRepository {
  constructor(private readonly prisma: PrismaService) {}

  createColumn(data: {
    boardId: number;
    name: string;
    color?: string;
    position: number;
  }) {
    return this.prisma.boardColumn.create({
      data,
    });
  }

  findBoard(boardId: number) {
    return this.prisma.board.findUnique({
      where: {
        id: boardId,
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
      },
    });
  }

  findByNameInBoard(boardId: number, name: string) {
    return this.prisma.boardColumn.findFirst({
      where: {
        boardId,
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });
  }

  async getMaxPosition(boardId: number): Promise<number> {
    const aggregate = await this.prisma.boardColumn.aggregate({
      where: {
        boardId,
      },
      _max: {
        position: true,
      },
    });
    return aggregate._max.position ?? -1;
  }

  countActiveTasksInColumn(columnId: number) {
    return this.prisma.task.count({
      where: {
        columnId,
        deletedAt: null,
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

  findColumns(boardId?: number, page = 1, limit = 10) {
    return this.prisma.boardColumn.findMany({
      where: {
        ...(boardId && { boardId }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        position: 'asc',
      },
    });
  }

  countColumns(boardId?: number) {
    return this.prisma.boardColumn.count({
      where: {
        ...(boardId && { boardId }),
      },
    });
  }

  findColumnById(id: number) {
    return this.prisma.boardColumn.findUnique({
      where: {
        id,
      },
      include: {
        board: {
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
          },
        },
        tasks: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  updateColumn(
    id: number,
    data: {
      name?: string;
      color?: string;
      position?: number;
    },
  ) {
    return this.prisma.boardColumn.update({
      where: {
        id,
      },
      data,
    });
  }

  deleteColumn(id: number) {
    return this.prisma.boardColumn.delete({
      where: {
        id,
      },
    });
  }
}
