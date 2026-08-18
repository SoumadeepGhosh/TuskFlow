import { ApiProperty } from '@nestjs/swagger';

export class CommentUserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Soumadeep Ghosh',
  })
  name!: string;

  @ApiProperty({
    example: 'soumadeep@gmail.com',
  })
  email!: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/avatar.png',
  })
  avatarUrl?: string;
}

export class CommentResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 10,
  })
  taskId!: number;

  @ApiProperty({
    example: 2,
  })
  userId!: number;

  @ApiProperty({
    example: 'Please update the API response.',
  })
  content!: string;

  @ApiProperty({
    required: false,
    example: '2026-08-18T10:30:00.000Z',
  })
  editedAt?: Date;

  @ApiProperty({
    example: '2026-08-18T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-18T10:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    type: () => CommentUserResponseDto,
  })
  user!: CommentUserResponseDto;
}

export class CommentCountResponseDto {
  @ApiProperty({
    example: 10,
  })
  taskId!: number;

  @ApiProperty({
    example: 15,
  })
  totalComments!: number;
}

export class DeleteCommentResponseDto {
  @ApiProperty({
    example: 'Comment deleted successfully',
  })
  message!: string;
}
