import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  taskId!: number;

  @ApiProperty({
    example: 'Please check the authentication middleware.',
    description: 'Comment content',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content!: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Updated comment text.',
    description: 'Updated comment content',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content!: string;
}

export class CommentQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Filter comments by task ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  taskId!: number;

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
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 20;
}
