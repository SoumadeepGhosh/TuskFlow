import { Module } from '@nestjs/common';
import { TaskAssigneeController } from './task-assignee.controller';
import { TaskAssigneeService } from './task-assignee.service';
import { TaskAssigneeRepository } from './repositories/task-assignee.repository';

@Module({
  controllers: [TaskAssigneeController],
  providers: [TaskAssigneeService, TaskAssigneeRepository],
})
export class TaskAssigneeModule {}
