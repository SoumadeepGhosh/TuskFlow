/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';

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
import { TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly taskRepository: TaskRepository) {}

  async create(columnId: number, dto: CreateTaskDto, user: JwtPayload) {
    const column = await this.taskRepository.findColumn(columnId);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    return this.taskRepository.createTask({
      columnId,
      projectId: column.board.projectId,
      reporterId: user.sub,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      status: dto.status,
      position: dto.position,
      startDate: dto.startDate,
      dueDate: dto.dueDate,
      estimatedHours: dto.estimatedHours,
    });
  }

  async findAll(columnId: number, pagination: TaskPaginationDto) {
    const column = await this.taskRepository.findColumn(columnId);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    const tasks = await this.taskRepository.findTasks(
      columnId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.taskRepository.countTasks(columnId);

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

  async updateStatus(id: number, dto: UpdateTaskStatusDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.updateTaskStatus(
      id,
      dto.status,
      dto.status === TaskStatus.DONE ? new Date() : null,
    );
  }

  async updatePriority(id: number, dto: UpdateTaskPriorityDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.updateTaskPriority(id, dto.priority);
  }

  async updatePosition(id: number, dto: UpdateTaskPositionDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.updateTaskPosition(id, dto.position);
  }

  async moveTask(id: number, dto: MoveTaskDto) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const column = await this.taskRepository.findColumn(dto.columnId);

    if (!column) {
      throw new NotFoundException('Board column not found');
    }

    return this.taskRepository.moveTask(id, dto.columnId, dto.position);
  }

  async completeTask(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.completeTask(id);
  }

  async reopenTask(id: number) {
    const task = await this.taskRepository.findTaskById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.reopenTask(id);
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

  async getProjectTaskStatistics(projectId: number) {
    const tasks = await this.taskRepository.getProjectTaskStatistics(projectId);

    return {
      total: tasks.length,

      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,

      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,

      inReview: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,

      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,

      low: tasks.filter((t) => t.priority === TaskPriority.LOW).length,

      medium: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,

      high: tasks.filter((t) => t.priority === TaskPriority.HIGH).length,

      urgent: tasks.filter((t) => t.priority === TaskPriority.URGENT).length,
    };
  }
}
