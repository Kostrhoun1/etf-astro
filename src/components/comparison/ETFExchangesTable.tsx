import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ETF } from '@/types/etf';

interface ETFExchangesTableProps {
  selectedETFs: ETF[];
}

const ETFExchangesTable: React.FC<ETFExchangesTableProps> = ({
  selectedETFs,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Obchodované burzy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Burza</th>
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
                  <td className="p-3 font-medium">Burza #{i}</td>
                  {selectedETFs.map((etf) => {
                    const exchangeName = etf[`exchange_${i}_name` as keyof ETF] as string;
                    const exchangeCurrency = etf[`exchange_${i}_currency` as keyof ETF] as string;
                    const exchangeTicker = etf[`exchange_${i}_ticker` as keyof ETF] as string;
                    const exchangeBloomberg = etf[`exchange_${i}_bloomberg` as keyof ETF] as string;
                    const exchangeReuters = etf[`exchange_${i}_reuters` as keyof ETF] as string;
                    
                    return (
                      <td key={etf.isin} className="p-3">
                        {exchangeName ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{exchangeName}</div>
                            {exchangeCurrency && (
                              <div className="text-xs text-gray-500">Měna: {exchangeCurrency}</div>
                            )}
                            {exchangeTicker && (
                              <div className="text-xs text-blue-600">Ticker: {exchangeTicker}</div>
                            )}
                            {exchangeBloomberg && (
                              <div className="text-xs text-gray-500">Bloomberg: {exchangeBloomberg}</div>
                            )}
                            {exchangeReuters && (
                              <div className="text-xs text-gray-500">Reuters: {exchangeReuters}</div>
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

export default ETFExchangesTable;