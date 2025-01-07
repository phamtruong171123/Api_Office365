import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './FileService';
import * as fs from 'fs';
import { join } from 'path';
import { Response } from 'express';
import { Readable } from 'stream';
jest.mock('fs');

// Mô tả bộ test cho FileService
describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle file upload successfully', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'example.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1234,
      destination: './uploads',
      filename: 'example.txt',
      path: './uploads/example.txt',
      buffer: Buffer.from('test content'),
      stream: new Readable(), // Tạo instance của NodeJS.ReadableStream
    };

    const result = service.handleFileUpload(mockFile);
    expect(result).toEqual({
      filename: mockFile.filename,
      path: join(__dirname, '..', '..', 'uploads', mockFile.filename),
    });
  });

  /* it('should list uploaded files', () => {
    // Mock readdirSync để trả về danh sách Dirent
    jest
      .spyOn(fs, 'readdirSync')
      .mockReturnValue([
        { name: 'file1.txt', isFile: () => true } as unknown as fs.Dirent,
        { name: 'file2.jpg', isFile: () => true } as unknown as fs.Dirent,
      ]);

    const files = service.listUploadedFiles();

    // Kỳ vọng đúng URL được tạo từ service
    expect(files).toEqual([
      { name: 'file1.txt', url: '/file/download/file1.txt' },
      { name: 'file2.jpg', url: '/file/download/file2.jpg' },
    ]);
  }); */

  it('should throw error if file upload fails', () => {
    expect(() => {
      service.handleFileUpload(null);
    }).toThrowError('File upload failed: No file received');
  });

  it('should download file successfully', () => {
    const mockRes = {
      setHeader: jest.fn(),
      sendFile: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    const filename = 'example.txt';
    const filePath = join(__dirname, '..', '..', 'uploads', filename);

    service.downloadFile(filename, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream',
    );
    expect(mockRes.sendFile).toHaveBeenCalledWith(filePath);
  });

  it('should return 404 if file is not found during download', () => {
    const mockRes = {
      setHeader: jest.fn(),
      sendFile: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const filename = 'nonexistent.txt';

    service.downloadFile(filename, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith('File not found');
  });

  it('should upload image and return base64 string', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'example.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 1234,
      destination: './uploads',
      filename: 'example.png',
      path: './uploads/example.png',
      buffer: Buffer.from('test content'),
      stream: new Readable(),
    };

    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('test content'));

    const result = service.uploadImage(mockFile);

    expect(result).toEqual({
      base64: Buffer.from('test content').toString('base64'),
    });
  });

  it('should throw error if image upload fails', () => {
    expect(() => {
      service.uploadImage(null);
    }).toThrowError('File upload failed: No file received');
  });
});
