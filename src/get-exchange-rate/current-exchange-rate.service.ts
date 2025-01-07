import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { parseStringPromise } from 'xml2js';
import { getExchangeRateDto } from './dto/ger-dto';

@Injectable()
export class GerService {
  private readonly url =
    'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx';

  constructor(private readonly httpService: HttpService) {}

  async getExchangeRate(dto: getExchangeRateDto): Promise<number> {
    try {
      const response = await lastValueFrom(this.httpService.get(this.url));
      if (!response || !response.data) {
        throw new Error('No response data received from API');
      }

      const data = await parseStringPromise(response.data);
      const rates = data?.ExrateList?.Exrate;

      if (!rates || rates.length === 0) {
        throw new Error('No exchange rates found in API response');
      }

      const formatRate = (rateString: string): number =>
        parseFloat(rateString.replace(',', ''));

      if (dto.fromCurrency.toUpperCase() === 'VND') {
        const targetRate = rates.find(
          (rate) => rate.$.CurrencyCode === dto.toCurrency.toUpperCase(),
        );
        if (!targetRate) {
          throw new Error(
            `Cannot find rate for target currency: ${dto.toCurrency}`,
          );
        }
        return 1 / formatRate(targetRate.$.Buy);
      }

      if (dto.toCurrency.toUpperCase() === 'VND') {
        const baseRate = rates.find(
          (rate) => rate.$.CurrencyCode === dto.fromCurrency.toUpperCase(),
        );
        if (!baseRate) {
          throw new Error(
            `Cannot find rate for base currency: ${dto.fromCurrency}`,
          );
        }
        return formatRate(baseRate.$.Buy);
      }

      const baseRate = rates.find(
        (rate) => rate.$.CurrencyCode === dto.fromCurrency.toUpperCase(),
      );
      const targetRate = rates.find(
        (rate) => rate.$.CurrencyCode === dto.toCurrency.toUpperCase(),
      );

      if (!baseRate || !targetRate) {
        throw new Error('Cannot find rates for the specified currencies');
      }

      return formatRate(baseRate.$.Buy) / formatRate(targetRate.$.Buy);
    } catch (error) {
      console.error('Error fetching exchange rate:', error.message);
      throw new Error(`Failed to fetch exchange rate: ${error.message}`);
    }
  }
}
