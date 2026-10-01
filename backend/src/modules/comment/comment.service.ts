import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentRepository } from './repositories/comment.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CommentQueryDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/request.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async create(dto: CreateCommentDto, user: JwtPayload) {
    const task = await this.commentRepository.findTask(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.createComment({
      taskId: dto.taskId,
      userId: user.sub,
      content: dto.content,
    });
  }

  async findAll(query: CommentQueryDto) {
    const task = await this.commentRepository.findTask(query.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comments = await this.commentRepository.findComments(
      query.taskId,
      query.page,
      query.limit,
    );

    const total = await this.commentRepository.countComments(query.taskId);

    return {
      items: comments,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(id: number, dto: UpdateCommentDto, user: JwtPayload) {
    const comment = await this.commentRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.sub) {
      throw new ForbiddenException(
        'You are only allowed to edit your own comments',
      );
    }

    return this.commentRepository.updateComment(id, dto.content);
  }

  async remove(id: number, user: JwtPayload) {
    const comment = await this.commentRepository.findCommentById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== user.sub) {
      throw new ForbiddenException(
        'You are only allowed to delete your own comments',
      );
    }

    await this.commentRepository.deleteComment(id);

    return {
      message: 'Comment deleted successfully',
    };
  }
}
