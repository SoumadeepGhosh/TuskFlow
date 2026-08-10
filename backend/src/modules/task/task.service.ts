import { Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateTaskDto,
  TaskPaginationDto,
  UpdateTaskDto,
} from './dto/request.dto';

import { TaskRepository } from './repositories/task.repository';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TaskStatus } from '@prisma/client';

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
}
