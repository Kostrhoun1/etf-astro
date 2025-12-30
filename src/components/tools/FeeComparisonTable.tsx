'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface FeeScenario {
  name: string;
  totalExpenseRatio: number;
  entryFee: number;
  color: string;
}

interface FeeCalculationResult {
  scenario: FeeScenario;
  year: number;
  grossValue: number;
  netValue: number;
  totalFees: number;
  feeImpact: number;
}

interface FeeComparisonTableProps {
  data: FeeCalculationResult[];
  investmentPeriod: number;
}

const FeeComparisonTable: React.FC<FeeComparisonTableProps> = ({ data, investmentPeriod }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  // Získej finální výsledky pro každý scénář
  const finalResults = data.filter(result => result.year === investmentPeriod);

  // Najdi nejlepší scénář (s nejnižšími poplatky)
  const bestScenario = finalResults.reduce((best, current) => 
    current.totalFees < best.totalFees ? current : best
  );

  console.log('Best scenario (lowest fees):', bestScenario);
  console.log('All final results:', finalResults);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Srovnání dopadů poplatků po {investmentPeriod} letech</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scénář</TableHead>
                <TableHead className="text-right">TER (%)</TableHead>
                <TableHead className="text-right">Vstupní poplatek (%)</TableHead>
                <TableHead className="text-right">Konečná hodnota (Kč)</TableHead>
                <TableHead className="text-right">Celkové poplatky (Kč)</TableHead>
                <TableHead className="text-right">Přeplatek oproti nejlepšímu (Kč)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalResults.map((result) => {
                const feeOverpayment = result.totalFees - bestScenario.totalFees;
                
                console.log(`${result.scenario.name}: Best fees=${bestScenario.totalFees}, Current fees=${result.totalFees}, Overpayment=${feeOverpayment}`);
                
                return (
                  <TableRow key={result.scenario.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: result.scenario.color }}
                        />
                        {result.scenario.name}
                        {result.scenario.name === bestScenario.scenario.name && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Nejlepší
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {result.scenario.totalExpenseRatio}%
                    </TableCell>
                    <TableCell className="text-right">
                      {result.scenario.entryFee}%
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(result.netValue)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatNumber(result.totalFees)}
                    </TableCell>
                    <TableCell className="text-right">
                      {feeOverpayment > 0 ? (
                        <span className="text-red-600">{formatNumber(feeOverpayment)}</span>
                      ) : (
                        <span className="text-green-600">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Klíčové pozorování:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Vstupní poplatky</strong> se uplatňují pouze jednou, ale snižují počáteční investici</li>
            <li>• <strong>TER</strong> působí každý rok a má compound efekt</li>
            <li>• ETF fondy typicky nemají vstupní poplatky a mají nízký TER (0,1-0,5%)</li>
            <li>• Aktivní fondy mívají vyšší TER (1-3%) a někdy i vstupní poplatky</li>
            <li>• <strong>Nejlepší scénář</strong> má nejnižší celkové poplatky - ostatní ukazují přeplatek</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeeComparisonTable;