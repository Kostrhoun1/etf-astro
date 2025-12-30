'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import AkcioviPortfolioPerformance from './AkcioviPortfolioPerformance';

const AkcioviPortfolioPerformanceWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <AkcioviPortfolioPerformance />
    </CurrencyProvider>
  );
};

export default AkcioviPortfolioPerformanceWrapper;
