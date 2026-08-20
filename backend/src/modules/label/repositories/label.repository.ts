/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class LabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  createLabel(data: { projectId: number; name: string; color: string }) {
    return this.prisma.label.create({
      data,
    });
  }

  findLabels(projectId: number, page: number, limit: number) {
    return this.prisma.label.findMany({
      where: {
        projectId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });
  }

  countLabels(projectId: number) {
    return this.prisma.label.count({
      where: {
        projectId,
      },
    });
  }

  findLabelById(id: number) {
    return this.prisma.label.findUnique({
      where: {
        id,
      },
    });
  }

  updateLabel(
    id: number,
    data: {
      name?: string;
      color?: string;
    },
  ) {
    return this.prisma.label.update({
      where: {
        id,
      },
      data,
    });
  }

  deleteLabel(id: number) {
    return this.prisma.label.delete({
      where: {
        id,
      },
    });
  }

  findProject(projectId: number) {
    return this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  existsByName(projectId: number, name: string) {
    return this.prisma.label.findFirst({
      where: {
        projectId,
        name,
      },
    });
  }
}
