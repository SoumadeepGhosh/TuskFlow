/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

import { NotificationService } from './notification.service';

import { NotificationPaginationDto } from './dto/request.dto';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiPagination()
  @Get()
  findAll(
    @CurrentUser()
    user: JwtPayload,

    @Query('page')
    page?: number,

    @Query('limit')
    limit?: number,
  ) {
    return this.notificationService.findAll(user, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    } as NotificationPaginationDto);
  }

  @Get('unread-count')
  findUnreadCount(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.notificationService.findUnreadCount(user);
  }

  @Patch(':id/read')
  markRead(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.notificationService.markRead(id, user);
  }

  @Patch('read-all')
  markAllRead(
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.notificationService.markAllRead(user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe)
    id: number,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.notificationService.remove(id, user);
  }
}
