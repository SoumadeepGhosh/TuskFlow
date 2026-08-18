import { ApiProperty } from '@nestjs/swagger';

export class LabelResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  projectId!: number;

  @ApiProperty({
    example: 'Bug',
  })
  name!: string;

  @ApiProperty({
    example: '#EF4444',
  })
  color!: string;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  updatedAt!: Date;
}

export class LabelPaginationMetaDto {
  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 25,
  })
  total!: number;

  @ApiProperty({
    example: 3,
  })
  totalPages!: number;
}

export class LabelListResponseDto {
  @ApiProperty({
    type: [LabelResponseDto],
  })
  items!: LabelResponseDto[];

  @ApiProperty({
    type: LabelPaginationMetaDto,
  })
  meta!: LabelPaginationMetaDto;
}
