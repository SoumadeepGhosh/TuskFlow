import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberStatus, ProjectRole, WorkspaceRole } from '@prisma/client';

import {
  BoardColumnPaginationDto,
  CreateBoardColumnDto,
  UpdateBoardColumnDto,
} from './dto/request.dto';

import { BoardColumnRepository } from './repositories/board-column.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class BoardColumnService {
  constructor(private readonly boardColumnRepository: BoardColumnRepository) {}

  private async assertCanAccessBoard(
    board: {
      id: number;
      projectId: number;
      project?: {
        id: number;
        workspaceId: number;
        createdBy: number;
        deletedAt: Date | null;
        workspace?: { id: number; name: string; ownerId: number } | null;
        members?: Array<{ userId: number; role: ProjectRole }>;
      } | null;
    },
    userId: number,
  ) {
    if (!board.project || board.project.deletedAt !== null) {
      throw new NotFoundException('Board or associated project not found');
    }

    // 1. Workspace owner
    if (board.project.workspace?.ownerId === userId) {
      return true;
    }

    // 2. Project creator
    if (board.project.createdBy === userId) {
      return true;
    }

    // 3. Project member
    if (board.project.members?.some((m) => m.userId === userId)) {
      return true;
    }

    // 4. Workspace member
    const wsMember = await this.boardColumnRepository.findWorkspaceMember(
      board.project.workspaceId,
      userId,
    );
    if (wsMember && wsMember.status === MemberStatus.ACTIVE) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this board',
    );
  }

  private async assertCanManageBoard(
    board: {
      id: number;
      projectId: number;
      project?: {
        id: number;
        workspaceId: number;
        createdBy: number;
        deletedAt: Date | null;
        workspace?: { id: number; name: string; ownerId: number } | null;
        members?: Array<{ userId: number; role: ProjectRole }>;
      } | null;
    },
    userId: number,
  ) {
    if (!board.project || board.project.deletedAt !== null) {
      throw new NotFoundException('Board or associated project not found');
    }

    // 1. Workspace owner has full manage rights
    if (board.project.workspace?.ownerId === userId) {
      return true;
    }

    // 2. Project creator has manage rights
    if (board.project.createdBy === userId) {
      return true;
    }

    // 3. Board creator has manage rights
    if ((board as { createdBy?: number }).createdBy === userId) {
      return true;
    }

    // 4. Workspace active member
    const wsMember = await this.boardColumnRepository.findWorkspaceMember(
      board.project.workspaceId,
      userId,
    );
    if (wsMember && wsMember.status === MemberStatus.ACTIVE) {
      return true;
    }

    // 5. Project member (Owner, Manager, or Developer)
    const projectMember = board.project.members?.find((m) => m.userId === userId);
    if (
      projectMember &&
      (projectMember.role === ProjectRole.OWNER ||
        projectMember.role === ProjectRole.MANAGER ||
        projectMember.role === ProjectRole.DEVELOPER)
    ) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to manage columns on this board',
    );
  }

  async create(
    boardId: number | undefined,
    dto: CreateBoardColumnDto,
    user: JwtPayload,
  ) {
    const targetBoardId = boardId ?? dto.boardId;

    if (!targetBoardId) {
      throw new BadRequestException('boardId is required');
    }

    const board = await this.boardColumnRepository.findBoard(targetBoardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.assertCanManageBoard(board, user.sub);

    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Column name cannot be empty');
    }

    const existingColumn = await this.boardColumnRepository.findByNameInBoard(
      targetBoardId,
      trimmedName,
    );

    if (existingColumn) {
      throw new ConflictException(
        `A column named "${trimmedName}" already exists on this board`,
      );
    }

    let position = dto.position;
    if (position === undefined || position === null || position < 0) {
      const maxPosition =
        await this.boardColumnRepository.getMaxPosition(targetBoardId);
      position = maxPosition >= 0 ? maxPosition + 1 : 0;
    }

    return this.boardColumnRepository.createColumn({
      boardId: targetBoardId,
      name: trimmedName,
      color: dto.color,
      position,
    });
  }

  async findAll(
    boardId: number | undefined,
    pagination: BoardColumnPaginationDto,
    user: JwtPayload,
  ) {
    const targetBoardId = boardId ?? pagination.boardId;

    if (!targetBoardId) {
      throw new BadRequestException('boardId is required');
    }

    const board = await this.boardColumnRepository.findBoard(targetBoardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.assertCanAccessBoard(board, user.sub);

    const columns = await this.boardColumnRepository.findColumns(
      targetBoardId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.boardColumnRepository.countColumns(targetBoardId);

    return {
      items: columns,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number, user: JwtPayload) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column || !column.board) {
      throw new NotFoundException('Board column not found');
    }

    await this.assertCanAccessBoard(column.board, user.sub);

    return column;
  }

  async update(id: number, dto: UpdateBoardColumnDto, user: JwtPayload) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column || !column.board) {
      throw new NotFoundException('Board column not found');
    }

    await this.assertCanManageBoard(column.board, user.sub);

    let updatedName = column.name;
    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Column name cannot be empty');
      }
      if (trimmed.toLowerCase() !== column.name.toLowerCase()) {
        const existing = await this.boardColumnRepository.findByNameInBoard(
          column.boardId,
          trimmed,
        );
        if (existing && existing.id !== id) {
          throw new ConflictException(
            `A column named "${trimmed}" already exists on this board`,
          );
        }
      }
      updatedName = trimmed;
    }

    if (dto.position !== undefined && dto.position < 0) {
      throw new BadRequestException('Position cannot be negative');
    }

    return this.boardColumnRepository.updateColumn(id, {
      name: updatedName,
      color: dto.color,
      position: dto.position,
    });
  }

  async remove(id: number, user: JwtPayload) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column || !column.board) {
      throw new NotFoundException('Board column not found');
    }

    await this.assertCanManageBoard(column.board, user.sub);

    const activeTasksCount =
      await this.boardColumnRepository.countActiveTasksInColumn(id);

    if (activeTasksCount > 0) {
      throw new BadRequestException(
        `Cannot delete column containing ${activeTasksCount} active task${
          activeTasksCount === 1 ? '' : 's'
        }. Please move or delete tasks before deleting this column.`,
      );
    }

    await this.boardColumnRepository.deleteColumn(id);

    return {
      message: 'Board column deleted successfully',
    };
  }
}
