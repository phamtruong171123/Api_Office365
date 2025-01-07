import {
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  Controller,
} from '@nestjs/common';
import { FileService } from './FileService';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('File') // Gắn nhóm tài liệu Swagger
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // Upload File Thường
  @Post('upload')
  @ApiOperation({ summary: 'Upload một file' })
  @ApiConsumes('multipart/form-data') // Định nghĩa kiểu dữ liệu multipart
  @ApiBody({
    description: 'File cần upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Định nghĩa kiểu dữ liệu là file
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File được upload thành công.',
    schema: {
      example: {
        message: 'File uploaded successfully',
        filePath: '/uploads/1674829134-example.txt',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi xảy ra trong quá trình upload file.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Đường dẫn lưu file
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('Uploaded file:', file);
    return this.fileService.handleFileUpload(file);
  }

  // Danh sách File
  @Get('list')
  @ApiOperation({ summary: 'Lấy danh sách file đã upload' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách file đã upload.',
    schema: {
      example: [
        '1674829134-example1.txt',
        '1674829135-example2.txt',
        '1674829136-example3.png',
      ],
    },
  })
  listFiles() {
    return this.fileService.listUploadedFiles();
  }

  // Tải File về
  @Get('download/:filename')
  @ApiOperation({ summary: 'Tải file đã upload về máy' })
  @ApiResponse({
    status: 200,
    description: 'File được tải về thành công.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file.',
  })
  downloadFile(@Param('filename') filename: string, @Res() res) {
    return this.fileService.downloadFile(filename, res);
  }

  // Upload File Ảnh và Trả về Base64
  @Post('upload-image')
  @ApiOperation({
    summary: 'Upload một file ảnh và trả về chuỗi Base64',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Ảnh cần upload (jpg, jpeg, png)',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary', // Định nghĩa trường ảnh là binary
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ảnh được upload thành công và trả về Base64.',
    schema: {
      example: {
        message: 'Image uploaded successfully',
        base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi xảy ra trong quá trình upload file ảnh.',
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        if (
          !allowedExtensions.includes(extname(file.originalname).toLowerCase())
        ) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('Uploaded image:', file);
    return this.fileService.uploadImage(file);
  }
}
