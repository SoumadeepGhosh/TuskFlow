import { ApiProperty } from '@nestjs/swagger';

export class TaskLabelResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 10,
  })
  taskId!: number;

  @ApiProperty({
    example: 3,
  })
  labelId!: number;

  @ApiProperty({
    example: 'Bug',
  })
  labelName!: string;

  @ApiProperty({
    example: '#EF4444',
  })
  labelColor!: string;

  @ApiProperty({
    example: '2026-08-18T12:30:00.000Z',
  })
  createdAt!: Date;
}

export class TaskLabelPaginationMetaDto {
  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 5,
  })
  total!: number;

  @ApiProperty({
    example: 1,
  })
  totalPages!: number;
}

export class TaskLabelListResponseDto {
  @ApiProperty({
    type: [TaskLabelResponseDto],
  })
  items!: TaskLabelResponseDto[];

  @ApiProperty({
    type: TaskLabelPaginationMetaDto,
  })
  meta!: TaskLabelPaginationMetaDto;
}
