import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberStatus, ProjectRole, WorkspaceRole } from '@prisma/client';

import {
  BoardPaginationDto,
  CreateBoardDto,
  UpdateBoardDto,
} from './dto/request.dto';

import { BoardRepository } from './repositories/board.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  private async assertCanAccessProject(
    project: {
      id: number;
      workspaceId: number;
      createdBy: number;
      workspace?: { id: number; name: string; ownerId: number } | null;
      members?: Array<{ userId: number; role: ProjectRole }>;
    },
    userId: number,
  ) {
    // 1. Workspace owner has access
    if (project.workspace?.ownerId === userId) {
      return true;
    }

    // 2. Project creator has access
    if (project.createdBy === userId) {
      return true;
    }

    // 3. Project member has access
    if (project.members?.some((m) => m.userId === userId)) {
      return true;
    }

    // 4. Workspace active member has access
    const wsMember = await this.boardRepository.findWorkspaceMember(
      project.workspaceId,
      userId,
    );
    if (wsMember && wsMember.status === MemberStatus.ACTIVE) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this project',
    );
  }

  private async assertCanManageBoard(
    project: {
      id: number;
      workspaceId: number;
      createdBy: number;
      workspace?: { id: number; name: string; ownerId: number } | null;
      members?: Array<{ userId: number; role: ProjectRole }>;
    },
    userId: number,
  ) {
    // 1. Workspace owner has full manage rights
    if (project.workspace?.ownerId === userId) {
      return true;
    }

    // 2. Project creator has manage rights
    if (project.createdBy === userId) {
      return true;
    }

    // 3. Workspace active member
    const wsMember = await this.boardRepository.findWorkspaceMember(
      project.workspaceId,
      userId,
    );
    if (wsMember && wsMember.status === MemberStatus.ACTIVE) {
      return true;
    }

    // 4. Project member with OWNER, MANAGER, or DEVELOPER role
    const projectMember = project.members?.find((m) => m.userId === userId);
    if (
      projectMember &&
      (projectMember.role === ProjectRole.OWNER ||
        projectMember.role === ProjectRole.MANAGER ||
        projectMember.role === ProjectRole.DEVELOPER)
    ) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to manage boards in this project',
    );
  }

  async create(
    projectId: number | undefined,
    dto: CreateBoardDto,
    user: JwtPayload,
  ) {
    const targetProjectId = projectId ?? dto.projectId;

    if (!targetProjectId) {
      throw new BadRequestException('projectId is required');
    }

    const project = await this.boardRepository.findProject(targetProjectId);

    if (!project) {
      throw new NotFoundException('Project not found or is inactive');
    }

    await this.assertCanManageBoard(project, user.sub);

    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Board name cannot be empty');
    }

    const existingBoard = await this.boardRepository.findBoardByName(
      targetProjectId,
      trimmedName,
    );

    if (existingBoard) {
      throw new ConflictException(
        `A board named "${trimmedName}" already exists in this project`,
      );
    }

    let position = dto.position;
    if (position === undefined || position === null || position < 0) {
      const maxPosition =
        await this.boardRepository.getMaxPosition(targetProjectId);
      position = maxPosition >= 0 ? maxPosition + 1 : 0;
    }

    return this.boardRepository.createBoard({
      projectId: targetProjectId,
      name: trimmedName,
      description: dto.description?.trim(),
      position,
      createdBy: user.sub,
    });
  }

  async findAll(
    projectId: number | undefined,
    pagination: BoardPaginationDto,
    user: JwtPayload,
  ) {
    const targetProjectId = projectId ?? pagination.projectId;

    if (targetProjectId) {
      const project = await this.boardRepository.findProject(targetProjectId);

      if (!project) {
        throw new NotFoundException('Project not found or is inactive');
      }

      await this.assertCanAccessProject(project, user.sub);
    }

    const boards = await this.boardRepository.findBoards(
      targetProjectId,
      pagination.page,
      pagination.limit,
      targetProjectId ? undefined : user.sub,
    );

    const total = await this.boardRepository.countBoards(
      targetProjectId,
      targetProjectId ? undefined : user.sub,
    );

    return {
      items: boards,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number, user: JwtPayload) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board || !board.project || board.project.deletedAt !== null) {
      throw new NotFoundException('Board not found');
    }

    await this.assertCanAccessProject(board.project, user.sub);

    return board;
  }

  async update(id: number, dto: UpdateBoardDto, user: JwtPayload) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board || !board.project || board.project.deletedAt !== null) {
      throw new NotFoundException('Board not found');
    }

    await this.assertCanManageBoard(board.project, user.sub);

    let updatedName = board.name;
    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Board name cannot be empty');
      }
      if (trimmed.toLowerCase() !== board.name.toLowerCase()) {
        const existing = await this.boardRepository.findBoardByName(
          board.projectId,
          trimmed,
        );
        if (existing && existing.id !== id) {
          throw new ConflictException(
            `A board named "${trimmed}" already exists in this project`,
          );
        }
      }
      updatedName = trimmed;
    }

    if (dto.position !== undefined && dto.position < 0) {
      throw new BadRequestException('Position cannot be negative');
    }

    return this.boardRepository.updateBoard(id, {
      name: updatedName,
      description:
        dto.description !== undefined ? dto.description.trim() : undefined,
      position: dto.position,
    });
  }

  async remove(id: number, user: JwtPayload) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board || !board.project || board.project.deletedAt !== null) {
      throw new NotFoundException('Board not found');
    }

    await this.assertCanManageBoard(board.project, user.sub);

    await this.boardRepository.deleteBoard(id);

    return {
      message: 'Board deleted successfully',
    };
  }
}
