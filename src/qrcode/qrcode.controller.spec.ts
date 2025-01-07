import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from './qrcode.controller';
import { QrCodeService } from './qrcode.service';
import { Response } from 'express';

describe('QrCodeController', () => {
  let qrCodeController: QrCodeController;
  let qrCodeService: QrCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [
        {
          provide: QrCodeService,
          useValue: {
            generateQRCode: jest.fn(),
          },
        },
      ],
    }).compile();

    qrCodeController = module.get<QrCodeController>(QrCodeController);
    qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(qrCodeController).toBeDefined();
  });

  it('should generate a QR Code and send it in response', async () => {
    const data = 'Test Data';
    const mockBuffer = Buffer.from('mock-qr-code');
    jest.spyOn(qrCodeService, 'generateQRCode').mockResolvedValue(mockBuffer);

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    await qrCodeController.generateQRCode(data, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
    expect(res.send).toHaveBeenCalledWith(mockBuffer);
    expect(qrCodeService.generateQRCode).toHaveBeenCalledWith(data);
  });

  it('should throw an error if data is empty', async () => {
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    await expect(qrCodeController.generateQRCode('', res)).rejects.toThrowError(
      'Data is required to generate a QR Code.',
    );
  });
});
