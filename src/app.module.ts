import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HashModule } from './hash/hash.module';
import { QrCodeModule } from './qrcode/qrcode.module';
import { GerModule } from './get-exchange-rate/ger.module';
import { FileModule } from './file/FileModule';

@Module({
  imports: [HashModule, QrCodeModule, GerModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
