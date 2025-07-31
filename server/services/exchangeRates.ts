import { storage } from '../storage';

const FREE_CURRENCY_API_KEY = process.env.FREE_CURRENCY_API_KEY || 'fca_live_80j2grkuH4z96OpuetED9DqlXBHuCnoKzxTiHib6';
const FIXER_API_KEY = process.env.FIXER_API_KEY || 'b9d732cc9cf5d54c27069256a74f044f';

interface FreeCurrencyResponse {
  data: Record<string, number>;
}

interface FixerResponse {
  success: boolean;
  rates: Record<string, number>;
}

const SUPPORTED_CURRENCIES = ['USD', 'SAR', 'YER'];

export async function fetchLatestRates(): Promise<void> {
  try {
    // Try FreeCurrencyAPI first
    const rates = await fetchFromFreeCurrencyAPI();
    if (rates) {
      await updateExchangeRates(rates);
      console.log('Exchange rates updated from FreeCurrencyAPI');
      return;
    }

    // Fallback to Fixer.io
    const fixerRates = await fetchFromFixerAPI();
    if (fixerRates) {
      await updateExchangeRates(fixerRates);
      console.log('Exchange rates updated from Fixer.io');
      return;
    }

    console.error('Failed to fetch exchange rates from both APIs');
  } catch (error) {
    console.error('Error updating exchange rates:', error);
  }
}

async function fetchFromFreeCurrencyAPI(): Promise<Record<string, number> | null> {
  try {
    const currencyPairs = SUPPORTED_CURRENCIES.flatMap(base =>
      SUPPORTED_CURRENCIES.filter(target => target !== base).map(target => `${base}${target}`)
    );

    const response = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${FREE_CURRENCY_API_KEY}&currencies=${currencyPairs.join(',')}`
    );

    if (!response.ok) {
      throw new Error(`FreeCurrencyAPI error: ${response.status}`);
    }

    const data: FreeCurrencyResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('FreeCurrencyAPI fetch error:', error);
    return null;
  }
}

async function fetchFromFixerAPI(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch(
      `http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&symbols=${SUPPORTED_CURRENCIES.join(',')}`
    );

    if (!response.ok) {
      throw new Error(`Fixer.io error: ${response.status}`);
    }

    const data: FixerResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Fixer.io API returned error');
    }

    // Convert to all currency pairs
    const rates: Record<string, number> = {};
    const baseRates = data.rates;

    for (const base of SUPPORTED_CURRENCIES) {
      for (const target of SUPPORTED_CURRENCIES) {
        if (base !== target) {
          const baseRate = baseRates[base] || 1;
          const targetRate = baseRates[target] || 1;
          rates[`${base}${target}`] = targetRate / baseRate;
        }
      }
    }

    return rates;
  } catch (error) {
    console.error('Fixer.io fetch error:', error);
    return null;
  }
}

async function updateExchangeRates(rates: Record<string, number>): Promise<void> {
  for (const [pair, rate] of Object.entries(rates)) {
    if (pair.length === 6) {
      const baseCurrency = pair.substring(0, 3);
      const targetCurrency = pair.substring(3, 6);
      
      if (SUPPORTED_CURRENCIES.includes(baseCurrency) && SUPPORTED_CURRENCIES.includes(targetCurrency)) {
        await storage.upsertExchangeRate({
          baseCurrency,
          targetCurrency,
          rate: rate.toString(),
        });
      }
    }
  }
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const rate = await storage.getExchangeRate(from, to);
  if (rate) {
    return parseFloat(rate.rate);
  }

  // Try reverse rate
  const reverseRate = await storage.getExchangeRate(to, from);
  if (reverseRate) {
    return 1 / parseFloat(reverseRate.rate);
  }

  throw new Error(`Exchange rate not found for ${from}/${to}`);
}

// Initialize with some default rates if none exist
export async function initializeDefaultRates(): Promise<void> {
  const existingRates = await storage.getAllExchangeRates();
  
  if (existingRates.length === 0) {
    const defaultRates = [
      { baseCurrency: 'USD', targetCurrency: 'SAR', rate: '3.7500' },
      { baseCurrency: 'USD', targetCurrency: 'YER', rate: '250.00' },
      { baseCurrency: 'SAR', targetCurrency: 'USD', rate: '0.2667' },
      { baseCurrency: 'SAR', targetCurrency: 'YER', rate: '66.67' },
      { baseCurrency: 'YER', targetCurrency: 'USD', rate: '0.0040' },
      { baseCurrency: 'YER', targetCurrency: 'SAR', rate: '0.0150' },
    ];

    for (const rate of defaultRates) {
      await storage.upsertExchangeRate(rate);
    }
    
    console.log('Default exchange rates initialized');
  }
}
