import { Module } from '@nestjs/common';
import { BurnoutService } from './burnout.service';
import { BurnoutController } from './burnout.controller';

@Module({
  providers: [BurnoutService],
  exports: [BurnoutService],
  controllers: [BurnoutController],
})
export class BurnoutModule {}
