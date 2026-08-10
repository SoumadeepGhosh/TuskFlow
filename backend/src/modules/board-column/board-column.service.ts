/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Injectable, NotFoundException } from '@nestjs/common';

import {
  BoardColumnPaginationDto,
  CreateBoardColumnDto,
  UpdateBoardColumnDto,
} from './dto/request.dto';

import { BoardColumnRepository } from './repositories/board-column.repository';

@Injectable()
export class BoardColumnService {
  constructor(private readonly boardColumnRepository: BoardColumnRepository) {}

  async create(boardId: number, dto: CreateBoardColumnDto) {
    const board = await this.boardColumnRepository.findBoard(boardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return this.boardColumnRepository.createColumn({
      boardId,
      name: dto.name,
      color: dto.color,
      position: dto.position,
    });
  }

  async findAll(boardId: number, pagination: BoardColumnPaginationDto) {
    const board = await this.boardColumnRepository.findBoard(boardId);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const columns = await this.boardColumnRepository.findColumns(
      boardId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.boardColumnRepository.countColumns(boardId);

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

  async findOne(id: number) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    return column;
  }

  async update(id: number, dto: UpdateBoardColumnDto) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    return this.boardColumnRepository.updateColumn(id, {
      name: dto.name,
      color: dto.color,
      position: dto.position,
    });
  }

  async remove(id: number) {
    const column = await this.boardColumnRepository.findColumnById(id);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    await this.boardColumnRepository.deleteColumn(id);

    return {
      message: 'Board column deleted successfully',
    };
  }
}
