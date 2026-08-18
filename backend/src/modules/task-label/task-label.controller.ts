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
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { TaskLabelService } from './task-label.service';

import { AssignLabelDto, TaskLabelPaginationDto } from './dto/request.dto';

@ApiTags('Task Labels')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskLabelController {
  constructor(private readonly taskLabelService: TaskLabelService) {}

  @Post('tasks/:taskId/labels')
  assignLabel(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Body()
    dto: AssignLabelDto,
  ) {
    return this.taskLabelService.assignLabel(taskId, dto);
  }

  @ApiPagination()
  @Get('tasks/:taskId/labels')
  findAll(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.taskLabelService.findAll(taskId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as TaskLabelPaginationDto);
  }

  @Delete('tasks/:taskId/labels/:labelId')
  remove(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Param('labelId', ParseIntPipe)
    labelId: number,
  ) {
    return this.taskLabelService.remove(taskId, labelId);
  }

  @Delete('tasks/:taskId/labels')
  removeAll(
    @Param('taskId', ParseIntPipe)
    taskId: number,
  ) {
    return this.taskLabelService.removeAll(taskId);
  }
}
