'use client';

import React from 'react';
import ETFComparisonHeader from './ETFComparisonHeader';
import ETFCategoryTabs from './ETFCategoryTabs';
import ETFComparisonTableSection from './ETFComparisonTableSection';
import ETFComparisonFilters from './ETFComparisonFilters';
import ETFComparisonPanel from '@/components/ETFComparisonPanel';
import LastUpdatedInfo from '@/components/LastUpdatedInfo';
import { useETFSearchData } from '@/hooks/useETFSearchData';
import { useETFComparison } from '@/hooks/useETFComparison';
import { useETFTableLogic } from '@/hooks/useETFTableLogic';
import type { ETF } from '@/types/etf';
import type { ETFBasicInfo } from '@/lib/etf-data';

interface ETFComparisonContainerProps {
  onShowDetailedComparison: (selectedETFs: ETF[]) => void;
  preSelectedISINs?: string[];
  initialETFs?: ETFBasicInfo[];
  totalCount?: number;
}

const ETFComparisonContainer: React.FC<ETFComparisonContainerProps> = ({
  onShowDetailedComparison,
  preSelectedISINs,
  initialETFs,
  totalCount,
}) => {
  // Use SSR data for initial render, then load full data in background
  const { etfs, categories, maxTerFromData, totalETFCount, isLoading, isLoadingComplete, lastUpdated } = useETFSearchData({
    initialETFs,
    initialTotalCount: totalCount,
  });
  const { selectedETFs, addETFToComparison, removeETFFromComparison, clearComparison, isETFSelected, canAddMore, loadETFsByISIN } = useETFComparison();

  const {
    filteredETFs,
    categories: logicCategories,
    activeCategory,
    handleCategoryChange,
    handleAdvancedFilterChange,
    advancedFilters,
    ranges
  } = useETFTableLogic(etfs);

  const handleShowDetailedComparison = () => {
    onShowDetailedComparison(selectedETFs);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <ETFComparisonHeader
          selectedCount={selectedETFs.length}
          onShowDetailedComparison={handleShowDetailedComparison}
          onClearAll={clearComparison}
        />
        <LastUpdatedInfo lastUpdated={lastUpdated} showCurrencyToggle={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <ETFCategoryTabs
            categories={logicCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          
          <ETFComparisonTableSection
            etfs={filteredETFs}
            isLoading={isLoading}
            onSelectETF={addETFToComparison}
            isETFSelected={isETFSelected}
            canAddMore={canAddMore}
            selectedETFs={selectedETFs}
            onRemoveETF={removeETFFromComparison}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ETFComparisonFilters
            etfs={etfs}
            advancedFilters={advancedFilters}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            ranges={ranges}
          />
        </div>
      </div>

      <ETFComparisonPanel
        selectedETFs={selectedETFs}
        onRemoveETF={removeETFFromComparison}
        onClearAll={clearComparison}
        onShowComparison={handleShowDetailedComparison}
      />
    </div>
  );
};

export default ETFComparisonContainer;