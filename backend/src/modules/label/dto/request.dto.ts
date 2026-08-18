import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { Type } from 'class-transformer';

import {
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class LabelPaginationDto {
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

export class CreateLabelDto {
  @ApiProperty({
    example: 'Bug',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: '#EF4444',
    description: 'Hex color code',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color!: string;
}

export class UpdateLabelDto extends PartialType(CreateLabelDto) {}
