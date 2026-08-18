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
  TaskPaginationDto,
  UpdateTaskDto,
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
}
