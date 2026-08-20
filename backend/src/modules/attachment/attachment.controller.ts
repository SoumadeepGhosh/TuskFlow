/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AttachmentService } from './attachment.service';
import { AttachmentResponseDto } from './dto/response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  AttachmentPaginationDto,
  RenameAttachmentRequestDto,
} from './dto/request.dto';

@ApiTags('Attachments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @ApiOperation({
    summary: 'Upload attachment',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    type: AttachmentResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @UploadedFile()
    file: any,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.attachmentService.upload(taskId, user.sub, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all attachments of a task',
  })
  @ApiResponse({
    status: 200,
    type: AttachmentResponseDto,
    isArray: true,
  })
  findAll(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Query()
    query: AttachmentPaginationDto,
  ) {
    return this.attachmentService.findAll(taskId, query);
  }
  @Get('statistics')
  @ApiOperation({
    summary: 'Get attachment statistics',
  })
  getStatistics(
    @Param('taskId', ParseIntPipe)
    taskId: number,
  ) {
    return this.attachmentService.getStatistics(taskId);
  }

  @Get(':attachmentId')
  @ApiOperation({
    summary: 'Get attachment details',
  })
  @ApiResponse({
    status: 200,
    type: AttachmentResponseDto,
  })
  findOne(
    @Param('attachmentId', ParseIntPipe)
    attachmentId: number,
  ) {
    return this.attachmentService.findOne(attachmentId);
  }

  @Delete(':attachmentId')
  @ApiOperation({
    summary: 'Delete attachment',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Attachment deleted successfully.',
      },
    },
  })
  remove(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Param('attachmentId', ParseIntPipe)
    attachmentId: number,
  ) {
    return this.attachmentService.remove(taskId, attachmentId);
  }

  @Get(':attachmentId/download')
  @ApiOperation({
    summary: 'Download attachment',
  })
  download(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Param('attachmentId', ParseIntPipe)
    attachmentId: number,
  ) {
    return this.attachmentService.download(taskId, attachmentId);
  }

  @Patch(':attachmentId/rename')
  @ApiOperation({
    summary: 'Rename attachment',
  })
  rename(
    @Param('taskId', ParseIntPipe)
    taskId: number,

    @Param('attachmentId', ParseIntPipe)
    attachmentId: number,

    @Body()
    dto: RenameAttachmentRequestDto,
  ) {
    return this.attachmentService.rename(
      taskId,
      attachmentId,
      dto.originalName,
    );
  }
}
