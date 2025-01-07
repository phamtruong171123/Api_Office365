import { Body, Controller, Post } from '@nestjs/common';
import { HashService } from './hash.service';
import { HashTextDto } from './dto/hash-text.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Hash')
@Controller('hash')
export class HashController {
  constructor(private readonly hashService: HashService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mã băm từ văn bản' })
  @ApiResponse({
    status: 201,
    description: 'Trả về mã băm đã tạo.',
    schema: {
      example: {
        hash: '5d41402abc4b2a76b9719d911017c592',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Yêu cầu không hợp lệ(ví dụ thiếu text hoặc không đúng algorithm)',
  })
  getHash(@Body() hashTextDto: HashTextDto): string {
    return this.hashService.getHash(hashTextDto.text, hashTextDto.algorithm);
  }
}
