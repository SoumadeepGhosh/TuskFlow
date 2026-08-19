import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadAttachmentRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Task ID',
  })
  @Type(() => Number)
  @IsInt()
  taskId!: number;
}
