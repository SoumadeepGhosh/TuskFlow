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
import { LabelService } from './label.service';
import { CreateLabelDto, UpdateLabelDto } from './dto/request.dto';
import { ApiPagination } from 'src/common/decorators/api-pagination.decorator';

@ApiTags('Labels')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Post()
  create(@Body() dto: CreateLabelDto) {
    return this.labelService.create(dto);
  }

  @ApiPagination()
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: Number,
    description: 'Filter labels by project ID',
  })
  @Get()
  findAll(
    @Query('projectId') projectId?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.labelService.findAll({
      projectId: projectId ? Number(projectId) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLabelDto) {
    return this.labelService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.labelService.remove(id);
  }
}
