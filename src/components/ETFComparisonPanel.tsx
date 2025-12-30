'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloseIcon, PieChartIcon } from '@/components/ui/icons';
import type { ETF } from '@/types/etf';
import { formatPercentage } from '@/utils/csvParser';

interface ETFComparisonPanelProps {
  selectedETFs: ETF[];
  onRemoveETF: (isin: string) => void;
  onClearAll: () => void;
  onShowComparison: () => void;
}

const ETFComparisonPanel: React.FC<ETFComparisonPanelProps> = ({
  selectedETFs,
  onRemoveETF,
  onClearAll,
  onShowComparison,
}) => {
  if (selectedETFs.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 shadow-lg z-50 bg-white border-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PieChartIcon />
            Porovnání ETF ({selectedETFs.length}/3)
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Vymazat vše
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {selectedETFs.map((etf) => (
            <div key={etf.isin} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{etf.name}</div>
                <div className="text-xs text-gray-500">{etf.isin}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {etf.category === 'Páková ETF' && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200 font-semibold">
                      PÁKOVÁ
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    TER: {formatPercentage(etf.ter_numeric)}
                  </Badge>
                  {etf.return_1y && (
                    <Badge variant="outline" className="text-xs">
                      1Y: {formatPercentage(etf.return_1y)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveETF(etf.isin)}
                className="ml-2 h-8 w-8 p-0"
              >
                <CloseIcon />
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={onShowComparison}
          className="w-full"
          disabled={selectedETFs.length < 2}
        >
          Zobrazit detailní porovnání
          {selectedETFs.length < 2 && (
            <span className="ml-2 text-xs">(min. 2 fondy)</span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ETFComparisonPanel;
