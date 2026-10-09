import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CreateTaskDto,
  MoveTaskDto,
  TaskPaginationDto,
  TaskSearchDto,
  UpdateTaskDto,
  UpdateTaskPositionDto,
  UpdateTaskPriorityDto,
  UpdateTaskStatusDto,
} from './dto/request.dto';

import { TaskRepository } from './repositories/task.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationType, TaskPriority, TaskStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly notificationService: NotificationService,
  ) {}

  private notifyTaskStakeholders(
    task: any,
    actorId: number | undefined,
    type: NotificationType,
    title: string,
    message: string,
  ) {
    try {
      const recipientIds = new Set<number>();
      if (task.reporterId && task.reporterId !== actorId) {
        recipientIds.add(task.reporterId);
      }
      if (task.assignees) {
        task.assignees.forEach((a: any) => {
          const uid = a.userId ?? a.user?.id;
          if (uid && uid !== actorId) {
            recipientIds.add(uid);
          }
        });
      }
      for (const recipientId of recipientIds) {
        void this.notificationService.createAndDispatch({
          recipientId,
          senderId: actorId,
          type,
          title,
          message,
          entityType: 'task',
          entityId: task.id,
          actionUrl: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
          },
        });
      }
    } catch {
      // non-blocking
    }
  }

  async create(
    columnId: number | undefined,
    dto: CreateTaskDto,
    user: JwtPayload,
  ) {
    const targetColumnId = columnId ?? dto.columnId;

    if (!targetColumnId) {
      throw new BadRequestException('columnId is required');
    }

    const column = await this.taskRepository.findColumn(targetColumnId);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    let position = dto.position;
    if (position === undefined || position === null || position < 0) {
      const maxPos = await this.taskRepository.getMaxPosition(targetColumnId);
      position = maxPos >= 0 ? maxPos + 1 : 0;
    }

    return this.taskRepository.createTask({
      columnId: targetColumnId,
      projectId: column.board.projectId,
      reporterId: user.sub,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      priority: dto.priority || TaskPriority.MEDIUM,
      status: dto.status || TaskStatus.TODO,
      position,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      estimatedHours: dto.estimatedHours,
    });
  }

  async findAll(columnId: number | undefined, pagination: TaskPaginationDto) {
    const targetColumnId = columnId ?? pagination.columnId;

    if (targetColumnId) {
      const column = await this.taskRepository.findColumn(targetColumnId);

      if (!column) {
        throw new NotFoundException('Board column not found');
      }
    }

    const tasks = await this.taskRepository.findTasks(
      targetColumnId,
      pagination.page,
      pagination.limit,
      pagination.projectId,
    );

    const total = await this.taskRepository.countTasks(
      targetColumnId,
      pagination.projectId,
    );

    return {
      items: tasks,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.updateTask(id, {
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      position: dto.position,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      estimatedHours: dto.estimatedHours,
      completedAt:
        dto.status === TaskStatus.DONE
          ? new Date()
          : dto.status
            ? null
            : task.completedAt,
    });
  }

  async remove(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.deleteTask(id);

    return {
      message: 'Task deleted successfully',
    };
  }
  async updateStatus(id: number, dto: UpdateTaskStatusDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const completedAt = dto.status === TaskStatus.DONE ? new Date() : null;

    const updated = await this.taskRepository.updateTaskStatus(id, dto.status, completedAt);

    this.notifyTaskStakeholders(
      task,
      undefined,
      dto.status === TaskStatus.DONE ? NotificationType.TASK_COMPLETED : NotificationType.TASK_STATUS_CHANGED,
      dto.status === TaskStatus.DONE ? `Task completed: "${task.title}"` : `Task status updated: "${task.title}"`,
      `Status changed to ${dto.status}`,
    );

    return updated;
  }

  async updatePriority(id: number, dto: UpdateTaskPriorityDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.taskRepository.updateTaskPriority(id, dto.priority);

    this.notifyTaskStakeholders(
      task,
      undefined,
      NotificationType.TASK_PRIORITY_CHANGED,
      `Task priority changed: "${task.title}"`,
      `Priority updated to ${dto.priority}`,
    );

    return updated;
  }
  async updatePosition(id: number, dto: UpdateTaskPositionDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.updateTaskPosition(id, dto.position);
  }
  async completeTask(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const completed = await this.taskRepository.completeTask(id);

    this.notifyTaskStakeholders(
      task,
      undefined,
      NotificationType.TASK_COMPLETED,
      `Task completed: "${task.title}"`,
      'Task was marked as completed',
    );

    return completed;
  }
  async reopenTask(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const reopened = await this.taskRepository.reopenTask(id);

    this.notifyTaskStakeholders(
      task,
      undefined,
      NotificationType.TASK_REOPENED,
      `Task reopened: "${task.title}"`,
      'Task was reopened',
    );

    return reopened;
  }
  async search(projectId: number, dto: TaskSearchDto) {
    const project = await this.taskRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const tasks = await this.taskRepository.searchTasks(projectId, dto);

    const total = await this.taskRepository.countSearchTasks(projectId, dto);

    return {
      items: tasks,
      meta: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }
  async findMyTasks(user: JwtPayload) {
    return this.taskRepository.findMyTasks(user.sub);
  }

  async findDueToday() {
    return this.taskRepository.findDueToday();
  }

  async findOverdueTasks() {
    return this.taskRepository.findOverdueTasks();
  }

  async getProjectTaskStatistics(projectId: number) {
    const project = await this.taskRepository.findProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.taskRepository.getProjectTaskStatistics(projectId);
  }
  async moveTask(id: number, dto: MoveTaskDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.moveTask(id, dto.columnId, dto.position);
  }
}
