'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from '../ui/button';
import { InfoIcon } from '../ui/icons';

const MonteCarloDataSources: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Zdroje dat pro simulaci</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-1 h-auto"
          >
            {isExpanded ? (
              <span className="h-4 w-4 text-blue-600 flex items-center justify-center">▲</span>
            ) : (
              <span className="h-4 w-4 text-blue-600 flex items-center justify-center">▼</span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-blue-800 mb-3">
          Simulace je založena na historických datech z období 1985-2024. Všechny výnosy jsou reálné (po odečtení inflace).
        </p>
        
        {isExpanded && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Průměrné výnosy a volatilita (1985-2024)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-blue-300">
                      <th className="text-left p-2 text-blue-900">Třída aktiv</th>
                      <th className="text-right p-2 text-blue-900">Roční výnos</th>
                      <th className="text-right p-2 text-blue-900">Volatilita</th>
                    </tr>
                  </thead>
                  <tbody className="text-blue-800">
                    <tr className="border-b border-blue-200">
                      <td className="p-2">US velké akcie (S&P 500)</td>
                      <td className="text-right p-2">8,6%</td>
                      <td className="text-right p-2">16,8%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">US malé akcie</td>
                      <td className="text-right p-2">7,6%</td>
                      <td className="text-right p-2">20,5%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">Akcie rozvíjejících se trhů</td>
                      <td className="text-right p-2">7,3%</td>
                      <td className="text-right p-2">23,1%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">Mezinárodní rozvinuté akcie</td>
                      <td className="text-right p-2">6,2%</td>
                      <td className="text-right p-2">19,4%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">Kanadské akcie</td>
                      <td className="text-right p-2">6,0%</td>
                      <td className="text-right p-2">17,2%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">REITs (nemovitosti)</td>
                      <td className="text-right p-2">5,8%</td>
                      <td className="text-right p-2">18,7%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">US vysoce výnosné dluhopisy</td>
                      <td className="text-right p-2">4,8%</td>
                      <td className="text-right p-2">8,9%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">US vysokokvalitní dluhopisy</td>
                      <td className="text-right p-2">4,2%</td>
                      <td className="text-right p-2">5,4%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">Mezinárodní dluhopisy</td>
                      <td className="text-right p-2">2,6%</td>
                      <td className="text-right p-2">10,8%</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-2">Zlato</td>
                      <td className="text-right p-2">2,3%</td>
                      <td className="text-right p-2">16,2%</td>
                    </tr>
                    <tr>
                      <td className="p-2">Hotovost (T-bills)</td>
                      <td className="text-right p-2">0,4%</td>
                      <td className="text-right p-2">1,5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded">
              <p className="font-medium mb-1">Důležité upozornění:</p>
              <p>
                Simulace respektuje historické korelace mezi aktivy z období 1985-2024. 
                Korelace blízké 1,0 znamenají podobné pohyby, korelace blízké 0 znamenají nezávislé pohyby, 
                negativní korelace znamenají opačné pohyby. Minulé výsledky nezaručují budoucí výkonnost.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonteCarloDataSources;