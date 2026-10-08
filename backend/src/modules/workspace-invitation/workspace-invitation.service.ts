import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { InvitationStatus, WorkspaceRole } from '@prisma/client';
import { WorkspaceInvitationRepository } from './repositories/workspace-invitation.repository';
import { EmailService } from '../email/email.service';
import { InviteMemberDto } from './dto/request.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    private readonly invitationRepository: WorkspaceInvitationRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3001'
    );
  }

  private getInvitationExpiration(): Date {
    const days =
      this.configService.get<number>('INVITATION_EXPIRATION_DAYS') || 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private async assertCanManageInvitations(
    workspaceId: number,
    userId: number,
  ) {
    const workspace = await this.invitationRepository.findWorkspace(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId === userId) {
      return workspace;
    }

    const member = await this.invitationRepository.findMember(
      workspaceId,
      userId,
    );

    if (
      !member ||
      (member.role !== WorkspaceRole.OWNER &&
        member.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only workspace owners and administrators can manage invitations',
      );
    }

    return workspace;
  }

  async inviteMember(
    workspaceId: number,
    dto: InviteMemberDto,
    currentUser: JwtPayload,
  ) {
    const workspace = await this.assertCanManageInvitations(
      workspaceId,
      currentUser.sub,
    );

    const email = dto.email.trim().toLowerCase();
    const role = dto.role || WorkspaceRole.MEMBER;

    // 1. Prevent inviting someone who is already an active member
    const existingMember = await this.invitationRepository.findMemberByEmail(
      workspaceId,
      email,
    );
    if (existingMember) {
      throw new ConflictException(
        'User is already an active member of this workspace',
      );
    }

    // 2. Prevent duplicate active pending invitations
    const pendingInvitation =
      await this.invitationRepository.findPendingInvitation(workspaceId, email);

    if (pendingInvitation) {
      if (pendingInvitation.expiresAt > new Date()) {
        throw new ConflictException(
          'An active pending invitation has already been sent to this email',
        );
      } else {
        // Mark stale invitation as expired
        await this.invitationRepository.updateInvitation(pendingInvitation.id, {
          status: InvitationStatus.EXPIRED,
        });
      }
    }

    // 3. Generate cryptographically secure token & expiration
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = this.getInvitationExpiration();

    // 4. Save invitation
    const invitation = await this.invitationRepository.createInvitation({
      workspaceId,
      email,
      role,
      token,
      invitedBy: currentUser.sub,
      expiresAt,
    });

    // 5. Send invitation email
    const inviterUser = await this.invitationRepository.findUserById(
      currentUser.sub,
    );
    const inviteUrl = `${this.getFrontendUrl()}/invite/${token}`;

    await this.emailService.sendWorkspaceInvitationEmail({
      recipientEmail: email,
      workspaceName: workspace.name,
      inviterName: inviterUser?.name || currentUser.email,
      role,
      inviteUrl,
      expiresAt,
    });

    return invitation;
  }

  async findInvitations(workspaceId: number, currentUser: JwtPayload) {
    await this.assertCanManageInvitations(workspaceId, currentUser.sub);
    return this.invitationRepository.findInvitationsByWorkspace(workspaceId);
  }

  async cancelInvitation(
    workspaceId: number,
    invitationId: number,
    currentUser: JwtPayload,
  ) {
    await this.assertCanManageInvitations(workspaceId, currentUser.sub);

    const invitation =
      await this.invitationRepository.findInvitationById(invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be cancelled');
    }

    await this.invitationRepository.updateInvitation(invitationId, {
      status: InvitationStatus.CANCELLED,
    });

    return { message: 'Invitation cancelled successfully' };
  }

  async resendInvitation(
    workspaceId: number,
    invitationId: number,
    currentUser: JwtPayload,
  ) {
    const workspace = await this.assertCanManageInvitations(
      workspaceId,
      currentUser.sub,
    );

    const invitation =
      await this.invitationRepository.findInvitationById(invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new NotFoundException('Invitation not found');
    }

    if (
      invitation.status !== InvitationStatus.PENDING &&
      invitation.status !== InvitationStatus.EXPIRED
    ) {
      throw new BadRequestException(
        'Cannot resend an invitation that has already been accepted or cancelled',
      );
    }

    // Generate new token & new expiration
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiresAt = this.getInvitationExpiration();

    const updatedInvitation = await this.invitationRepository.updateInvitation(
      invitationId,
      {
        token: newToken,
        expiresAt: newExpiresAt,
        status: InvitationStatus.PENDING,
      },
    );

    const inviterUser = await this.invitationRepository.findUserById(
      currentUser.sub,
    );
    const inviteUrl = `${this.getFrontendUrl()}/invite/${newToken}`;

    await this.emailService.sendWorkspaceInvitationEmail({
      recipientEmail: invitation.email,
      workspaceName: workspace.name,
      inviterName: inviterUser?.name || currentUser.email,
      role: invitation.role,
      inviteUrl,
      expiresAt: newExpiresAt,
    });

    return updatedInvitation;
  }

  async getInvitationByToken(token: string) {
    const invitation =
      await this.invitationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    // Auto-check expiry
    if (
      invitation.status === InvitationStatus.PENDING &&
      invitation.expiresAt < new Date()
    ) {
      await this.invitationRepository.updateInvitation(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      invitation.status = InvitationStatus.EXPIRED;
    }

    return invitation;
  }

  async acceptInvitation(token: string, currentUser: JwtPayload) {
    const invitation =
      await this.invitationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new BadRequestException('This invitation has already been accepted');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `This invitation is ${invitation.status.toLowerCase()} and cannot be accepted`,
      );
    }

    if (invitation.expiresAt < new Date()) {
      await this.invitationRepository.updateInvitation(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      throw new BadRequestException(
        'This invitation has expired. Please ask an admin to resend it.',
      );
    }

    // Security check: Verify email matches if desired, or allow accepting with registered account
    const userEmail = currentUser.email.toLowerCase();
    const inviteEmail = invitation.email.toLowerCase();
    if (userEmail !== inviteEmail) {
      throw new ForbiddenException(
        `This invitation was sent to ${invitation.email}. You are currently logged in as ${currentUser.email}. Please switch to the invited account.`,
      );
    }

    // Execute in transaction
    await this.invitationRepository.acceptInvitationTransaction(
      invitation.id,
      invitation.workspaceId,
      currentUser.sub,
      invitation.role,
      invitation.invitedBy,
    );

    return {
      message: 'Invitation accepted successfully',
      workspaceId: invitation.workspaceId,
      workspaceSlug: invitation.workspace.slug,
    };
  }

  async declineInvitation(token: string) {
    const invitation =
      await this.invitationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `This invitation is already ${invitation.status.toLowerCase()}`,
      );
    }

    await this.invitationRepository.updateInvitation(invitation.id, {
      status: InvitationStatus.DECLINED,
    });

    return { message: 'Invitation declined successfully' };
  }
}

