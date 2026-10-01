import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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
      throw new NotFoundException('Project not found');
    }

    return this.boardRepository.createBoard({
      projectId: targetProjectId,
      name: dto.name,
      description: dto.description,
      position: dto.position,
      createdBy: user.sub,
    });
  }

  async findAll(
    projectId: number | undefined,
    pagination: BoardPaginationDto,
  ) {
    const targetProjectId = projectId ?? pagination.projectId;

    if (targetProjectId) {
      const project = await this.boardRepository.findProject(targetProjectId);

      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const boards = await this.boardRepository.findBoards(
      targetProjectId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.boardRepository.countBoards(targetProjectId);

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

  async findOne(id: number) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async update(id: number, dto: UpdateBoardDto) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return this.boardRepository.updateBoard(id, {
      name: dto.name,
      description: dto.description,
      position: dto.position,
    });
  }

  async remove(id: number) {
    const board = await this.boardRepository.findBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.boardRepository.deleteBoard(id);

    return {
      message: 'Board deleted successfully',
    };
  }
}
