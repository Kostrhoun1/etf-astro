# Plán oprav na základě Code Review

## Shrnutí nálezů

| Kategorie | Kritických | Vysoká priorita | Střední | Nízká |
|-----------|------------|-----------------|---------|-------|
| Bezpečnost | 2 | 2 | 2 | 1 |
| SEO | 2 | 2 | 3 | 2 |
| Výkon | 2 | 3 | 3 | 3 |
| Přístupnost | 3 | 5 | 3 | 3 |
| Struktura kódu | 1 | 3 | 4 | 3 |

---

## FÁZE 1: Kritické opravy (Ihned)

### 1.1 Bezpečnost - Hardcoded Supabase klíč

**Soubor:** `src/lib/supabase.ts`

**Aktuální stav:**
```typescript
const SUPABASE_URL = 'https://nbhwnatadyubiuadfakx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Oprava:**
```typescript
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_KEY;

// Pro veřejné operace použít anon key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Pro admin operace (pouze server-side)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

**Další kroky:**
1. Zrotovat Supabase service key v dashboardu
2. Nastavit environment variables ve Vercel
3. Přidat klíče do `.env.local` pro lokální vývoj

---

### 1.2 Bezpečnost - Slabý revalidate secret

**Soubor:** `src/pages/api/revalidate.ts`

**Aktuální stav:**
```typescript
const expectedSecret = import.meta.env.REVALIDATE_SECRET || 'etf_refresh_2025'
```

**Oprava:**
```typescript
const expectedSecret = import.meta.env.REVALIDATE_SECRET;
if (!expectedSecret) {
  return new Response(JSON.stringify({ error: 'Server configuration error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### 1.3 SEO - Budoucí datumy ve structured data

**Soubory:** Všechny stránky v `src/pages/nejlepsi-etf/` a broker recenze

**Problém:** `datePublished: "2026-01-15"` - budoucí datum je nevalidní

**Oprava:**
```typescript
const currentDate = new Date().toISOString().split('T')[0];
// nebo pevné datum z minulosti
const publishedDate = "2024-12-01";
```

---

### 1.4 Přístupnost - Chybí skip link

**Soubor:** `src/layouts/Layout.astro`

**Přidat před `<header>`:**
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-md">
  Přejít na hlavní obsah
</a>
```

**A přidat id na main:**
```html
<main id="main-content">
```

---

## FÁZE 2: Vysoká priorita

### 2.1 Výkon - Zbytečná hydratace statických komponent

**Soubor:** `src/pages/index.astro`

| Komponenta | Aktuálně | Opravit na |
|------------|----------|------------|
| `HeroSection` | `client:load` | Odstranit (je statická) |
| `USPSection` | `client:load` | Odstranit (je statická) |
| `FAQSection` | `client:load` | `client:visible` |
| `BrokerComparisonSection` | `client:load` | `client:visible` |
| `PortfolioStrategiesTeaser` | `client:load` | `client:visible` |
| `TopETFTabsWrapper` | `client:load` | `client:idle` |

**Odhadovaný přínos:** -200-400ms TTI, -100KB JS bundle

---

### 2.2 Struktura - Duplicitní formátovací funkce

**Problém:** `formatPercentage` a `formatNumber` jsou definovány v 25+ souborech s různými implementacemi

**Řešení:** Vytvořit `src/utils/formatters.ts`

```typescript
// src/utils/formatters.ts
export function formatPercentage(value: number | null | undefined, options?: {
  showSign?: boolean;
  decimals?: number;
}): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const { showSign = false, decimals = 2 } = options ?? {};
  const prefix = showSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined, options?: {
  decimals?: number;
  suffix?: string;
}): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const { decimals = 0, suffix = '' } = options ?? {};
  return value.toLocaleString('cs-CZ', { maximumFractionDigits: decimals }) + suffix;
}

export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function getReturnColor(value: number | null): string {
  if (value === null) return '';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return '';
}
```

**Soubory k aktualizaci (nahradit lokální definice importem):**
- `src/utils/csvParser.ts`
- `src/components/etf/ETFTableServer.tsx`
- `src/components/home/TopETFTabs.tsx`
- `src/components/ETFTable.tsx`
- ... (dalších ~20 souborů)

---

### 2.3 Struktura - Duplicitní ETFItem interface

**Problém:** `ETFItem` interface je definován ve 3+ souborech

**Řešení:** Konsolidovat do `src/types/etf.ts`

```typescript
// src/types/etf.ts
export interface ETFItem {
  isin: string;
  name: string;
  fund_provider: string;
  primary_ticker: string;
  ter_numeric: number | null;
  fund_size_numeric: number | null;
  ytd_return: number | null;
  one_year_return: number | null;
  three_year_return: number | null;
  five_year_return: number | null;
  replication_method: string | null;
  distribution_policy: string | null;
  fund_currency: string | null;
  domicile: string | null;
  fund_category: string | null;
  last_updated: string | null;
}
```

---

### 2.4 SEO - AuthorSchema není globálně použito

**Soubor:** `src/layouts/Layout.astro`

**Přidat před `</head>`:**
```astro
---
import AuthorSchema from '../components/SEO/AuthorSchema';
---
<AuthorSchema client:load />
```

---

### 2.5 Přístupnost - GlobalETFSearch chybí ARIA

**Soubor:** `src/components/GlobalETFSearch.tsx`

**Opravy:**
```tsx
<input
  ref={inputRef}
  type="text"
  placeholder={placeholder}
  aria-label="Vyhledávání ETF"
  aria-autocomplete="list"
  aria-controls="search-results"
  aria-expanded={isOpen && results.length > 0}
  ...
/>

{isOpen && results.length > 0 && (
  <div
    id="search-results"
    role="listbox"
    aria-label="Výsledky vyhledávání"
    className="..."
  >
    {results.map((etf, index) => (
      <button
        key={etf.isin}
        role="option"
        aria-selected={index === 0}
        onClick={() => handleSelectETF(etf)}
        ...
      >
```

---

## FÁZE 3: Střední priorita

### 3.1 SEO - Chybí Twitter @site

**Soubor:** `src/layouts/Layout.astro`

**Přidat po řádku 86:**
```html
<meta name="twitter:site" content="@ETFpruvodce" />
```

---

### 3.2 Výkon - Velké obrázky

**Soubory v `public/`:**
| Soubor | Velikost | Cíl |
|--------|----------|-----|
| `og-image.png` | 808 KB | < 100 KB |
| `images/etf-mapa-diverzifikace.png` | 816 KB | < 200 KB |
| `images/etf-kosik-vs-akcie.png` | 628 KB | < 150 KB |

**Příkazy:**
```bash
magick public/og-image.png -resize '1200x630>' -quality 85 public/og-image.jpg
magick public/images/etf-mapa-diverzifikace.png -resize '800x800>' -quality 80 public/images/etf-mapa-diverzifikace.webp
magick public/images/etf-kosik-vs-akcie.png -resize '800x800>' -quality 80 public/images/etf-kosik-vs-akcie.webp
```

---

### 3.3 Přístupnost - Sortovatelné tabulky

**Soubor:** `src/components/ETFTable.tsx`

**Přidat na TableHead:**
```tsx
<TableHead
  className="cursor-pointer hover:bg-gray-50 text-left..."
  onClick={() => handleSort('name')}
  tabIndex={0}
  role="columnheader"
  aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
  onKeyDown={(e) => e.key === 'Enter' && handleSort('name')}
>
```

---

### 3.4 Přístupnost - Barevné indikátory výnosů

**Soubor:** `src/components/ETFTable.tsx`

**Problém:** Pouze barva indikuje pozitivní/negativní hodnoty

**Oprava:**
```tsx
function formatReturn(value: number | null) {
  if (value === null) return 'N/A';
  const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '';
  const icon = value > 0 ? '↑' : value < 0 ? '↓' : '';
  return (
    <span className={color}>
      {icon} {value > 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}
```

---

### 3.5 Bezpečnost - SQL injection risk

**Soubory:** `src/pages/api/etf/search.ts`, `src/pages/api/backtest/search-etf.ts`

**Oprava - sanitizace vstupu:**
```typescript
function sanitizeSearchQuery(query: string): string {
  // Odstranit speciální znaky pro PostgREST
  return query.replace(/[%_\\'"]/g, '').trim();
}

const sanitizedQuery = sanitizeSearchQuery(query);
if (sanitizedQuery.length < 2 || sanitizedQuery.length > 100) {
  return new Response(JSON.stringify({ error: 'Invalid query' }), { status: 400 });
}
```

---

### 3.6 SEO - Dynamické generování sitemap

**Soubor:** `astro.config.mjs`

```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
});
```

---

## FÁZE 4: Nízká priorita

### 4.1 Struktura - Sjednocení názvů souborů

**Pravidla:**
- Komponenty: PascalCase (`ETFTable.tsx`)
- Hooks: camelCase s `use` prefixem (`useETFData.ts`)
- Utility: camelCase (`formatters.ts`)

**Přejmenovat:**
- `use-toast.ts` → `useToast.ts`

---

### 4.2 Výkon - Self-hosting Inter fontu

**Stáhnout Inter font a přidat do `public/fonts/`:**
```css
/* src/styles/global.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

---

### 4.3 Přístupnost - Překlad anglických sr-only textů

**Soubory:**
- `src/components/ui/dialog.tsx`: `Close` → `Zavřít`
- `src/components/ui/pagination.tsx`: `Go to previous page` → `Přejít na předchozí stránku`

---

### 4.4 TypeScript - Odstranění `any` typů

**Soubory s nejvíce `any`:**
- `src/components/tools/InvestmentCalculatorContent.tsx`
- `src/utils/investmentRecommendationEngine.ts`
- `src/components/ETFDetailedComparison.tsx`
- `src/components/tools/FeeComparisonChart.tsx`

---

### 4.5 Struktura - Odstranění wrapper komponent

**Zbytečné wrappery k odstranění:**
- `TopETFTabsWrapper.tsx` - nahradit přímým použitím `TopETFTabs`
- `MonteCarloContentWrapper.tsx`
- `BacktestContentWrapper.tsx`

---

## Časový odhad

| Fáze | Úkoly | Odhad |
|------|-------|-------|
| Fáze 1 | 4 kritické opravy | 2-3 hodiny |
| Fáze 2 | 5 vysoká priorita | 4-6 hodin |
| Fáze 3 | 6 střední priorita | 3-4 hodiny |
| Fáze 4 | 5 nízká priorita | 2-3 hodiny |

**Celkem:** ~12-16 hodin práce

---

## Checklist

### Fáze 1 - Kritické
- [ ] Zrotovat Supabase klíč a přesunout do env vars
- [ ] Opravit revalidate secret
- [ ] Opravit budoucí datumy ve structured data
- [ ] Přidat skip link

### Fáze 2 - Vysoká
- [ ] Optimalizovat client direktivy
- [ ] Konsolidovat formatovací funkce
- [ ] Konsolidovat ETFItem interface
- [ ] Přidat AuthorSchema globálně
- [ ] Opravit GlobalETFSearch ARIA

### Fáze 3 - Střední
- [ ] Přidat Twitter @site
- [ ] Komprimovat velké obrázky
- [ ] Opravit ARIA pro sortovatelné tabulky
- [ ] Přidat ikony k barevným indikátorům
- [ ] Sanitizovat search queries
- [ ] Nastavit dynamický sitemap

### Fáze 4 - Nízká
- [ ] Sjednotit názvy souborů
- [ ] Self-host Inter font
- [ ] Přeložit anglické sr-only texty
- [ ] Odstranit `any` typy
- [ ] Odstranit wrapper komponenty
