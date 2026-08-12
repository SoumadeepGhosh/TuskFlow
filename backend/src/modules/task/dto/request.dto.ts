import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class TaskPaginationDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement JWT Authentication',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    required: false,
    example: 'Implement login, refresh token and logout APIs.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @ApiProperty({
    example: 1,
    description: 'Task position inside the column',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position!: number;

  @ApiProperty({
    required: false,
    example: '2026-08-20',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @ApiProperty({
    required: false,
    example: '2026-08-15',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    required: false,
    example: 16,
    description: 'Estimated work hours',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedHours?: number;
}

export class MoveTaskDto {
  @ApiProperty({
    example: 2,
    description: 'Destination board column',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  columnId!: number;

  @ApiProperty({
    example: 4,
    description: 'New position inside destination column',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position!: number;
}
export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: TaskStatus,
    enumName: 'TaskStatus',
    example: TaskStatus.IN_PROGRESS,
    description: 'Select the new task status',
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}

export class UpdateTaskPriorityDto {
  @ApiProperty({
    enum: TaskPriority,
    enumName: 'TaskPriority',
    example: TaskPriority.HIGH,
    description: 'Select the new task priority',
  })
  @IsEnum(TaskPriority)
  priority!: TaskPriority;
}

export class UpdateTaskPositionDto {
  @ApiProperty({
    example: 3,
    description: 'Task position inside the column',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  position!: number;
}
export class TaskSearchDto {
  @ApiPropertyOptional({
    example: 'JWT',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
