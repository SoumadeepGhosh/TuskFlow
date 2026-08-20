import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AssignTaskAssigneeDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'User ID to assign to the task',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;
}

export class TaskAssigneePaginationDto {
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
