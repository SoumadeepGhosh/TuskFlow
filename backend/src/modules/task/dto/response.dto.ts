import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class TaskResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  columnId!: number;

  @ApiProperty({
    example: 1,
  })
  projectId!: number;

  @ApiProperty({
    example: 2,
  })
  reporterId!: number;

  @ApiProperty({
    example: 'Implement JWT Authentication',
  })
  title!: string;

  @ApiProperty({
    example: 'Implement login, refresh token and logout APIs.',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  priority!: TaskPriority;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @ApiProperty({
    example: 1,
  })
  position!: number;

  @ApiProperty({
    example: '2026-08-15T00:00:00.000Z',
    nullable: true,
  })
  startDate!: Date | null;

  @ApiProperty({
    example: '2026-08-20T00:00:00.000Z',
    nullable: true,
  })
  dueDate!: Date | null;

  @ApiProperty({
    example: 16,
    nullable: true,
  })
  estimatedHours!: number | null;

  @ApiProperty({
    example: '2026-08-20T12:30:00.000Z',
    nullable: true,
  })
  completedAt!: Date | null;

  @ApiProperty({
    example: '2026-08-10T08:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:30:00.000Z',
  })
  updatedAt!: Date;
}

export class TaskMessageResponseDto {
  @ApiProperty({
    example: 'Task deleted successfully',
  })
  message!: string;
}
