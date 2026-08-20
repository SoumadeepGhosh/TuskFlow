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
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { TaskAssigneeService } from './task-assignee.service';

import {
  AssignTaskAssigneeDto,
  TaskAssigneePaginationDto,
} from './dto/request.dto';

@ApiTags('Task Assignees')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskAssigneeController {
  constructor(private readonly taskAssigneeService: TaskAssigneeService) {}

  @Post('tasks/:taskId/assignees')
  assignUser(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Body()
    dto: AssignTaskAssigneeDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.taskAssigneeService.assignUser(taskId, dto, user);
  }

  @ApiPagination()
  @Get('tasks/:taskId/assignees')
  findTaskAssignees(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.taskAssigneeService.findTaskAssignees(taskId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as TaskAssigneePaginationDto);
  }

  @Delete('tasks/:taskId/assignees/:userId')
  removeAssignment(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    return this.taskAssigneeService.removeAssignment(taskId, userId);
  }

  @ApiPagination()
  @Get('users/:userId/tasks')
  findUserAssignedTasks(
    @Param('userId', ParseIntPipe)
    userId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.taskAssigneeService.findUserAssignedTasks(userId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as TaskAssigneePaginationDto);
  }
}
