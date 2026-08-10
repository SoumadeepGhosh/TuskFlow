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

import { BoardService } from './board.service';
import {
  BoardPaginationDto,
  CreateBoardDto,
  UpdateBoardDto,
} from './dto/request.dto';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Boards')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post('projects/:projectId/boards')
  create(
    @Param('projectId', ParseIntPipe)
    projectId: number,
    @Body() dto: CreateBoardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.create(projectId, dto, user);
  }

  @ApiPagination()
  @Get('projects/:projectId/boards')
  findAll(
    @Param('projectId', ParseIntPipe)
    projectId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boardService.findAll(projectId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as BoardPaginationDto);
  }

  @Get('boards/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.boardService.findOne(id);
  }

  @Patch('boards/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, dto);
  }

  @Delete('boards/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.boardService.remove(id);
  }
}
