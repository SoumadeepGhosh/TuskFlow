import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AttachmentService } from './attachment.service';
import { UploadAttachmentDto } from './dto/request.dto';
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Attachments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        taskId: {
          type: 'integer',
          example: 1,
        },
      },
      required: ['file', 'taskId'],
    },
  })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachmentService.upload(file, dto, user);
  }

  @ApiPagination()
  @ApiQuery({
    name: 'taskId',
    required: true,
    type: Number,
    description: 'Filter attachments by task ID',
  })
  @Get()
  findAll(
    @Query('taskId', ParseIntPipe) taskId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.attachmentService.findAll({
      taskId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attachmentService.remove(id, user);
  }
}
