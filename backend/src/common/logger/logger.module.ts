import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { loggerConfig } from './logger.config';
import { AppLoggerService } from './logger.service';

@Global()
@Module({
  imports: [PinoLoggerModule.forRoot(loggerConfig)],
  providers: [AppLoggerService],
  exports: [PinoLoggerModule, AppLoggerService],
})
export class LoggerModule {}
