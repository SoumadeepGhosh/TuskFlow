import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TaskLabelRepository } from './repositories/task-label.repository';

import { AssignLabelDto, TaskLabelPaginationDto } from './dto/request.dto';

@Injectable()
export class TaskLabelService {
  constructor(private readonly taskLabelRepository: TaskLabelRepository) {}

  async assignLabel(taskId: number, dto: AssignLabelDto) {
    const task = await this.taskLabelRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const label = await this.taskLabelRepository.findLabel(dto.labelId);

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const existing = await this.taskLabelRepository.exists(taskId, dto.labelId);

    if (existing) {
      throw new BadRequestException('Label already assigned to this task');
    }

    return this.taskLabelRepository.assignLabel(taskId, dto.labelId);
  }

  async findAll(taskId: number, pagination: TaskLabelPaginationDto) {
    const task = await this.taskLabelRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const items = await this.taskLabelRepository.findTaskLabels(
      taskId,
      pagination.page,
      pagination.limit,
    );

    const total = await this.taskLabelRepository.countTaskLabels(taskId);

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

  async remove(taskId: number, labelId: number) {
    const task = await this.taskLabelRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const existing = await this.taskLabelRepository.exists(taskId, labelId);

    if (!existing) {
      throw new NotFoundException('Label is not assigned to this task');
    }

    await this.taskLabelRepository.removeLabel(taskId, labelId);

    return {
      message: 'Label removed successfully',
    };
  }

  async removeAll(taskId: number) {
    const task = await this.taskLabelRepository.findTask(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskLabelRepository.removeAllLabels(taskId);

    return {
      message: 'All labels removed successfully',
    };
  }
}
