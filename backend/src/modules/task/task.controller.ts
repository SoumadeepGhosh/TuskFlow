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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { TaskService } from './task.service';

import {
  CreateTaskDto,
  MoveTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
  UpdateTaskPositionDto,
  UpdateTaskPriorityDto,
  UpdateTaskStatusDto,
} from './dto/request.dto';
import { TaskPriority, TaskStatus } from '@prisma/client';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('columns/:columnId/tasks')
  create(
    @Param('columnId', ParseIntPipe)
    columnId: number,
    @Body()
    dto: CreateTaskDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.taskService.create(columnId, dto, user);
  }

  @ApiPagination()
  @Get('columns/:columnId/tasks')
  findAll(
    @Param('columnId', ParseIntPipe)
    columnId: number,
    @Query('page')
    page?: number,
    @Query('limit')
    limit?: number,
  ) {
    return this.taskService.findAll(columnId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as TaskPaginationDto);
  }

  @Get('projects/:projectId/tasks/search')
  @ApiPagination()
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: 'Search keyword',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TaskPriority,
  })
  search(
    @Param('projectId', ParseIntPipe)
    projectId: number,

    @Query('keyword')
    keyword?: string,

    @Query('status')
    status?: TaskStatus,

    @Query('priority')
    priority?: TaskPriority,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.taskService.search(projectId, {
      keyword,
      status,
      priority,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('tasks/my')
  findMyTasks(@CurrentUser() user: JwtPayload) {
    return this.taskService.findMyTasks(user);
  }

  @Get('tasks/due-today')
  findDueToday() {
    return this.taskService.findDueToday();
  }
  @Get('tasks/overdue')
  findOverdueTasks() {
    return this.taskService.findOverdueTasks();
  }

  @Get('tasks/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.taskService.findOne(id);
  }

  @Patch('tasks/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, dto);
  }
  @Patch('tasks/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateStatus(id, dto);
  }

  @Patch('tasks/:id/priority')
  updatePriority(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateTaskPriorityDto,
  ) {
    return this.taskService.updatePriority(id, dto);
  }

  @Patch('tasks/:id/position')
  updatePosition(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateTaskPositionDto,
  ) {
    return this.taskService.updatePosition(id, dto);
  }

  @Patch('tasks/:id/move')
  moveTask(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: MoveTaskDto,
  ) {
    return this.taskService.moveTask(id, dto);
  }

  @Patch('tasks/:id/complete')
  completeTask(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.taskService.completeTask(id);
  }

  @Patch('tasks/:id/reopen')
  reopenTask(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.taskService.reopenTask(id);
  }

  @Delete('tasks/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.taskService.remove(id);
  }

  @Get('projects/:projectId/tasks/statistics')
  getProjectTaskStatistics(
    @Param('projectId', ParseIntPipe)
    projectId: number,
  ) {
    return this.taskService.getProjectTaskStatistics(projectId);
  }
}
