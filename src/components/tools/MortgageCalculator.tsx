'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { HomeIcon, CalendarIcon, InfoIcon, PiggyBankIcon, CalculatorIcon, PercentIcon, DollarIcon } from '../ui/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface MortgageData {
  month: number;
  year: number;
  remainingDebt: number;
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  totalInterest: number;
}

const MortgageCalculator: React.FC = () => {
  const [propertyValue, setPropertyValue] = useState<number>(4500000);
  const [loanAmount, setLoanAmount] = useState<number>(3600000);
  const [interestRate, setInterestRate] = useState<number>(5.5);
  const [loanPeriod, setLoanPeriod] = useState<number>(25);

  const downPayment = propertyValue - loanAmount;
  const ltv = (loanAmount / propertyValue) * 100;
  const downPaymentPercentage = (downPayment / propertyValue) * 100;

  const mortgageData = useMemo(() => {
    if (!loanAmount || !interestRate || !loanPeriod || loanAmount <= 0) return [];

    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanPeriod * 12;
    
    // Calculate monthly payment using mortgage formula
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const data: MortgageData[] = [];
    let remainingDebt = loanAmount;
    let totalInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remainingDebt * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      remainingDebt = Math.max(0, remainingDebt - principalPayment);
      totalInterest += interestPayment;

      data.push({
        month,
        year: Math.ceil(month / 12),
        remainingDebt,
        monthlyPayment,
        principalPayment,
        interestPayment,
        totalInterest
      });
    }

    return data;
  }, [loanAmount, interestRate, loanPeriod]);

  const summary = useMemo(() => {
    if (mortgageData.length === 0) return null;

    const monthlyPayment = mortgageData[0].monthlyPayment;
    const totalPayments = monthlyPayment * mortgageData.length;
    const totalInterest = mortgageData[mortgageData.length - 1].totalInterest;

    return {
      monthlyPayment,
      totalPayments,
      totalInterest,
      interestPercentage: (totalInterest / loanAmount) * 100,
      totalCost: propertyValue
    };
  }, [mortgageData, loanAmount, propertyValue]);

  const chartData = useMemo(() => {
    return mortgageData
      .filter((_, index) => index % 12 === 0 || index === mortgageData.length - 1)
      .map(item => ({
        year: item.year,
        'Zbývající dluh': Math.round(item.remainingDebt),
        'Zaplacené úroky': Math.round(item.totalInterest)
      }));
  }, [mortgageData]);

  const pieData = useMemo(() => {
    if (!summary) return [];
    
    return [
      { name: 'Vlastní kapitál', value: downPayment, color: '#10B981' },
      { name: 'Úvěr (jistina)', value: loanAmount, color: '#3B82F6' },
      { name: 'Úroky z úvěru', value: summary.totalInterest, color: '#EF4444' }
    ];
  }, [downPayment, loanAmount, summary]);

  const yearlyData = useMemo(() => {
    if (mortgageData.length === 0) return [];
    
    const yearlyBreakdown = [];
    for (let year = 1; year <= loanPeriod; year++) {
      const yearData = mortgageData.filter(item => item.year === year);
      if (yearData.length > 0) {
        const yearlyPrincipal = yearData.reduce((sum, item) => sum + item.principalPayment, 0);
        const yearlyInterest = yearData.reduce((sum, item) => sum + item.interestPayment, 0);
        
        yearlyBreakdown.push({
          year,
          'Úmor jistiny': Math.round(yearlyPrincipal),
          'Úrok': Math.round(yearlyInterest)
        });
      }
    }
    
    return yearlyBreakdown.filter((_, index) => index % 5 === 0 || index === yearlyBreakdown.length - 1);
  }, [mortgageData, loanPeriod]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-2xl">
              Hypoteční kalkulačka
            </CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Spočítejte si měsíční splátky hypotéky a celkové náklady na bydlení
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Input Section */}
            <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
                  <HomeIcon className="h-5 w-5 text-violet-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Parametry hypotéky</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="propertyValue">Hodnota nemovitosti (Kč)</Label>
                  <Input
                    id="propertyValue"
                    type="number"
                    value={propertyValue || ''}
                    onChange={(e) => {
                      const newValue = Number(e.target.value) || 0;
                      setPropertyValue(newValue);
                      // Ensure loan amount doesn't exceed property value
                      if (loanAmount > newValue) {
                        setLoanAmount(Math.round(newValue * 0.8));
                      }
                    }}
                    placeholder="4 500 000"
                    min="1000000"
                    max="20000000"
                    step="100000"
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="loanAmount">Výše úvěru (Kč)</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount || ''}
                    onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                    placeholder="3 600 000"
                    min="0"
                    max={propertyValue}
                    step="50000"
                    className="h-10"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    LTV: {ltv.toFixed(1)}% | Vlastní kapitál: {downPayment.toLocaleString()} Kč
                  </p>
                </div>
              </div>
            </div>

            {/* Parametry úvěru */}
            <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.4s]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
                  <PercentIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Parametry úvěru</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="interestRate">Úroková sazba (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate || ''}
                    onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                    placeholder="5.5"
                    min="1"
                    max="15"
                    step="0.1"
                    className="h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="loanPeriod">Doba splatnosti (roky)</Label>
                  <Input
                    id="loanPeriod"
                    type="number"
                    value={loanPeriod || ''}
                    onChange={(e) => setLoanPeriod(Number(e.target.value) || 0)}
                    placeholder="25"
                    min="5"
                    max="40"
                    step="1"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => {}} 
            className="w-full hover-scale bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white font-semibold py-3 mt-4 animate-fade-in [animation-delay:0.6s]"
          >
            <CalculatorIcon className="mr-2 h-5 w-5" />
            Spočítat hypotéku
          </Button>
          
          {/* Rozbalovací předpoklady */}
          <details className="mt-6 border border-orange-200 rounded-lg">
            <summary className="p-4 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors rounded-lg">
              <span className="font-semibold text-orange-900">📋 Předpoklady hypoteční kalkulačky (klikněte pro rozbalení)</span>
            </summary>
            <div className="p-4 border-t border-orange-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-orange-900">Výpočet splátek:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Anuita:</strong> Rovnoměrné měsíční splátky</li>
                    <li>• <strong>Úročení:</strong> Měsíční kapitalizace úroků</li>
                    <li>• <strong>Splátka:</strong> Úrok + umořování jistiny</li>
                    <li>• <strong>Fixace:</strong> Stálá úroková sazba po celou dobu</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-900">Omezení a upozornění:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Orientační výpočet:</strong> Reálné podmínky se liší</li>
                    <li>• <strong>Schválení úvěru:</strong> Závisí na bonnitě klienta</li>
                    <li>• <strong>Změny sazeb:</strong> Při refixaci se mění</li>
                    <li>• <strong>Dodatečné náklady:</strong> Pojištění, poplatky, daně</li>
                    <li>• <strong>Individuální nabídka:</strong> Každá banka má jiné podmínky</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-900">Předčasné splacení:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• <strong>Kdykoli možné:</strong> Hypotéku můžete doplatit kdykoli</li>
                    <li>• <strong>Zdarma na konci fixace:</strong> Bez poplatků při refixaci</li>
                    <li>• <strong>Zdarma v těžkých situacích:</strong> Nemoc, invalidita apod.</li>
                    <li>• <strong>Jinak s poplatkem:</strong> Banka má nárok na úhradu nákladů</li>
                  </ul>
                </div>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      {summary && loanAmount > 0 && (
        <>
          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex items-center justify-center rounded-full bg-emerald-100 w-12 h-12 mx-auto group-hover:bg-emerald-200 transition-colors hover-scale">
                  <DollarIcon className="h-6 w-6 text-emerald-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors">Měsíční splátka</h4>
                <p className="text-2xl font-bold text-emerald-600">
                  {Math.round(summary.monthlyPayment).toLocaleString()} Kč
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex items-center justify-center rounded-full bg-blue-100 w-12 h-12 mx-auto group-hover:bg-blue-200 transition-colors hover-scale">
                  <CalculatorIcon className="h-6 w-6 text-blue-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-800 transition-colors">Celkem zaplatíte</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(summary.totalPayments).toLocaleString()} Kč
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex items-center justify-center rounded-full bg-red-100 w-12 h-12 mx-auto group-hover:bg-red-200 transition-colors hover-scale">
                  <PercentIcon className="h-6 w-6 text-red-700" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-800 transition-colors">Celkem úroky</h4>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(summary.totalInterest).toLocaleString()} Kč
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Debt Progress Chart */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                  Průběh splácení hypotéky
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Rok', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${(value / 1000000).toFixed(2)} mil. Kč`]}
                      labelFormatter={(label) => `Rok ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Zbývající dluh" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Zaplacené úroky" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBankIcon className="h-5 w-5 text-green-600" />
                  Struktura celkových nákladů
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${(value / 1000000).toFixed(2)} mil. Kč`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Amortizační tabulka */}
          <Card className="shadow-lg border-0">
            <CardContent>
              <details className="border border-gray-200 rounded-lg">
                <summary className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg">
                  <span className="font-semibold text-gray-900">📊 Detailní průběh splácení po měsících (klikněte pro rozbalení)</span>
                </summary>
                <div className="p-4 border-t border-gray-200 max-h-96 overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-900">Měsíc</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-900">Splátka</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-900">Úrok</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-900">Jistina</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-900">Zbývá dluh</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-900">Celkem úroky</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mortgageData.map((row, index) => (
                          <tr key={index} className={index % 12 === 11 ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-2 text-gray-900">
                              {row.month} {index % 12 === 11 && `(rok ${row.year})`}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {Math.round(row.monthlyPayment).toLocaleString()} Kč
                            </td>
                            <td className="px-3 py-2 text-right text-red-600">
                              {Math.round(row.interestPayment).toLocaleString()} Kč
                            </td>
                            <td className="px-3 py-2 text-right text-blue-600">
                              {Math.round(row.principalPayment).toLocaleString()} Kč
                            </td>
                            <td className="px-3 py-2 text-right text-gray-900">
                              {Math.round(row.remainingDebt).toLocaleString()} Kč
                            </td>
                            <td className="px-3 py-2 text-right text-orange-600">
                              {Math.round(row.totalInterest).toLocaleString()} Kč
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
                    <p><strong>Vysvětlivky:</strong></p>
                    <ul className="mt-2 space-y-1">
                      <li>• <span className="text-red-600 font-semibold">Úrok</span> - měsíční úroky z aktuálního zůstatku</li>
                      <li>• <span className="text-blue-600 font-semibold">Jistina</span> - část splátky snižující dluh</li>
                      <li>• <span className="bg-blue-50 px-1 rounded">Modré řádky</span> - konec kalendářního roku</li>
                    </ul>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>

          {/* Yearly Payment Breakdown */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-600" />
                Roční struktura splátek - úroky vs. jistina
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                Zobrazeno každý 5. rok - ukazuje, jak se postupně snižují úroky a zvyšuje úmor jistiny
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Rok splácení', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k Kč`}
                    width={90}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${Math.round(value).toLocaleString()} Kč`,
                      name === 'Úmor jistiny' ? 'Zaplaceno na jistině' : 'Zaplaceno na úrocích'
                    ]}
                    labelFormatter={(label) => `${label}. rok splácení`}
                    separator=": "
                  />
                  <Bar 
                    dataKey="Úmor jistiny" 
                    stackId="a" 
                    fill="#3B82F6" 
                    name="Úmor jistiny"
                  />
                  <Bar 
                    dataKey="Úrok" 
                    stackId="a" 
                    fill="#EF4444" 
                    name="Úroky"
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Legenda s vysvětlením */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-900">Vysvětlení grafu:</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                    <span className="text-gray-700"><strong>Červená (úroky):</strong> Kolik zaplatíte bance za půjčku</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <span className="text-gray-700"><strong>Modrá (jistina):</strong> Kolik skutečně splatíte z dluhu</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Na začátku platíte více na úrocích, postupně se poměr obrací ve prospěch jistiny
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loanAmount <= 0 && (
        <Card className="shadow-lg border-0 bg-yellow-50">
          <CardContent className="text-center py-8">
            <div className="text-yellow-600 mb-4">
              <InfoIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 mb-2">
              Neplatná výše úvěru
            </h3>
            <p className="text-yellow-700">
              Zadejte validní výši úvěru pro výpočet hypotéky.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MortgageCalculator;