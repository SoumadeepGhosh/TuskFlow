import { ApiProperty } from '@nestjs/swagger';

export class ActivityResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Activity ID',
  })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'Workspace ID',
  })
  workspaceId!: number | null;

  @ApiProperty({
    example: 1,
    description: 'Project ID',
  })
  projectId!: number | null;

  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  taskId!: number | null;

  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  userId!: number;

  @ApiProperty({
    example: 'TASK_CREATED',
    description: 'Activity action',
  })
  action!: string;

  @ApiProperty({
    example: {
      title: 'Old Task Title',
    },
    nullable: true,
  })
  oldValue!: Record<string, unknown> | null;

  @ApiProperty({
    example: {
      title: 'New Task Title',
    },
    nullable: true,
  })
  newValue!: Record<string, unknown> | null;

  @ApiProperty({
    example: {
      browser: 'Chrome',
      ip: '127.0.0.1',
    },
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({
    example: '2026-08-18T12:30:00.000Z',
  })
  createdAt!: Date;
}

export class PaginatedActivityResponseDto {
  @ApiProperty({
    type: [ActivityResponseDto],
  })
  data!: ActivityResponseDto[];

  @ApiProperty({
    example: 120,
  })
  total!: number;

  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 12,
  })
  totalPages!: number;
}
