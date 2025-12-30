'use client';

import React from 'react';

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

interface FeeCalculatorResultsProps {
  finalResults: FeeCalculationResult[];
}

const FeeCalculatorResults: React.FC<FeeCalculatorResultsProps> = ({ finalResults }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {finalResults.map((result) => (
        <div key={result.scenario.name} className="p-4 rounded-lg border" style={{ borderColor: result.scenario.color }}>
          <h4 className="font-semibold mb-2" style={{ color: result.scenario.color }}>
            {result.scenario.name}
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Konečná hodnota:</span>
              <span className="font-medium ml-2">{formatNumber(result.netValue)} Kč</span>
            </div>
            <div>
              <span className="text-gray-600">Celkové poplatky:</span>
              <span className="font-medium ml-2">{formatNumber(result.totalFees)} Kč</span>
            </div>
            <div>
              <span className="text-gray-600">Ztráta kvůli poplatkům:</span>
              <span className="font-medium ml-2">{formatNumber(result.feeImpact)} Kč</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeeCalculatorResults;