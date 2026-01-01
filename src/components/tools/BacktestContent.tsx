'use client';

import React from 'react';

import FAQSection from '../SEO/FAQSection';
import InternalLinking from '../SEO/InternalLinking';
import StructuredData from '../SEO/StructuredData';
import { Card, CardContent } from "../ui/card";
import { TrendingUpIcon, BarChart3Icon, ShieldIcon, ClockIcon, TargetIcon, RefreshIcon } from '../ui/icons';
import { BacktestCalculator } from '../tools/BacktestCalculator';

const BacktestContent: React.FC = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Domů",
        "item": "https://etfpruvodce.cz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kalkulačky",
        "item": "https://etfpruvodce.cz/kalkulacky"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Backtest portfolia ETF 2026",
        "item": "https://etfpruvodce.cz/kalkulacky/backtest-portfolia"
      }
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero sekce */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BarChart3Icon className="w-4 h-4" />
            Backtest portfolia ETF 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Backtest portfolia ETF
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Otestujte historickou výkonnost vašeho ETF portfolia s reálnými daty od roku 2000.
            Analyzujte rizika, drawdowny a porovnejte různé investiční strategie.
          </p>
        </div>

        {/* Samotná kalkulačka */}
        <BacktestCalculator />

        {/* Klíčové informace o backtestování */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Co vám backtest ukáže</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUpIcon className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">CAGR</h3>
                <p className="text-gray-600 text-xs">
                  Průměrný roční výnos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ShieldIcon className="w-10 h-10 text-red-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Drawdown</h3>
                <p className="text-gray-600 text-xs">
                  Maximální pokles
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Volatilita</h3>
                <p className="text-gray-600 text-xs">
                  Míra kolísání
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TargetIcon className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Sharpe Ratio</h3>
                <p className="text-gray-600 text-xs">
                  Výnos vs. riziko
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ClockIcon className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Horizont</h3>
                <p className="text-gray-600 text-xs">
                  Úspěšnost v čase
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <RefreshIcon className="w-10 h-10 text-violet-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Rebalancování</h3>
                <p className="text-gray-600 text-xs">
                  Strategie vyvažování
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Praktické rady pro backtest */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jak správně interpretovat backtest?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-violet-800">Co backtest ukáže</h3>
              <p className="text-gray-700 mb-4">
                Backtest simuluje, jak by vaše portfolio fungovalo v minulosti s reálnými historickými daty.
                Pomáhá pochopit charakteristiky různých strategií.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Historickou výkonnost:</strong> Jak portfolio rostlo</li>
                <li>• <strong>Rizikové metriky:</strong> Drawdowny, volatilita, VaR</li>
                <li>• <strong>Korelace:</strong> Jak spolu aktiva souvisí</li>
                <li>• <strong>Investiční horizont:</strong> Kdy je pravděpodobnost zisku</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-violet-800">Co backtest neukáže</h3>
              <p className="text-gray-700 mb-4">
                Minulá výkonnost není zárukou budoucích výsledků. Backtest má svá omezení,
                která je třeba brát v úvahu.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Budoucí výnosy:</strong> Trhy se mění</li>
                <li>• <strong>Černé labutě:</strong> Nepředvídatelné události</li>
                <li>• <strong>Transakční náklady:</strong> Spreads, poplatky brokerů</li>
                <li>• <strong>Daně:</strong> Vliv zdanění na čisté výnosy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* DCA vysvětlení */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pravidelné investování (DCA)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Co je DCA?</h3>
              <p className="text-gray-700 mb-4">
                Dollar Cost Averaging (DCA) je strategie, kdy investujete pravidelně stejnou částku
                bez ohledu na aktuální cenu. Tím průměrujete nákupní cenu a snižujete riziko špatného načasování.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Nižší riziko:</strong> Rozložení nákupů v čase</li>
                <li>• <strong>Disciplína:</strong> Pravidelné investování bez emocí</li>
                <li>• <strong>Průměrování:</strong> Kupujete více, když je levněji</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Příklad</h3>
              <p className="text-gray-700 mb-4">
                Při pravidelné investici 5 000 Kč měsíčně do S&P 500 od roku 2015:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Celkem investováno:</strong> ~600 000 Kč za 10 let</li>
                <li>• <strong>Hodnota portfolia:</strong> ~1 000 000+ Kč</li>
                <li>• <strong>Zisk:</strong> Cca 66%+ přes složené úročení</li>
                <li>• <strong>Bez stresu:</strong> Neřešíte, kdy nakoupit</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Populární strategie */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Populární investiční strategie</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">100% S&P 500</h3>
              <p className="text-gray-600 text-sm mb-4">
                Nejjednodušší strategie - investice pouze do amerického akciového trhu.
                Historicky nejvyšší výnosy, ale také vyšší volatilita.
              </p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">CAGR (2000-2024):</span> ~7-10% p.a.
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">60/40 Portfolio</h3>
              <p className="text-gray-600 text-sm mb-4">
                Klasická vyvážená strategie - 60% akcie, 40% dluhopisy.
                Nižší volatilita za cenu mírně nižších výnosů.
              </p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">CAGR (2000-2024):</span> ~5-7% p.a.
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">All Weather</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ray Dalio strategie pro všechny tržní podmínky.
                Diverzifikace přes akcie, dluhopisy, zlato a komodity.
              </p>
              <div className="text-sm text-gray-500">
                <span className="font-medium">CAGR (2000-2024):</span> ~5-6% p.a.
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ sekce */}
        <FAQSection
          title="Často kladené otázky o backtestu portfolia"
          faqs={[
            {
              question: "Co je backtest portfolia?",
              answer: "Backtest je historická simulace, která ukazuje, jak by vaše investiční strategie fungovala v minulosti s reálnými tržními daty. Používá se k analýze výnosů, rizik a chování portfolia v různých tržních podmínkách. Důležité je pamatovat, že minulá výkonnost není zárukou budoucích výsledků."
            },
            {
              question: "Jaká data používá tento backtest nástroj?",
              answer: "Nástroj používá historická data indexů od roku 2000, včetně S&P 500, MSCI World, Emerging Markets, vládních a firemních dluhopisů, zlata a komodit. Data jsou v EUR a automaticky se přepočítávají na CZK nebo USD podle historických kurzů ČNB a ECB."
            },
            {
              question: "Co znamená CAGR?",
              answer: "CAGR (Compound Annual Growth Rate) je průměrný roční výnos zohledňující složené úročení. Na rozdíl od prostého aritmetického průměru CAGR přesně ukazuje, jakým tempem portfolio skutečně rostlo. Například CAGR 7% znamená, že portfolio každý rok v průměru vyrostlo o 7% včetně reinvestovaných výnosů."
            },
            {
              question: "Co je drawdown a proč je důležitý?",
              answer: "Drawdown je pokles hodnoty portfolia od jeho předchozího maxima. Maximální drawdown ukazuje nejhorší možný pokles, který byste v minulosti zažili. Je důležitý pro posouzení, zda byste psychicky zvládli takový pokles. Například drawdown -50% znamená, že portfolio ztratilo polovinu své hodnoty."
            },
            {
              question: "Co je Sharpe Ratio?",
              answer: "Sharpe Ratio měří výnos portfolia vzhledem k jeho riziku (volatilitě). Hodnota nad 1 je považována za dobrou, nad 2 za výbornou. Vyšší Sharpe Ratio znamená lepší poměr výnosu a rizika - dostáváte více výnosu za jednotku podstoupeného rizika."
            },
            {
              question: "Jak funguje pravidelné investování (DCA)?",
              answer: "Dollar Cost Averaging (DCA) je strategie, kdy investujete pravidelně stejnou částku (např. 5 000 Kč měsíčně) bez ohledu na aktuální ceny. Když jsou ceny nízké, koupíte více podílů, když jsou vysoké, méně. Tím průměrujete nákupní cenu a eliminujete riziko špatného načasování jednorázové investice."
            },
            {
              question: "Co je Monte Carlo simulace?",
              answer: "Monte Carlo simulace generuje tisíce možných budoucích scénářů na základě historické volatility a výnosů. Výsledkem jsou pravděpodobnostní pásma (percentily), které ukazují rozsah možných výsledků. Pro detailní simulaci budoucnosti portfolia použijte náš samostatný nástroj Monte Carlo simulátor."
            },
            {
              question: "Jaký investiční horizont je ideální?",
              answer: "Pro akciové investice se doporučuje minimálně 10-15 let. Historicky platí, že čím delší horizont, tím vyšší pravděpodobnost kladného výnosu. Na horizontu 1 roku je pravděpodobnost zisku u akcií cca 70%, na 15+ letech se blíží 100% (historicky)."
            },
            {
              question: "Co je rebalancování portfolia?",
              answer: "Rebalancování je pravidelné obnovení původních vah aktiv v portfoliu. Pokud například akcie vzrostou a dluhopisy ne, portfolio se vychýlí od původního poměru 60/40. Rebalancováním prodáte část akcií a dokoupíte dluhopisy, čímž udržíte požadovanou míru rizika a diverzifikace."
            },
            {
              question: "Jsou výsledky backtesty spolehlivé pro budoucnost?",
              answer: "Ne zcela. Backtest ukazuje, jak by strategie fungovala v minulosti, ale budoucnost může být jiná. Hlavní omezení: 1) Minulé výnosy se nemusí opakovat, 2) Nezahrnuje transakční náklady a daně, 3) Nepočítá s 'černými labutěmi' - nepředvídatelnými událostmi. Backtest je užitečný pro pochopení charakteristik strategie, ne pro predikci budoucnosti."
            }
          ]}
          className="mt-16"
        />

        {/* CTA sekce */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">Chcete investovat do ETF?</h3>
            <p className="text-blue-100 mb-4">
              Porovnejte nejlepší brokery pro české investory a začněte budovat své portfolio ještě dnes.
            </p>
            <a
              href="/kde-koupit-etf"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              Kde koupit ETF
            </a>
          </div>
        </div>

        {/* Související nástroje */}
        <InternalLinking
          relatedLinks={[
            {
              title: "Investiční kalkulačka",
              href: "/kalkulacky/investicni-kalkulacka",
              description: "Spočítejte si budoucí hodnotu pravidelných investic"
            },
            {
              title: "Monte Carlo simulátor",
              href: "/kalkulacky/monte-carlo-simulator",
              description: "Simulace tisíců možných scénářů vývoje portfolia"
            },
            {
              title: "FIRE kalkulačka",
              href: "/kalkulacky/fire-kalkulacka",
              description: "Spočítejte si cestu k finanční nezávislosti"
            },
            {
              title: "Kalkulačka poplatků ETF",
              href: "/kalkulacky/kalkulacka-poplatku-etf",
              description: "Vliv TER poplatků na dlouhodobé výnosy"
            },
            {
              title: "Srovnání ETF",
              href: "/srovnani-etf",
              description: "Porovnejte 4300+ ETF fondů"
            }
          ]}
          title="Související kalkulačky a nástroje"
          className="mt-16"
        />
      </div>
    </>
  );
};

export default BacktestContent;
