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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('boards')
  createDirect(@Body() dto: CreateBoardDto, @CurrentUser() user: JwtPayload) {
    return this.boardService.create(dto.projectId, dto, user);
  }

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
  @Get('boards')
  findAllBoards(
    @CurrentUser() user: JwtPayload,
    @Query('projectId') projectId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boardService.findAll(
      projectId ? Number(projectId) : undefined,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        projectId: projectId ? Number(projectId) : undefined,
      } as BoardPaginationDto,
      user,
    );
  }

  @ApiPagination()
  @Get('projects/:projectId/boards')
  findAll(
    @Param('projectId', ParseIntPipe)
    projectId: number,
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.boardService.findAll(
      projectId,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      } as BoardPaginationDto,
      user,
    );
  }

  @Get('boards/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.findOne(id, user);
  }

  @Patch('boards/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.update(id, dto, user);
  }

  @Post('boards/:id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.uploadCover(id, file, user);
  }

  @Delete('boards/:id/cover')
  removeCover(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.removeCover(id, user);
  }

  @Delete('boards/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.boardService.remove(id, user);
  }
}
