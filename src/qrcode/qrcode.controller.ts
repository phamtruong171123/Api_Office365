import { Controller, Query, Get, Res } from '@nestjs/common';
import { QrCodeService } from './qrcode.service';
import { Response } from 'express';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('QRCode')
@Controller('qrcode')
export class QrCodeController {
  [x: string]: any;
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get('generate')
  @ApiOperation({ summary: 'Tạo mã QR từ văn bản' }) // Mô tả API
  @ApiQuery({
    name: 'data',
    required: true,
    description: 'Văn bản cần mã hóa thành mã QR',
    example: 'Hello World', // Example cho Swagger
  })
  @ApiResponse({
    status: 200,
    description: 'Trả về chuỗi Base64 của ảnh QR Code.',
    schema: {
      example: {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi khi văn bản đầu vào không hợp lệ.',
  })
  async generateQRCode(@Query('data') data: string, @Res() res: Response) {
    if (!data || data.trim() === '') {
      throw new Error('Data is required to generate a QR Code.');
    }

    const qrCodeBuffer = await this.qrCodeService.generateQRCode(data);
    res.setHeader('Content-Type', 'image/png');
    res.send(qrCodeBuffer);
  }
}
