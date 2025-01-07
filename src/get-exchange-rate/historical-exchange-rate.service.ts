import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { getExchangeRateDto } from './dto/ger-dto';

@Injectable()
export class HistoricalExchangeRateService {
  private readonly baseUrl = 'https://www.vietcombank.com.vn/api/exchangerates';

  constructor(private readonly httpService: HttpService) {}

  async getExchangeRate(dto: getExchangeRateDto): Promise<number> {
    const { fromCurrency, toCurrency, date } = dto;

    // Kiểm tra nếu ngày không được cung cấp
    if (!date) {
      throw new HttpException(
        'Date is required to fetch historical exchange rates',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra ngày có hợp lệ hay không
    if (!this.isValidDate(date)) {
      throw new HttpException(
        `Invalid date format. Expected format: YYYY-MM-DD`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Kiểm tra nếu ngày là ngày trong tương lai
    if (this.isFutureDate(date)) {
      throw new HttpException(
        `Date cannot be in the future.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];
    const url = `${this.baseUrl}?date=${formattedDate}`;

    try {
      const response = await lastValueFrom(this.httpService.get(url));
      const rates = response.data.Data;

      // Kiểm tra nếu không có dữ liệu tỷ giá trong phản hồi
      if (!rates || rates.length === 0) {
        throw new HttpException(
          'No exchange rates found for the specified date',
          HttpStatus.NOT_FOUND,
        );
      }

      // Xử lý đặc biệt cho VND
      if (fromCurrency.toUpperCase() === 'VND') {
        const targetRate = this.findRate(rates, toCurrency);
        return 1 / targetRate;
      }

      if (toCurrency.toUpperCase() === 'VND') {
        const baseRate = this.findRate(rates, fromCurrency);
        return baseRate;
      }

      // Xử lý thông thường cho các loại tiền khác
      const baseRate = this.findRate(rates, fromCurrency);
      const targetRate = this.findRate(rates, toCurrency);

      // Tính và trả về kết quả
      return baseRate / targetRate;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch exchange rate: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private findRate(rates: any[], currency: string): number {
    const rate = rates.find(
      (rate) => rate.currencyCode === currency.toUpperCase(),
    );

    if (!rate) {
      throw new HttpException(
        `Cannot find rate for currency: ${currency}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return parseFloat(rate.transfer.replace(',', ''));
  }

  private isValidDate(date: string): boolean {
    // Kiểm tra xem chuỗi có phải định dạng ngày hợp lệ không
    const parsedDate = Date.parse(date);
    return !isNaN(parsedDate) && /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  private isFutureDate(date: string): boolean {
    const today = new Date();
    const inputDate = new Date(date);
    return inputDate > today;
  }
}
