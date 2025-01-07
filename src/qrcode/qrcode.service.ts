import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQRCode(data: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(data);
    } catch (error) {
      throw new Error(`Failed to generate QR Code: ${error.message}`);
    }
  }
}
