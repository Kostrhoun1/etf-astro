# 🚀 IMPLEMENTAČNÍ PLÁN - Gemini Strategie pro ETF Průvodce

**Cíl:** Transformovat web z databázového přehledu na autoritativní hodnotící platformu z pohledu českého investora

**Časový rámec:** 2-4 týdny (systematická implementace)

**Očekávaný výsledek:** Zvýšení indexace z 14 na 80+ statických stránek do 4-8 týdnů

---

## 📊 ANALÝZA SOUČASNÉHO STAVU

### Problémy:
- ✅ Astro framework funguje správně (build OK, homepage indexována)
- ❌ Pouze 14 stránek indexováno (z 3900+)
- ❌ "Thin content" - tabulková data bez interpretace
- ❌ Nedostatek českého kontextu (daně, brokeři, měna)
- ❌ Chybí autoritativní hodnocení (E-E-A-T)
- ❌ Ztráta důvěryhodnosti kvůli www/non-www chaosu

### Silné stránky:
- ✅ VÍCE obsahu než původní Vite verze (+38% průměrně)
- ✅ Kvalitní databáze 4300+ ETF
- ✅ Fungující rating systém (potřebuje rozšíření)
- ✅ Technicky správná implementace

---

## 🎯 FÁZE 1: VYTVOŘENÍ KOMPONENT (Týden 1)

### 1.1 ✅ CzechTaxContext.astro (HOTOVO)
**Props:** `isAccumulating`, `currency`, `fundName?`

**Obsah:**
- Akumulační vs distribuční ETF
- 3letý časový test (osvobození od daně)
- Měnové riziko
- Praktické tipy pro české investory

**Použití:** ETF stránky, broker recenze, vzdělávací články

---

### 1.2 🔄 CzechBrokerAvailability.astro (V PRÁCI)
**Props:** `etfName`, `isin`, `ter`, `isPopular?`

**Obsah:**
- Srovnání poplatků u českých brokerů (XTB, Trading212, DEGIRO, Portu, Fio)
- Kalkulace reálných nákladů pro různé investiční částky
- Doporučení "nejlepší broker pro toto ETF"
- Odkazy na recenze brokerů
- Frakční podíly a automatické investování

**Proč to pomůže:**
- České názvy brokerů = unikátní obsah
- Konkrétní cifry v Kč = lokální relevance
- Google vidí praktickou hodnotu pro české uživatele

---

### 1.3 ExpertVerdict.astro
**Props:** `etfName`, `category`, `suitableFor[]`, `notSuitableFor[]`, `personalOpinion`, `author`

**Obsah:**
- ✅ Pro koho je vhodné (3-4 body)
- ❌ Pro koho to není (3-4 body)
- 💡 Osobní názor autora (Tomáš Kostrhoun)
- ⭐ Celkové hodnocení (1-5 hvězdiček s vysvětlením)
- 🔗 Alternativy a konkurence

**E-E-A-T signály:**
- Jméno autora + odkaz na LinkedIn
- Datum aktualizace
- "Z mé zkušenosti jako investor..."
- "Osobně využívám / Osobně bych zvolil..."

---

### 1.4 ETFRatingDetailed.astro
**Props:** `rating`, `ter`, `fundSize`, `return1y`, `return5y`, `trackingError`, `category`

**Rozšířené hodnocení s interpretací:**

```typescript
// Hodnocení podle kategorií (1-5 hvězdiček):
- 💰 Nákladovost (TER): Jak nízké jsou poplatky vs. průměr
- 📊 Velikost fondu: Stabilita a likvidita
- 📈 Historická výkonnost: Porovnání s kategorií
- 🎯 Tracking error: Jak přesně kopíruje index
- 💎 Celková atraktivita: Agregát všech faktorů
```

**Interpretace každé metriky:**
```
TER: 0.07%
❌ Špatně: "Poplatek 0.07%"
✅ Dobře: "Extrémně nízký poplatek 0.07% - hluboko pod průměrem
           trhu (0.20%). Pro investici 1M Kč = pouze 700 Kč ročně.
           Konkurence s TER 0.5% = 5 000 Kč. Rozdíl 4 300 Kč/rok!"
```

---

### 1.5 DataInterpretation.astro
**Props:** `metric`, `value`, `average`, `category`

**Univerzální komponenta pro interpretaci dat:**
- Zobrazí hodnotu + kontext
- Porovnání s průměrem kategorie
- Vysvětlení, co to znamená pro investora
- Vizuální indikátor (🟢 výborné, 🟡 průměrné, 🔴 slabé)

**Příklad použití:**
```astro
<DataInterpretation
  metric="TER"
  value={0.07}
  average={0.20}
  category="Akciové ETF"
/>
```

---

### 1.6 AlternativesComparison.astro
**Props:** `currentETF`, `alternatives[]`, `comparisonPoints[]`

**Obsah:**
- "Nevyhovuje vám X? Zvažte..."
- Porovnání 2-3 alternativ (tabulka)
- Kdy zvolit alternativu
- Odkazy na detailní srovnání

**Proč to pomůže:**
- Internal linking (SEO)
- Delší time on page
- Snižuje bounce rate
- Google vidí komplexnost obsahu

---

## 🎯 FÁZE 2: ÚPRAVA STRÁNEK (Týden 2-3)

### Priority úprav (podle GSC Impressions):

#### 2.1 Stránky jednotlivých ETF `/etf/[isin].astro`

**Nová struktura:**

```astro
---
// Frontmatter - data fetching
---

<!-- 1. HERO sekce s breadcrumbs -->
<Hero etfName={etf.name} ticker={ticker} category={etf.category} />

<!-- 2. RYCHLÉ HODNOCENÍ - NAD THE FOLD -->
<section class="bg-gradient-to-r from-violet-50 to-blue-50 p-8 rounded-xl">
  <div class="flex items-center gap-4 mb-4">
    <span class="text-3xl">🇨🇿</span>
    <div>
      <h2 class="text-2xl font-bold">Naše hodnocení pro české investory</h2>
      <p class="text-sm text-gray-600">Hodnotíme {etf.name} z pohledu českých poplatků, daní a dostupnosti</p>
    </div>
  </div>

  <ETFRatingDetailed
    rating={calculatedRating}
    ter={etf.ter_numeric}
    fundSize={etf.fund_size_numeric}
    ...
  />
</section>

<!-- 3. DATOVÁ KARTA - Stávající tabulka -->
<section>
  <h2>Základní informace</h2>
  {/* Stávající data, ALE s interpretací pod každým blokem */}

  <DataInterpretation metric="TER" value={etf.ter_numeric} />
  <DataInterpretation metric="Fund Size" value={etf.fund_size_numeric} />
</section>

<!-- 4. ČESKÝ KONTEXT - KLÍČOVÁ SEKCE -->
<CzechTaxContext
  isAccumulating={etf.distribution_policy === 'Accumulating'}
  currency={etf.fund_currency}
  fundName={etf.name}
/>

<!-- 5. KDE KOUPIT V ČR -->
<CzechBrokerAvailability
  etfName={etf.name}
  isin={etf.isin}
  ter={etf.ter_numeric}
/>

<!-- 6. PORTFOLIO SLOŽENÍ - Stávající holdings -->

<!-- 7. NÁŠ VERDIKT - E-E-A-T -->
<ExpertVerdict
  etfName={etf.name}
  category={etf.category}
  suitableFor={generateSuitableFor(etf)}
  notSuitableFor={generateNotSuitableFor(etf)}
  personalOpinion={generatePersonalOpinion(etf)}
  author="Tomáš Kostrhoun"
/>

<!-- 8. ALTERNATIVY -->
<AlternativesComparison
  currentETF={etf}
  alternatives={relatedETFs}
/>

<!-- 9. FAQ -->
<ETFFAQSection etf={etf} />

<!-- 10. INTERNAL LINKING -->
<InternalLinking />
```

**Klíčové změny:**
- Hodnocení PŘED daty (user intent)
- České kontexty v každé sekci
- Osobní názor autora
- Interpretace VŠECH dat

---

#### 2.2 Co jsou ETF `/co-jsou-etf.astro`

**Doplnit:**
1. Sekce "Jak vybrat ETF jako český investor"
   - Daňové optimalizace
   - Výběr brokera
   - Měnové páry

2. Sekce "Časté chyby českých začátečníků"
   - Neznalost 3letého testu
   - Distribuční vs akumulační
   - Přehlížení poplatků brokera

3. Příběh/case study
   - "Jan investuje 5000 Kč měsíčně do VWCE"
   - Kalkulace po 10, 20, 30 letech
   - Daňové dopady

**Přidat komponenty:**
```astro
<CzechInvestorChecklist />
<BrokerComparisonCalculator />
<TaxOptimizationGuide />
```

---

#### 2.3 Kde koupit ETF `/kde-koupit-etf.astro`

**Rozšířit každou recenzi brokera:**

```astro
<!-- Pro každého brokera -->
<section>
  <h2>XTB - Recenze z pohledu českého investora</h2>

  <!-- Hodnocení -->
  <div class="rating">⭐⭐⭐⭐⭐ 4.8/5</div>

  <!-- Osobní verdikt -->
  <blockquote>
    "XTB používám osobně pro pravidelné investování. 0% poplatky
    do 100 000 EUR ročně znamenají, že při měsíční investici
    10 000 Kč ušetřím oproti DEGIRU cca 360 Kč ročně."
    - Tomáš Kostrhoun, zakladatel ETF průvodce
  </blockquote>

  <!-- Konkrétní kalkulace -->
  <div class="calculator">
    <h3>Kolik vás bude stát investování 10 000 Kč měsíčně?</h3>
    - XTB: 0 Kč
    - Trading212: 0 Kč
    - DEGIRO: 30 Kč × 12 = 360 Kč/rok
    - Fio: 0.25% = 300 Kč/měsíc = 3 600 Kč/rok ⚠️
  </div>

  <!-- Pro koho -->
  <ExpertVerdict
    suitableFor={[
      "Pravidelní investoři (DCA)",
      "Objem do 100k EUR ročně",
      "Začátečníci (česká podpora)"
    ]}
    notSuitableFor={[
      "Velmi velké objemy (100k+ EUR/rok)",
      "Day tradeři (jiná platforma)"
    ]}
  />
</section>
```

---

#### 2.4 Portfolio strategie `/portfolio-strategie.astro`

**Pro každou strategii přidat:**

1. **Backtesting z pohledu českého investora**
   - Výkonnost v Kč (ne jen USD)
   - Vliv měnového kurzu CZK/USD
   - Daňové dopady

2. **Implementace v ČR**
   ```
   Ray Dalio All Weather:
   - 40% dlouhodobé dluhopisy → Jaké ETF koupit v ČR?
   - 30% akcie → VWCE nebo CSPX?
   - 15% střednědobé dluhopisy → Které konkrétně?
   - 7.5% komodity → Dostupné přes XTB?
   - 7.5% zlato → Fyzické nebo ETF?
   ```

3. **Osobní zkušenost**
   ```
   "Osobně využívám modifikovanou verzi této strategie.
   Namísto střednědobých dluhopisů držím hotovost na
   spořicím účtu (4% p.a.), protože..."
   ```

---

#### 2.5 Ostatní statické stránky

**Systematicky projít všech 80+ stránek a doplnit:**

1. **Broker recenze** (DEGIRO, Interactive Brokers, Fio, Portu, Trading212, XTB)
   - Osobní verdikt
   - Konkrétní kalkulace poplatků v Kč
   - Pro koho / pro koho ne
   - Case study: "Petr investuje 5000 Kč měsíčně"

2. **Kalkulačky** (10+ stránek)
   - Úvod: "Proč jsem vytvořil tuto kalkulačku"
   - Návod: "Jak používat (5 kroků)"
   - Interpretace výsledků
   - Case study s konkrétními čísly

3. **Nejlepší ETF kategorie** (30+ stránek)
   - Úvod: "Jak jsme vybírali"
   - Metodologie hodnocení
   - Osobní top 3 s vysvětlením
   - Varování před běžnými chybami

4. **Srovnání ETF** (CSPX vs VWRA, atd.)
   - Úvod: "Které je lepší pro českého investora?"
   - Tabulka PLUS interpretace každého řádku
   - Závěrečné doporučení (ne "záleží na vás")
   - Praktický příklad: "Pro mladého investora → CSPX, pro konzervativního → VWRA"

---

## 🎯 FÁZE 3: TECHNICKÉ ÚPRAVY (Týden 2)

### 3.1 Sitemap - vrátit ETF stránky

**Před:**
```javascript
sitemap({
  filter: (page) => !page.includes('/etf/')
})
```

**Po:**
```javascript
sitemap({
  // Žádný filtr - zahrnout všechny stránky
  // Nebo selektivní filtr pro opravdu nepotřebné stránky
  filter: (page) => !page.includes('/api/') && !page.includes('/_')
})
```

### 3.2 Schema.org - rozšířené structured data

**Pro každou ETF stránku:**
```json
{
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "...",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "bestRating": "5",
    "ratingCount": "1",
    "reviewCount": "1"
  },
  "review": {
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": "Tomáš Kostrhoun",
      "url": "https://etfpruvodce.cz/o-nas"
    },
    "datePublished": "2026-01-08",
    "reviewBody": "...",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "4.5",
      "bestRating": "5"
    }
  }
}
```

### 3.3 Internal linking automatizace

**Vytvořit komponentu SmartInternalLinks.astro:**
- Analyzuje kontext stránky (kategorie, ETF, téma)
- Automaticky navrhuje 5-8 relevantních odkazů
- Zobrazuje je v kontextu, ne jen jako seznam

---

## 🎯 FÁZE 4: TESTOVÁNÍ (Týden 3)

### 4.1 Lokální testing

**Checklist pro každou upravenou stránku:**
- [ ] Build projde bez chyb
- [ ] Stránka se načte < 3s
- [ ] Všechny komponenty renderují správně
- [ ] Žádné prázdné Props
- [ ] Meta tagy jsou správně
- [ ] Canonical URL je správná
- [ ] Schema.org validní (validator.schema.org)

### 4.2 Content audit

**Pro každou stránku zkontrolovat:**
- [ ] Word count > 1500 slov (nebo 800+ pro menší stránky)
- [ ] Minimálně 5 H2 nadpisů
- [ ] Alespoň 1 autorský názor/verdikt
- [ ] Alespoň 1 sekce s českým kontextem
- [ ] 5-10 internal links
- [ ] Žádný duplicitní obsah
- [ ] Přidaná hodnota oproti konkurenci

### 4.3 SEO audit

**Nástroje:**
- Google Search Console - submit URL
- Screaming Frog - technické SEO
- Lighthouse - Core Web Vitals
- Google Rich Results Test - structured data

**Metriky sledovat:**
- Time on page (cíl: 3+ minuty)
- Bounce rate (cíl: < 60%)
- Page speed (cíl: < 2s)
- Mobile usability (cíl: 100%)

---

## 🎯 FÁZE 5: DEPLOYMENT A MONITORING (Týden 3-4)

### 5.1 Postupné nasazení

**Strategie: A/B testing na Top 10 stránkách**

1. **Týden 3 - Den 1:**
   - Deploy upravených 10 stránek
   - Request indexing v GSC pro každou stránku
   - Snapshot metrik (GSC, GA)

2. **Týden 3-4:**
   - Sledovat denně: impressions, clicks, CTR
   - Sledovat týdně: indexace, pozice
   - Porovnat s kontrolní skupinou (neupravené stránky)

3. **Týden 4:**
   - Vyhodnotit výsledky
   - Pokud úspěch (+20% impressions) → pokračovat
   - Pokud neúspěch → iterovat na základě dat

### 5.2 Top 10 stránek k testování

**Podle GSC Impressions (descending):**
1. Homepage `/` (již indexována - použít jako benchmark)
2. `/co-jsou-etf`
3. `/kde-koupit-etf`
4. `/srovnani-etf`
5. `/nejlepsi-etf`
6. `/portfolio-strategie`
7. `/degiro-recenze`
8. `/xtb-recenze`
9. `/kalkulacky/investicni-kalkulacka`
10. `/nejlepsi-etf/nejlepsi-sp500-etf`

### 5.3 Měření úspěchu

**KPI - týden 0 (baseline):**
- Indexováno: 14 stránek
- Impressions: X
- Clicks: Y
- CTR: Z%

**KPI - týden 2 (první měření):**
- Cíl: +5-10 nově indexovaných stránek
- Cíl: +50% impressions na upravených stránkách
- Cíl: +20% CTR

**KPI - týden 4 (finální měření):**
- Cíl: 20-30 indexovaných stránek
- Cíl: +100% impressions celkem
- Cíl: +30% organic traffic

**KPI - týden 8 (dlouhodobý efekt):**
- Cíl: 50+ indexovaných stránek
- Cíl: +200% impressions
- Cíl: Návrat na úroveň před www/non-www chaosem

---

## 🎯 FÁZE 6: ŠKÁLOVÁNÍ (Týden 5-8)

### 6.1 Pokud test úspěšný → aplikovat na všechny stránky

**Priorita 1: Statické stránky (80 stránek)**
- Týden 5: Broker recenze (6 stránek)
- Týden 6: Kalkulačky (10 stránek)
- Týden 7: Nejlepší ETF kategorie (30 stránek)
- Týden 8: Ostatní (34 stránek)

**Priorita 2: ETF stránky (3800+ stránek)**
- Vytvořit automatizaci pro generování personalizovaných verdiktů
- Použít AI/šablony pro generování unikátních "Náš názor" sekcí
- Postupné nasazení po 100 stránkách týdně

### 6.2 Automatizace pro ETF stránky

**Vytvořit funkci generateExpertVerdict(etf):**

```typescript
function generateExpertVerdict(etf: ETF) {
  // Pravidla pro "Pro koho je vhodné"
  const suitableFor = [];

  if (etf.category === 'Equity') {
    if (etf.return_5y > 50) {
      suitableFor.push("Investory hledající dlouhodobý růst");
    }
    if (etf.fund_size_numeric > 1000) {
      suitableFor.push("Konzervativní investory (vysoká likvidita)");
    }
  }

  if (etf.distribution_policy === 'Accumulating') {
    suitableFor.push("České investory (daňová optimalizace)");
  }

  // ... další pravidla

  return {
    suitableFor,
    notSuitableFor,
    personalOpinion: generatePersonalOpinion(etf)
  };
}
```

**Výhoda:**
- Škálovatelné na 3800 stránek
- Konzistentní, ale unikátní obsah
- Lidský editor může dále vylepšit

---

## 📋 CHECKLIST PŘED SPUŠTĚNÍM

### Technické
- [ ] Build probíhá bez chyb
- [ ] Všechny komponenty mají TypeScript typy
- [ ] Props validation
- [ ] Error boundaries
- [ ] Fallback pro chybějící data

### SEO
- [ ] Robots.txt správný
- [ ] Sitemap.xml obsahuje všechny stránky
- [ ] Canonical URLs správné
- [ ] Meta descriptions < 160 znaků
- [ ] Titles < 60 znaků
- [ ] Schema.org validní
- [ ] Internal links fungují
- [ ] Žádné broken links

### Content
- [ ] Všechny sekce mají heading
- [ ] Word count > minimum
- [ ] České kontexty všude
- [ ] Autorské verdikty
- [ ] Žádné duplicity
- [ ] Gramatika OK
- [ ] Diakritika OK

### Legal
- [ ] Disclaimer o nefinanční poradnu
- [ ] GDPR compliance
- [ ] Cookies consent
- [ ] Autorská práva (obrázky)

---

## 🚨 RIZIKA A MITIGACE

### Riziko 1: Google nepřeindexuje ani po úpravách
**Pravděpodobnost:** Střední (30%)
**Mitigace:**
- Čekat 8 týdnů, ne jen 4
- Získat backlinks (PR článek, guest posting)
- Social media push (X, LinkedIn)

### Riziko 2: Úpravy zhorší současnou indexaci
**Pravděpodobnost:** Nízká (10%)
**Mitigace:**
- A/B test na malé skupině první
- Verzování (Git) - možnost rollback
- Monitoring GSC denně

### Riziko 3: Automatizace vytvoří duplicitní obsah
**Pravděpodobnost:** Střední (40%)
**Mitigace:**
- Lidská revize vzorku (10% stránek)
- Použít AI pro variace, ne kopírování
- Plagiarism checker

### Riziko 4: Časová náročnost je vyšší než plán
**Pravděpodobnost:** Vysoká (60%)
**Mitigace:**
- Buffer 50% na každou fázi
- Prioritizovat Top 20 stránek, ne všech 80
- Iterativní přístup, ne waterfall

---

## 📊 RESOURCE REQUIREMENTS

### Čas
- **Týden 1:** 20-30 hodin (komponenty)
- **Týden 2:** 20-30 hodin (úprava Top 10)
- **Týden 3:** 10 hodin (testing + monitoring)
- **Týden 4:** 10 hodin (analýza výsledků)
- **Týden 5-8:** 40 hodin (škálování)

**Celkem: 100-120 hodin**

### Tools
- Astro (máme)
- Google Search Console (máme)
- Google Analytics (máme)
- AI pro generování variací (ChatGPT/Claude)
- Plagiarism checker (Copyscape nebo podobný)

---

## 🎯 SUCCESS CRITERIA

### Minimální úspěch (Tier 1)
- ✅ 30+ stránek indexováno (z 14)
- ✅ +100% impressions
- ✅ +50% clicks
- ✅ Žádný pokles v pozicích stávajících stránek

### Střední úspěch (Tier 2)
- ✅ 50+ stránek indexováno
- ✅ +200% impressions
- ✅ +100% clicks
- ✅ Top 3 pozice pro hlavní keywords

### Plný úspěch (Tier 3)
- ✅ 80+ statických stránek indexováno
- ✅ 500+ ETF stránek indexováno
- ✅ +500% impressions
- ✅ +300% organic traffic
- ✅ Featured snippets pro FAQ

---

## 📅 TIMELINE OVERVIEW

| Týden | Fáze | Úkoly | Výstupy |
|-------|------|-------|---------|
| 1 | Komponenty | Vytvoření 6 komponent | Reusable components |
| 2 | Top 10 | Úprava 10 klíčových stránek | 10 optimalizovaných stránek |
| 3 | Testing | Deploy + monitoring | Data o úspěšnosti |
| 4 | Analýza | Vyhodnocení, iterace | Go/No-go rozhodnutí |
| 5-6 | Škálování 1 | Broker + kalkulačky (16 stránek) | 26 stránek celkem |
| 7-8 | Škálování 2 | Nejlepší ETF (30 stránek) | 56 stránek celkem |
| 9+ | ETF stránky | Postupné nasazení po 100/týden | 3800+ stránek |

---

## 🔄 ITERAČNÍ PŘÍSTUP

**Nebudeme dělat waterfall (vše najednou), ale iterace:**

1. **Sprint 1:** Vytvořit 3 komponenty → otestovat na 1 stránce
2. **Sprint 2:** Vytvořit dalších 3 komponenty → otestovat na 5 stránkách
3. **Sprint 3:** Deploy 10 stránek → měřit týden
4. **Sprint 4:** Iterovat na základě dat → škálovat

**Výhoda:**
- Rychlé učení se z chyb
- Flexibilita v přístupu
- Minimalizace rizika
- Průběžné výsledky

---

## 📞 KOMUNIKACE A REPORTING

**Weekly check-in:**
- Co se udělalo
- Co funguje / nefunguje
- Plán na další týden
- Blockers

**Nástroje:**
- Google Sheets: Tracking progress
- GSC: Denní monitoring indexace
- GA: Týdenní traffic report
- Git commits: Versioning

---

## ✅ ROZHODNUTÍ: ZAČÍT IMPLEMENTACI?

Tento plán je **velmi detailní** a systematický.

**Doporučuji začít DNES:**
1. Dokončím zbývající komponenty (2-3 hodiny)
2. Upravíme 1 vzorovou stránku (1 hodina)
3. Ukážu výsledek
4. Rozhodnete se, jestli pokračovat

**Souhlasíte? Mám pokračovat v implementaci komponent?**
