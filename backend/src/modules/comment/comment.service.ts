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

import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateCommentDto, user: JwtPayload) {
    const task = await this.commentRepository.findTask(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.commentRepository.createComment({
      taskId: dto.taskId,
      userId: user.sub,
      content: dto.content,
    });

    try {
      const recipientIds = new Set<number>();
      if (task.reporterId && task.reporterId !== user.sub) {
        recipientIds.add(task.reporterId);
      }
      if (task.assignees) {
        task.assignees.forEach((a: { userId: number }) => {
          if (a.userId !== user.sub) recipientIds.add(a.userId);
        });
      }

      const actionUrl = task.project?.workspaceId
        ? `/workspaces/${task.project.workspaceId}/projects/${task.project.id}/tasks/${task.id}`
        : `/tasks/${task.id}`;

      for (const recipientId of recipientIds) {
        void this.notificationService.createAndDispatch({
          recipientId,
          senderId: user.sub,
          type: NotificationType.TASK_COMMENT,
          title: `New comment on "${task.title}"`,
          message: `${comment.user?.name || user.email || 'Someone'} commented: "${dto.content.slice(0, 100)}"`,
          entityType: 'task',
          entityId: task.id,
          actionUrl,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            commentId: comment.id,
          },
        });
      }
    } catch {
      // Non-blocking notification dispatch
    }

    return comment;
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
