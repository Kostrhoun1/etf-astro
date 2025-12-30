'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, XIcon, BarChart3Icon, TrendingUpIcon, PlusIcon, GlobeIcon, BuildingIcon, ShieldIcon } from '@/components/ui/icons';
import Layout from '@/components/Layout';

interface ETF {
  isin: string;
  name: string;
  ticker: string;
  ter: number;
  size: number;
  currency: string;
  category: string;
  provider: string;
}

const mockETFs: ETF[] = [
  {
    isin: 'IE00B4L5Y983',
    name: 'iShares Core MSCI World UCITS ETF',
    ticker: 'IWDA',
    ter: 0.20,
    size: 45000,
    currency: 'USD',
    category: 'Developed Markets',
    provider: 'BlackRock'
  },
  {
    isin: 'LU0274208692',
    name: 'Xtrackers MSCI World UCITS ETF',
    ticker: '1D',
    ter: 0.19,
    size: 8500,
    currency: 'USD',
    category: 'Developed Markets',
    provider: 'DWS'
  },
  {
    isin: 'IE00B3RBWM25',
    name: 'Vanguard FTSE All-World UCITS ETF',
    ticker: 'VWRL',
    ter: 0.22,
    size: 12000,
    currency: 'USD',
    category: 'Global',
    provider: 'Vanguard'
  }
];

const ETFComparisonContent: React.FC = () => {
  const [selectedETFs, setSelectedETFs] = useState<ETF[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredETFs, setFilteredETFs] = useState(mockETFs);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockETFs.filter(etf =>
      etf.name.toLowerCase().includes(query.toLowerCase()) ||
      etf.ticker.toLowerCase().includes(query.toLowerCase()) ||
      etf.isin.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredETFs(filtered);
  };

  const addETF = (etf: ETF) => {
    if (selectedETFs.length < 4 && !selectedETFs.find(selected => selected.isin === etf.isin)) {
      setSelectedETFs([...selectedETFs, etf]);
    }
  };

  const removeETF = (isin: string) => {
    setSelectedETFs(selectedETFs.filter(etf => etf.isin !== isin));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gray-50">
        {/* Hero sekce */}
        <section className="relative flex flex-col items-center justify-center px-4 py-12 md:py-20 mb-6 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="relative z-10 max-w-2xl text-center">
            <span className="uppercase text-xs font-bold text-blue-200 tracking-widest">POKROČILÉ NÁSTROJE</span>
            <h1 className="font-extrabold text-4xl md:text-5xl text-white mt-3 mb-4">
              Porovnání ETF fondů
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-6">
              Detailní porovnání až 4 ETF fondů současně. Analyzujte poplatky, výkonnost, rizika a složení portfolia.
            </p>
          </div>
        </section>

        {/* Vyhledávání */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5" />
                Vyhledávání ETF fondů
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Zadejte název, ticker nebo ISIN..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredETFs.map((etf) => (
                  <div key={etf.isin} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{etf.name}</h3>
                        <p className="text-xs text-gray-600">{etf.ticker} • {etf.isin}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{etf.provider}</Badge>
                          <span className="text-xs text-gray-500">TER: {etf.ter}%</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addETF(etf)}
                        disabled={selectedETFs.length >= 4 || selectedETFs.some(selected => selected.isin === etf.isin)}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Vybrané ETF pro porovnání */}
        {selectedETFs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3Icon className="w-5 h-5" />
                    Porovnání vybraných ETF ({selectedETFs.length}/4)
                  </span>
                  {selectedETFs.length > 1 && (
                    <Button>
                      <TrendingUpIcon className="w-4 h-4 mr-2" />
                      Analyzovat
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-semibold">ETF</th>
                        <th className="text-left py-3 px-2 font-semibold">TER</th>
                        <th className="text-left py-3 px-2 font-semibold">Velikost</th>
                        <th className="text-left py-3 px-2 font-semibold">Měna</th>
                        <th className="text-left py-3 px-2 font-semibold">Kategorie</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedETFs.map((etf) => (
                        <tr key={etf.isin} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium text-sm">{etf.name}</div>
                              <div className="text-xs text-gray-600">{etf.ticker} • {etf.isin}</div>
                              <Badge variant="outline" className="text-xs mt-1">{etf.provider}</Badge>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-medium text-green-600">{etf.ter}%</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm">{formatNumber(etf.size)} mil. {etf.currency}</span>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="secondary">{etf.currency}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-sm">{etf.category}</span>
                          </td>
                          <td className="py-3 px-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeETF(etf.isin)}
                            >
                              <XIcon className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Funkce nástroje */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Co můžete porovnávat
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kompletní analýza a porovnání všech důležitých aspektů ETF fondů.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                <TrendingUpIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Poplatky a náklady</h3>
              <p className="text-gray-600">
                TER poplatky, tracking error, bid-ask spread a celkové náklady investování
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-4">
                <BarChart3Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Výkonnost</h3>
              <p className="text-gray-600">
                Historické výnosy, volatilita, Sharpe ratio a srovnání s benchmarkem
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mx-auto mb-4">
                <ShieldIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rizika a diverzifikace</h3>
              <p className="text-gray-600">
                Regionální a sektorové rozložení, koncentrace holdings a ESG rating
              </p>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default ETFComparisonContent;