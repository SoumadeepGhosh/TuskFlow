import {
  BadRequestException,
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
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly storageService: StorageService,
  ) {}

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
      logoUrl: createWorkspaceDto.logoUrl,
      coverUrl: createWorkspaceDto.coverUrl,
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

    const isMember = workspace.members?.some(
      (m: { userId: number }) => m.userId === user.sub,
    );

    if (workspace.ownerId !== user.sub && !isMember) {
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
      logoUrl?: string | null;
      coverUrl?: string | null;
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

    if (updateWorkspaceDto.logoUrl !== undefined) {
      data.logoUrl = updateWorkspaceDto.logoUrl;
    }

    if (updateWorkspaceDto.coverUrl !== undefined) {
      data.coverUrl = updateWorkspaceDto.coverUrl;
    }

    return this.workspaceRepository.update(id, data);
  }

  async uploadLogo(id: number, file: Express.Multer.File, user: JwtPayload) {
    if (!file) throw new BadRequestException('File is required');
    const workspace = await this.findOne(id, user);

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Only the workspace owner can update the logo');
    }

    if (workspace.logoUrl) {
      const storageKey = workspace.logoUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const saved = await this.storageService.saveFile(file, 'workspaces');
    return this.workspaceRepository.update(id, { logoUrl: saved.fileUrl });
  }

  async removeLogo(id: number, user: JwtPayload) {
    const workspace = await this.findOne(id, user);

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Only the workspace owner can remove the logo');
    }

    if (workspace.logoUrl) {
      const storageKey = workspace.logoUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    return this.workspaceRepository.update(id, { logoUrl: null });
  }

  async uploadCover(id: number, file: Express.Multer.File, user: JwtPayload) {
    if (!file) throw new BadRequestException('File is required');
    const workspace = await this.findOne(id, user);

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Only the workspace owner can update the banner cover');
    }

    if (workspace.coverUrl) {
      const storageKey = workspace.coverUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const saved = await this.storageService.saveFile(file, 'workspaces');
    return this.workspaceRepository.update(id, { coverUrl: saved.fileUrl });
  }

  async removeCover(id: number, user: JwtPayload) {
    const workspace = await this.findOne(id, user);

    if (workspace.ownerId !== user.sub) {
      throw new ForbiddenException('Only the workspace owner can remove the banner cover');
    }

    if (workspace.coverUrl) {
      const storageKey = workspace.coverUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    return this.workspaceRepository.update(id, { coverUrl: null });
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
