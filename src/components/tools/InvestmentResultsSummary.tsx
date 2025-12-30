import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PiggyBankIcon, TargetIcon, TrendingUpIcon } from '../ui/icons';
import type { CalculationData } from '../../utils/investmentCalculations';

interface InvestmentResultsSummaryProps {
  results: CalculationData[];
}

const InvestmentResultsSummary: React.FC<InvestmentResultsSummaryProps> = ({ results }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  if (!results.length) return null;

  const finalResult = results[results.length - 1];

  return (
    <div className="pt-6 border-t">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 mx-auto group-hover:bg-violet-200 transition-colors hover-scale">
              <PiggyBankIcon className="h-6 w-6 text-violet-700" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-800 transition-colors">Celkem investováno</h4>
            <p className="text-2xl font-bold text-violet-600">
              {formatNumber(finalResult.totalInvested)} Kč
            </p>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex items-center justify-center rounded-full bg-emerald-100 w-12 h-12 mx-auto group-hover:bg-emerald-200 transition-colors hover-scale">
              <TrendingUpIcon className="h-6 w-6 text-emerald-700" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors">Čistý výnos (po dani)</h4>
            <p className="text-2xl font-bold text-emerald-600">
              {formatNumber(finalResult.netGain)} Kč
            </p>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 mx-auto group-hover:bg-violet-200 transition-colors hover-scale">
              <TargetIcon className="h-6 w-6 text-violet-700" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-800 transition-colors">Celková hodnota portfolia</h4>
            <p className="text-2xl font-bold text-violet-600">
              {formatNumber(finalResult.netValue)} Kč
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentResultsSummary;