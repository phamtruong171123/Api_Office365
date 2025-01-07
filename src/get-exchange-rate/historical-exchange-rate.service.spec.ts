import { Test, TestingModule } from '@nestjs/testing';
import { HistoricalExchangeRateService } from './historical-exchange-rate.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { getExchangeRateDto } from './dto/ger-dto';

jest.mock('rxjs', () => ({
  lastValueFrom: jest.fn(),
}));

describe('HistoricalExchangeRateService', () => {
  let service: HistoricalExchangeRateService;

  // Chuẩn bị môi trường test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricalExchangeRateService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(), // Mock lại phương thức `get`
          },
        },
      ],
    }).compile();

    service = module.get<HistoricalExchangeRateService>(
      HistoricalExchangeRateService,
    );
  });

  // Kiểm tra service được định nghĩa
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test trường hợp không cung cấp ngày
  it('should throw an error if date is not provided', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      date: undefined,
    };

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'Date is required to fetch historical exchange rates',
    );
  });

  // Test trường hợp ngày không hợp lệ
  it('should throw an error for invalid date format', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      date: 'invalid-date',
    };

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'Invalid date format. Expected format: YYYY-MM-DD',
    );
  });

  // Test trường hợp ngày trong tương lai
  it('should throw an error if date is in the future', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      date: futureDate.toISOString().split('T')[0],
    };

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'Date cannot be in the future.',
    );
  });

  // Test trường hợp không có dữ liệu từ API
  it('should throw an error if API response is empty', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      date: '2023-01-01',
    };

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: { Data: [] } });

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'No exchange rates found for the specified date',
    );
  });

  // Test trường hợp trả về tỷ giá chính xác
  it('should return the correct exchange rate for valid currencies', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'VND',
      date: '2023-01-01',
    };

    const mockApiResponse = {
      data: {
        Data: [
          { currencyCode: 'USD', transfer: '23000' },
          { currencyCode: 'VND', transfer: '1' },
        ],
      },
    };

    (lastValueFrom as jest.Mock).mockResolvedValue(mockApiResponse);

    const rate = await service.getExchangeRate(dto);

    expect(rate).toBe(23000);
  });

  // Test trường hợp không tìm thấy đơn vị tiền tệ
  it('should throw an error if currency is not found', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'XYZ',
      date: '2023-01-01',
    };

    const mockApiResponse = {
      data: {
        Data: [{ currencyCode: 'USD', transfer: '23000' }],
      },
    };

    (lastValueFrom as jest.Mock).mockResolvedValue(mockApiResponse);

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'Cannot find rate for currency: XYZ',
    );
  });
});
