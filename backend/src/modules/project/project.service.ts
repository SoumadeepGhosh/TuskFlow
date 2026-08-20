/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
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

  async create(workspaceId: number, dto: CreateProjectDto, user: JwtPayload) {
    const workspace = await this.projectRepository.findWorkspace(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to create projects in this workspace',
      );
    }

    const existingProject = await this.projectRepository.findByKey(
      workspaceId,
      dto.key,
    );

    if (existingProject) {
      throw new ConflictException('Project key already exists');
    }

    return this.projectRepository.createProject({
      workspaceId,
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

  async findAll(workspaceId: number, pagination: ProjectPaginationDto) {
    const workspace = await this.projectRepository.findWorkspace(workspaceId);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const projects = await this.projectRepository.findAllByWorkspace(
      workspaceId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.projectRepository.countByWorkspace(workspaceId);

    return {
      items: projects,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
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
