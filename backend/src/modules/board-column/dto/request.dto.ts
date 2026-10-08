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

export class BoardColumnPaginationDto {
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
    description: 'Filter by board ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  boardId?: number;
}

export class CreateBoardColumnDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Board ID (if not provided in route)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  boardId?: number;

  @ApiProperty({
    example: 'To Do',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    required: false,
    example: '#3B82F6',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Column position inside the board (auto-assigned if omitted)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateBoardColumnDto extends PartialType(CreateBoardColumnDto) {}
