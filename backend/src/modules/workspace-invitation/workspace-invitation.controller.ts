import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { WorkspaceInvitationService } from './workspace-invitation.service';
import { InviteMemberDto } from './dto/request.dto';

@ApiTags('Workspace Invitations')
@Controller('workspaces/:workspaceId/invitations')
export class WorkspaceInvitationController {
  constructor(
    private readonly invitationService: WorkspaceInvitationService,
  ) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invite a member to the workspace' })
  @Post()
  inviteMember(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationService.inviteMember(workspaceId, dto, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all invitations for the workspace' })
  @Get()
  findInvitations(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationService.findInvitations(workspaceId, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel a pending workspace invitation' })
  @Delete(':invitationId')
  cancelInvitation(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationService.cancelInvitation(
      workspaceId,
      invitationId,
      user,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Resend a workspace invitation with a new token' })
  @Post(':invitationId/resend')
  resendInvitation(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationService.resendInvitation(
      workspaceId,
      invitationId,
      user,
    );
  }
}

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationAcceptanceController {
  constructor(
    private readonly invitationService: WorkspaceInvitationService,
  ) {}

  @ApiOperation({ summary: 'Get workspace invitation details by token' })
  @Get(':token')
  getInvitationByToken(@Param('token') token: string) {
    return this.invitationService.getInvitationByToken(token);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Accept a workspace invitation' })
  @Post(':token/accept')
  acceptInvitation(
    @Param('token') token: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invitationService.acceptInvitation(token, user);
  }

  @ApiOperation({ summary: 'Decline a workspace invitation' })
  @Post(':token/decline')
  declineInvitation(@Param('token') token: string) {
    return this.invitationService.declineInvitation(token);
  }
}

