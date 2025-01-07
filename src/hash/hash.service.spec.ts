import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    hashService = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(hashService).toBeDefined();
  });

  it('should generate a correct hash for MD5', () => {
    const text = 'Hello';
    const algorithm = 'md5';
    const expectedHash = crypto
      .createHash(algorithm)
      .update(text)
      .digest('hex');

    const result = hashService.getHash(text, algorithm);

    expect(result).toBe(expectedHash);
  });

  it('should generate a correct hash for SHA-256', () => {
    const text = 'Hello';
    const algorithm = 'sha256';
    const expectedHash = crypto
      .createHash(algorithm)
      .update(text)
      .digest('hex');

    const result = hashService.getHash(text, algorithm);

    expect(result).toBe(expectedHash);
  });

  it('should throw an error if text is null', () => {
    expect(() => {
      hashService.getHash(null, 'md5');
    }).toThrowError(new BadRequestException('Input text cannot be empty.'));
  });

  it('should throw an error if text is empty', () => {
    expect(() => {
      hashService.getHash('', 'md5');
    }).toThrowError(new BadRequestException('Input text cannot be empty.'));
  });

  it('should throw an error if the algorithm is invalid', () => {
    const invalidAlgorithm = 'unsupported-algorithm';

    expect(() => {
      hashService.getHash('Hello', invalidAlgorithm);
    }).toThrowError(
      new BadRequestException(
        `Invalid hashing algorithm. Supported algorithms are: ${crypto
          .getHashes()
          .join(', ')}`,
      ),
    );
  });

  it('should throw an error if crypto throws an unexpected error', () => {
    jest.spyOn(crypto, 'createHash').mockImplementation(() => {
      throw new Error('Unexpected crypto error');
    });

    expect(() => {
      hashService.getHash('Hello', 'md5');
    }).toThrowError(
      new BadRequestException(
        'Failed to generate hash: Unexpected crypto error',
      ),
    );
  });
});
