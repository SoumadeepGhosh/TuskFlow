import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 5,
  })
  recipientId!: number;

  @ApiProperty({
    example: 2,
    required: false,
  })
  senderId?: number;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  type!: NotificationType;

  @ApiProperty({
    example: 'Task Assigned',
  })
  title!: string;

  @ApiProperty({
    example: 'John assigned you to Task TF-25',
  })
  message!: string;

  @ApiProperty({
    example: 'task',
    required: false,
  })
  entityType?: string;

  @ApiProperty({
    example: 25,
    required: false,
  })
  entityId?: number;

  @ApiProperty({
    example: false,
  })
  isRead!: boolean;

  @ApiProperty({
    required: false,
    example: '2026-08-24T09:15:00.000Z',
  })
  readAt?: Date;

  @ApiProperty({
    example: '2026-08-24T09:00:00.000Z',
  })
  createdAt!: Date;
}

export class NotificationListItemDto extends NotificationResponseDto {}

export class NotificationListResponseDto {
  @ApiProperty({
    type: [NotificationListItemDto],
  })
  items!: NotificationListItemDto[];

  @ApiProperty({
    example: 25,
  })
  total!: number;

  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 3,
  })
  totalPages!: number;

  @ApiProperty({
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    example: false,
  })
  hasPreviousPage!: boolean;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    example: 5,
  })
  unreadCount!: number;
}

export class DeleteNotificationResponseDto {
  @ApiProperty({
    example: 'Notification deleted successfully',
  })
  message!: string;
}
