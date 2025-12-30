'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CalculatorIcon, DollarIcon, UsersIcon } from '../ui/icons';
import { calculateNetSalary } from '../../utils/netSalaryCalculations'
import type { NetSalaryData } from '../../utils/netSalaryCalculations';
import NetSalaryResults from './NetSalaryResults';

const NetSalaryCalculator: React.FC = () => {
  const [grossSalary, setGrossSalary] = useState<number>(45000);
  const [isPensioner, setIsPensioner] = useState<boolean>(false);
  const [hasChildren, setHasChildren] = useState<boolean>(false);
  const [numberOfChildren, setNumberOfChildren] = useState<number>(0);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [results, setResults] = useState<NetSalaryData | null>(null);

  const handleCalculate = () => {
    const params = {
      grossSalary,
      isPensioner,
      hasChildren,
      numberOfChildren: hasChildren ? numberOfChildren : 0,
      isStudent,
      hasDisability
    };
    
    const calculatedResults = calculateNetSalary(params);
    setResults(calculatedResults);
  };

  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-2xl">Kalkulačka čisté mzdy 2026</CardTitle>
          </div>
          <CardDescription className="">
            Spočítejte si čistou mzdu podle aktuální české legislativy pro rok 2026
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Základní údaje */}
            <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.2s]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
                  <DollarIcon className="h-5 w-5 text-violet-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">Základní údaje</h3>
              </div>
              <div>
                <Label htmlFor="grossSalary" className="">Hrubá mzda (Kč/měsíc)</Label>
                <Input
                  id="grossSalary"
                  type="number"
                  value={grossSalary || ''}
                  onChange={(e) => setGrossSalary(Number(e.target.value) || 0)}
                  min="1000"
                  step="1000"
                  className="mt-1 h-9"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Min. mzda 2026: 20 800 Kč
                </p>
              </div>
            </div>

            {/* Slevy na dani a pojištění */}
            <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover animate-fade-in [animation-delay:0.4s]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
                  <UsersIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Slevy a pojištění</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPensioner"
                    checked={isPensioner}
                    onChange={(e) => setIsPensioner(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPensioner" className="">Pracující důchodce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="hasChildren" className="">Mám děti</Label>
                </div>
                {hasChildren && (
                  <div>
                    <Label htmlFor="numberOfChildren" className="">Počet dětí</Label>
                    <Input
                      id="numberOfChildren"
                      type="number"
                      value={numberOfChildren || ''}
                      onChange={(e) => setNumberOfChildren(Number(e.target.value) || 0)}
                      min="0"
                      max="10"
                      className="mt-1 h-9"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasDisability"
                    checked={hasDisability}
                    onChange={(e) => setHasDisability(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="hasDisability" className="">Invalidita/ZTP</Label>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full hover-scale bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 mb-4 animate-fade-in [animation-delay:0.6s]">
            <CalculatorIcon className="mr-2 h-5 w-5" />
            Vypočítat čistou mzdu
          </Button>

          {/* Rozbalovací předpoklady */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg">
              <span className="font-semibold text-gray-900 text-sm">📋 Předpoklady kalkulačky mzdy</span>
            </summary>
            <div className="p-3 border-t border-gray-200">
              <h4 className="font-semibold mb-2 text-gray-900 text-sm">📊 Aktuální sazby pro rok 2026</h4>
              <div className="grid md:grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <h5 className="font-semibold mb-1">Pojistné zaměstnance:</h5>
                  <ul className="space-y-0.5 text-gray-700">
                    <li>• Sociální pojištění: 7,1%</li>
                    <li>• Zdravotní pojištění: 4,5%</li>
                    <li>• Celkem: 11,6%</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Daň z příjmů:</h5>
                  <ul className="space-y-0.5 text-gray-700">
                    <li>• Základní sazba: 15%</li>
                    <li>• Nad 139 671 Kč/měsíc: 23%</li>
                    <li>• Sleva na poplatníka: 2 570 Kč/měsíc</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="font-semibold mb-2 text-gray-900 text-sm">⚙️ Předpoklady výpočtu</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• <strong>Daň z příjmu:</strong> Počítá se z hrubé mzdy, progresivní zdanění od 139 671 Kč/měsíc</li>
                <li>• <strong>Důchodci:</strong> Sleva na důchodovém (6,5%), platí nemocenské (0,6%) + zdravotní (4,5%)</li>
                <li>• <strong>Slevy na děti:</strong> Progresivní - 1. dítě 1 267 Kč, 2. dítě 1 860 Kč, 3.+ dítě 2 320 Kč</li>
                <li>• <strong>Superhrubá mzda:</strong> Zrušena od roku 2021, daň se počítá z hrubé mzdy</li>
                <li>• <strong>Nezahrnuje:</strong> Stravenky, benefity, nadpracovna</li>
              </ul>
            </div>
          </details>
        </CardContent>
      </Card>

      {results && (
        <NetSalaryResults results={results} />
      )}
    </div>
  );
};

export default NetSalaryCalculator;