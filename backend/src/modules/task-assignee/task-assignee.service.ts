import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { TaskAssigneeRepository } from './repositories/task-assignee.repository';

import {
  AssignTaskAssigneeDto,
  TaskAssigneePaginationDto,
} from './dto/request.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskAssigneeService {
  constructor(
    private readonly taskAssigneeRepository: TaskAssigneeRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async assignUser(
    taskId: number,
    dto: AssignTaskAssigneeDto,
    user: JwtPayload,
  ) {
    const task = await this.taskAssigneeRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const assignee = await this.taskAssigneeRepository.findUser(dto.userId);
    const sender = await this.taskAssigneeRepository.findUser(user.sub);

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }
    if (!assignee) {
      throw new NotFoundException('User not found');
    }

    const alreadyAssigned = await this.taskAssigneeRepository.findAssignment(
      taskId,
      dto.userId,
    );

    if (alreadyAssigned) {
      throw new ConflictException('User is already assigned to this task');
    }

    const assignment = await this.taskAssigneeRepository.assignUser({
      taskId,
      userId: dto.userId,
      assignedBy: user.sub,
    });

    await this.notificationService.createNotification({
      recipientId: dto.userId,
      senderId: user.sub,

      type: NotificationType.TASK_ASSIGNED,

      title: 'Task Assigned',

      message: `You have been assigned to "${task.title}"`,

      entityType: 'task',

      entityId: task.id,

      recipientEmail: assignee.email,

      recipientName: assignee.name,

      senderName: sender.name,
    });

    return assignment;
  }

  async findTaskAssignees(
    taskId: number,
    pagination: TaskAssigneePaginationDto,
  ) {
    const task = await this.taskAssigneeRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const items = await this.taskAssigneeRepository.findTaskAssignees(
      taskId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.taskAssigneeRepository.countTaskAssignees(taskId);

    return {
      items,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async removeAssignment(taskId: number, userId: number) {
    const assignment = await this.taskAssigneeRepository.findAssignment(
      taskId,
      userId,
    );

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.taskAssigneeRepository.removeAssignment(taskId, userId);

    return {
      message: 'Task assignee removed successfully',
    };
  }

  async findUserAssignedTasks(
    userId: number,
    pagination: TaskAssigneePaginationDto,
  ) {
    const user = await this.taskAssigneeRepository.findUser(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = await this.taskAssigneeRepository.findUserAssignedTasks(
      userId,
      pagination.page,
      pagination.limit,
    );

    const total =
      await this.taskAssigneeRepository.countUserAssignedTasks(userId);

    return {
      items,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }
}
