import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TaskAssigneeService } from './task-assignee.service';
import { AssignUserDto } from './dto/request.dto';

@ApiTags('Task Assignees')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskAssigneeController {
  constructor(private readonly taskAssigneeService: TaskAssigneeService) {}

  @Post('tasks/:taskId/assignees')
  assign(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AssignUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.taskAssigneeService.assign(taskId, dto, user);
  }

  @Delete('tasks/:taskId/assignees/:userId')
  remove(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.taskAssigneeService.remove(taskId, userId);
  }

  @Get('tasks/:taskId/assignees')
  findAssignees(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskAssigneeService.findAssignees(taskId);
  }

  @Get('users/:userId/tasks')
  findUserTasks(@Param('userId', ParseIntPipe) userId: number) {
    return this.taskAssigneeService.findUserTasks(userId);
  }
}
