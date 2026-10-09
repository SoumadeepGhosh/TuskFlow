import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export enum NotificationStatusFilter {
  ALL = 'all',
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export class NotificationPaginationDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit = 20;

  @ApiPropertyOptional({
    enum: NotificationStatusFilter,
    default: NotificationStatusFilter.ALL,
  })
  @IsOptional()
  @IsEnum(NotificationStatusFilter)
  status?: NotificationStatusFilter = NotificationStatusFilter.ALL;

  @ApiPropertyOptional({
    enum: NotificationType,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    example: 'task',
    description: 'Filter by entity type (e.g. task, project, workspace)',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    example: 'assigned you a task',
    description: 'Search string matching title or message',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class BulkActionDto {
  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsInt({ each: true })
  ids!: number[];
}

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  browserNotifications?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  taskNotifications?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  commentNotifications?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  mentionNotifications?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  systemNotifications?: boolean;
}
