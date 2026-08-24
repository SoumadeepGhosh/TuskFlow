import { Module } from '@nestjs/common';
import { TaskAssigneeController } from './task-assignee.controller';
import { TaskAssigneeService } from './task-assignee.service';
import { TaskAssigneeRepository } from './repositories/task-assignee.repository';
import { NotificationModule } from '../notification/notification.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [NotificationModule, SocketModule],
  controllers: [TaskAssigneeController],
  providers: [TaskAssigneeService, TaskAssigneeRepository],
})
export class TaskAssigneeModule {}
