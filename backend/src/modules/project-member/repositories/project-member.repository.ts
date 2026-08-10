/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProject(projectId: number) {
    return this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findMember(projectId: number, userId: number) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async addMember(projectId: number, userId: number, role: ProjectRole) {
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
        joinedAt: new Date(),
      },
    });
  }

  async findMembers(projectId: number, page: number, limit: number) {
    return this.prisma.projectMember.findMany({
      where: {
        projectId,
      },
      skip: (page - 1) * limit,
      take: limit,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countMembers(projectId: number) {
    return this.prisma.projectMember.count({
      where: {
        projectId,
      },
    });
  }

  async findMemberById(memberId: number) {
    return this.prisma.projectMember.findUnique({
      where: {
        id: memberId,
      },
    });
  }

  async updateRole(memberId: number, role: ProjectRole) {
    return this.prisma.projectMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });
  }

  async removeMember(memberId: number) {
    return this.prisma.projectMember.delete({
      where: {
        id: memberId,
      },
    });
  }
}
