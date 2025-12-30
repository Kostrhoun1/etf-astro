'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import BacktestContent from './BacktestContent';

const BacktestContentWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <BacktestContent />
    </CurrencyProvider>
  );
};

export default BacktestContentWrapper;
