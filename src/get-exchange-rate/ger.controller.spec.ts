import { Test, TestingModule } from '@nestjs/testing';
import { GerController } from './ger.controller';
import { GerService } from './current-exchange-rate.service';
import { HistoricalExchangeRateService } from './historical-exchange-rate.service';
import { getExchangeRateDto } from './dto/ger-dto';

describe('GerController', () => {
  let controller: GerController;
  let gerService: GerService;

  // Chuẩn bị môi trường test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GerController],
      providers: [
        {
          provide: GerService,
          useValue: {
            getExchangeRate: jest.fn(), // Mock lại phương thức `getExchangeRate`
          },
        },
        {
          provide: HistoricalExchangeRateService,
          useValue: {
            getExchangeRate: jest.fn(), // Mock lại phương thức `getExchangeRate`
          },
        },
      ],
    }).compile();

    controller = module.get<GerController>(GerController);
    gerService = module.get<GerService>(GerService);
  });

  // Kiểm tra controller được định nghĩa
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test trường hợp trả về tỷ giá chính xác
  it('should return exchange rate for valid input', async () => {
    const dto: getExchangeRateDto = { fromCurrency: 'USD', toCurrency: 'VND' };
    const mockRate = 23000;

    jest.spyOn(gerService, 'getExchangeRate').mockResolvedValue(mockRate);

    const result = await controller.getCurrentRate(dto);

    expect(result.rate).toBe(mockRate);
    expect(gerService.getExchangeRate).toHaveBeenCalledWith(dto);
  });

  // Test trường hợp ném lỗi khi service gặp lỗi
  it('should throw an error if service throws', async () => {
    const dto: getExchangeRateDto = { fromCurrency: 'USD', toCurrency: 'VND' };

    jest
      .spyOn(gerService, 'getExchangeRate')
      .mockRejectedValue(new Error('Currency not found'));

    await expect(controller.getCurrentRate(dto)).rejects.toThrowError(
      'Currency not found',
    );
  });
});
