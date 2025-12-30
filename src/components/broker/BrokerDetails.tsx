'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon, CalculatorIcon, ShieldIcon, TrendingUpIcon } from '@/components/ui/icons';
import { brokers } from '../../data/brokerData';

const BrokerDetails: React.FC = () => {
  return (
    <Accordion type="single" collapsible className="space-y-4">
      {brokers.map((broker) => (
        <AccordionItem key={broker.id} value={broker.id} className="border rounded-lg">
          <AccordionTrigger className="px-6 hover:no-underline">
            <div className="flex items-center gap-4">
              <img
                src={broker.logo}
                alt={`${broker.name} logo - online broker pro nákup ETF fondů`}
                className="w-8 h-8 rounded object-cover bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="4" fill="#f3f4f6"/><text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="10" fill="#6b7280">${broker.name.charAt(0)}</text></svg>`)}`;
                }}
              />
              <span className="font-semibold text-lg">{broker.name}</span>
              <Badge variant="outline" className="ml-auto">
                {broker.rating} ⭐
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldIcon className="text-blue-600" />
                  <h4 className="font-semibold">Regulace a ochrana</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Regulace:</strong> {broker.regulation}</div>
                  <div><strong>Ochrana:</strong> {broker.protection}</div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <CalculatorIcon className="text-green-600" />
                  <h4 className="font-semibold">Poplatky</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>ETF poplatek:</strong> {broker.etfFee}</div>
                  <div><strong>Správa účtu:</strong> {broker.managementFee}</div>
                  <div><strong>Konverze měn:</strong> {broker.fxFee}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUpIcon className="text-purple-600" />
                  <h4 className="font-semibold">Funkce a podpora</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Frakční ETF:</span>
                    {broker.fractional ? <CheckIcon /> : <XIcon />}
                  </div>
                  <div className="flex justify-between">
                    <span>Česká podpora:</span>
                    {broker.czSupport ? <CheckIcon /> : <XIcon />}
                  </div>
                  <div><strong>Zdanění CZ dividend:</strong> {broker.czDividends}</div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default BrokerDetails;