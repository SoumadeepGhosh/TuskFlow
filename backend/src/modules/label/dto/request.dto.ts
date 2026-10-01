import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({
    example: 1,
    description: 'Project ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  projectId!: number;

  @ApiProperty({
    example: 'Bug',
    description: 'Label name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({
    example: '#EF4444',
    description: 'Label color hex code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  color!: string;
}

export class UpdateLabelDto extends PartialType(CreateLabelDto) {}

export class LabelQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter labels by project ID',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  projectId?: number;

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
    example: 50,
    default: 50,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 50;
}
