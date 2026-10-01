/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateProjectDto,
  ProjectPaginationDto,
  UpdateProjectDto,
} from './dto/request.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ProjectRepository } from './repositories/project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(
    workspaceId: number | undefined,
    dto: CreateProjectDto,
    user: JwtPayload,
  ) {
    const targetWorkspaceId = workspaceId ?? dto.workspaceId;
    if (!targetWorkspaceId) {
      throw new BadRequestException('workspaceId is required');
    }

    const workspace = await this.projectRepository.findWorkspace(targetWorkspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to create projects in this workspace',
      );
    }

    const existingProject = await this.projectRepository.findByKey(
      targetWorkspaceId,
      dto.key,
    );

    if (existingProject) {
      throw new ConflictException('Project key already exists');
    }

    return this.projectRepository.createProject({
      workspaceId: targetWorkspaceId,
      name: dto.name,
      key: dto.key.toUpperCase(),
      description: dto.description,
      icon: dto.icon,
      color: dto.color,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      createdBy: user.sub,
    });
  }

  async findAll(
    workspaceId: number | undefined,
    pagination: ProjectPaginationDto,
    user?: JwtPayload,
  ) {
    const targetWorkspaceId = workspaceId ?? pagination.workspaceId;

    if (targetWorkspaceId) {
      const workspace =
        await this.projectRepository.findWorkspace(targetWorkspaceId);

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const projects = await this.projectRepository.findAllByWorkspace(
        targetWorkspaceId,
        pagination.page,
        pagination.limit,
      );

      const total =
        await this.projectRepository.countByWorkspace(targetWorkspaceId);

      return {
        items: projects,
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    }

    const projects = await this.projectRepository.findAll(
      pagination.page,
      pagination.limit,
      undefined,
      user?.sub,
    );

    const total = await this.projectRepository.countAll(undefined, user?.sub);

    return {
      items: projects,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.projectRepository.update(id, {
      ...dto,
      key: dto.key?.toUpperCase(),
    });
  }

  async remove(id: number) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.delete(id);

    return {
      message: 'Project deleted successfully',
    };
  }
}
