'use client';

import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { Currency } from '../../contexts/CurrencyContext';

interface CurrencyToggleProps {
  className?: string;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ className = '' }) => {
  const { selectedCurrency, setCurrency, getCurrencyLabel } = useCurrency();

  const currencies: Currency[] = ['EUR', 'CZK', 'USD'];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-2" title="Zobrazit výkonnost přepočtenou do vybrané měny">
        Výkonnost v měně:
      </span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {currencies.map((currency) => (
          <button
            key={currency}
            onClick={() => setCurrency(currency)}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${selectedCurrency === currency
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }
            `}
          >
            {getCurrencyLabel(currency)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurrencyToggle;