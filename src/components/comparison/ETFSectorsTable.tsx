import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETFListItem } from '@/types/etf';
import { formatPercentage } from '@/utils/csvParser';

interface ETFSectorsTableProps {
  selectedETFs: ETFListItem[];
}

const ETFSectorsTable: React.FC<ETFSectorsTableProps> = ({
  selectedETFs,
}) => {
  const extendedETFs = selectedETFs as any[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 sektorů</CardTitle>
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
                  {extendedETFs.map((etf) => {
                    const sectorName = etf[`sector_${i}_name`];
                    const sectorWeight = etf[`sector_${i}_weight`];
                    return (
                      <td key={etf.isin} className="p-3">
                        {sectorName ? (
                          <div>
                            <div className="text-sm font-medium">{sectorName}</div>
                            {sectorWeight && (
                              <div className="text-xs text-gray-500">
                                {formatPercentage(sectorWeight)}
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

export default ETFSectorsTable;