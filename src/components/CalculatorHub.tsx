import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CalculatorIcon, BarChart3Icon, PiggyBankIcon, TargetIcon, TrendingUpIcon, DollarIcon, HomeIcon, CreditCardIcon, ShieldIcon, HistoryIcon } from '../ui/icons';


interface CalculatorItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: 'investment' | 'finance' | 'advanced';
}

const CalculatorHub: React.FC = () => {
  const calculators: CalculatorItem[] = [
    {
      title: 'Hypoteční kalkulačka',
      description: 'Spočítejte si hypoteční splátky a celkové náklady na bydlení',
      icon: <HomeIcon className="h-6 w-6 text-violet-700" />,
      href: '/kalkulacky/hypotecni-kalkulacka',
      category: 'finance',
    },
    {
      title: 'Spotřebitelský úvěr',
      description: 'Kalkulačka splátek spotřebitelského úvěru a celkových nákladů',
      icon: <CreditCardIcon className="h-6 w-6 text-emerald-700" />,
      href: '/kalkulacky/uverova-kalkulacka',
      category: 'finance',
    },
    {
      title: 'Čistý plat 2026',
      description: 'Výpočet čisté mzdy podle aktuální české legislativy',
      icon: <CalculatorIcon className="h-6 w-6 text-violet-700" />,
      href: '/kalkulacky/cisty-plat-2026',
      category: 'finance',
    },
    {
      title: 'Investiční kalkulačka',
      description: 'DCA strategie a compound interest výpočty pro ETF investice',
      icon: <TrendingUpIcon className="h-6 w-6 text-emerald-700" />,
      href: '/kalkulacky/investicni-kalkulacka',
      category: 'investment'
    },
    {
      title: 'FIRE kalkulačka',
      description: '4% withdrawal rule a FIRE plánování pro finanční nezávislost',
      icon: <PiggyBankIcon className="h-6 w-6 text-violet-700" />,
      href: '/kalkulacky/fire-kalkulacka',
      category: 'investment'
    },
    {
      title: 'Nouzová rezerva',
      description: 'Optimální velikost emergency fund podle vaší situace',
      icon: <ShieldIcon className="h-6 w-6 text-emerald-700" />,
      href: '/kalkulacky/nouzova-rezerva',
      category: 'finance'
    },
    {
      title: 'ETF poplatky',
      description: 'Analýza dopadu TER a dalších poplatků na dlouhodobé výnosy',
      icon: <TargetIcon className="h-6 w-6 text-violet-700" />,
      href: '/kalkulacky/kalkulacka-poplatku-etf',
      category: 'investment'
    },
    {
      title: 'Backtest portfolia',
      description: 'Otestujte historickou výkonnost ETF portfolia od roku 2000',
      icon: <HistoryIcon className="h-6 w-6 text-blue-700" />,
      href: '/kalkulacky/backtest-portfolia',
      category: 'advanced'
    },
    {
      title: 'Monte Carlo simulátor',
      description: 'Prognóza budoucnosti portfolia s tisíci scénářů',
      icon: <BarChart3Icon className="h-6 w-6 text-emerald-700" />,
      href: '/kalkulacky/monte-carlo-simulator',
      category: 'advanced'
    },
    {
      title: 'Měnový dopad',
      description: 'Analýza kurzového rizika a hedging strategií pro ETF',
      icon: <DollarIcon className="h-6 w-6 text-violet-700" />,
      href: '/kalkulacky/kurzovy-dopad-etf',
      category: 'advanced'
    }
  ];

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'investment': return 'Investiční nástroje';
      case 'finance': return 'Finanční kalkulačky';
      case 'advanced': return 'Pokročilé analýzy';
      default: return 'Ostatní';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'investment': return 'Nástroje pro ETF investory a dlouhodobé spoření';
      case 'finance': return 'Základní finanční výpočty pro každodenní použití';
      case 'advanced': return 'Pokročilé analýzy pro zkušené investory';
      default: return '';
    }
  };

  const categorizedCalculators = calculators.reduce((acc, calc) => {
    if (!acc[calc.category]) {
      acc[calc.category] = [];
    }
    acc[calc.category].push(calc);
    return acc;
  }, {} as Record<string, CalculatorItem[]>);

  return (
    <div className="space-y-12">
      {/* Kalkulačky podle kategorií */}
      {Object.entries(categorizedCalculators).map(([category, calcs]) => (
        <div key={category} className="animate-fade-in" style={{animationDelay: `${0.2 + Object.keys(categorizedCalculators).indexOf(category) * 0.1}s`}}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getCategoryTitle(category)}
            </h2>
            <p className="text-gray-600">
              {getCategoryDescription(category)}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calcs.map((calc, index) => (
              <div key={index} className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 group-hover:bg-violet-200 transition-colors hover-scale">
                    {calc.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">
                      {calc.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{calc.description}</p>
                
                <a href={calc.href}>
                  <button className="w-full hover-scale bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all">
                    Spustit kalkulačku
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* SEO text pro kalkulačky */}
      <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-8 card-hover animate-fade-in [animation-delay:0.8s]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-full bg-violet-100 w-12 h-12 group-hover:bg-violet-200 transition-colors hover-scale">
            <span className="text-2xl">💎</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-violet-800 transition-colors">
            Proč používat naše finanční kalkulačky?
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center rounded-full bg-emerald-100 w-10 h-10 group-hover:bg-emerald-200 transition-colors hover-scale">
                <span className="text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">
                Aktuální data 2026
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Všechny naše kalkulačky používají nejnovější sazby, daňové změny a legislativní úpravy 
              platné pro rok 2026. Hypoteční sazby, daně z příjmů, pojistné - vše je aktuální.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Daňové sazby:</strong> Aktuální slevy a sazby daně z příjmů</li>
              <li>• <strong>Úrokové sazby:</strong> Současné sazby hypoték a úvěrů</li>
              <li>• <strong>Pojistné:</strong> Zdravotní a sociální pojištění 2026</li>
            </ul>
          </div>
          <div className="border-transparent shadow-none hover:shadow-md transition-shadow duration-200 group bg-white rounded-lg p-6 card-hover">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center rounded-full bg-violet-100 w-10 h-10 group-hover:bg-violet-200 transition-colors hover-scale">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-800 transition-colors">
                Komplexní finanční plánování
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Od základních výpočtů po pokročilé investiční strategie. Naše nástroje pokrývají 
              celé spektrum finančního plánování - od hypotéky po FIRE movement.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Základní výpočty:</strong> Mzda, úvěry, hypotéky</li>
              <li>• <strong>Investiční plánování:</strong> ETF, DCA, compound interest</li>
              <li>• <strong>Pokročilé analýzy:</strong> Backtest portfolia, Monte Carlo, měnová rizika</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorHub;