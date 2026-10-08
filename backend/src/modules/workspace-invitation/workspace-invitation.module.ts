import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import {
  InvitationAcceptanceController,
  WorkspaceInvitationController,
} from './workspace-invitation.controller';
import { WorkspaceInvitationService } from './workspace-invitation.service';
import { WorkspaceInvitationRepository } from './repositories/workspace-invitation.repository';

@Module({
  imports: [EmailModule],
  controllers: [WorkspaceInvitationController, InvitationAcceptanceController],
  providers: [WorkspaceInvitationService, WorkspaceInvitationRepository],
  exports: [WorkspaceInvitationService],
})
export class WorkspaceInvitationModule {}
