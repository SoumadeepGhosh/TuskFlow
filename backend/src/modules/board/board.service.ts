import { Injectable, NotFoundException } from '@nestjs/common';

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

  async create(projectId: number, dto: CreateBoardDto, user: JwtPayload) {
    const project = await this.boardRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.boardRepository.createBoard({
      projectId,
      name: dto.name,
      description: dto.description,
      position: dto.position,
      createdBy: user.sub,
    });
  }

  async findAll(projectId: number, pagination: BoardPaginationDto) {
    const project = await this.boardRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const boards = await this.boardRepository.findBoards(
      projectId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.boardRepository.countBoards(projectId);

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
