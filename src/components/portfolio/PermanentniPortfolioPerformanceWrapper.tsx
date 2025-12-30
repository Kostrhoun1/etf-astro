'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import PermanentniPortfolioPerformance from './PermanentniPortfolioPerformance';

const PermanentniPortfolioPerformanceWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <PermanentniPortfolioPerformance />
    </CurrencyProvider>
  );
};

export default PermanentniPortfolioPerformanceWrapper;
