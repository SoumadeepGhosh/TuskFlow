import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findTask(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
    });
  }

  findTaskWithProject(taskId: number) {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
      },
      include: {
        project: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
            members: true,
          },
        },
      },
    });
  }

  createAttachment(data: {
    taskId: number;
    uploadedBy: number;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
  }) {
    return this.prisma.attachment.create({
      data,
    });
  }

  findAttachments(taskId: number, page = 1, limit = 20) {
    return this.prisma.attachment.findMany({
      where: {
        taskId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findUsersByIds(userIds: number[]) {
    if (!userIds || userIds.length === 0) return [];
    return this.prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  countAttachments(taskId: number) {
    return this.prisma.attachment.count({
      where: {
        taskId,
      },
    });
  }

  findAttachmentById(id: number) {
    return this.prisma.attachment.findUnique({
      where: {
        id,
      },
    });
  }

  findAttachmentWithDetails(id: number) {
    return this.prisma.attachment.findUnique({
      where: {
        id,
      },
      include: {
        task: {
          include: {
            project: {
              include: {
                workspace: {
                  select: {
                    id: true,
                    name: true,
                    ownerId: true,
                  },
                },
                members: true,
              },
            },
          },
        },
      },
    });
  }

  findWorkspaceMember(workspaceId: number, userId: number) {
    return this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  findProjectMember(projectId: number, userId: number) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  deleteAttachment(id: number) {
    return this.prisma.attachment.delete({
      where: {
        id,
      },
    });
  }
}
