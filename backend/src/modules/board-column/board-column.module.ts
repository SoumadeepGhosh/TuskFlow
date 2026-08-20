import { Module } from '@nestjs/common';
import { BoardColumnController } from './board-column.controller';
import { BoardColumnService } from './board-column.service';
import { BoardColumnRepository } from './repositories/board-column.repository';

@Module({
  controllers: [BoardColumnController],
  providers: [BoardColumnService, BoardColumnRepository],
})
export class BoardColumnModule {}
