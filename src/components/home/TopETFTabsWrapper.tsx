'use client';

import React from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import TopETFTabs from './TopETFTabs';

interface ETFItem {
  isin: string;
  name: string;
  fund_provider: string;
  primary_ticker?: string;
  ter_numeric: number;
  fund_size_numeric: number;
  rating?: number;
  return_1y_czk?: number;
  return_1y_usd?: number;
  return_1y?: number;
  return_ytd_czk?: number;
  return_ytd_usd?: number;
  return_ytd?: number;
  return_3y_czk?: number;
  return_3y_usd?: number;
  return_3y?: number;
  return_5y_czk?: number;
  return_5y_usd?: number;
  return_5y?: number;
  category: string;
}

interface CategoryData {
  id: string;
  name: string;
  iconName: string;
  description: string;
  etfs: ETFItem[];
}

interface TopETFTabsWrapperProps {
  categories: CategoryData[];
  totalETFCount?: number;
}

const TopETFTabsWrapper: React.FC<TopETFTabsWrapperProps> = (props) => {
  return (
    <CurrencyProvider>
      <TopETFTabs {...props} />
    </CurrencyProvider>
  );
};

export default TopETFTabsWrapper;
