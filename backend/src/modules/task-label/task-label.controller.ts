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
import { TaskLabelService } from './task-label.service';
import { AssignTaskLabelDto } from './dto/request.dto';

@ApiTags('Task Labels')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/labels')
export class TaskLabelController {
  constructor(private readonly taskLabelService: TaskLabelService) {}

  @Post()
  assign(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AssignTaskLabelDto,
  ) {
    return this.taskLabelService.assign(taskId, dto);
  }

  @Delete(':labelId')
  remove(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('labelId', ParseIntPipe) labelId: number,
  ) {
    return this.taskLabelService.remove(taskId, labelId);
  }

  @Get()
  findForTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.taskLabelService.findForTask(taskId);
  }
}
