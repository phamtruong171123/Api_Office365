import { ApiProperty } from '@nestjs/swagger';

export class getExchangeRateDto {
  @ApiProperty({
    description: 'Mã tiền tệ gốc (ví dụ: USD)',
    example: 'USD',
  })
  fromCurrency: string;

  @ApiProperty({
    description: 'Mã tiền tệ đích (ví dụ: VND)',
    example: 'VND',
  })
  toCurrency: string;

  @ApiProperty({
    description: 'Ngày lấy tỷ giá (định dạng: YYYY-MM-DD)',
  })
  date?: string; // ngày lấy tỉ giá
}
