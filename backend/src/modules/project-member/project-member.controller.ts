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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  AddProjectMemberDto,
  ProjectMemberPaginationDto,
  UpdateProjectMemberRoleDto,
} from './dto/request.dto';
import { ProjectMemberService } from './project-member.service';
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Project Members')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Post()
  addMember(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddProjectMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectMemberService.addMember(projectId, dto, user);
  }

  @ApiPagination()
  @Get()
  findMembers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const paginationDto: ProjectMemberPaginationDto = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    };
    return this.projectMemberService.findMembers(projectId, paginationDto);
  }

  @Patch(':memberId/role')
  updateRole(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateProjectMemberRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectMemberService.updateRole(memberId, dto, user);
  }

  @Delete(':memberId')
  removeMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectMemberService.removeMember(memberId, user);
  }
}
