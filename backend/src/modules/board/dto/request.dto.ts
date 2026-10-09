import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class BoardPaginationDto {
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

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by project ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  projectId?: number;
}

export class CreateBoardDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Project ID (if not provided in route)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  projectId?: number;

  @ApiProperty({
    example: 'Sprint Board',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    required: false,
    example: 'Board for Sprint Planning',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    required: false,
    example: '📋',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    required: false,
    example: '/uploads/boards/cover.jpg',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Board position inside the project (auto-assigned if omitted)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}
