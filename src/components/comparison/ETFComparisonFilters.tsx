import React from 'react';
import type { ETFListItem } from '@/types/etf';
import type { AdvancedFiltersState } from '@/hooks/useETFTableLogic';
import ETFAdvancedFilters from '@/components/ETFAdvancedFilters';

interface ETFComparisonFiltersProps {
  etfs: ETFListItem[];
  advancedFilters: AdvancedFiltersState;
  onAdvancedFilterChange: (key: keyof AdvancedFiltersState, value: any) => void;
  ranges: {
    ter: { min: number; max: number };
    fundSize: { min: number; max: number };
    dividendYield: { min: number; max: number };
  };
}

const ETFComparisonFilters: React.FC<ETFComparisonFiltersProps> = ({
  etfs,
  advancedFilters,
  onAdvancedFilterChange,
  ranges,
}) => {
  return (
    <div>
      <ETFAdvancedFilters
        etfs={etfs}
        filters={advancedFilters}
        onFilterChange={onAdvancedFilterChange}
        ranges={ranges}
      />
    </div>
  );
};

export default ETFComparisonFilters;