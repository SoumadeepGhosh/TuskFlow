/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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

  findBoards(projectId: number, page: number, limit: number) {
    return this.prisma.board.findMany({
      where: {
        projectId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        position: 'asc',
      },
    });
  }

  countBoards(projectId: number) {
    return this.prisma.board.count({
      where: {
        projectId,
      },
    });
  }

  findBoardById(id: number) {
    return this.prisma.board.findUnique({
      where: {
        id,
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
