import { ApiProperty } from '@nestjs/swagger';

export class AssigneeUserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Soumadeep Ghosh',
  })
  name!: string;

  @ApiProperty({
    example: 'soumadeep@gmail.com',
  })
  email!: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    nullable: true,
  })
  avatarUrl?: string | null;
}

export class TaskAssigneeResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 15,
  })
  taskId!: number;

  @ApiProperty({
    example: 5,
  })
  userId!: number;

  @ApiProperty({
    example: 1,
    description: 'User who assigned the task',
  })
  assignedBy!: number;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  assignedAt!: Date;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: AssigneeUserResponseDto,
  })
  user!: AssigneeUserResponseDto;
}

export class TaskAssigneeListResponseDto {
  @ApiProperty({
    type: [TaskAssigneeResponseDto],
  })
  items!: TaskAssigneeResponseDto[];

  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 25,
  })
  total!: number;

  @ApiProperty({
    example: 3,
  })
  totalPages!: number;
}
