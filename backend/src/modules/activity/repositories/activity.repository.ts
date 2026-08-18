import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ActivityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ActivityCreateInput) {
    return this.prisma.activity.create({
      data,
    });
  }

  findAll(skip: number, take: number) {
    return this.prisma.activity.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  count() {
    return this.prisma.activity.count();
  }

  findById(id: number) {
    return this.prisma.activity.findUnique({
      where: { id },
    });
  }

  findByTask(taskId: number, skip: number, take: number) {
    return this.prisma.activity.findMany({
      where: {
        taskId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByProject(projectId: number, skip: number, take: number) {
    return this.prisma.activity.findMany({
      where: {
        projectId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByWorkspace(workspaceId: number, skip: number, take: number) {
    return this.prisma.activity.findMany({
      where: {
        workspaceId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByUser(userId: number, skip: number, take: number) {
    return this.prisma.activity.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByAction(action: string, skip: number, take: number) {
    return this.prisma.activity.findMany({
      where: {
        action: {
          contains: action,
          mode: 'insensitive',
        },
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  delete(id: number) {
    return this.prisma.activity.delete({
      where: {
        id,
      },
    });
  }
}
