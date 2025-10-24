
import { useContext } from 'react';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { currencies, conversionRates } from '../data/currencies';
import { useLocalization } from './useLocalization';

export const useCurrency = () => {
  const context = useContext(AppContext);
  const { language } = useLocalization();

  if (!context) {
    throw new Error('useCurrency must be used within an AppProvider');
  }

  const { currency } = context;

  const formatCurrency = (priceInOmr: number) => {
    const selectedCurrency = currencies[currency];
    const rate = conversionRates[currency];
    const convertedPrice = priceInOmr * rate;

    const formattedPrice = convertedPrice.toFixed(selectedCurrency.decimalPlaces);
    
    // For Arabic, place the symbol after the number
    if (language === 'ar') {
        return `${formattedPrice} ${selectedCurrency.symbol[language]}`;
    }
    
    // For English, place the symbol before the number
    return `${selectedCurrency.symbol[language]}${formattedPrice}`;
  };

  return { formatCurrency, currency };
};