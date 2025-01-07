import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';

@Injectable()
export class FileService {
  private readonly uploadPath = join(__dirname, '..', '..', 'uploads'); // Đường dẫn tuyệt đối tới thư mục uploads

  constructor() {
    // Kiểm tra nếu thư mục uploads chưa tồn tại thì tạo mới
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
      console.log(`Created upload directory at: ${this.uploadPath}`);
    }
  }

  // Xử lý Upload File Thường
  handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new Error('File upload failed: No file received');
    }

    // Xây dựng đường dẫn file chính xác
    const filePath = join(this.uploadPath, file.filename);
    console.log('File saved at:', filePath);

    return { filename: file.filename, path: filePath };
  }

  // Trả về danh sách File
  listUploadedFiles() {
    try {
      const files = fs.readdirSync(this.uploadPath); // Đọc danh sách file từ thư mục uploads
      return files.map((file) => ({
        name: file,
        url: `/file/download/${file}`, // Tạo URL tải xuống
      }));
    } catch (error) {
      console.error('Error reading files:', error.message);
      throw new Error('Could not list uploaded files');
    }
  }

  // Xử lý Tải File về
  downloadFile(filename: string, res: Response) {
    try {
      // Xây dựng đường dẫn chính xác tới file
      const filePath = join(this.uploadPath, filename);
      console.log('Downloading file from:', filePath);

      // Kiểm tra nếu file không tồn tại
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        res.status(404).send('File not found');
        return;
      }

      // Thiết lập header để trình duyệt tải file xuống
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');

      // Gửi file về cho client
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error during file download:', error.message);
      res.status(500).send('An error occurred while downloading the file');
    }
  }

  // Xử lý Upload Ảnh và Trả về Base64
  uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new Error('File upload failed: No file received');
    }

    try {
      // Xây dựng đường dẫn tới file
      const filePath = join(this.uploadPath, file.filename);
      console.log('Image saved at:', filePath);

      const imageBuffer = fs.readFileSync(filePath); // Đọc file từ disk
      const base64 = imageBuffer.toString('base64'); // Chuyển sang base64

      return { base64 };
    } catch (error) {
      console.error('Error processing image:', error.message);
      throw new Error('Could not process the image');
    }
  }
}
