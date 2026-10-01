import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UploadAttachmentDto {
  @ApiProperty({
    example: 1,
    description: 'Task ID to which the file is attached',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  taskId!: number;
}

export class AttachmentQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Filter attachments by task ID',
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
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 10;
}
