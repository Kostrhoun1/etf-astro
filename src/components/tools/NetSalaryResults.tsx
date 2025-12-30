import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from '../ui/badge';
import { TrendingDownIcon, CalculatorIcon, DollarIcon, TrendingUpIcon, BuildingIcon, PieChartIcon } from '../ui/icons';
import { formatCurrency, formatPercentage } from '../../utils/netSalaryCalculations';
import type { NetSalaryData } from '../../utils/netSalaryCalculations';

interface NetSalaryResultsProps {
  results: NetSalaryData;
}

const NetSalaryResults: React.FC<NetSalaryResultsProps> = ({ results }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(Math.round(num));
  };

  const getEfficiencyColor = (rate: number) => {
    if (rate < 0.2) return 'text-green-600';
    if (rate < 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (rate: number) => {
    if (rate < 0.2) return { text: 'Velmi dobré', variant: 'default' as const };
    if (rate < 0.3) return { text: 'Průměrné', variant: 'secondary' as const };
    return { text: 'Vysoké zatížení', variant: 'destructive' as const };
  };

  const efficiency = getEfficiencyBadge(results.taxEffectiveRate);

  return (
    <div className="space-y-6">
      {/* Hlavní výsledek */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalculatorIcon className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-gray-900">Výsledek výpočtu čisté mzdy</CardTitle>
                <p className="text-sm text-gray-600">
                  Hrubá mzda: {formatCurrency(results.grossSalary)} → 
                  Čistá mzda: {formatCurrency(results.netSalary)}
                </p>
              </div>
            </div>
            <Badge variant={efficiency.variant} className="text-sm">
              {efficiency.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Čistá mzda</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(results.netSalary)}</p>
              <p className="text-xs text-gray-500">
                {((results.netSalary / results.grossSalary) * 100).toFixed(1)}% z hrubé mzdy
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Celkové odvody</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(results.totalInsurance + results.netTax)}
              </p>
              <p className="text-xs text-gray-500">
                {formatPercentage(results.taxEffectiveRate)} efektivní sazba
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Náklady zaměstnavatele</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(results.employerCosts)}</p>
              <p className="text-xs text-gray-500">
                +{((results.employerCosts - results.grossSalary) / results.grossSalary * 100).toFixed(1)}% k hrubé mzdě
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailní rozdělení */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Odvody zaměstnance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDownIcon className="h-4 w-4 text-red-600" />
              Odvody zaměstnance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sociální pojištění (6,5%)</span>
                <span className="font-semibold">{formatCurrency(results.socialInsurance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Zdravotní pojištění (4,5%)</span>
                <span className="font-semibold">{formatCurrency(results.healthInsurance)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Celkem pojistné</span>
                  <span className="font-bold text-red-600">{formatCurrency(results.totalInsurance)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daň z příjmů */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarIcon className="h-4 w-4 text-orange-600" />
              Daň z příjmů
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daňová sazba</span>
                <span className="font-semibold">{formatPercentage(results.taxRate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Daň před slevami</span>
                <span className="font-semibold">{formatCurrency(results.incomeTax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Slevy na dani</span>
                <span className="font-semibold text-green-600">-{formatCurrency(results.taxDeductions)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Čistá daň</span>
                  <span className="font-bold text-orange-600">{formatCurrency(results.netTax)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slevy na dani - pouze pokud existují */}
      {results.breakdown.totalTaxCredits > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
              Slevy na dani
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {results.breakdown.monthlyTaxCredit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleva na poplatníka</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(results.breakdown.monthlyTaxCredit)}
                    </span>
                  </div>
                )}
                {results.breakdown.childTaxCredit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleva na děti</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(results.breakdown.childTaxCredit)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {results.breakdown.studentTaxCredit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleva pro studenta</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(results.breakdown.studentTaxCredit)}
                    </span>
                  </div>
                )}
                {results.breakdown.disabilityTaxCredit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleva ZTP/ZTP-P</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(results.breakdown.disabilityTaxCredit)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Celkem slevy</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(results.breakdown.totalTaxCredits)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Náklady zaměstnavatele */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BuildingIcon className="h-4 w-4 text-blue-600" />
            Celkové náklady zaměstnavatele
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hrubá mzda zaměstnance</span>
              <span className="font-semibold">{formatCurrency(results.grossSalary)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sociální pojištění (24,8%)</span>
              <span className="font-semibold">
                {formatCurrency(results.grossSalary * 0.248)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Zdravotní pojištění (9%)</span>
              <span className="font-semibold">
                {formatCurrency(results.grossSalary * 0.09)}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Celkové náklady</span>
                <span className="font-bold text-blue-600">{formatCurrency(results.employerCosts)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiky */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-purple-600" />
            Statistiky a srovnání
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Efektivní zatížení:</h4>
              <p className={`text-2xl font-bold ${getEfficiencyColor(results.taxEffectiveRate)}`}>
                {formatPercentage(results.taxEffectiveRate)}
              </p>
              <p className="text-xs text-gray-600">z hrubé mzdy</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Podíl čisté mzdy:</h4>
              <p className="text-2xl font-bold text-green-600">
                {((results.netSalary / results.grossSalary) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">z hrubé mzdy</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Ročně čistá:</h4>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(results.netSalary * 12)}
              </p>
              <p className="text-xs text-gray-600">za celý rok</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Tipy pro optimalizaci:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Využijte slevy na dani za děti, studium nebo zdravotní postižení</li>
              <li>• Zvažte příspěvky zaměstnavatele na důchodové spoření nebo životní pojištění</li>
              <li>• Pro důchodce je výhodné pracovat kvůli 0% sociálnímu pojištění</li>
              <li>• Vysoké příjmy nad 139 671 Kč/měsíc podléhají 23% dani</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetSalaryResults;