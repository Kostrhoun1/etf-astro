'use client';

import React from 'react';

import FAQSection from '../SEO/FAQSection';
import InternalLinking from '../SEO/InternalLinking';
import StructuredData from '../SEO/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { HomeIcon, CalculatorIcon, TrendingUpIcon } from '../ui/icons';
import MortgageCalculator from '../tools/MortgageCalculator';

const MortgageCalculatorContent: React.FC = () => {
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
        "name": "Hypoteční kalkulačka 2026",
        "item": "https://www.etfpruvodce.cz/kalkulacky/hypotecni-kalkulacka"
      }
    ]
  };

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Hypoteční kalkulačka 2026 - Výpočet hypotéky",
    "description": "Bezplatná hypoteční kalkulačka pro výpočet měsíčních splátek hypotéky. Spočítejte si celkové náklady na bydlení, vlastní kapitál a úročení.",
    "url": "https://www.etfpruvodce.cz/kalkulacky/hypotecni-kalkulacka",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CZK"
    },
    "featureList": [
      "Výpočet měsíčních splátek hypotéky",
      "Analýza celkových nákladů na úvěr",
      "Kalkulace vlastního kapitálu",
      "Srovnání různých úrokových sazeb",
      "Doba splatnosti až 30 let",
      "Struktura splátek - úroky vs jistina"
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero sekce */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HomeIcon className="w-4 h-4" />
            Hypoteční kalkulačka 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hypoteční kalkulačka 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Spočítejte si přesnou výši měsíční splátky hypotéky a celkové náklady úvěru s aktuálními úrokovými sazbami pro rok 2026.
          </p>
        </div>

        {/* Samotná kalkulačka */}
        <MortgageCalculator />

        {/* Klíčové informace o hypotékách */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Klíčové informace o hypotékách 2026</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <CalculatorIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Anuita</h3>
                <p className="text-gray-600 text-sm">
                  Rovnoměrné měsíční splátky po celou dobu úvěru
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUpIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Vlastní kapitál</h3>
                <p className="text-gray-600 text-sm">
                  Minimálně 20% z ceny nemovitosti
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <HomeIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fixace</h3>
                <p className="text-gray-600 text-sm">
                  Stabilní úroková sazba po stanovenou dobu
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <HomeIcon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Daňové úlevy</h3>
                <p className="text-gray-600 text-sm">
                  Odpočet úroků až 300 000 Kč ročně
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Praktické rady pro hypotéky */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jak získat nejlepší hypotéku v roce 2026?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Příprava na hypotéku</h3>
              <p className="text-gray-700 mb-4">
                Úspěch při vyjednávání hypotéky začíná dobrou přípravou. 
                Banky hodnotí vaši bonitu podle několika klíčových kritérií.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Vlastní kapitál:</strong> Alespoň 20% z ceny nemovitosti</li>
                <li>• <strong>Stabilní příjem:</strong> Alespoň 6 měsíců ze stejného zdroje</li>
                <li>• <strong>Čistá kreditní historie:</strong> Žádné nesplacené dluhy</li>
                <li>• <strong>Rezerva:</strong> 3-6 násobek měsíční splátky</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Výběr nejlepší nabídky</h3>
              <p className="text-gray-700 mb-4">
                Neberte první nabídku od banky. Porovnejte podmínky u více poskytovatelů 
                a vyjednávejte lepší sazbu na základě svých silných stránek.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Porovnejte sazby:</strong> RPSN u 3-5 různých bank</li>
                <li>• <strong>Vyjednávejte:</strong> Využijte konkurenční nabídky</li>
                <li>• <strong>Zkontrolujte poplatky:</strong> Vyřizování, odhad, vedení</li>
                <li>• <strong>Volte správnou fixaci:</strong> Podle tržních výhledů</li>
              </ul>
            </div>
          </div>
        </div>


        {/* FAQ sekce */}
        <FAQSection
          title="Často kladené otázky o hypoteční kalkulačce"
          faqs={[
            {
              question: "Jak funguje hypoteční kalkulačka?",
              answer: "Hypoteční kalkulačka vypočítává měsíční splátky pomocí anuity - rovnoměrné splátky po celou dobu úvěru. Výpočet zohledňuje výši úvěru, úrokovou sazbu a dobu splatnosti. V čase se mění poměr úroků a jistiny - na začátku platíte více na úrocích, ke konci více na jistině."
            },
            {
              question: "Jaký je optimální vlastní kapitál při koupi nemovitosti?",
              answer: "Doporučuje se mít alespoň 20% vlastního kapitálu z ceny nemovitosti. To snižuje úrokovou sazbu a eliminuje nutnost platit pojištění hypotéky. S vyšším vlastním kapitálem (30-40%) získáte ještě lepší úrokové sazby od bank."
            },
            {
              question: "Jaké jsou průměrné úrokové sazby hypotéky v roce 2026?",
              answer: "Úrokové sazby hypotéky se průběžně mění podle situace na trhu. Závisí na bance, výši vlastního kapitálu a době fixace. Kratší fixace (3-5 let) mívají obvykle nižší sazby než dlouhé fixace (15-20 let). Pro aktuální sazby doporučujeme oslovit více bank."
            },
            {
              question: "Jak dlouho by měla být doba splatnosti hypotéky?",
              answer: "Nejčastěji se volí 25-30 let. Delší doba znamená nižší měsíční splátky, ale vyšší celkové náklady na úroky. Kratší doba (15-20 let) má vyšší splátky, ale ušetříte na úrocích. Vyberte podle svojí finanční situace."
            },
            {
              question: "Co zahrnuje měsíční splátka hypotéky?",
              answer: "Měsíční splátka hypotéky se skládá z úroků a jistiny. Na začátku tvoří úroky většinu splátky, postupně se poměr obrací. Kromě hypotéky počítejte i s pojištěním nemovitosti, daní z nemovitosti a případnými poplatky za správu úvěru."
            },
            {
              question: "Lze hypotéku předčasně splatit?",
              answer: "Hypotéku můžete předčasně doplatit kdykoliv v průběhu trvání úvěru. Předčasné splacení je bez poplatku na konci fixačního období úrokové sazby nebo v případě vážných životních situací (úmrtí, invalidita, ztráta práce). V ostatních případech banka může účtovat sankci za předčasné splacení, obvykle 0,5-2% z předčasně splacené částky. Před předčasným splacením si spočítejte celkové náklady včetně poplatků."
            },
            {
              question: "Jaké dokumenty potřebuji k žádosti o hypotéku?",
              answer: "Obvykle potřebujete: doklady totožnosti, potvrzení o příjmech (3-6 měsíců), výpis z účtu, kupní smlouvu nebo smlouvu o budoucí smlouvě, odhad nemovitosti, a další dokumenty podle požadavků banky. Příprava dokumentů může trvat několik týdnů."
            },
            {
              question: "Jak si mohu odečíst úroky z hypotéky z daní?",
              answer: "V České republice si můžete odečíst zaplacené úroky z hypotéky z daňového základu až do výše 300 000 Kč ročně. To představuje úsporu až 45 000 Kč ročně na daních (při 15% sazbě). Úleva platí pro hypotéku na vlastní bydlení, ne pro investiční nemovitosti."
            },
            {
              question: "Co je to RPSN a proč je důležité?",
              answer: "RPSN (Roční Procentní Sazba Nákladů) zahrnuje nejen úrokovou sazbu, ale i všechny poplatky spojené s hypotékou. Je to nejlepší nástroj pro porovnání nabídek různých bank. RPSN ukazuje skutečnou roční cenu úvěru včetně všech nákladů."
            },
            {
              question: "Kdy je vhodné refinancovat hypotéku?",
              answer: "Refinancování je výhodné, pokud můžete získat úrokovou sazbu alespoň o 0,5-1% nižší než máte aktuálně, a zároveň zbývá více než 5 let do konce úvěru. Nezapomeňte započítat náklady na refinancování (odhad, notář, poplatky). Refinancování je také příležitost k vyjednání lepších podmínek."
            }
          ]}
          className="mt-16"
        />

        {/* CTA sekce */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">💰 Chcete ušetřit na hypotéce?</h3>
            <p className="text-green-100 mb-4">
              Po splacení hypotéky investujte ušetřené peníze do ETF portfolia. Dlouhodobě může být výnosnější než předčasné splácení hypotéky.
            </p>
            <a 
              href="/kalkulacky/investicni-kalkulacka"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-block"
            >
              Investiční kalkulačka
            </a>
          </div>
        </div>

        {/* Související nástroje */}
        <InternalLinking
          relatedLinks={[
            {
              title: "Úvěrová kalkulačka",
              href: "/kalkulacky/uverova-kalkulacka",
              description: "Spočítejte si splátky spotřebitelského úvěru"
            },
            {
              title: "Kalkulačka čisté mzdy",
              href: "/kalkulacky/cisty-plat-2026",
              description: "Zjistěte si disponibilní příjem pro hypotéku"
            },
            {
              title: "Investiční kalkulačka",
              href: "/kalkulacky/investicni-kalkulacka",
              description: "Investujte přebytky po splácení hypotéky"
            },
            {
              title: "Nouzová rezerva",
              href: "/kalkulacky/nouzova-rezerva",
              description: "Spočítejte si rezervu před koupí nemovitosti"
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

export default MortgageCalculatorContent;