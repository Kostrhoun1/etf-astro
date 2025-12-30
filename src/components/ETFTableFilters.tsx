'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon } from '@/components/ui/icons';

interface ETFTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ETFTableFilters: React.FC<ETFTableFiltersProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="mt-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Hledat podle názvu, ISIN, poskytovatele nebo tickeru..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default ETFTableFilters;
