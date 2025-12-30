'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import DividendPortfolioPerformance from './DividendPortfolioPerformance';

const DividendPortfolioPerformanceWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <DividendPortfolioPerformance />
    </CurrencyProvider>
  );
};

export default DividendPortfolioPerformanceWrapper;
