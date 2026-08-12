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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { TaskService } from './task.service';

import {
  CreateTaskDto,
  MoveTaskDto,
  TaskPaginationDto,
  TaskSearchDto,
  UpdateTaskDto,
  UpdateTaskPositionDto,
  UpdateTaskPriorityDto,
  UpdateTaskStatusDto,
} from './dto/request.dto';

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

  @Delete('tasks/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.taskService.remove(id);
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
  @Get('projects/:projectId/tasks/search')
  search(
    @Param('projectId', ParseIntPipe)
    projectId: number,

    @Query()
    dto: TaskSearchDto,
  ) {
    return this.taskService.search(projectId, dto);
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

  @Get('tasks/my')
  findMyTasks(
    @CurrentUser()
    user: JwtPayload,
  ) {
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

  @Get('projects/:projectId/tasks/statistics')
  getProjectTaskStatistics(
    @Param('projectId', ParseIntPipe)
    projectId: number,
  ) {
    return this.taskService.getProjectTaskStatistics(projectId);
  }
}
