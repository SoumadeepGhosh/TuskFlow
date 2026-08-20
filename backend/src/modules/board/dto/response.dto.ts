import { ApiProperty } from '@nestjs/swagger';

export class BoardResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  projectId!: number;

  @ApiProperty({
    example: 'Sprint Board',
  })
  name!: string;

  @ApiProperty({
    example: 'Development Sprint Board',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: 1,
  })
  position!: number;

  @ApiProperty({
    example: 2,
  })
  createdBy!: number;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  updatedAt!: Date;
}

export class BoardMessageResponseDto {
  @ApiProperty({
    example: 'Board deleted successfully',
  })
  message!: string;
}
