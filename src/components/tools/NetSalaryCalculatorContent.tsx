'use client';

import React from 'react';

import FAQSection from '../SEO/FAQSection';
import InternalLinking from '../SEO/InternalLinking';
import StructuredData from '../SEO/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CalculatorIcon, TrendingUpIcon, UsersIcon } from '../ui/icons';
import NetSalaryCalculator from '../tools/NetSalaryCalculator';

const NetSalaryCalculatorContent: React.FC = () => {
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
        "name": "Kalkulačka čisté mzdy 2026",
        "item": "https://etfpruvodce.cz/kalkulacky/cisty-plat-2026"
      }
    ]
  };

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kalkulačka čisté mzdy 2026 - Výpočet čisté mzdy ČR",
    "description": "Bezplatná kalkulačka čisté mzdy podle aktuální české legislativy 2026. Výpočet pojistného, daní, slev na dani pro zaměstnance i důchodce.",
    "url": "https://etfpruvodce.cz/kalkulacky/cisty-plat-2026",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CZK"
    },
    "featureList": [
      "Výpočet čisté mzdy podle legislativy 2026",
      "Sociální a zdravotní pojištění",
      "Daň z příjmů a slevy na dani",
      "Kalkulace pro pracující důchodce",
      "Náklady zaměstnavatele",
      "Srovnání hrubé a čisté mzdy"
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero sekce */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CalculatorIcon className="w-4 h-4" />
            Kalkulačka čisté mzdy 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kalkulačka čisté mzdy 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Spočítejte si čistou mzdu podle aktuální české legislativy pro rok 2026.
          </p>
        </div>

        {/* Samotná kalkulačka */}
        <NetSalaryCalculator />

        {/* Jak funguje výpočet mzdy */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Jak se počítá čistá mzda v ČR 2026?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <CalculatorIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Hrubá mzda</h3>
                <p className="text-gray-600 text-sm">
                  Základní mzda podle pracovní smlouvy
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CalculatorIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pojistné</h3>
                <p className="text-gray-600 text-sm">
                  Sociální 7,1% + zdravotní 4,5% = 11,6%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUpIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Daň z příjmů</h3>
                <p className="text-gray-600 text-sm">
                  15% z hrubé mzdy (od roku 2021)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <UsersIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Slevy na dani</h3>
                <p className="text-gray-600 text-sm">
                  2 570 Kč měsíčně základní sleva
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Jak funguje výpočet mzdy - detailní vysvětlení */}
        <div className="bg-white rounded-2xl border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jak se počítá čistá mzda v ČR</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold mb-2">Hrubá mzda</h3>
                <p className="text-gray-600">Výchozí částka před všemi odpočty podle pracovní smlouvy.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold mb-2">Pojistné na sociální zabezpečení (7,1%)</h3>
                <p className="text-gray-600">Odvod na důchodové (6,5%), nemocenské (0,6%) a státní politiku zaměstnanosti.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold mb-2">Pojistné na zdravotní pojištění (4,5%)</h3>
                <p className="text-gray-600">Odvod na veřejné zdravotní pojištění.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold mb-2">Daň z příjmů (15%)</h3>
                <p className="text-gray-600">Daň z příjmů fyzických osob přímo z hrubé mzdy (od roku 2021).</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">5</div>
              <div>
                <h3 className="font-semibold mb-2">Slevy na dani</h3>
                <p className="text-gray-600">Sleva na poplatníka (2 570 Kč měsíčně) a další slevy podle situace.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Důležité změny v roce 2026 */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Důležité změny v roce 2026</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Aktuální sazby 2026</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Daň z příjmů:</strong> 15% z hrubé mzdy (superhrubá mzda zrušena)</li>
                <li>• <strong>Sociální pojištění:</strong> zaměstnanec 7,1%, zaměstnavatel 24,8%</li>
                <li>• <strong>Zdravotní pojištění:</strong> zaměstnanec 4,5%, zaměstnavatel 9%</li>
                <li>• <strong>Základní sleva:</strong> 30 840 Kč ročně (2 570 Kč/měsíc)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Speciální případy</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Pracující důchodci:</strong> slevy na pojistném</li>
                <li>• <strong>Studenti do 26 let:</strong> dodatečné daňové úlevy</li>
                <li>• <strong>Zdravotně postižení:</strong> zvýšené slevy na dani</li>
                <li>• <strong>Rodiče:</strong> daňové zvýhodnění na děti</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ sekce */}
        <FAQSection
          title="Často kladené otázky o výpočtu čisté mzdy"
          faqs={[
            {
              question: "Jak se počítá čistá mzda v České republice?",
              answer: "Čistá mzda = Hrubá mzda - pojistné na sociální zabezpečení (7,1%) - pojistné na zdravotní pojištění (4,5%) - daň z příjmů (15% z hrubé mzdy) + slevy na dani. Od roku 2021 se daň počítá přímo z hrubé mzdy, superhrubá mzda byla zrušena."
            },
            {
              question: "Jaké jsou aktuální sazby pojistného a daní pro rok 2026?",
              answer: "Pro rok 2026: sociální pojištění zaměstnanec 7,1% (6,5% důchodové + 0,6% nemocenské), zdravotní pojištění zaměstnanec 4,5%, daň z příjmů 15%. Zaměstnavatel platí navíc 24,8% na sociální + 9% na zdravotní pojištění. Sleva na poplatníka je 30 840 Kč ročně (2 570 Kč měsíčně)."
            },
            {
              question: "Jak funguje sleva na dani na poplatníka?",
              answer: "Sleva na poplatníka je 30 840 Kč ročně (2 570 Kč měsíčně). Tato sleva se odečítá přímo z vypočtené daně, ne ze základu daně. Pokud je sleva vyšší než daň, dostanete daň nula, ale nevracejí se žádné peníze zpět."
            },
            {
              question: "Jak se liší výpočet mzdy u pracujících důchodců?",
              answer: "Pracující důchodci mají od roku 2026 slevu na důchodovém pojištění (6,5%), platí pouze nemocenské pojištění (0,6%) a zdravotní pojištění (4,5%). Celkem tedy 5,1% místo standardních 11,6%. Daň z příjmů a slevy na dani zůstávají stejné."
            },
            {
              question: "Co je to superhrubá mzda?",
              answer: "Superhrubá mzda byla zrušena k 1.1.2021. Dříve se z ní počítala daň z příjmů. Od roku 2021 se daň počítá přímo z hrubé mzdy sazbou 15% (místo 15% ze superhrubé). Díky tomu mají zaměstnanci vyšší čistou mzdu než v minulosti."
            },
            {
              question: "Jaké další slevy na dani mohu uplatnit?",
              answer: "Kromě základní slevy na poplatníka můžete uplatnit: slevu na manžela/manželku (24 840 Kč), slevu na invaliditu (I./II. stupeň 2 520 Kč, III. stupeň 5 040 Kč ročně), slevu pro držitele ZTP/P (16 140 Kč), daňové zvýhodnění na děti (progresivní: 1. dítě 15 204 Kč, 2. dítě 22 320 Kč, 3.+ dítě 27 840 Kč ročně)."
            },
            {
              question: "Kolik stojí zaměstnavatele můj plat?",
              answer: "Celkové náklady zaměstnavatele = hrubá mzda + 33,8% (pojistné zaměstnavatele). Z toho 24,8% jde na sociální pojištění a 9% na zdravotní pojištění. Při hrubé mzdě 50 tis. Kč platí zaměstnavatel celkem 66,9 tis. Kč."
            },
            {
              question: "Jak ovlivňují benefity výši čisté mzdy?",
              answer: "Některé benefity nejsou daněny: stravenky do 200 Kč/den, příspěvek na dopravu, vzdělávání, penzijní připojištění (do 50 tis. Kč ročně), životní pojištění (do 50 tis. Kč ročně). Ostatní benefity se zdaňují jako příjem."
            },
            {
              question: "Kdy se platí vyšší daň než 15%?",
              answer: "Vyšší daňová sazba 23% se uplatňuje na příjmy převyšující 1 935 552 Kč ročně (cca 161 tis. Kč měsíčně hrubého). Tato sazba se týká pouze části příjmu nad tímto limitem, ne celého příjmu."
            }
          ]}
          className="mt-16"
        />

        {/* CTA sekce */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">💰 Máte vyšší čistou mzdu než očekáváte?</h3>
            <p className="text-blue-100 mb-4">
              Spočítejte si, kolik můžete investovat měsíčně po pokrytí základních výdajů a vybudujte si bohatství.
            </p>
            <a 
              href="/kalkulacky/investicni-kalkulacka"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
            >
              Investiční kalkulačka
            </a>
          </div>
        </div>

        {/* Související nástroje */}
        <InternalLinking
          relatedLinks={[
            {
              title: "Investiční kalkulačka",
              href: "/kalkulacky/investicni-kalkulacka",
              description: "Investujte přebytky po základních výdajích"
            },
            {
              title: "Nouzová rezerva",
              href: "/kalkulacky/nouzova-rezerva",
              description: "Spočítejte si optimální velikost rezervy"
            },
            {
              title: "Hypoteční kalkulačka",
              href: "/kalkulacky/hypotecni-kalkulacka",
              description: "Zjistěte si dostupnost hypotéky podle příjmu"
            },
            {
              title: "FIRE kalkulačka",
              href: "/kalkulacky/fire-kalkulacka",
              description: "Plánování finanční nezávislosti"
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

export default NetSalaryCalculatorContent;