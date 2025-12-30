'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import CurrencyToggle from '@/components/ui/CurrencyToggle';

interface ETFComparisonHeaderProps {
  selectedCount: number;
  onShowDetailedComparison: () => void;
  onClearAll: () => void;
}

const ETFComparisonHeader: React.FC<ETFComparisonHeaderProps> = ({ 
  selectedCount, 
  onShowDetailedComparison, 
  onClearAll 
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex justify-end gap-3">
      <Button variant="outline" onClick={onClearAll}>
        Vymazat výběr ({selectedCount})
      </Button>
      {selectedCount >= 2 && (
        <Button onClick={onShowDetailedComparison}>
          Porovnat vybrané fondy
        </Button>
      )}
    </div>
  );
};

export default ETFComparisonHeader;