'use client';

import React from 'react';
import FAQSection from '../SEO/FAQSection';
import InternalLinking from '../SEO/InternalLinking';
import StructuredData from '../SEO/StructuredData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PiggyBankIcon, AlertIcon, ShieldIcon } from '../ui/icons';
import EmergencyFundCalculator from '../tools/EmergencyFundCalculator';

const EmergencyFundContent: React.FC = () => {
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
        "name": "Kalkulačka nouzové rezervy 2026",
        "item": "https://etfpruvodce.cz/kalkulacky/nouzova-rezerva"
      }
    ]
  };

  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kalkulačka nouzové rezervy 2026 - Emergency Fund",
    "description": "Spočítejte si optimální velikost nouzové rezervy podle rizikového profilu. Kde držet peníze a strategie spoření na emergency fund.",
    "url": "https://etfpruvodce.cz/kalkulacky/nouzova-rezerva",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CZK"
    },
    "featureList": [
      "Výpočet optimální velikosti nouzové rezervy",
      "Analýza osobního rizikového profilu",
      "Doporučení kde držet emergency fund",
      "Strategie postupného budování rezervy",
      "Zohlednění měsíčních výdajů a příjmů",
      "Personalizované rady pro úspory"
    ]
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero sekce */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShieldIcon className="w-4 h-4" />
            Kalkulačka nouzové rezervy 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Kalkulačka nouzové rezervy 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Spočítejte si optimální velikost nouzové rezervy podle vašeho rizikového profilu. 
            Finanční bezpečnost je základem každého investičního plánu.
          </p>
        </div>

        {/* Samotná kalkulačka */}
        <EmergencyFundCalculator />

        {/* Proč je nouzová rezerva důležitá */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Proč potřebujete nouzovou rezervu?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Neočekávané situace</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Ztráta zaměstnání</strong> - výpovědní lhůta nemusí stačit</li>
                <li>• <strong>Nemoc nebo úraz</strong> - snížení příjmů, vyšší výdaje</li>
                <li>• <strong>Opravu bydlení</strong> - protečení, topení, elektřina</li>
                <li>• <strong>Rodinné krize</strong> - rozvod, úmrtí v rodině</li>
                <li>• <strong>Ekonomická krize</strong> - propouštění, snížení mezd</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">Klid a flexibility</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Spánek v klidu</strong> - bez stresu z peněz</li>
                <li>• <strong>Lepší rozhodování</strong> - nemusíte spěchat</li>
                <li>• <strong>Žádné dluhy</strong> - nemusíte si půjčovat</li>
                <li>• <strong>Investiční klid</strong> - nemusíte prodávat za špatných podmínek</li>
                <li>• <strong>Příležitosti</strong> - můžete využít investiční šance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Velikost rezervy podle situace */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <ShieldIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">3 měsíce výdajů</h3>
              <p className="text-gray-600 text-sm">
                <strong>Minimální rezerva</strong><br/>
                Pro stabilní zaměstnání, mladé, bez závazků
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <PiggyBankIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">6 měsíců výdajů</h3>
              <p className="text-gray-600 text-sm">
                <strong>Standardní rezerva</strong><br/>
                Pro většinu lidí, rodiny s dětmi, hypotéka
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertIcon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">12+ měsíců výdajů</h3>
              <p className="text-gray-600 text-sm">
                <strong>Vysoká rezerva</strong><br/>
                OSVČ, nestabilní příjmy, zdravotní problémy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kde držet nouzovou rezervu */}
        <div className="bg-white rounded-2xl border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kde držet nouzovou rezervu v roce 2026</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-800">✅ Vhodné možnosti</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Spořicí účty CZK s vysokým úrokem</h4>
                  <p className="text-sm text-gray-600">mBank 4,01%, Raiffeisenbank 4,00% p.a., okamžitá dostupnost, pojištěno do 100k EUR</p>
                </div>
                <div>
                  <h4 className="font-semibold">Termínované vklady CZK</h4>
                  <p className="text-sm text-gray-600">3-6 měsíců, Fio 2,70% p.a., nižší likvidita, garance výnosu</p>
                </div>
                <div>
                  <h4 className="font-semibold">Státní dluhopisy ČR</h4>
                  <p className="text-sm text-gray-600">1-3 roky, CZK, vysoká bezpečnost, likvidita na sekundárním trhu</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-800">❌ Nevhodné možnosti</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Akciové ETF</h4>
                  <p className="text-sm text-gray-600">Vysoká volatilita - můžete přijít o 20-50% hodnoty</p>
                </div>
                <div>
                  <h4 className="font-semibold">Kryptoměny</h4>
                  <p className="text-sm text-gray-600">Extrémní volatilita, regulatorní rizika</p>
                </div>
                <div>
                  <h4 className="font-semibold">P2P půjčky</h4>
                  <p className="text-sm text-gray-600">Riziko defaultu, nízká likvidita</p>
                </div>
                <div>
                  <h4 className="font-semibold">Dluhopisy na 10+ let</h4>
                  <p className="text-sm text-gray-600">Úrokové riziko, může kolísat hodnota</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategie budování rezervy */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jak postavit nouzovou rezervu krok za krokem</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold mb-2">Spočítejte si měsíční výdaje</h3>
                <p className="text-gray-700">Sečtěte všechny nutné měsíční výdaje: bydlení, jídlo, doprava, pojištění, minimální oblečení. Zbytné věci nezapočítávejte.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold mb-2">Stanovte cíl podle rizika</h3>
                <p className="text-gray-700">3-12 měsíců výdajů podle vaší situace. Zaměstnanci: 3-6 měsíců, OSVČ: 6-12 měsíců, nestabilní příjmy: 12+ měsíců.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold mb-2">Začněte s malým cílem</h3>
                <p className="text-gray-700">První cíl: 1000 Kč, pak 10 000 Kč, pak 1 měsíc výdajů. Malé úspěchy motivují k pokračování.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold mb-2">Automatizujte spoření</h3>
                <p className="text-gray-700">Nastavte trvalý příkaz hned po výplatě. 10-20% příjmu na rezervu, dokud nedosáhnete cíle.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">5</div>
              <div>
                <h3 className="font-semibold mb-2">Teprve pak investujte</h3>
                <p className="text-gray-700">Až máte dostatečnou rezervu, můžete začít investovat do ETF. Rezerva je priorita č. 1!</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ sekce */}
        <FAQSection
          title="Často kladené otázky o nouzové rezervě"
          faqs={[
            {
              question: "Kolik měsíců výdajů mám mít v nouzové rezervě?",
              answer: "Závisí na vaší situaci: 3 měsíce pro stabilní zaměstnání bez závazků, 6 měsíců pro většinu lidí s rodinou/hypotékou, 12+ měsíců pro OSVČ nebo nestabilní příjmy. Rezerva má pokrýt neočekávané situace jako ztráta práce nebo zdravotní problémy."
            },
            {
              question: "Kde mám držet nouzovou rezervu v roce 2026?",
              answer: "Nejlepší jsou spořicí účty s vysokým úrokem (2-4% p.a.) pro okamžitou dostupnost, termínované vklady na 3-6 měsíců (3-5% p.a.), nebo konzervativní peněžní trh ETF. NIKDY v akciích, kryptoměnách nebo P2P půjčkách - ty mohou klesnout právě když peníze potřebujete."
            },
            {
              question: "Mám nejprve spořit na rezervu nebo investovat do ETF?",
              answer: "VŽDY nejprve rezerva! Bez nouzové rezervy budete muset v krizi prodávat investice za nevýhodných podmínek. Ideální postup: 1) malá rezerva 10-20k Kč, 2) dobudování plné rezervy, 3) teprve pak investování do ETF. Rezerva je pojištění vašich investic."
            },
            {
              question: "Kolik procent příjmu mám dávat na nouzovou rezervu?",
              answer: "Dokud nemáte dostatečnou rezervu, doporučuje se 10-20% čistého příjmu. Po dosažení cíle můžete tyto peníze směrovat do investic. Čím rychleji si postavíte rezervu, tím dříve můžete začít investovat a využívat compound interest efekt."
            },
            {
              question: "Můžu použít nouzovou rezervu na investiční příležitosti?",
              answer: "NE! Nouzová rezerva je pouze na skutečné nouze - ztráta práce, nemoc, opravy. Investiční příležitosti nejsou nouze. Pokud chcete využívat příležitosti, vytvořte si separátní 'oportunistický fond' nad rámec nouzové rezervy."
            },
            {
              question: "Je hypotéka důvodem k vyšší nouzové rezervě?",
              answer: "Ano, s hypotékou byste měli mít vyšší rezervu (6-9 měsíců splátek + výdajů). Hypoteční splátky nejdou odložit a při neschopnosti splácet hrozí exekuce. Zároveň počítejte s možnými opravami nemovitosti, které nejdou předvídat."
            },
            {
              question: "Jak často mám přehodnotit velikost nouzové rezervy?",
              answer: "Kontrolujte ročně nebo při větších životních změnách: zvýšení příjmů/výdajů, narození dítěte, koupě nemovitosti, změna zaměstnání, rozwod nebo nemoc. Rezerva má odpovídat vaší aktuální životní situaci a rizikovému profilu."
            }
          ]}
          className="mt-16"
        />

        {/* Související nástroje */}
        <InternalLinking
          relatedLinks={[
            {
              title: "Kalkulačka čisté mzdy",
              href: "/kalkulacky/cisty-plat-2026",
              description: "Spočítejte si disponibilní příjem pro spoření"
            },
            {
              title: "Investiční kalkulačka",
              href: "/kalkulacky/investicni-kalkulacka",
              description: "Po vytvoření rezervy začněte investovat"
            },
            {
              title: "FIRE kalkulačka",
              href: "/kalkulacky/fire-kalkulacka",
              description: "Plánování finanční nezávislosti a předčasného odchodu do důchodu"
            },
            {
              title: "Srovnání brokerů",
              href: "/srovnani-brokeru",
              description: "Kde investovat přebytky po rezervě"
            }
          ]}
          title="Související kalkulačky a nástroje"
          className="mt-16"
        />
      </div>
    </>
  );
};

export default EmergencyFundContent;