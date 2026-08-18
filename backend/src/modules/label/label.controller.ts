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

import { LabelService } from './label.service';

import {
  CreateLabelDto,
  LabelPaginationDto,
  UpdateLabelDto,
} from './dto/request.dto';

@ApiTags('Labels')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post('projects/:projectId/labels')
  create(
    @Param('projectId', ParseIntPipe)
    projectId: number,

    @Body()
    dto: CreateLabelDto,
  ) {
    return this.labelService.create(projectId, dto);
  }

  @ApiPagination()
  @Get('projects/:projectId/labels')
  findAll(
    @Param('projectId', ParseIntPipe)
    projectId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.labelService.findAll(projectId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as LabelPaginationDto);
  }

  @Get('labels/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.labelService.findOne(id);
  }

  @Patch('labels/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateLabelDto,
  ) {
    return this.labelService.update(id, dto);
  }

  @Delete('labels/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.labelService.remove(id);
  }
}
