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
