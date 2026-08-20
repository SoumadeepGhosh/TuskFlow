import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({
    example: 1,
    description: 'Workspace ID',
  })
  @IsOptional()
  @IsInt()
  workspaceId?: number;

  @ApiProperty({
    example: 1,
    description: 'Project ID',
  })
  @IsOptional()
  @IsInt()
  projectId?: number;

  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  @IsOptional()
  @IsInt()
  taskId?: number;

  @ApiProperty({
    example: 'TASK_CREATED',
    description: 'Activity action',
  })
  @IsString()
  action!: string;

  @ApiPropertyOptional({
    example: {
      title: 'Old Task',
    },
  })
  @IsOptional()
  @IsObject()
  oldValue?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: {
      title: 'New Task',
    },
  })
  @IsOptional()
  @IsObject()
  newValue?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: {
      ip: '127.0.0.1',
      browser: 'Chrome',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ActivityPaginationDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
  })
  @IsOptional()
  @IsInt()
  limit?: number = 10;
}
