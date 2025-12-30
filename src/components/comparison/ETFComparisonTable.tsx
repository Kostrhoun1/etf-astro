import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETF } from '@/types/etf';

interface ComparisonData {
  label: string;
  key: string;
  format?: (value: any, etf?: ETF) => string;
  className?: string;
}

interface ETFComparisonTableProps {
  title: string;
  data: ComparisonData[];
  selectedETFs: ETF[];
}

const ETFComparisonTable: React.FC<ETFComparisonTableProps> = ({
  title,
  data,
  selectedETFs,
}) => {
  // Pokud jde o poplatky a velikost fondu, upravíme popisek sloupce Velikost fondu
  const getRowLabel = (row: ComparisonData) => {
    if (row.key === 'fund_size_numeric') {
      return 'Velikost fondu (mil.)';
    }
    return row.label;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Parametr</th>
                {selectedETFs.map((etf) => (
                  <th key={etf.isin} className="text-left p-3 font-medium min-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{etf.name}</div>
                      <div className="text-xs text-gray-500">{etf.isin}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 font-medium">{getRowLabel(row)}</td>
                  {selectedETFs.map((etf) => {
                    const value = etf[row.key as keyof ETF];
                    const formattedValue = row.format ? row.format(value, etf) : (value || '-');
                    return (
                      <td key={etf.isin} className={`p-3 ${row.className || ''}`}>
                        {formattedValue}
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

export default ETFComparisonTable;