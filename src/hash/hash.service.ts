import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto'; // Thư viện crypto

@Injectable()
export class HashService {
  getHash(text: string, algorithm: string): string {
    // Kiểm tra nếu chuỗi text bị thiếu, rỗng hoặc chỉ chứa khoảng trắng
    if (!text || text.trim() === '') {
      throw new BadRequestException('Input text cannot be empty.');
    }

    // Kiểm tra nếu thuật toán không hợp lệ
    if (!crypto.getHashes().includes(algorithm)) {
      throw new BadRequestException(
        `Invalid hashing algorithm. Supported algorithms are: ${crypto
          .getHashes()
          .join(', ')}`,
      );
    }

    try {
      // Tạo hash và trả về dưới dạng hex
      return crypto.createHash(algorithm).update(text).digest('hex');
    } catch (error) {
      // Bắt lỗi không mong muốn
      throw new BadRequestException(
        `Failed to generate hash: ${error.message}`,
      );
    }
  }
}
