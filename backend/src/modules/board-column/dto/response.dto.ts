import { ApiProperty } from '@nestjs/swagger';

export class BoardColumnResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 1,
  })
  boardId!: number;

  @ApiProperty({
    example: 'To Do',
  })
  name!: string;

  @ApiProperty({
    example: '#3B82F6',
    nullable: true,
  })
  color!: string | null;

  @ApiProperty({
    example: 1,
  })
  position!: number;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-10T10:00:00.000Z',
  })
  updatedAt!: Date;
}

export class BoardColumnMessageResponseDto {
  @ApiProperty({
    example: 'Board column deleted successfully',
  })
  message!: string;
}
