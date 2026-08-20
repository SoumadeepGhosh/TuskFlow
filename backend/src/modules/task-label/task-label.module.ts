import { Module } from '@nestjs/common';
import { TaskLabelController } from './task-label.controller';
import { TaskLabelService } from './task-label.service';
import { TaskLabelRepository } from './repositories/task-label.repository';

@Module({
  controllers: [TaskLabelController],
  providers: [TaskLabelService, TaskLabelRepository],
})
export class TaskLabelModule {}
