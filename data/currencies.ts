
import { Currency, CurrencyCode } from '../types';

export const currencies: Record<CurrencyCode, Currency> = {
  OMR: {
    code: 'OMR',
    name: { en: 'Omani Rial', ar: 'ريال عماني' },
    symbol: { en: 'OMR ', ar: 'ر.ع.' },
    decimalPlaces: 3,
  },
  USD: {
    code: 'USD',
    name: { en: 'US Dollar', ar: 'دولار أمريكي' },
    symbol: { en: '$', ar: '$' },
    decimalPlaces: 2,
  },
  AED: {
    code: 'AED',
    name: { en: 'UAE Dirham', ar: 'درهم إماراتي' },
    symbol: { en: 'AED ', ar: 'د.إ' },
    decimalPlaces: 2,
  },
  SAR: {
    code: 'SAR',
    name: { en: 'Saudi Riyal', ar: 'ريال سعودي' },
    symbol: { en: 'SAR ', ar: 'ر.س' },
    decimalPlaces: 2,
  },
  QAR: {
    code: 'QAR',
    name: { en: 'Qatari Riyal', ar: 'ريال قطري' },
    symbol: { en: 'QAR ', ar: 'ر.ق' },
    decimalPlaces: 2,
  },
  BHD: {
    code: 'BHD',
    name: { en: 'Bahraini Dinar', ar: 'دينار بحريني' },
    symbol: { en: 'BHD ', ar: '.د.ب' },
    decimalPlaces: 3,
  },
  KWD: {
    code: 'KWD',
    name: { en: 'Kuwaiti Dinar', ar: 'دينار كويتي' },
    symbol: { en: 'KWD ', ar: 'د.ك' },
    decimalPlaces: 3,
  },
};

// Conversion rates from base currency OMR
export const conversionRates: Record<CurrencyCode, number> = {
  OMR: 1,
  USD: 2.60,
  AED: 9.53,
  SAR: 9.74,
  QAR: 9.45,
  BHD: 0.976,
  KWD: 0.797,
};