/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { ActivityService } from './activity.service';

import { ActivityPaginationDto, CreateActivityDto } from './dto/request.dto';

@ApiTags('Activities')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('activities')
  create(
    @Body()
    dto: CreateActivityDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.activityService.create(dto, user);
  }

  @Get('activities')
  @ApiPagination()
  findAll(
    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as ActivityPaginationDto);
  }

  @Get('activities/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.activityService.findOne(id);
  }

  @Get('tasks/:taskId/activities')
  @ApiPagination()
  findTaskActivities(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.findTaskActivities(taskId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('projects/:projectId/activities')
  @ApiPagination()
  findProjectActivities(
    @Param('projectId', ParseIntPipe)
    projectId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.findProjectActivities(projectId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('workspaces/:workspaceId/activities')
  @ApiPagination()
  findWorkspaceActivities(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.findWorkspaceActivities(workspaceId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('users/me/activities')
  @ApiPagination()
  findMyActivities(
    @CurrentUser()
    user: JwtPayload,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.findMyActivities(user, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('activities/search')
  @ApiPagination()
  @ApiQuery({
    name: 'action',
    required: true,
    type: String,
    description: 'Search activity by action',
  })
  searchByAction(
    @Query('action')
    action: string,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.activityService.searchByAction(action, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Delete('activities/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.activityService.remove(id);
  }
}
