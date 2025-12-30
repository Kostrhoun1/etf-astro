'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import AllWeatherPortfolioPerformance from './AllWeatherPortfolioPerformance';

const AllWeatherPortfolioPerformanceWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <AllWeatherPortfolioPerformance />
    </CurrencyProvider>
  );
};

export default AllWeatherPortfolioPerformanceWrapper;
