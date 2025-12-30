'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icons';
import CurrencyToggle from '@/components/ui/CurrencyToggle';

interface ETFDetailedComparisonHeaderProps {
  onBack: () => void;
}

const ETFDetailedComparisonHeader: React.FC<ETFDetailedComparisonHeaderProps> = ({ onBack }) => {
  return (
    <div className="mb-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Zpět na seznam
      </Button>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Detailní porovnání ETF fondů
          </h1>
          <p className="text-gray-600 mt-2">
            Kompletní srovnání všech dostupných parametrů vybraných fondů
          </p>
        </div>
        <div className="hidden md:block ml-4">
          <CurrencyToggle />
        </div>
      </div>
      <div className="flex justify-center md:hidden mt-4">
        <CurrencyToggle />
      </div>
    </div>
  );
};

export default ETFDetailedComparisonHeader;