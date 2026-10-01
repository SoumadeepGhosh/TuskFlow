import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class LabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProject(projectId: number) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });
  }

  createLabel(data: { projectId: number; name: string; color: string }) {
    return this.prisma.label.create({
      data,
    });
  }

  findLabels(projectId?: number, page = 1, limit = 50) {
    return this.prisma.label.findMany({
      where: {
        ...(projectId && { projectId }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });
  }

  countLabels(projectId?: number) {
    return this.prisma.label.count({
      where: {
        ...(projectId && { projectId }),
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

  updateLabel(id: number, data: { name?: string; color?: string }) {
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
}
