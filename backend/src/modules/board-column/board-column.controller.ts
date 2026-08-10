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
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { BoardColumnService } from './board-column.service';
import {
  BoardColumnPaginationDto,
  CreateBoardColumnDto,
  UpdateBoardColumnDto,
} from './dto/request.dto';

@ApiTags('Board Columns')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Post('boards/:boardId/columns')
  create(
    @Param('boardId', ParseIntPipe)
    boardId: number,
    @Body()
    dto: CreateBoardColumnDto,
  ) {
    return this.boardColumnService.create(boardId, dto);
  }

  @ApiPagination()
  @Get('boards/:boardId/columns')
  findAll(
    @Param('boardId', ParseIntPipe)
    boardId: number,
    @Query('page')
    page?: number,
    @Query('limit')
    limit?: number,
  ) {
    return this.boardColumnService.findAll(boardId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as BoardColumnPaginationDto);
  }

  @Get('columns/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.boardColumnService.findOne(id);
  }

  @Patch('columns/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    dto: UpdateBoardColumnDto,
  ) {
    return this.boardColumnService.update(id, dto);
  }

  @Delete('columns/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.boardColumnService.remove(id);
  }
}
