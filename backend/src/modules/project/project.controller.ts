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

import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/request.dto';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('workspaces/:workspaceId/projects')
  create(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,

    @Body()
    dto: CreateProjectDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.projectService.create(workspaceId, dto, user);
  }

  @ApiPagination()
  @Get('workspaces/:workspaceId/projects')
  findAll(
    @Param('workspaceId', ParseIntPipe)
    workspaceId: number,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.projectService.findAll(workspaceId, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get('projects/:id')
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.projectService.findOne(id);
  }

  @Patch('projects/:id')
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateProjectDto,
  ) {
    return this.projectService.update(id, dto);
  }

  @Delete('projects/:id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.projectService.remove(id);
  }
}
