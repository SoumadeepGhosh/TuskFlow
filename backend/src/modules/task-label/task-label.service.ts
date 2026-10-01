import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskLabelRepository } from './repositories/task-label.repository';
import { AssignTaskLabelDto } from './dto/request.dto';

@Injectable()
export class TaskLabelService {
  constructor(private readonly taskLabelRepository: TaskLabelRepository) {}

  async assign(taskId: number, dto: AssignTaskLabelDto) {
    const task = await this.taskLabelRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const label = await this.taskLabelRepository.findLabel(dto.labelId);
    if (!label) {
      throw new NotFoundException('Label not found');
    }

    const existing = await this.taskLabelRepository.findTaskLabel(
      taskId,
      dto.labelId,
    );
    if (existing) {
      throw new ConflictException('Label already assigned to this task');
    }

    return this.taskLabelRepository.createTaskLabel(taskId, dto.labelId);
  }

  async remove(taskId: number, labelId: number) {
    const existing = await this.taskLabelRepository.findTaskLabel(
      taskId,
      labelId,
    );
    if (!existing) {
      throw new NotFoundException('Task label relationship not found');
    }

    await this.taskLabelRepository.deleteTaskLabel(taskId, labelId);

    return {
      message: 'Label removed from task successfully',
    };
  }

  async findForTask(taskId: number) {
    const task = await this.taskLabelRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskLabelRepository.findLabelsForTask(taskId);
  }
}
