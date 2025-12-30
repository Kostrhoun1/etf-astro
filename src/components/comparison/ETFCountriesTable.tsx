import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETF } from '@/types/etf';
import { formatPercentage } from '@/utils/csvParser';

interface ETFCountriesTableProps {
  selectedETFs: ETF[];
}

const ETFCountriesTable: React.FC<ETFCountriesTableProps> = ({
  selectedETFs,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 zemí</CardTitle>
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
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b">
                  <td className="p-3 font-medium">#{i}</td>
                  {selectedETFs.map((etf) => {
                    const countryName = etf[`country_${i}_name` as keyof ETF] as string;
                    const countryWeight = etf[`country_${i}_weight` as keyof ETF] as number;
                    return (
                      <td key={etf.isin} className="p-3">
                        {countryName ? (
                          <div>
                            <div className="text-sm font-medium">{countryName}</div>
                            {countryWeight && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(countryWeight)}
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

export default ETFCountriesTable;