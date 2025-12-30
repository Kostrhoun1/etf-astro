import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETF } from '@/types/etf';
import { formatPercentage } from '@/utils/csvParser';

interface ETFHoldingsTableProps {
  selectedETFs: ETF[];
}

const ETFHoldingsTable: React.FC<ETFHoldingsTableProps> = ({
  selectedETFs,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 pozic v portfoliu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Pozice</th>
                {selectedETFs.map((etf) => (
                  <th key={etf.isin} className="text-left p-3 font-medium min-w-[200px]">
                    {etf.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 font-medium">#{i}</td>
                  {selectedETFs.map((etf) => {
                    const holdingName = etf[`holding_${i}_name` as keyof ETF] as string;
                    const holdingWeight = etf[`holding_${i}_weight` as keyof ETF] as number;
                    return (
                      <td key={etf.isin} className="p-3">
                        {holdingName ? (
                          <div>
                            <div className="text-sm font-medium">{holdingName}</div>
                            {holdingWeight && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(holdingWeight)}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ETFHoldingsTable;