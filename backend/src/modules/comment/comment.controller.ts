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

import { CommentService } from './comment.service';

import {
  CommentPaginationDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/request.dto';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Body()
    dto: CreateCommentDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.commentService.create(taskId, dto, user);
  }

  @ApiPagination()
  @Get('tasks/:taskId/comments')
  findAll(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.commentService.findAll(taskId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as CommentPaginationDto);
  }

  @Get('comments/my')
  findMyComments(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.commentService.findMyComments(user);
  }

  @Get('comments/recent')
  findRecentComments() {
    return this.commentService.findRecentComments();
  }

  @Get('tasks/:taskId/comments/count')
  countTaskComments(
    @Param('taskId', ParseIntPipe)
    taskId: number,
  ) {
    return this.commentService.countTaskComments(taskId);
  }

  @Get('comments/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.commentService.findOne(id);
  }

  @Patch('comments/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, dto);
  }

  @Delete('comments/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.commentService.remove(id);
  }
}
