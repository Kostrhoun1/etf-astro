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

// Mobile card component for single ETF
const ETFComparisonCard: React.FC<{
  etf: ETF;
  data: ComparisonData[];
  getRowLabel: (row: ComparisonData) => string;
}> = ({ etf, data, getRowLabel }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="mb-4 pb-3 border-b border-gray-100">
      <h4 className="font-semibold text-gray-900 line-clamp-2">{etf.name}</h4>
      <p className="text-sm text-gray-500 font-mono mt-1">{etf.isin}</p>
    </div>
    <dl className="space-y-3">
      {data.map((row, index) => {
        const value = etf[row.key as keyof ETF];
        const formattedValue = row.format ? row.format(value, etf) : (value || '-');
        return (
          <div key={index} className="flex justify-between items-center">
            <dt className="text-sm text-gray-500">{getRowLabel(row)}</dt>
            <dd className={`font-medium ${row.className || ''}`}>{formattedValue}</dd>
          </div>
        );
      })}
    </dl>
  </div>
);

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
        {/* Mobile: Stack layout */}
        <div className="md:hidden space-y-4">
          {selectedETFs.map((etf) => (
            <ETFComparisonCard
              key={etf.isin}
              etf={etf}
              data={data}
              getRowLabel={getRowLabel}
            />
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
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