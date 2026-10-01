import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class TaskLabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
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

  findTaskLabel(taskId: number, labelId: number) {
    return this.prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }

  createTaskLabel(taskId: number, labelId: number) {
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

  deleteTaskLabel(taskId: number, labelId: number) {
    return this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }

  findLabelsForTask(taskId: number) {
    return this.prisma.taskLabel.findMany({
      where: {
        taskId,
      },
      include: {
        label: true,
      },
    });
  }
}
