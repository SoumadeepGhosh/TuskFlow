import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationService } from './notification.service';
import {
  BulkActionDto,
  NotificationPaginationDto,
  UpdateNotificationPreferenceDto,
} from './dto/request.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Get user notifications with filtering and search' })
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: NotificationPaginationDto,
  ) {
    return this.notificationService.getUserNotifications(user.sub, query);
  }

  @ApiOperation({ summary: 'Get total unread notifications count' })
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getUnreadCount(user.sub);
  }

  @ApiOperation({ summary: 'Get user notification preferences' })
  @Get('preferences')
  getPreferences(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getPreferences(user.sub);
  }

  @ApiOperation({ summary: 'Update user notification preferences' })
  @Patch('preferences')
  updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationService.updatePreferences(user.sub, dto);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Patch('read-all')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.sub);
  }

  @ApiOperation({ summary: 'Clear all notifications' })
  @Delete('clear-all')
  clearAll(@CurrentUser() user: JwtPayload) {
    return this.notificationService.clearAll(user.sub);
  }

  @ApiOperation({ summary: 'Bulk mark notifications as read' })
  @Post('bulk-read')
  bulkMarkRead(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkActionDto,
  ) {
    return this.notificationService.bulkMarkAsRead(user.sub, dto);
  }

  @ApiOperation({ summary: 'Bulk mark notifications as unread' })
  @Post('bulk-unread')
  bulkMarkUnread(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkActionDto,
  ) {
    return this.notificationService.bulkMarkAsUnread(user.sub, dto);
  }

  @ApiOperation({ summary: 'Bulk archive notifications' })
  @Post('bulk-archive')
  bulkArchive(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkActionDto,
  ) {
    return this.notificationService.bulkArchive(user.sub, dto);
  }

  @ApiOperation({ summary: 'Bulk delete notifications' })
  @Post('bulk-delete')
  bulkDelete(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkActionDto,
  ) {
    return this.notificationService.bulkDelete(user.sub, dto);
  }

  @ApiOperation({ summary: 'Mark notification as read' })
  @Patch(':id/read')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.markAsRead(id, user.sub);
  }

  @ApiOperation({ summary: 'Mark notification as unread' })
  @Patch(':id/unread')
  markUnread(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.markAsUnread(id, user.sub);
  }

  @ApiOperation({ summary: 'Archive notification' })
  @Patch(':id/archive')
  archive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.archive(id, user.sub);
  }

  @ApiOperation({ summary: 'Restore archived notification' })
  @Patch(':id/restore')
  restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.restore(id, user.sub);
  }

  @ApiOperation({ summary: 'Delete notification' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificationService.remove(id, user.sub);
  }
}
