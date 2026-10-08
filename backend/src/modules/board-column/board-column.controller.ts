/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

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

  @Post('columns')
  createDirect(
    @Body() dto: CreateBoardColumnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardColumnService.create(dto.boardId, dto, user);
  }

  @Post('boards/:boardId/columns')
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreateBoardColumnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardColumnService.create(boardId, dto, user);
  }

  @ApiPagination()
  @Get('columns')
  findAllColumns(
    @CurrentUser() user: JwtPayload,
    @Query('boardId') boardId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boardColumnService.findAll(
      boardId ? Number(boardId) : undefined,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        boardId: boardId ? Number(boardId) : undefined,
      } as BoardColumnPaginationDto,
      user,
    );
  }

  @ApiPagination()
  @Get('boards/:boardId/columns')
  findAll(
    @Param('boardId', ParseIntPipe) boardId: number,
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boardColumnService.findAll(
      boardId,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      } as BoardColumnPaginationDto,
      user,
    );
  }

  @Get('columns/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardColumnService.findOne(id, user);
  }

  @Patch('columns/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBoardColumnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardColumnService.update(id, dto, user);
  }

  @Delete('columns/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardColumnService.remove(id, user);
  }
}
