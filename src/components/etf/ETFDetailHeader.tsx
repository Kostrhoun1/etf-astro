'use client';

import React from 'react';
import type { ETF } from '@/types/etf';
import { Badge } from '@/components/ui/badge';
import ETFRating from '@/components/ETFRating';
import CurrencyToggle from '@/components/ui/CurrencyToggle';

interface ETFDetailHeaderProps {
  etf: ETF;
}

const ETFDetailHeader: React.FC<ETFDetailHeaderProps> = ({ etf }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          {/* H1 moved to server component in page.tsx - SEO critical */}
          <div className="mb-4">
            <ETFRating etf={etf} showDescription size="lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            {etf.degiro_free && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                DEGIRO Free
              </Badge>
            )}
            {etf.category === 'Páková ETF' && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-semibold">
                PÁKOVÁ ETF
              </Badge>
            )}
            <Badge variant="outline">
              {etf.category}
            </Badge>
            <Badge variant="outline">
              {etf.fund_currency}
            </Badge>
            <Badge variant="outline">
              {etf.distribution_policy}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="hidden md:block">
            <CurrencyToggle />
          </div>
        </div>
      </div>
      
      <div className="flex justify-center md:hidden mt-4">
        <CurrencyToggle />
      </div>
    </div>
  );
};

export default ETFDetailHeader;