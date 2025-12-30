'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, XIcon, StarRating, CreditCardIcon, GlobeIcon, TrendingUpIcon, ShieldIcon, InfoIcon } from '@/components/ui/icons';
import type { Broker } from '../../types/broker';

interface BrokerCardProps {
  broker: Broker;
  isExpanded: boolean;
  onToggle: () => void;
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker, isExpanded, onToggle }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onToggle}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <img
            src={broker.logo}
            alt={`${broker.name} logo - online broker pro nákup ETF fondů${broker.czSupport ? ' s českou podporou' : ''}`}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#f3f4f6"/><text x="24" y="28" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">${broker.name.charAt(0)}</text></svg>`)}`;
            }}
          />
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              {broker.name}
              {broker.czSupport && <Badge variant="outline" className="text-xs">CZ</Badge>}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={Math.round(broker.rating)} />
              <span className="text-sm text-gray-600 ml-2">({broker.rating})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">{broker.description}</p>
        
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{broker.etfFee.split(' ')[0]}</div>
            <div className="text-xs text-gray-500">ETF poplatek</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{broker.etfCount}</div>
            <div className="text-xs text-gray-500">ETF nabídka</div>
          </div>
        </div>

        {/* Quick info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <CreditCardIcon className="text-xs" />
              Minimální vklad:
            </span>
            <span className="font-medium">{broker.minDeposit}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <GlobeIcon className="text-xs" />
              Platformy:
            </span>
            <span className="font-medium text-xs">{broker.platforms.join(', ')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <TrendingUpIcon className="text-xs" />
              Frakční ETF:
            </span>
            <span className="flex items-center">
              {broker.fractional ? <CheckIcon /> : <XIcon />}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <ShieldIcon className="text-xs" />
              Regulace:
            </span>
            <span className="font-medium text-xs">{broker.regulation.split(',')[0]}</span>
          </div>
        </div>

        {/* Special features */}
        <div className="flex flex-wrap gap-1">
          {broker.specialFeatures.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {broker.specialFeatures.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{broker.specialFeatures.length - 2}
            </Badge>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Detailed info when expanded */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <InfoIcon />
                  Detailní informace
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Konverze měn:</span>
                    <span className="font-medium">{broker.fxFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Zákaznická podpora:</span>
                    <span className="font-medium">{broker.customerSupport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jazyky:</span>
                    <span className="font-medium text-xs">{broker.languages.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trhy:</span>
                    <span className="font-medium text-xs">{Array.isArray(broker.markets) ? broker.markets.join(', ') : broker.markets}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                  <CheckIcon />
                  Výhody
                </h4>
                <ul className="space-y-1">
                  {broker.pros.map((pro, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1 h-1 bg-green-500 rounded-full mt-2 shrink-0"></div>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <XIcon />
                  Nevýhody
                </h4>
                <ul className="space-y-1">
                  {broker.cons.map((con, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <div className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0"></div>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Click to expand hint */}
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" className="text-xs text-gray-500">
            {isExpanded ? 'Skrýt detaily' : 'Zobrazit detaily'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrokerCard;