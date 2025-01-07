import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GerService } from './current-exchange-rate.service';
import { GerController } from './ger.controller';
import { HistoricalExchangeRateService } from './historical-exchange-rate.service';

@Module({
  imports: [HttpModule],
  controllers: [GerController],
  providers: [GerService, HistoricalExchangeRateService],
})
export class GerModule {}
