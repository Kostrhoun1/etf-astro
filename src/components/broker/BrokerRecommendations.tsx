import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileTextIcon, ExternalLinkIcon, CrownIcon, TargetIcon, TrendingUpIcon, ShieldIcon, ZapIcon } from '@/components/ui/icons';
import { brokers } from '../../data/brokerData';

const BrokerRecommendations: React.FC = () => {
  // Get sorted brokers by rating
  const sortedBrokers = [...brokers].sort((a, b) => b.rating - a.rating);
  const topBrokers = sortedBrokers.slice(0, 3);
  
  // Helper function to get broker by id
  const getBroker = (id: string) => brokers.find(b => b.id === id);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="space-y-8">
      {/* Top Rated Brokers */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white">
              <CrownIcon className="text-xl" />
            </div>
            <div>
              <h3>🏆 Nejlepší brokeři 2026</h3>
              <p className="text-sm font-normal text-gray-600 mt-1">Podle našeho nezávislého hodnocení</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {topBrokers.map((broker, index) => (
              <div key={broker.id} className="relative group">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-transparent group-hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
                  {/* Position Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={broker.logo}
                      alt={`${broker.name} logo - online broker pro investování do ETF fondů`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-lg">{broker.name}</h4>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getScoreColor(broker.rating)}`}>
                        {broker.rating}/100
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{broker.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ETF poplatek:</span>
                      <span className="font-medium text-green-600">
                        {broker.etfFee.includes('0%') || broker.etfFee.includes('bez komisí') ? '0%' : 
                         broker.etfFee.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Česká podpora:</span>
                      <span className="font-medium">{broker.czSupport ? '✅ Ano' : '❌ Ne'}</span>
                    </div>
                  </div>
                  
                  <a href={`/${broker.id}-recenze`}>
                    <Button className="w-full group-hover:shadow-lg transition-shadow">
                      Detailní recenze
                      <ExternalLinkIcon className="ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations by User Type */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Beginners */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TargetIcon />
              💚 Pro začátečníky
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700">
              Nulové poplatky, jednoduché ovládání, česká podpora
            </p>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('xtb')?.logo} alt="XTB logo - broker s 0% poplatky na ETF" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-green-800">XTB</strong>
                    <Badge className="bg-green-100 text-green-700">94/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">0% poplatky + 24/7 česká podpora + vzdělání</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('portu')?.logo} alt="Portu logo - český robo-advisor pro automatické investice" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-green-800">Portu</strong>
                    <Badge className="bg-green-100 text-green-700">98/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Automatizace + česká společnost + od 500 Kč</p>
              </div>
            </div>
            
            <a href="/xtb-recenze">
              <Button variant="outline" size="sm" className="w-full text-green-700 border-green-300 hover:bg-green-100">
                Porovnat pro začátečníky
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Advanced Users */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <TrendingUpIcon />
              🚀 Pro pokročilé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-purple-700">
              Profesionální nástroje, globální trhy, nízké náklady
            </p>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('ibkr')?.logo} alt="Interactive Brokers logo - globální broker pro pokročilé investory" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-purple-800">Interactive Brokers</strong>
                    <Badge className="bg-purple-100 text-purple-700">85/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">86 burz + TWS platforma + opce & futures</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('xtb')?.logo} alt="XTB logo - broker s 0% poplatky na ETF" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-purple-800">XTB</strong>
                    <Badge className="bg-purple-100 text-purple-700">94/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">xStation 5 + analýzy + česká podpora</p>
              </div>
            </div>
            
            <a href="/interactive-brokers-recenze">
              <Button variant="outline" size="sm" className="w-full text-purple-700 border-purple-300 hover:bg-purple-100">
                Porovnat pro pokročilé
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Czech Investors */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <ShieldIcon />
              🇨🇿 České akcie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-700">
              Optimální zdanění dividend (15% místo 35%)
            </p>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('fio')?.logo} alt="Fio eBroker logo - česká banka s nízkonákladovým brokeringem" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-blue-800">Fio e-Broker</strong>
                    <Badge className="bg-blue-100 text-blue-700">75/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">15% zdanění CZ dividend + česká podpora</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('portu')?.logo} alt="Portu logo - český robo-advisor pro automatické investice" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-blue-800">Portu</strong>
                    <Badge className="bg-blue-100 text-blue-700">98/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">15% zdanění + automatizace + ČNB licence</p>
              </div>
            </div>
            
            <a href="/fio-ebroker-recenze">
              <Button variant="outline" size="sm" className="w-full text-blue-700 border-blue-300 hover:bg-blue-100">
                Porovnat české akcie
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Automation */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ZapIcon />
              ⚡ Automatizace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-orange-700">
              "Set & forget" přístup s pravidelnými investicemi
            </p>
            
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('portu')?.logo} alt="Portu logo - český robo-advisor pro automatické investice" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-orange-800">Portu</strong>
                    <Badge className="bg-orange-100 text-orange-700">98/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Plný robo-advisor + investiční rezerva</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={getBroker('trading212')?.logo} alt="Trading 212 logo - broker s 0% poplatky a frakčními akciemi" className="w-6 h-6 rounded" loading="lazy" />
                    <strong className="text-orange-800">Trading 212</strong>
                    <Badge className="bg-orange-100 text-orange-700">87/100</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Pies & AutoInvest + 0% poplatky</p>
              </div>
            </div>
            
            <a href="/portu-recenze">
              <Button variant="outline" size="sm" className="w-full text-orange-700 border-orange-300 hover:bg-orange-100">
                Porovnat automatizaci
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <FileTextIcon className="text-xl" />
            ⚠️ Důležité upozornění
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800 leading-relaxed">
            <strong>Před finálním rozhodnutím:</strong> Prostudujte si aktuální sazebníky poplatků a podmínky vybraného brokera. 
            Daňové implikace vždy konzultujte s daňovým poradcem. Investice do ETF fondů jsou spojeny s rizikem ztráty.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrokerRecommendations;