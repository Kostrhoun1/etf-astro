'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import NobelPortfolioPerformance from './NobelPortfolioPerformance';

const NobelPortfolioPerformanceWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <NobelPortfolioPerformance />
    </CurrencyProvider>
  );
};

export default NobelPortfolioPerformanceWrapper;
