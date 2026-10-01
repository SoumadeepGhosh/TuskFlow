import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({
    example: 2,
    description: 'User ID to assign to the task',
  })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  userId!: number;
}
