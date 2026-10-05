import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskAssigneeRepository } from './repositories/task-assignee.repository';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AssignUserDto } from './dto/request.dto';

@Injectable()
export class TaskAssigneeService {
  constructor(
    private readonly taskAssigneeRepository: TaskAssigneeRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async assign(taskId: number, dto: AssignUserDto, currentUser: JwtPayload) {
    const task = await this.taskAssigneeRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const targetUser = await this.taskAssigneeRepository.findUser(dto.userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.taskAssigneeRepository.findAssignee(
      taskId,
      dto.userId,
    );
    if (existing) {
      throw new ConflictException('User is already assigned to this task');
    }

    const assignment = await this.taskAssigneeRepository.createAssignee({
      taskId,
      userId: dto.userId,
      assignedBy: currentUser.sub,
    });

    // Automatically trigger notification pipeline (Database -> Socket.IO -> BullMQ -> Nodemailer)
    void this.notificationService.createAndDispatch(
      {
        recipientId: dto.userId,
        senderId: currentUser.sub,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assignment',
        message: `You have been assigned to task: "${task.title}"`,
        entityType: 'TASK',
        entityId: task.id,
      },
      {
        recipientEmail: targetUser.email,
        recipientName: targetUser.name,
        taskTitle: task.title,
        taskId: task.id,
        assignedByName: currentUser.email,
      },
    );

    return assignment;
  }

  async remove(taskId: number, userId: number) {
    const existing = await this.taskAssigneeRepository.findAssignee(
      taskId,
      userId,
    );
    if (!existing) {
      throw new NotFoundException('Task assignee not found');
    }

    await this.taskAssigneeRepository.deleteAssignee(taskId, userId);

    return {
      message: 'User removed from task successfully',
    };
  }

  async findAssignees(taskId: number) {
    const task = await this.taskAssigneeRepository.findTask(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskAssigneeRepository.findAssigneesForTask(taskId);
  }

  async findUserTasks(userId: number) {
    const user = await this.taskAssigneeRepository.findUser(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignments =
      await this.taskAssigneeRepository.findTasksForUser(userId);
    return assignments.map((a) => a.task);
  }
}
