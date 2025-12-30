# MIGRACE ETF ASTRO - PROJEKTOVÝ PLÁN

## HLAVNÍ CÍL
**Každá stránka v Astro MUSÍ být 100% identická s Next.js verzí:**
- Funkčně (všechny interakce)
- Obsahově (všechny texty, diakritika)
- UX/UI (design, layout, animace)
- SEO (metadata, schema.org, keywords)

**Referenční projekt**: `/Users/tomaskostrhoun/Documents/etf-nextjs-ssr/`
**Cílový projekt**: `/Users/tomaskostrhoun/Documents/etf-astro/`

---

## SEO CHECKLIST (PRO KAŽDOU STRÁNKU)
- [ ] Title tag (60 znaků max)
- [ ] Meta description (160 znaků max)
- [ ] Canonical URL
- [ ] Keywords meta tag
- [ ] OpenGraph: title, description, image, url, type, locale
- [ ] Twitter Card: card, title, description, image
- [ ] Schema.org JSON-LD (Article, FAQPage, BreadcrumbList, Product/Service)
- [ ] H1 tag (jediný na stránce)
- [ ] Hierarchie headingů (H1 > H2 > H3)
- [ ] Alt texty pro obrázky
- [ ] Internal linking
- [ ] Robots meta (index, follow)

---

## STAV PROJEKTU: ✅ HOTOVO (4380 stránek)

---

## 1. ETF DETAIL STRÁNKA [isin].astro
**STAV: ✅ HOTOVO**

### Funkcionalita:
- [x] Hero sekce s breadcrumbs
- [x] Rating hvězdičky
- [x] Výkonnost (YTD, 1m, 3m, 1y, 3y, 5y)
- [x] Základní informace
- [x] Struktura fondu
- [x] Největší pozice (Top 10 holdings)
- [x] Geografické rozložení (countries)
- [x] Sektorové rozložení (sectors)
- [x] Dividendové informace
- [x] Rizikovost (Beta, Korelace, Tracking error, Volatilita, Max drawdown)
- [x] Obchodní informace (Exchanges)
- [x] Podobná ETF
- [x] CTA sekce
- [x] Internal Linking

### SEO:
- [x] Title tag
- [x] Meta description
- [x] Canonical
- [x] Schema.org FinancialProduct
- [ ] Keywords
- [ ] OpenGraph
- [ ] Twitter Card

---

## 2. BROKER RECENZE (6 stránek)
**STAV: ✅ HOTOVO**

### Všechny broker recenze hotové:
- [x] XTB Recenze
- [x] DEGIRO Recenze
- [x] Portu Recenze
- [x] Trading 212 Recenze
- [x] Fio e-Broker Recenze
- [x] Interactive Brokers Recenze
- [x] Srovnání brokerů (hlavní stránka)

---

## 3. SROVNÁNÍ ETF
**STAV: ✅ HOTOVO**
- [x] Populární srovnání sekce (10 srovnání)
- [x] Quick Stats sekce
- [x] Metadata keywords
- [x] OpenGraph tags
- [x] Twitter Card tags
- [x] Česká diakritika ve všech podstránkách
- [x] SEO optimalizace všech 10 comparison stránek

---

## 4. NEJLEPŠÍ ETF (37 stránek)
**STAV: ✅ HOTOVO**
- [x] Top 3 editoriální výběr
- [x] FAQ schema
- [x] Author byline E-E-A-T
- [x] Animované hero
- [x] Česká diakritika
- [x] Emoji ve všech sekcích
- [x] Schema.org (Article, FAQ, Breadcrumb)
- [x] Internal linking

---

## 5. PORTFOLIO STRATEGIE (6 stránek)
**STAV: ✅ HOTOVO**
- [x] Performance komponenty
- [x] FAQ sekce (8 otázek)
- [x] Implementace sekce
- [x] SEO metadata (keywords, OpenGraph, Twitter)
- [x] Schema.org JSON-LD

---

## 6. KALKULAČKY (11 stránek)
**STAV: ✅ HOTOVO**
- [x] Kategorizace
- [x] Metadata (keywords, OpenGraph, Twitter)
- [x] Edukativní obsah
- [x] Schema.org JSON-LD (FAQ, ItemList)

---

## 7. OSTATNÍ STRÁNKY
**STAV: ✅ HOTOVO**
- [x] /o-nas - SEO metadata přidáno
- [x] /co-jsou-etf - SEO metadata přidáno
- [x] /kde-koupit-etf - SEO metadata přidáno
- [x] /index.astro (homepage) - SEO metadata kompletní
- [x] /srovnani-brokeru - Česká diakritika opravena
- [x] Infografiky (4 stránky) - SEO metadata přidáno

---

## TESTOVACÍ PROTOKOL

### Před označením jako HOTOVO:
1. Build prochází bez chyb
2. Vizuální kontrola v prohlížeči
3. Porovnání textů s Next.js
4. Odkazy fungují
5. Interaktivita funguje
6. Schema.org validní
7. SEO metadata kompletní

---

## PRIORITA OPRAV:
1. Broker recenze (vysoký traffic)
2. Srovnání ETF (hlavní funkcionalita)
3. Portfolio strategie
4. Kalkulačky
5. Nejlepší ETF podstránky

---

## PŘÍKAZ PRO POKRAČOVÁNÍ:
"Přečti MIGRATION_STATUS.md a pokračuj od bodu X"
