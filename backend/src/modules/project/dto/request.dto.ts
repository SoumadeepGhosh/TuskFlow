import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
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

export class ProjectPaginationDto {
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

export class CreateProjectDto {
  @ApiProperty({
    example: 'TaskFlow Backend',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'TASK',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  key!: string;

  @ApiProperty({
    required: false,
    example: 'Backend APIs for TaskFlow',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    required: false,
    example: '📁',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    required: false,
    example: '#3B82F6',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @ApiProperty({
    required: false,
    example: '2026-08-10',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    required: false,
    example: '2026-09-30',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
