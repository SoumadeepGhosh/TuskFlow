/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
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
  ) {
    return this.projectMemberService.addMember(projectId, dto);
  }

  @ApiPagination()
  @Get()
  findMembers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.projectMemberService.findMembers(projectId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as ProjectMemberPaginationDto);
  }

  @Patch(':memberId/role')
  updateRole(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.projectMemberService.updateRole(memberId, dto);
  }

  @Delete(':memberId')
  removeMember(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.projectMemberService.removeMember(memberId);
  }
}
