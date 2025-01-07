// Import các module và thư viện cần thiết
import { Test, TestingModule } from '@nestjs/testing';
import { GerService } from './current-exchange-rate.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { getExchangeRateDto } from './dto/ger-dto';

// Mock lại các module `rxjs` và `xml2js`
jest.mock('rxjs', () => ({
  lastValueFrom: jest.fn(),
}));

jest.mock('xml2js', () => ({
  parseStringPromise: jest.fn(),
}));

// Mô tả test cho GerService
describe('GerService', () => {
  let service: GerService;

  // Chuẩn bị môi trường test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GerService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(), // Mock lại phương thức `get` của HttpService
          },
        },
      ],
    }).compile();

    service = module.get<GerService>(GerService);
  });

  // Kiểm tra service được định nghĩa
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test trường hợp không nhận được dữ liệu từ API
  it('should throw an error if API response is empty', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
    };

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: null });

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'No response data received from API',
    );
  });

  // Test trường hợp trả về tỷ giá chính xác khi các đơn vị tiền tệ hợp lệ
  it('should return the correct exchange rate for valid currencies', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
    };

    const mockApiResponse = `
      <ExrateList>
        <Exrate CurrencyCode="USD" Buy="25221.00" />
        <Exrate CurrencyCode="EUR" Buy="27852.00" />
      </ExrateList>
    `;

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: mockApiResponse });
    (parseStringPromise as jest.Mock).mockResolvedValue({
      ExrateList: {
        Exrate: [
          { $: { CurrencyCode: 'USD', Buy: '25221.00' } },
          { $: { CurrencyCode: 'EUR', Buy: '27852.00' } },
        ],
      },
    });

    const rate = await service.getExchangeRate(dto);

    expect(rate).toBeCloseTo(25221.0 / 27852.0);
  });

  // Test trường hợp không tìm thấy đơn vị tiền tệ
  it('should throw an error if currency is not found', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'XYZ',
    };

    const mockApiResponse = `
      <ExrateList>
        <Exrate CurrencyCode="USD" Buy="25221.00" />
      </ExrateList>
    `;

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: mockApiResponse });
    (parseStringPromise as jest.Mock).mockResolvedValue({
      ExrateList: {
        Exrate: [{ $: { CurrencyCode: 'USD', Buy: '25221.00' } }],
      },
    });

    await expect(service.getExchangeRate(dto)).rejects.toThrowError(
      'Failed to fetch exchange rate: Cannot find rates for the specified currencies',
    );
  });

  // Test trường hợp đơn vị tiền tệ gốc là VND
  it('should handle VND as base currency correctly', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'VND',
      toCurrency: 'USD',
    };

    const mockApiResponse = `
      <ExrateList>
        <Exrate CurrencyCode="USD" Buy="25221.00" />
      </ExrateList>
    `;

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: mockApiResponse });
    (parseStringPromise as jest.Mock).mockResolvedValue({
      ExrateList: {
        Exrate: [{ $: { CurrencyCode: 'USD', Buy: '25221.00' } }],
      },
    });

    const rate = await service.getExchangeRate(dto);

    expect(rate).toBeCloseTo(1 / 25221.0);
  });

  // Test trường hợp đơn vị tiền tệ đích là VND
  it('should handle VND as target currency correctly', async () => {
    const dto: getExchangeRateDto = {
      fromCurrency: 'USD',
      toCurrency: 'VND',
    };

    const mockApiResponse = `
      <ExrateList>
        <Exrate CurrencyCode="USD" Buy="25221.00" />
      </ExrateList>
    `;

    (lastValueFrom as jest.Mock).mockResolvedValue({ data: mockApiResponse });
    (parseStringPromise as jest.Mock).mockResolvedValue({
      ExrateList: {
        Exrate: [{ $: { CurrencyCode: 'USD', Buy: '25221.00' } }],
      },
    });

    const rate = await service.getExchangeRate(dto);

    expect(rate).toBe(25221.0);
  });
});
