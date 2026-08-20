/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class TaskLabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });
  }

  findLabel(labelId: number) {
    return this.prisma.label.findUnique({
      where: {
        id: labelId,
      },
    });
  }

  exists(taskId: number, labelId: number) {
    return this.prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }

  assignLabel(taskId: number, labelId: number) {
    return this.prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
      include: {
        label: true,
      },
    });
  }

  findTaskLabels(taskId: number, page: number, limit: number) {
    return this.prisma.taskLabel.findMany({
      where: {
        taskId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        label: true,
      },
    });
  }

  countTaskLabels(taskId: number) {
    return this.prisma.taskLabel.count({
      where: {
        taskId,
      },
    });
  }

  removeLabel(taskId: number, labelId: number) {
    return this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }

  removeAllLabels(taskId: number) {
    return this.prisma.taskLabel.deleteMany({
      where: {
        taskId,
      },
    });
  }
}
