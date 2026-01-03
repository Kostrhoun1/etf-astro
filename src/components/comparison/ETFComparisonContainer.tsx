'use client';

import React, { useState } from 'react';
import ETFComparisonHeader from './ETFComparisonHeader';
import ETFCategoryTabs from './ETFCategoryTabs';
import ETFComparisonTableSection from './ETFComparisonTableSection';
import ETFComparisonFilters from './ETFComparisonFilters';
import ETFComparisonPanel from '@/components/ETFComparisonPanel';
import LastUpdatedInfo from '@/components/LastUpdatedInfo';
import { useETFSearchData } from '@/hooks/useETFSearchData';
import { useETFComparison } from '@/hooks/useETFComparison';
import { useETFTableLogic } from '@/hooks/useETFTableLogic';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterIcon, CloseIcon } from '@/components/ui/icons';
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Use SSR data for initial render, then load full data in background
  const { etfs, categories, maxTerFromData, totalETFCount, isLoading, isLoadingComplete, isFullDataLoaded, lastUpdated } = useETFSearchData({
    initialETFs,
    initialTotalCount: totalCount,
  });
  const { selectedETFs, addETFToComparison, removeETFFromComparison, clearComparison, isETFSelected, canAddMore, loadETFsByISIN } = useETFComparison();

  const {
    filteredETFs,
    activeCategory,
    handleCategoryChange,
    handleAdvancedFilterChange,
    advancedFilters,
    ranges
  } = useETFTableLogic(etfs, categories);

  const handleShowDetailedComparison = () => {
    onShowDetailedComparison(selectedETFs);
  };

  // Count active filters for badge
  const getActiveFiltersCount = () => {
    let count = 0;
    if (advancedFilters.distributionPolicy !== 'all') count++;
    if (advancedFilters.replicationMethod !== 'all') count++;
    if (advancedFilters.fundSizeRange !== 'all') count++;
    if (advancedFilters.region !== 'all') count++;
    if (advancedFilters.indexName !== 'all') count++;
    if (advancedFilters.fundCurrency !== 'all') count++;
    if (advancedFilters.hedgingType && advancedFilters.hedgingType !== 'all') count++;
    if (advancedFilters.minRating > 0) count++;
    if (advancedFilters.terRange[0] > ranges.ter.min || advancedFilters.terRange[1] < ranges.ter.max) count++;
    if (advancedFilters.fundSizeRangeValues[0] > ranges.fundSize.min || advancedFilters.fundSizeRangeValues[1] < ranges.fundSize.max) count++;
    if (advancedFilters.dividendYieldRange[0] > ranges.dividendYield.min || advancedFilters.dividendYieldRange[1] < ranges.dividendYield.max) count++;
    if (advancedFilters.includeLeveragedETFs) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

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
          {/* Category tabs + Mobile filter button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <ETFCategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Mobile filter button - visible only on mobile */}
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 min-h-[44px] border-violet-200 hover:bg-violet-50"
            >
              <FilterIcon className="w-4 h-4" />
              <span>Filtry</span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-violet-600 text-white text-xs px-1.5 py-0.5 min-w-[20px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

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

        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1">
          <ETFComparisonFilters
            etfs={etfs}
            advancedFilters={advancedFilters}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            ranges={ranges}
          />
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="px-0">
          <SheetHeader className="px-4">
            <SheetTitle className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              Pokročilé filtry
              {activeFiltersCount > 0 && (
                <Badge className="bg-violet-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetClose className="absolute right-4 top-3 p-2 rounded-full hover:bg-gray-100">
              <CloseIcon className="w-5 h-5" />
              <span className="sr-only">Zavřít</span>
            </SheetClose>
          </SheetHeader>
          <div className="px-4 pb-6 pt-2">
            <ETFComparisonFilters
              etfs={etfs}
              advancedFilters={advancedFilters}
              onAdvancedFilterChange={handleAdvancedFilterChange}
              ranges={ranges}
            />
          </div>
        </SheetContent>
      </Sheet>

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