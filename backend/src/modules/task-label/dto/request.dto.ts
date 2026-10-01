import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AssignTaskLabelDto {
  @ApiProperty({
    example: 1,
    description: 'Label ID to attach to the task',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  labelId!: number;
}
