import { Controller, Get, Query } from '@nestjs/common';
import { GerService } from './current-exchange-rate.service';
import { HistoricalExchangeRateService } from './historical-exchange-rate.service';
import { getExchangeRateDto } from './dto/ger-dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Exchange Rates')
@Controller('get-exchange-rate')
export class GerController {
  constructor(
    private readonly gerService: GerService,
    private readonly historicalExchangeRateService: HistoricalExchangeRateService,
  ) {}

  // Lấy tỷ giá hiện tại
  @Get('current-date')
  @ApiOperation({ summary: 'Lấy tỷ giá hối đoái hiện tại' }) // Mô tả API
  @ApiQuery({
    name: 'fromCurrency',
    required: true,
    description: 'Mã tiền tệ gốc (ví dụ: USD)',
    example: 'USD',
  })
  @ApiQuery({
    name: 'toCurrency',
    required: true,
    description: 'Mã tiền tệ đích (ví dụ: VND)',
    example: 'VND',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về tỷ giá hối đoái hiện tại.',
    schema: {
      example: {
        fromCurrency: 'USD',
        toCurrency: 'VND',
        rate: 23000,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ (ví dụ: thiếu thông tin currency).',
  })
  async getCurrentRate(
    @Query() dto: getExchangeRateDto,
  ): Promise<{ rate: number }> {
    const rate = await this.gerService.getExchangeRate(dto);
    return { rate };
  }

  // Lấy tỷ giá theo ngày
  @Get('historical')
  @ApiOperation({ summary: 'Lấy tỷ giá hối đoái lịch sử' }) // Mô tả API
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Ngày lấy tỷ giá (định dạng: YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'fromCurrency',
    required: true,
    description: 'Mã tiền tệ gốc (ví dụ: USD)',
    example: 'USD',
  })
  @ApiQuery({
    name: 'toCurrency',
    required: true,
    description: 'Mã tiền tệ đích (ví dụ: EUR)',
    example: 'EUR',
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về tỷ giá hối đoái lịch sử.',
    schema: {
      example: {
        date: '2024-01-01',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.85,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu không hợp lệ (ví dụ: thiếu thông tin hoặc định dạng ngày sai).',
  })
  async getHistoricalRate(
    @Query() dto: getExchangeRateDto,
  ): Promise<{ rate: number }> {
    const rate = await this.historicalExchangeRateService.getExchangeRate(dto);
    return { rate };
  }
}
