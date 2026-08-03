/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable } from '@nestjs/common';
import { MemberStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class WorkspaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findWorkspace(workspaceId: number) {
    return this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });
  }

  async findMember(workspaceId: number, userId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findMemberById(memberId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        id: memberId,
      },
    });
  }

  async addMember(workspaceId: number, userId: number, role: WorkspaceRole) {
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
  }

  async findMembers(workspaceId: number, page: number, limit: number) {
    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
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
    });
  }

  async updateRole(memberId: number, role: WorkspaceRole) {
    return this.prisma.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });
  }

  async updateStatus(memberId: number, status: MemberStatus) {
    return this.prisma.workspaceMember.update({
      where: {
        id: memberId,
      },
      data: {
        status,
      },
    });
  }

  async removeMember(memberId: number) {
    return this.prisma.workspaceMember.delete({
      where: {
        id: memberId,
      },
    });
  }
}
