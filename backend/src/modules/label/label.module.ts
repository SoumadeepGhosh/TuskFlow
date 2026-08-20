import { Module } from '@nestjs/common';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { LabelRepository } from './repositories/label.repository';

@Module({
  controllers: [LabelController],
  providers: [LabelService, LabelRepository],
})
export class LabelModule {}
