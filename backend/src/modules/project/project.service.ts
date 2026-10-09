import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MemberStatus,
  ProjectRole,
  ProjectStatus,
  WorkspaceRole,
} from '@prisma/client';

import {
  CreateProjectDto,
  ProjectPaginationDto,
  UpdateProjectDto,
} from './dto/request.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ProjectRepository } from './repositories/project.repository';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly storageService: StorageService,
  ) {}

  private async assertCanCreateProject(workspaceId: number, userId: number) {
    const workspace = await this.projectRepository.findWorkspace(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId === userId) {
      return workspace;
    }

    const member = await this.projectRepository.findWorkspaceMember(
      workspaceId,
      userId,
    );

    if (
      !member ||
      member.status !== MemberStatus.ACTIVE ||
      (member.role !== WorkspaceRole.OWNER &&
        member.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only workspace owners and administrators can create projects',
      );
    }

    return workspace;
  }

  private async assertCanManageProject(
    projectId: number,
    userId: number,
    requireOwner = false,
  ) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Workspace owner always has full rights
    if (project.workspace?.ownerId === userId) {
      return project;
    }

    // Workspace admin has full rights
    const wsMember = await this.projectRepository.findWorkspaceMember(
      project.workspaceId,
      userId,
    );
    if (
      wsMember &&
      wsMember.status === MemberStatus.ACTIVE &&
      (wsMember.role === WorkspaceRole.OWNER ||
        wsMember.role === WorkspaceRole.ADMIN)
    ) {
      return project;
    }

    // Project creator has rights
    if (project.createdBy === userId) {
      return project;
    }

    // Check project member role
    const projectMember = await this.projectRepository.findProjectMember(
      projectId,
      userId,
    );

    if (!projectMember) {
      throw new ForbiddenException(
        'You do not have permission to manage this project',
      );
    }

    if (requireOwner) {
      if (projectMember.role !== ProjectRole.OWNER) {
        throw new ForbiddenException(
          'Only project owners can perform this action',
        );
      }
    } else {
      if (
        projectMember.role !== ProjectRole.OWNER &&
        projectMember.role !== ProjectRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Only project owners and managers can perform this action',
        );
      }
    }

    return project;
  }

  async create(
    workspaceId: number | undefined,
    dto: CreateProjectDto,
    user: JwtPayload,
  ) {
    const targetWorkspaceId = workspaceId ?? dto.workspaceId;
    if (!targetWorkspaceId) {
      throw new BadRequestException('workspaceId is required');
    }

    await this.assertCanCreateProject(targetWorkspaceId, user.sub);

    const formattedKey = dto.key.trim().toUpperCase();

    const existingProject = await this.projectRepository.findByKey(
      targetWorkspaceId,
      formattedKey,
    );

    if (existingProject) {
      throw new ConflictException(
        `Project key "${formattedKey}" already exists in this workspace`,
      );
    }

    return this.projectRepository.createProjectWithSetup({
      workspaceId: targetWorkspaceId,
      name: dto.name.trim(),
      key: formattedKey,
      description: dto.description?.trim(),
      icon: dto.icon,
      color: dto.color,
      logoUrl: dto.logoUrl,
      coverUrl: dto.coverUrl,
      status: dto.status || ProjectStatus.ACTIVE,
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
        pagination.status,
      );

      const total = await this.projectRepository.countByWorkspace(
        targetWorkspaceId,
        pagination.status,
      );

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
      pagination.status,
    );

    const total = await this.projectRepository.countAll(
      undefined,
      user?.sub,
      pagination.status,
    );

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

  async findOne(id: number, user?: JwtPayload) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user) {
      // Check if user has access to this workspace or project
      const isWorkspaceOwner = project.workspace?.ownerId === user.sub;
      const wsMember = await this.projectRepository.findWorkspaceMember(
        project.workspaceId,
        user.sub,
      );
      const isProjectMember = project.members.some(
        (m) => m.userId === user.sub,
      );
      const isCreator = project.createdBy === user.sub;

      if (!isWorkspaceOwner && !wsMember && !isProjectMember && !isCreator) {
        throw new ForbiddenException(
          'You do not have access to view this project',
        );
      }
    }

    return project;
  }

  async update(id: number, dto: UpdateProjectDto, user: JwtPayload) {
    const project = await this.assertCanManageProject(id, user.sub, false);

    let updatedKey = project.key;
    if (dto.key) {
      const formattedKey = dto.key.trim().toUpperCase();
      if (formattedKey !== project.key) {
        const existingKey = await this.projectRepository.findByKey(
          project.workspaceId,
          formattedKey,
        );
        if (existingKey && existingKey.id !== id) {
          throw new ConflictException(
            `Project key "${formattedKey}" is already taken in this workspace`,
          );
        }
        updatedKey = formattedKey;
      }
    }

    return this.projectRepository.update(id, {
      ...dto,
      name: dto.name ? dto.name.trim() : undefined,
      description:
        dto.description !== undefined ? dto.description.trim() : undefined,
      key: updatedKey,
    });
  }

  async uploadLogo(id: number, file: Express.Multer.File, user: JwtPayload) {
    if (!file) throw new BadRequestException('File is required');
    const project = await this.assertCanManageProject(id, user.sub, false);

    if (project.logoUrl) {
      const storageKey = project.logoUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const saved = await this.storageService.saveFile(file, 'projects');
    return this.projectRepository.update(id, { logoUrl: saved.fileUrl });
  }

  async removeLogo(id: number, user: JwtPayload) {
    const project = await this.assertCanManageProject(id, user.sub, false);

    if (project.logoUrl) {
      const storageKey = project.logoUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    return this.projectRepository.update(id, { logoUrl: null });
  }

  async uploadCover(id: number, file: Express.Multer.File, user: JwtPayload) {
    if (!file) throw new BadRequestException('File is required');
    const project = await this.assertCanManageProject(id, user.sub, false);

    if (project.coverUrl) {
      const storageKey = project.coverUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    const saved = await this.storageService.saveFile(file, 'projects');
    return this.projectRepository.update(id, { coverUrl: saved.fileUrl });
  }

  async removeCover(id: number, user: JwtPayload) {
    const project = await this.assertCanManageProject(id, user.sub, false);

    if (project.coverUrl) {
      const storageKey = project.coverUrl.replace(/^\/?(api\/)?uploads\//, '');
      await this.storageService.deleteFile(storageKey);
    }

    return this.projectRepository.update(id, { coverUrl: null });
  }

  async remove(id: number, user: JwtPayload) {
    await this.assertCanManageProject(id, user.sub, true);

    await this.projectRepository.delete(id);

    return {
      message: 'Project deleted successfully',
    };
  }
}

