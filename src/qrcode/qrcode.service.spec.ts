import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeService } from './qrcode.service';
import * as QRCode from 'qrcode';

jest.mock('qrcode'); // Mock thư viện QRCode

describe('QrCodeService', () => {
  let qrCodeService: QrCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrCodeService],
    }).compile();

    qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(qrCodeService).toBeDefined();
  });

  it('should generate a QR Code for valid input', async () => {
    const data = 'Test Data';
    const mockBuffer = Buffer.from('mock-qr-code');
    jest.spyOn(QRCode, 'toBuffer').mockResolvedValue(mockBuffer);

    const result = await qrCodeService.generateQRCode(data);

    expect(result).toBe(mockBuffer);
    expect(QRCode.toBuffer).toHaveBeenCalledWith(data);
  });

  it('should throw an error if QRCode generation fails', async () => {
    const data = 'Test Data';
    jest
      .spyOn(QRCode, 'toBuffer')
      .mockRejectedValue(new Error('QR Code error'));

    await expect(qrCodeService.generateQRCode(data)).rejects.toThrowError(
      'Failed to generate QR Code: QR Code error',
    );
  });
});
