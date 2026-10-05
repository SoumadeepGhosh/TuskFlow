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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/request.dto';
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: JwtPayload) {
    return this.commentService.create(dto, user);
  }

  @ApiPagination()
  @ApiQuery({
    name: 'taskId',
    required: true,
    type: Number,
    description: 'Filter comments by task ID',
  })
  @Get()
  findAll(
    @Query('taskId', ParseIntPipe) taskId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.findAll({
      taskId,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.update(id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentService.remove(id, user);
  }
}
