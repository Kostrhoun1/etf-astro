'use client';

import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarFilledIcon, ArrowRightIcon, TargetIcon } from '@/components/ui/icons';
import { useETFLiveData } from '@/hooks/useETFLiveData';

interface ETFTemplate {
  name: string;
  ticker: string;
  isin: string;
  provider: string;
  degiroFree: boolean;
  reason: string;
}

interface Top3ETFLiveSectionProps {
  title: string;
  description?: string;
  subtitle?: string;
  sectionId?: string;
  etfTemplates: ETFTemplate[];
  colorScheme: 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'yellow' | 'orange';
}

const colorSchemes = {
  blue: {
    ringColor: 'ring-blue-500',
    bgGradient: 'from-blue-50 to-white',
    badgeColor: 'bg-blue-600'
  },
  green: {
    ringColor: 'ring-green-500', 
    bgGradient: 'from-green-50 to-white',
    badgeColor: 'bg-green-600'
  },
  purple: {
    ringColor: 'ring-purple-500',
    bgGradient: 'from-purple-50 to-white', 
    badgeColor: 'bg-purple-600'
  },
  red: {
    ringColor: 'ring-red-500',
    bgGradient: 'from-red-50 to-white',
    badgeColor: 'bg-red-600'
  },
  gray: {
    ringColor: 'ring-gray-500',
    bgGradient: 'from-gray-50 to-white',
    badgeColor: 'bg-gray-600'
  },
  yellow: {
    ringColor: 'ring-yellow-500',
    bgGradient: 'from-yellow-50 to-white',
    badgeColor: 'bg-yellow-600'
  },
  orange: {
    ringColor: 'ring-orange-500',
    bgGradient: 'from-orange-50 to-white',
    badgeColor: 'bg-orange-600'
  }
};

export default function Top3ETFLiveSection({ title, description, subtitle, sectionId, etfTemplates, colorScheme }: Top3ETFLiveSectionProps) {
  // Load live data for TOP 3 ETFs
  const { etfs: liveETFs, isLoading: isLoadingLive, error: liveError } = useETFLiveData(etfTemplates);
  
  // Debug logging for colorScheme issues
  console.log('Top3ETFLiveSection colorScheme:', colorScheme);
  console.log('Available color schemes:', Object.keys(colorSchemes));
  
  const colors = colorSchemes[colorScheme];
  
  // Safety check - fallback to blue if colorScheme is invalid
  if (!colors) {
    console.error(`Invalid colorScheme: ${colorScheme}. Falling back to blue.`);
    const fallbackColors = colorSchemes.blue;
    
    return (
      <section id="top3" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              ⚠️ Color scheme error: '{colorScheme}' is not a valid color scheme. Using blue as fallback.
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {description || subtitle}
            </p>
          </div>

          {/* Loading/Error States */}
          {isLoadingLive && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Načítání aktuálních dat...
              </div>
            </div>
          )}
          
          {liveError && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                ⚠️ {liveError} - zobrazujeme offline data
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {liveETFs.map((etf, index) => (
              <Card key={etf.isin} className={`relative overflow-hidden ${index === 0 ? `ring-2 ${fallbackColors.ringColor} bg-gradient-to-br ${fallbackColors.bgGradient}` : 'bg-white'} hover:shadow-xl transition-all duration-300`}>
                {index === 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className={`${fallbackColors.badgeColor} text-white`}>
                      🏆 Nejlepší
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {etf.hasLiveData && etf.rating ? (
                        [...Array(etf.rating)].map((_, i) => (
                          <StarFilledIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Rating N/A</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {etf.provider}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {etf.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ticker:</span>
                      <span className="font-medium">{etf.ticker}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TER:</span>
                      <span className="font-medium text-green-600">
                        {etf.hasLiveData && etf.ter !== null ? `${etf.ter}%` : 'N/A'}
                        {!etf.hasLiveData && <span className="text-xs text-orange-500 ml-1">⚠️</span>}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Velikost:</span>
                      <span className="font-medium">
                        {etf.hasLiveData && etf.fundSize !== null ? `${etf.fundSize.toLocaleString()} mil. EUR` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">1Y výnos:</span>
                      <span className="font-medium text-blue-600">
                        {etf.hasLiveData && etf.return1Y !== null ? `${etf.return1Y}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                    {etf.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Tlačítka pro detail ETF */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {liveETFs.map((etf) => (
              <div key={etf.isin} className="text-center">
                <Button asChild className={`w-full ${fallbackColors.badgeColor} hover:opacity-90 text-white`}>
                  <a
                    href={`/etf/${etf.isin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowRightIcon className="w-4 h-4 mr-2" />
                    Detail {etf.ticker}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="top3" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {description || subtitle}
          </p>
        </div>

        {/* Loading/Error States */}
        {isLoadingLive && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              Načítání aktuálních dat...
            </div>
          </div>
        )}
        
        {liveError && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
              ⚠️ {liveError} - zobrazujeme offline data
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {liveETFs.map((etf, index) => (
            <Card key={etf.isin} className={`relative overflow-hidden ${index === 0 ? `ring-2 ${colors.ringColor} bg-gradient-to-br ${colors.bgGradient}` : 'bg-white'} hover:shadow-xl transition-all duration-300`}>
              {index === 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className={`${colors.badgeColor} text-white`}>
                    🏆 Nejlepší
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {etf.hasLiveData && etf.rating ? (
                      [...Array(etf.rating)].map((_, i) => (
                        <StarFilledIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Rating N/A</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {etf.provider}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {etf.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ticker:</span>
                    <span className="font-medium">{etf.ticker}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TER:</span>
                    <span className="font-medium text-green-600">
                      {etf.hasLiveData && etf.ter !== null ? `${etf.ter}%` : 'N/A'}
                      {!etf.hasLiveData && <span className="text-xs text-orange-500 ml-1">⚠️</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Velikost:</span>
                    <span className="font-medium">
                      {etf.hasLiveData && etf.fundSize !== null ? `${etf.fundSize.toLocaleString()} mil. EUR` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">1Y výnos:</span>
                    <span className="font-medium text-blue-600">
                      {etf.hasLiveData && etf.return1Y !== null ? `${etf.return1Y}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  {etf.reason}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Tlačítka pro detail ETF */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {liveETFs.map((etf) => (
            <div key={etf.isin} className="text-center">
              <Button asChild className={`w-full ${colors.badgeColor} hover:opacity-90 text-white`}>
                <a
                  href={`/etf/${etf.isin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  Detail {etf.ticker}
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}