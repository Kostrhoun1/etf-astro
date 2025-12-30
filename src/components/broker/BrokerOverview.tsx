'use client';

import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon, ExternalLinkIcon } from '@/components/ui/icons';
import { brokers } from '../../data/brokerData';

const BrokerOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {brokers.map((broker) => (
        <Card key={broker.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <img
                src={broker.logo}
                alt={`${broker.name} logo - online broker pro nákup ETF fondů`}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#f3f4f6"/><text x="24" y="28" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">${broker.name.charAt(0)}</text></svg>`)}`;
                }}
              />
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  {broker.name}
                  {broker.czSupport && <Badge variant="outline" className="text-xs">CZ</Badge>}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    broker.rating >= 90 ? 'bg-green-100 text-green-800' :
                    broker.rating >= 80 ? 'bg-blue-100 text-blue-800' :
                    broker.rating >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    broker.rating >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {broker.rating}/100
                  </div>
                  <span className="text-sm text-gray-600">
                    {broker.rating >= 90 ? 'Vynikající' :
                     broker.rating >= 80 ? 'Velmi dobré' :
                     broker.rating >= 70 ? 'Dobré' :
                     broker.rating >= 60 ? 'Průměrné' : 'Slabé'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow flex flex-col">
            <p className="text-gray-600 text-sm leading-relaxed">{broker.description}</p>
            
            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">
                  {broker.etfFee.includes('0%') ? '0%' : 
                   broker.etfFee.includes('bez komisí') ? '0%' :
                   broker.etfFee.includes('1 EUR') ? '1 EUR' :
                   broker.etfFee.includes('0,24') ? '0,24%+' :
                   broker.etfFee.includes('$0.005') ? '$0.005' :
                   broker.etfFee.includes('0,29') ? '0,29%+' :
                   broker.etfFee.split(' ')[0]}
                </div>
                <div className="text-xs text-gray-500">ETF poplatek</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600">{broker.etfCount}</div>
                <div className="text-xs text-gray-500">ETF nabídka</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-purple-600">{broker.minDeposit}</div>
                <div className="text-xs text-gray-500">Min. vklad</div>
              </div>
            </div>

            {/* Pros and Cons Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-1">
                  <CheckIcon />
                  Výhody
                </h4>
                <ul className="space-y-2 min-h-[120px]">
                  {broker.pros.slice(0, 3).map((pro, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></div>
                      <span className="leading-relaxed">{pro}</span>
                    </li>
                  ))}
                  {broker.pros.length > 3 && (
                    <li className="text-xs text-gray-500 italic">
                      +{broker.pros.length - 3} dalších výhod
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-1">
                  <XIcon />
                  Nevýhody
                </h4>
                <ul className="space-y-2 min-h-[120px]">
                  {broker.cons.slice(0, 3).map((con, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></div>
                      <span className="leading-relaxed">{con}</span>
                    </li>
                  ))}
                  {broker.cons.length > 3 && (
                    <li className="text-xs text-gray-500 italic">
                      +{broker.cons.length - 3} dalších nevýhod
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Special features as tags */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Speciální funkce:</h5>
              <div className="flex flex-wrap gap-1">
                {broker.specialFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Detailed review links */}
            {broker.name === 'DEGIRO' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/degiro-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze DEGIRO
                  </Button>
                </a>
              </div>
            )}
            {broker.name === 'XTB' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/xtb-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze XTB
                  </Button>
                </a>
              </div>
            )}
            {broker.name === 'Interactive Brokers' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/interactive-brokers-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze IBKR
                  </Button>
                </a>
              </div>
            )}
            {broker.name === 'Fio e-Broker' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/fio-ebroker-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze Fio
                  </Button>
                </a>
              </div>
            )}
            {broker.name === 'Trading 212' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/trading212-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze Trading 212
                  </Button>
                </a>
              </div>
            )}
            {broker.name === 'Portu' && (
              <div className="border-t pt-4 mt-auto">
                <a href="/portu-recenze">
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ExternalLinkIcon className="mr-2" />
                    Detailní recenze Portu
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BrokerOverview;