'use client';

import React from 'react';

import FAQSection from '../SEO/FAQSection';
import InternalLinking from '../SEO/InternalLinking';
import StructuredData from '../SEO/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertIcon, TrendingUpIcon, DollarIcon, ShieldIcon } from '../ui/icons';
import CurrencyImpactAnalyzer from '../tools/CurrencyImpactAnalyzer';
import HedgedVsUnhedgedComparison from '../tools/HedgedVsUnhedgedComparison';

const CurrencyImpactAnalyzerContent: React.FC = () => {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Domů",
        "item": "https://www.etfpruvodce.cz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Kalkulačky",
        "item": "https://www.etfpruvodce.cz/kalkulacky"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Analýza kurzového dopadu ETF",
        "item": "https://www.etfpruvodce.cz/kalkulacky/kurzovy-dopad-etf"
      }
    ]
  };

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Analýza kurzového dopadu ETF 2026 - Currency Hedging",
    "description": "Analyzujte vliv kurzových změn na ETF portfolio. Měnové riziko, hedging strategie a optimalizace pro české investory.",
    "url": "https://www.etfpruvodce.cz/kalkulacky/kurzovy-dopad-etf",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CZK"
    },
    "featureList": [
      "Analýza měnové expozice portfolia",
      "Srovnání hedged vs unhedged ETF",
      "Scénářová analýza kurzových změn",
      "Doporučení pro české investory",
      "Historická analýza kurzů CZK/USD/EUR",
      "Optimalizace měnového rizika"
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero sekce */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <DollarIcon className="w-4 h-4" />
            Analýza kurzového dopadu
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kurzový dopad ETF
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Analyzujte vliv kurzových změn na ETF portfolio a optimalizujte měnové riziko.
          </p>
        </div>

        {/* Samotná kalkulačka */}
        <CurrencyImpactAnalyzer />

        {/* Jak funguje kurzové riziko */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Jak funguje kurzové riziko ETF?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <AlertIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Měna vs Expozice</h3>
                <p className="text-gray-600 text-sm">
                  SXR8 je EUR fond, ale má 100% USD expozici
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUpIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Kurzový dopad</h3>
                <p className="text-gray-600 text-sm">
                  20% změna kurzu = 20% změna výnosů
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ShieldIcon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">EUR Hedging</h3>
                <p className="text-gray-600 text-sm">
                  Eliminuje EUR/USD riziko, ne EUR/CZK
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Hedging náklady</h3>
                <p className="text-gray-600 text-sm">
                  TER + Carry Cost = skutečné náklady
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Jednoduché vysvětlení */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jak minimalizovat kurzové riziko?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Dlouhodobé investice</h3>
              <p className="text-gray-700 mb-4">
                Nejefektivnější způsob je <strong>pravidelné investování (DCA)</strong>. 
                Postupně nakupujete za různé kurzy, což vyrovnává výkyvy.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Dollar Cost Averaging:</strong> snižuje kurzové riziko</li>
                <li>• <strong>Čas:</strong> dlouhodobě se kurzy stabilizují</li>
                <li>• <strong>Jednoduchost:</strong> žádné složité strategie</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-800">Krátkodobé investice</h3>
              <p className="text-gray-700 mb-4">
                U investic do 3 let je kurzové riziko významné. 
                Zvažte hedged ETF nebo vyšší podíl domácích investic.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Hedged ETF:</strong> eliminují část kurzového rizika</li>
                <li>• <strong>Náklady:</strong> hedging stojí ~1% ročně navíc</li>
                <li>• <strong>CZK investice:</strong> žádné kurzové riziko</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Srovnání hedged vs unhedged ETF */}
        <HedgedVsUnhedgedComparison />

        {/* FAQ sekce */}
        <FAQSection
          title="Často kladené otázky o kurzovém dopadu ETF"
          faqs={[
            {
              question: "Jak velký je kurzový dopad na ETF výnosy?",
              answer: "Kurzový dopad je přímý - při změně kurzu o 20% se vaše výnosy změní o stejných 20%. Proto je důležité rozumět měnové expozici vašeho portfolia. Například pokud máte 100% americké akcie a USD oslabí o 15% vůči CZK, vaše portfolio v korunách poklesne o 15% bez ohledu na výkonnost akcií."
            },
            {
              question: "Jak nejlépe minimalizovat kurzové riziko pro české investory?",
              answer: "Pro dlouhodobé investice (10+ let) je nejefektivnější pravidelné investování (DCA), které vyrovnává kurzové výkyvy v čase. Pro krátkodobé investice do 3 let zvažte vyšší podíl domácích investic nebo EUR hedged ETF, ale uvědomte si vyšší náklady."
            },
            {
              question: "Co je to měnová expozice a jak ji zjistím?",
              answer: "Měnová expozice závisí na podkladových aktivech ETF, ne na měně obchodování. SXR8 je EUR fond, ale má 100% USD expozici, protože investuje do amerických akcií. VWCE má ~60% USD, ~30% EUR expozici podle regionálního rozložení. Informace najdete ve fact sheetu ETF."
            },
            {
              question: "Jsou hedged ETF dražší a vyplatí se?",
              answer: "Ano, hedged ETF stojí výrazně více - místo 0,07% až ~1,10% ročně kvůli TER + carry cost. Pro české investory navíc neřeší EUR/CZK riziko, jen EUR/USD. Vyplatí se hlavně při krátkodobém investování nebo při očekávání posílení domácí měny."
            },
            {
              question: "Existují ETF zajištěné proti české koruně?",
              answer: "NE! ETF zajištěné proti CZK neexistují. Dostupné jsou pouze EUR zajištěné ETF (např. IBCF), které eliminují EUR/USD riziko. Pro české investory zůstává EUR/CZK riziko u všech zahraničních ETF."
            },
            {
              question: "Jaké jsou alternativy k hedged ETF pro zajištění proti CZK?",
              answer: "Pro pokročilé investory existují měnové forwardy nebo SWAP kontrakty, ale to je velmi pokročilá záležitost vyžadující institucionální přístup. Retail investoři mohou použít forex pozice (EUR/CZK, USD/CZK short), ale je to složité a nákladné."
            },
            {
              question: "Jak funguje Dollar Cost Averaging (DCA) proti kurzovému riziku?",
              answer: "DCA znamená pravidelné investování stejné částky bez ohledu na kurz. Když je kurz vysoký, nakoupíte méně podílů, když je nízký, více podílů. Dlouhodobě to vyrovnává průměrnou nákupní cenu a minimalizuje dopad špatného timingu. Ideální pro investiční horizonty 10+ let."
            },
            {
              question: "Které ETF mají nejnižší kurzové riziko pro Čechy?",
              answer: "Nejnižší kurzové riziko mají české dluhopisy a spořicí účty (0% kurzové riziko). Z ETF pak evropské akciové ETF (EUNL) s ~70% EUR expozicí. Globální ETF (VWCE) mají smíšenou expozici, nejvyšší riziko mají čistě americké ETF (CSP1) se 100% USD expozicí."
            },
            {
              question: "Kdy se kurzové změny promítnou do ETF ceny?",
              answer: "Kurzové změny se promítají okamžitě do tržní ceny ETF během obchodního dne. ETF obchodované na evropských burzách v EUR reagují na změny EUR/USD kurzu v reálném čase. NAV (čistá hodnota aktiv) se přepočítává denně po uzavření amerických trhů."
            },
            {
              question: "Jak poznat měnovou expozici ETF před koupí?",
              answer: "Podívejte se do fact sheetu ETF na regionální rozložení nebo top holdings. Americké akcie = USD expozice, evropské = EUR expozice. Pozor: MSCI World má ~70% USA, takže především USD riziko. Vždy kontrolujte podkladová aktiva, ne jen název nebo měnu obchodování."
            }
          ]}
          className="mt-16"
        />

        {/* CTA sekce */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">📊 Najděte nejlepší ETF pro vaše portfolio</h3>
            <p className="text-blue-100 mb-4">
              Porovnejte ETF fondy podle TER, výkonnosti a měnového rizika. Najděte ideální mix pro své investiční cíle.
            </p>
            <a 
              href="/srovnani-etf"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              Srovnat ETF fondy
            </a>
          </div>
        </div>

        {/* Související nástroje */}
        <InternalLinking
          relatedLinks={[
            {
              title: "Srovnání ETF fondů",
              href: "/srovnani-etf",
              description: "Najděte hedged a unhedged varianty ETF"
            },
            {
              title: "Investiční kalkulačka",
              href: "/kalkulacky/investicni-kalkulacka",
              description: "Spočítejte si výnosy z pravidelného investování"
            },
            {
              title: "Monte Carlo simulátor",
              href: "/kalkulacky/monte-carlo-simulator",
              description: "Analýza portfoliových rizik"
            },
            {
              title: "Nejlepší ETF 2026",
              href: "/tipy/nejlepsi-etf-na-americke-akcie",
              description: "Doporučené ETF fondy pro české investory"
            },
            {
              title: "Všechny nástroje",
              href: "/kalkulacky",
              description: "Kompletní přehled kalkulaček"
            }
          ]}
          title="Související kalkulačky a nástroje"
          className="mt-16"
        />
      </div>
    </>
  );
};

export default CurrencyImpactAnalyzerContent;