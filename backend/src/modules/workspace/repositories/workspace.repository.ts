import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWorkspace(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: number;
  }) {
    return this.prisma.workspace.create({
      data,
    });
  }

  addWorkspaceOwner(workspaceId: number, ownerId: number) {
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: ownerId,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.workspace.findUnique({
      where: {
        slug,
      },
    });
  }

  findByOwner(ownerId: number) {
    return this.prisma.workspace.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllByOwner(ownerId: number, page: number, limit: number) {
    return this.prisma.workspace.findMany({
      where: {
        deletedAt: null,
        OR: [{ ownerId }, { members: { some: { userId: ownerId } } }],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: number) {
    return this.prisma.workspace.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        projects: {
          where: {
            deletedAt: null,
          },
        },
        members: {
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
        },
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      slug?: string;
    },
  ) {
    return this.prisma.workspace.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.workspace.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
