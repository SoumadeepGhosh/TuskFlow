import { Injectable, NotFoundException } from '@nestjs/common';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import {
  CommentPaginationDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/request.dto';

import { CommentRepository } from './repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async create(taskId: number, dto: CreateCommentDto, user: JwtPayload) {
    const task = await this.commentRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.createComment({
      taskId,
      userId: user.sub,
      content: dto.content,
    });
  }

  async findAll(taskId: number, pagination: CommentPaginationDto) {
    const task = await this.commentRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comments = await this.commentRepository.findComments(
      taskId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.commentRepository.countComments(taskId);

    return {
      items: comments,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findCommentById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: number, dto: UpdateCommentDto) {
    const comment = await this.commentRepository.findCommentById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.commentRepository.updateComment(id, dto.content!);
  }

  async remove(id: number) {
    const comment = await this.commentRepository.findCommentById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.commentRepository.deleteComment(id);

    return {
      message: 'Comment deleted successfully',
    };
  }

  async findMyComments(user: JwtPayload) {
    return this.commentRepository.findMyComments(user.sub);
  }

  async findRecentComments() {
    return this.commentRepository.findRecentComments();
  }

  async countTaskComments(taskId: number) {
    const task = await this.commentRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const total = await this.commentRepository.countComments(taskId);

    return {
      taskId,
      totalComments: total,
    };
  }
}
