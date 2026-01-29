'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ETF, ETFListItem } from '../types/etf';

// Currency types
export type Currency = 'EUR' | 'CZK' | 'USD';

// Performance period types
export type PerformancePeriod = '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | '2021' | '2022' | '2023' | '2024' | '2025' | 'inception';

// Currency context interface
interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  getPerformanceValue: (etf: ETF | ETFListItem, period: PerformancePeriod) => number | null;
  getCurrencySymbol: (currency: Currency) => string;
  getCurrencyLabel: (currency: Currency) => string;
}

// Create context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Currency provider component
export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('CZK');

  // Load currency preference from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('etf-currency-preference') as Currency;
    if (savedCurrency && ['EUR', 'CZK', 'USD'].includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  const setCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('etf-currency-preference', currency);
  };

  // Get performance value for specific currency and period
  const getPerformanceValue = (etf: ETF | ETFListItem, period: PerformancePeriod): number | null => {
    const fieldName = `return_${period}` as keyof (ETF | ETFListItem);
    
    switch (selectedCurrency) {
      case 'CZK':
        const czkField = `return_${period}_czk` as keyof (ETF | ETFListItem);
        return (etf[czkField] as number) ?? null;
      
      case 'USD':
        const usdField = `return_${period}_usd` as keyof (ETF | ETFListItem);
        return (etf[usdField] as number) ?? null;
      
      case 'EUR':
      default:
        return (etf[fieldName] as number) ?? null;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: Currency): string => {
    switch (currency) {
      case 'EUR':
        return '€';
      case 'CZK':
        return 'Kč';
      case 'USD':
        return '$';
      default:
        return '€';
    }
  };

  // Get currency label with flag
  const getCurrencyLabel = (currency: Currency): string => {
    switch (currency) {
      case 'EUR':
        return '🇪🇺 EUR';
      case 'CZK':
        return '🇨🇿 CZK';
      case 'USD':
        return '🇺🇸 USD';
      default:
        return '🇪🇺 EUR';
    }
  };

  const value: CurrencyContextType = {
    selectedCurrency,
    setCurrency,
    getPerformanceValue,
    getCurrencySymbol,
    getCurrencyLabel,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Helper hook for performance formatting
export const useFormattedPerformance = (etf: ETF | ETFListItem, period: PerformancePeriod): string => {
  const { getPerformanceValue } = useCurrency();
  const value = getPerformanceValue(etf, period);
  
  if (value === null || value === undefined) {
    return '-';
  }
  
  // Format as percentage with proper sign
  const formattedValue = value.toFixed(2);
  return value >= 0 ? `+${formattedValue}%` : `${formattedValue}%`;
};