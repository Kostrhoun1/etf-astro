'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import MonteCarloContent from './MonteCarloContent';

const MonteCarloContentWrapper: React.FC = () => {
  return (
    <CurrencyProvider>
      <MonteCarloContent />
    </CurrencyProvider>
  );
};

export default MonteCarloContentWrapper;
