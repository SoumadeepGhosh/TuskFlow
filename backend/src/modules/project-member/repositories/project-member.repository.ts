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
      include: {
        workspace: {
          select: {
            id: true,
            ownerId: true,
          },
        },
      },
    });
  }

  async findWorkspaceMember(workspaceId: number, userId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async countOwners(projectId: number) {
    return this.prisma.projectMember.count({
      where: {
        projectId,
        role: ProjectRole.OWNER,
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
        createdAt: 'asc',
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
      include: {
        project: {
          select: {
            id: true,
            workspaceId: true,
            createdBy: true,
            workspace: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
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

  async removeMember(memberId: number) {
    return this.prisma.projectMember.delete({
      where: {
        id: memberId,
      },
    });
  }
}
