/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AddMemberDto,
  UpdateMemberRoleDto,
  UpdateMemberStatusDto,
} from './dto/request.dto';
import { WorkspaceMemberService } from './workspace-member.service';
import { SortOrder } from 'src/common/dto/api-response.dto';
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Workspace Members')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('workspaces/:workspaceId/members')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post()
  addMember(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() dto: AddMemberDto,
  ) {
    return this.workspaceMemberService.addMember(workspaceId, dto);
  }

  @ApiPagination()
  @Get()
  findMembers(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workspaceMemberService.findMembers(workspaceId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortOrder: SortOrder.ASC,
    });
  }

  @Patch(':memberId/role')
  updateRole(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceMemberService.updateRole(memberId, dto);
  }

  @Patch(':memberId/status')
  updateStatus(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateMemberStatusDto,
  ) {
    return this.workspaceMemberService.updateStatus(memberId, dto);
  }

  @Delete(':memberId')
  removeMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.workspaceMemberService.removeMember(memberId);
  }
}
