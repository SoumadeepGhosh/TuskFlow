/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspacePaginationDto,
} from './dto/request.dto';
import { WorkspaceRepository } from './repositories/workspace.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, user: JwtPayload) {
    // Simple slug generation
    const slug = createWorkspaceDto.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    // Create workspace
    const workspace = await this.workspaceRepository.createWorkspace({
      name: createWorkspaceDto.name,
      description: createWorkspaceDto.description,
      slug,
      ownerId: user.sub,
    });

    // Add owner as workspace member
    await this.workspaceRepository.addWorkspaceOwner(workspace.id, user.sub);

    return workspace;
  }

  async findAll(user: JwtPayload, pagination: WorkspacePaginationDto) {
    return this.workspaceRepository.findAllByOwner(
      user.sub,
      pagination.page,
      pagination.limit,
    );
  }

  async findOne(id: number, user: JwtPayload) {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Only owner can access for now
    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return workspace;
  }

  async update(
    id: number,
    updateWorkspaceDto: UpdateWorkspaceDto,
    user: JwtPayload,
  ) {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to update this workspace',
      );
    }

    const data: {
      name?: string;
      description?: string;
      slug?: string;
    } = {};

    if (updateWorkspaceDto.name) {
      data.name = updateWorkspaceDto.name;

      data.slug = updateWorkspaceDto.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');
    }

    if (updateWorkspaceDto.description !== undefined) {
      data.description = updateWorkspaceDto.description;
    }

    return this.workspaceRepository.update(id, data);
  }

  async remove(id: number, user: JwtPayload) {
    const workspace = await this.workspaceRepository.findById(id);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException(
        'You are not allowed to delete this workspace',
      );
    }

    await this.workspaceRepository.delete(id);

    return {
      message: 'Workspace deleted successfully',
    };
  }
}
