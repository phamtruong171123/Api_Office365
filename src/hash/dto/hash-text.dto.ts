// định nghĩa dữ liệu đầu vào

import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
export class HashTextDto {
  @ApiProperty({
    description: 'Văn bản cần tạo mã băm',
    example: 'Hello World',
  })
  @IsString()
  text: string; // đoạn text cần băm

  @ApiProperty({
    description: 'Thuật toán mã hóa',
    example: 'sha256',
    enum: ['sha256', 'md5', 'sha-512'],
  })
  @IsString()
  @IsIn(['md5', 'sha256', 'sha512']) // các loại thuật toán băm sử dụng
  algorithm: string;
}
