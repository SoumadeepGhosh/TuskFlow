import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class ProjectResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  workspaceId!: number;

  @ApiProperty({
    example: 'TaskFlow Backend',
  })
  name!: string;

  @ApiProperty({
    example: 'TASK',
  })
  key!: string;

  @ApiProperty({
    example: 'Backend APIs for TaskFlow',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: '📁',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    example: '#3B82F6',
    required: false,
  })
  color?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus;

  @ApiProperty({
    example: '2026-08-10T00:00:00.000Z',
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    example: '2026-09-30T00:00:00.000Z',
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    example: 2,
  })
  createdBy!: number;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  updatedAt!: Date;
}

export class ProjectListItemDto extends ProjectResponseDto {}

export class ProjectListResponseDto {
  @ApiProperty({
    type: [ProjectListItemDto],
  })
  items!: ProjectListItemDto[];

  @ApiProperty({
    example: 25,
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
    example: 3,
  })
  totalPages!: number;

  @ApiProperty({
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    example: false,
  })
  hasPreviousPage!: boolean;
}
