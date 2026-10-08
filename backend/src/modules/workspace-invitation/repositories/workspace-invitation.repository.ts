import { Injectable } from '@nestjs/common';
import { InvitationStatus, MemberStatus, Prisma, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class WorkspaceInvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWorkspace(workspaceId: number) {
    return this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        deletedAt: null,
      },
    });
  }

  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
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

  async findMemberByEmail(workspaceId: number, email: string) {
    return this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
        status: {
          not: MemberStatus.REMOVED,
        },
      },
    });
  }

  async findPendingInvitation(workspaceId: number, email: string) {
    return this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async createInvitation(data: {
    workspaceId: number;
    email: string;
    role: WorkspaceRole;
    token: string;
    invitedBy: number;
    expiresAt: Date;
  }) {
    return this.prisma.workspaceInvitation.create({
      data: {
        workspaceId: data.workspaceId,
        email: data.email,
        role: data.role,
        token: data.token,
        status: InvitationStatus.PENDING,
        invitedBy: data.invitedBy,
        expiresAt: data.expiresAt,
      },
      include: {
        inviter: {
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

  async findInvitationsByWorkspace(workspaceId: number) {
    // Automatically mark expired pending invitations
    await this.prisma.workspaceInvitation.updateMany({
      where: {
        workspaceId,
        status: InvitationStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return this.prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        inviter: {
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

  async findInvitationById(id: number) {
    return this.prisma.workspaceInvitation.findUnique({
      where: { id },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  async findInvitationByToken(token: string) {
    return this.prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  async updateInvitation(
    id: number,
    data: Prisma.WorkspaceInvitationUpdateInput,
  ) {
    return this.prisma.workspaceInvitation.update({
      where: { id },
      data,
      include: {
        inviter: {
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

  async acceptInvitationTransaction(
    invitationId: number,
    workspaceId: number,
    userId: number,
    role: WorkspaceRole,
    invitedBy: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Mark invitation as accepted
      const updatedInvitation = await tx.workspaceInvitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // 2. Create or reactivate workspace member
      const member = await tx.workspaceMember.upsert({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
        create: {
          workspaceId,
          userId,
          role,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
          invitedBy,
        },
        update: {
          role,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      return { invitation: updatedInvitation, member };
    });
  }
}

