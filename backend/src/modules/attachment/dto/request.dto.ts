import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttachmentPaginationDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'invoice',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    example: 'pdf',
  })
  @IsOptional()
  @IsString()
  extension?: string;

  @ApiPropertyOptional({
    example: 5,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  uploadedBy?: number;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'originalName', 'fileSize'],
  })
  @IsOptional()
  @IsIn(['createdAt', 'originalName', 'fileSize'])
  sortBy?: 'createdAt' | 'originalName' | 'fileSize' = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
export class UploadAttachmentRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  @Type(() => Number)
  @IsInt()
  taskId!: number;
}
export class RenameAttachmentRequestDto {
  @ApiProperty({
    example: 'Sprint Design.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName!: string;
}
