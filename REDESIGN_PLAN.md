# Detailní plán UX/UI redesignu - ETF Astro

## Filozofie redesignu

**Princip:** Mobile-first, desktop-enhanced
- Mobil: Jednoduchý, rychlý, zaměřený na klíčové informace
- Desktop: Rozšířené zobrazení, více dat, pokročilé funkce

---

## FÁZE 1: Základní opravy (Kritické)

### 1.1 Odstranění vizuálního šumu

#### 1.1.1 Smazat animované bloby
**Soubory:**
- `src/styles/global.css` - smazat řádky 251-276 (`.animate-blob`, keyframes)
- `src/pages/co-jsou-etf.astro` - smazat řádky 118-120 (3x blob div)
- Všechny stránky v `src/pages/nejlepsi-etf/` - odstranit bloby kde jsou

**Důvod:** Žerou výkon, nic nepřidávají, rozptylují pozornost

#### 1.1.2 Zjednodušit barevnou paletu
**Nová paleta:**
```
Primární:    violet-600 (#7c3aed) - CTA, odkazy, aktivní stavy
Sekundární:  gray-* - veškerý text, pozadí, okraje
Akcent:      emerald-600 (#059669) - pozitivní hodnoty (výnosy +)
Negativní:   red-600 (#dc2626) - negativní hodnoty (výnosy -)
```

**Soubory k úpravě:**
- `src/pages/co-jsou-etf.astro` - nahradit teal, blue, indigo za violet/gray
- `src/pages/index.astro` - sjednotit barvy
- `src/components/home/HeroSection.tsx` - zjednodušit gradient
- Všechny stránky v `src/pages/nejlepsi-etf/`

**Změny:**
- `from-emerald-600 via-teal-600 to-blue-600` → `text-violet-600`
- `bg-gradient-to-r from-emerald-100 to-teal-100` → `bg-violet-50`
- Barevné bullet points (emerald, teal, blue, indigo) → všechny `bg-violet-500`

---

### 1.2 Oprava touch targets (44px minimum)

#### 1.2.1 Button komponenta
**Soubor:** `src/components/ui/button.tsx`

```tsx
// PŘED:
const buttonVariants = cva(
  "...",
  {
    variants: {
      size: {
        default: "h-10 px-4 py-2",      // 40px - příliš malé
        sm: "h-9 rounded-md px-3",       // 36px - příliš malé
        lg: "h-11 rounded-md px-8",      // 44px - OK
      },
    },
  }
)

// PO:
const buttonVariants = cva(
  "...",
  {
    variants: {
      size: {
        default: "h-11 px-4 py-2 md:h-10",  // 44px mobil, 40px desktop
        sm: "h-10 rounded-md px-3 md:h-9",   // 40px mobil, 36px desktop
        lg: "h-12 rounded-md px-8",          // 48px všude
      },
    },
  }
)
```

#### 1.2.2 Input komponenta
**Soubor:** `src/components/ui/input.tsx`

```tsx
// PŘED:
className="... h-10 ..."  // 40px

// PO:
className="... h-12 md:h-10 ..."  // 48px mobil, 40px desktop
```

#### 1.2.3 Mobilní menu tlačítko
**Soubor:** `src/layouts/Layout.astro`

```astro
// PŘED (řádek 157-165):
<button class="md:hidden p-2 rounded-md ...">

// PO:
<button class="md:hidden p-3 min-h-[44px] min-w-[44px] rounded-md ...">
```

#### 1.2.4 Search input
**Soubor:** `src/components/GlobalETFSearch.tsx`

```tsx
// PŘED (řádek 111):
className="... py-2 ..."

// PO:
className="... py-3 md:py-2 min-h-[44px] md:min-h-0 ..."
```

---

### 1.3 USP sekce viditelná na mobilu

**Soubor:** `src/components/home/USPSection.tsx`

```tsx
// PŘED (řádek 29):
<section className="bg-white py-2 md:py-8 hidden sm:block">

// PO:
<section className="bg-white py-6 md:py-8">
```

**Další úpravy v USPSection:**
- Ikony: `w-10 h-10` → `w-12 h-12 md:w-10 md:h-10`
- Text: `text-xs` → `text-sm md:text-xs`
- Grid: `grid-cols-2 md:grid-cols-4` (2 sloupce na mobilu, 4 na desktopu)

---

## FÁZE 2: Hero a navigace

### 2.1 Zjednodušení Hero sekce

**Soubor:** `src/components/home/HeroSection.tsx`

#### Mobile verze:
- 1 hlavní nadpis
- 1 krátký popis (max 2 řádky)
- 1 primární CTA tlačítko
- Žádné sekundární akce

#### Desktop verze:
- Hlavní nadpis
- Delší popis
- 1 primární + 1 sekundární CTA
- Volitelně statistiky

```tsx
// Struktura:
<section className="py-12 md:py-24">
  <div className="max-w-7xl mx-auto px-4">
    {/* Mobile: centered, simple */}
    {/* Desktop: 2 columns with visual */}
    <div className="text-center md:text-left md:grid md:grid-cols-2 md:gap-12">

      <div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
          Porovnejte 4 300+ ETF fondů
        </h1>

        <p className="mt-4 text-lg text-gray-600 md:text-xl">
          Najděte nejlepší ETF pro vaše portfolio.
        </p>

        {/* Mobile: 1 button, full width */}
        <div className="mt-8">
          <a href="/srovnani-etf"
             className="block w-full md:w-auto md:inline-block
                        bg-violet-600 text-white px-8 py-4 rounded-lg
                        text-center font-semibold">
            Porovnat ETF
          </a>

          {/* Desktop only: secondary CTA */}
          <a href="/co-jsou-etf"
             className="hidden md:inline-block ml-4 px-8 py-4
                        border-2 border-gray-300 rounded-lg">
            Co jsou ETF?
          </a>
        </div>
      </div>

      {/* Desktop only: visual/stats */}
      <div className="hidden md:block">
        {/* Stats nebo ilustrace */}
      </div>
    </div>
  </div>
</section>
```

---

### 2.2 Mobilní menu s animací

**Soubor:** `src/layouts/Layout.astro`

#### Nová implementace:

```astro
<!-- Mobile Menu Button -->
<button
  id="mobile-menu-btn"
  class="md:hidden p-3 min-h-[44px] min-w-[44px] rounded-md"
  aria-label="Menu"
  aria-expanded="false"
>
  <svg id="menu-icon-open" class="w-6 h-6" ...><!-- hamburger --></svg>
  <svg id="menu-icon-close" class="w-6 h-6 hidden" ...><!-- X --></svg>
</button>

<!-- Mobile Menu Overlay (scrim) -->
<div id="mobile-menu-overlay"
     class="fixed inset-0 bg-black/50 z-40 hidden opacity-0
            transition-opacity duration-300">
</div>

<!-- Mobile Menu Panel -->
<div id="mobile-menu"
     class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50
            transform translate-x-full transition-transform duration-300
            shadow-xl">
  <nav class="p-6 pt-20 space-y-2">
    {navigation.map((item) => (
      <a href={item.href}
         class="block px-4 py-4 min-h-[44px] rounded-lg text-lg font-medium
                text-gray-700 hover:bg-violet-50 hover:text-violet-600
                transition-colors">
        {item.name}
      </a>
    ))}
  </nav>
</div>

<script>
  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;

    if (isOpen) {
      menu.classList.remove('translate-x-full');
      overlay.classList.remove('hidden');
      setTimeout(() => overlay.classList.remove('opacity-0'), 10);
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.add('translate-x-full');
      overlay.classList.add('opacity-0');
      setTimeout(() => overlay.classList.add('hidden'), 300);
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      document.body.style.overflow = '';
    }

    menuBtn.setAttribute('aria-expanded', isOpen.toString());
  }

  menuBtn?.addEventListener('click', toggleMenu);
  overlay?.addEventListener('click', toggleMenu);
</script>
```

---

## FÁZE 3: ETF Tabulka -Responzivní design

### 3.1 Strategie zobrazení

| Obrazovka | Sloupce | Layout |
|-----------|---------|--------|
| Mobile (<640px) | 3 | Card/List |
| Tablet (640-1024px) | 5 | Tabulka |
| Desktop (>1024px) | 9 | Plná tabulka |

### 3.2 Mobile layout (Card view)

**Soubor:** `src/components/ETFTable.tsx`

```tsx
// Nová komponenta pro mobilní kartu
const ETFMobileCard = ({ etf }) => (
  <a href={`/etf/${etf.isin}`}
     className="block bg-white rounded-lg border border-gray-200 p-4
                hover:border-violet-300 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {etf.name}
        </h3>
        <p className="text-sm text-gray-500">{etf.isin}</p>
      </div>
      {etf.primary_ticker && (
        <span className="ml-2 px-2 py-1 bg-violet-100 text-violet-700
                        text-xs font-medium rounded">
          {etf.primary_ticker}
        </span>
      )}
    </div>

    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
      <div>
        <p className="text-xs text-gray-500">TER</p>
        <p className="font-semibold">{etf.ter_numeric?.toFixed(2)}%</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Výnos 1R</p>
        <p className={`font-semibold ${
          etf.return_1y > 0 ? 'text-emerald-600' :
          etf.return_1y < 0 ? 'text-red-600' : ''
        }`}>
          {etf.return_1y > 0 ? '+' : ''}{etf.return_1y?.toFixed(1)}%
        </p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Velikost</p>
        <p className="font-semibold">
          {etf.fund_size_numeric >= 1000
            ? `${(etf.fund_size_numeric/1000).toFixed(1)} mld`
            : `${etf.fund_size_numeric} mil`}
        </p>
      </div>
    </div>
  </a>
);

// Hlavní komponenta s responzivním přepínáním
const ETFTable = ({ etfs, ...props }) => {
  return (
    <>
      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {etfs.map(etf => (
          <ETFMobileCard key={etf.isin} etf={etf} />
        ))}
      </div>

      {/* Tablet: Zjednodušená tabulka (5 sloupců) */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th>Název</th>
              <th>TER</th>
              <th>Výnos 1R</th>
              <th>Výnos 3R</th>
              <th>Velikost</th>
            </tr>
          </thead>
          <tbody>
            {/* ... */}
          </tbody>
        </table>
      </div>

      {/* Desktop: Plná tabulka (9 sloupců) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th>Název / ISIN</th>
              <th>TER</th>
              <th>YTD</th>
              <th>1R</th>
              <th>3R</th>
              <th>5R</th>
              <th>Velikost</th>
              <th>Dividenda</th>
              <th>Typ</th>
            </tr>
          </thead>
          <tbody>
            {/* ... */}
          </tbody>
        </table>
      </div>
    </>
  );
};
```

---

## FÁZE 4: Comparison tabulka - Responzivní

### 4.1 Strategie

| Obrazovka | Max ETF | Layout |
|-----------|---------|--------|
| Mobile | 2 | Vertikální stack |
| Tablet | 3 | Horizontální |
| Desktop | 4+ | Horizontální scroll |

### 4.2 Implementace

**Soubor:** `src/components/comparison/ETFComparisonTable.tsx`

```tsx
// Mobile: Stack vertikálně
<div className="md:hidden space-y-6">
  {selectedETFs.map(etf => (
    <div key={etf.isin} className="bg-white rounded-lg border p-4">
      <h3 className="font-bold text-lg mb-4">{etf.name}</h3>

      <dl className="space-y-3">
        <div className="flex justify-between">
          <dt className="text-gray-500">TER</dt>
          <dd className="font-semibold">{etf.ter_numeric}%</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Výnos 1R</dt>
          <dd className="font-semibold">{etf.return_1y}%</dd>
        </div>
        {/* ... další řádky */}
      </dl>
    </div>
  ))}
</div>

// Tablet/Desktop: Horizontální tabulka
<div className="hidden md:block overflow-x-auto">
  <table className="w-full min-w-[600px]">
    {/* ... existující implementace */}
  </table>
</div>
```

---

## FÁZE 5: Spacing systém

### 5.1 Definice spacing scale (8px grid)

**Soubor:** `src/styles/global.css` nebo Tailwind config

```css
/* Spacing tokens */
:root {
  --space-xs: 4px;    /* 0.25rem */
  --space-sm: 8px;    /* 0.5rem */
  --space-md: 16px;   /* 1rem */
  --space-lg: 24px;   /* 1.5rem */
  --space-xl: 32px;   /* 2rem */
  --space-2xl: 48px;  /* 3rem */
  --space-3xl: 64px;  /* 4rem */
  --space-4xl: 96px;  /* 6rem */
}
```

### 5.2 Aplikace na sekce

```
Mezi hlavními sekcemi:  space-3xl (64px) na mobilu, space-4xl (96px) desktop
Mezi subsekce:          space-2xl (48px)
Mezi elementy:          space-lg (24px)
Vnitřní padding karty:  space-md (16px) mobil, space-lg (24px) desktop
Container padding:      space-md (16px) mobil, space-lg (24px) tablet, space-xl (32px) desktop
```

---

## FÁZE 6: Typography systém

### 6.1 Definice typografické škály

```
Display:  text-4xl (36px) / text-5xl (48px) desktop - pouze hlavní hero
H1:       text-3xl (30px) / text-4xl (36px) desktop
H2:       text-2xl (24px) / text-3xl (30px) desktop
H3:       text-xl (20px) / text-2xl (24px) desktop
H4:       text-lg (18px) / text-xl (20px) desktop
Body:     text-base (16px) - nikdy menší na mobilu!
Small:    text-sm (14px) - pouze metadata, labels
XSmall:   text-xs (12px) - pouze badges, timestamps - NIKDY pro čitelný text
```

### 6.2 Line heights

```
Nadpisy:  leading-tight (1.25)
Body:     leading-relaxed (1.625)
```

### 6.3 Max-width pro čitelnost

```css
.prose-content {
  max-width: 65ch; /* ~650px - optimální délka řádku */
}
```

---

## FÁZE 7: Homepage restrukturalizace

### 7.1 Nová struktura (mobile-first)

```
1. Hero sekce
   - Mobil: Nadpis + 1 CTA
   - Desktop: Nadpis + 2 CTA + vizuál

2. USP sekce (vždy viditelná)
   - Mobil: 2x2 grid
   - Desktop: 4 sloupce

3. Top ETF preview
   - Mobil: 3 karty vertikálně
   - Desktop: 3 karty horizontálně
   - CTA: "Zobrazit všechny ETF"

4. CTA sekce
   - Jednoduchá výzva k akci
   - Link na srovnání / kalkulačku

5. Footer
```

### 7.2 Co odstranit z homepage

- FAQ sekce (13 otázek) → přesunout na `/faq` nebo `/co-jsou-etf`
- Broker comparison → přesunout na `/kde-koupit-etf`
- Portfolio strategies teaser → přesunout na `/portfolio-strategie`
- Related links sekce → footer nebo dedicated stránka

---

## FÁZE 8: Search komponenta

### 8.1 Opravy

**Soubor:** `src/components/GlobalETFSearch.tsx`

```tsx
// 1. Správný input type
<input
  type="search"  // Místo "text"
  inputMode="search"
  enterKeyHint="search"
  ...
/>

// 2. Dropdown max-width na mobilu
<div className="absolute ... max-w-[calc(100vw-2rem)] md:max-w-2xl">

// 3. Větší touch targets v results
<button className="... py-4 md:py-3 min-h-[56px] md:min-h-0 ...">

// 4. Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
  }
  if (e.key === 'ArrowUp') {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }
  if (e.key === 'Enter' && selectedIndex >= 0) {
    handleSelectETF(results[selectedIndex]);
  }
};
```

---

## FÁZE 9: Accessibility opravy

### 9.1 Focus states

```css
/* Viditelný focus pro všechny interaktivní elementy */
:focus-visible {
  outline: 2px solid var(--color-violet-500);
  outline-offset: 2px;
}

/* Odstranit default focus ring ale zachovat pro keyboard */
:focus:not(:focus-visible) {
  outline: none;
}
```

### 9.2 ARIA labels

- Všechna tlačítka musí mít `aria-label` pokud nemají text
- Tabulky musí mít `<caption>` nebo `aria-label`
- Loading stavy musí mít `aria-live="polite"`

---

## FÁZE 10: Performance optimalizace

### 10.1 Client directives

```astro
// Layout.astro - Search
<GlobalETFSearch client:idle />  // OK pro desktop
// Na mobilu je search v header, takže client:idle je správné

// index.astro
<TopETFTabsWrapper client:visible />      // Lazy load
<BrokerComparisonSection client:visible /> // Lazy load (pokud zůstane)
<FAQSection client:visible />              // Lazy load (pokud zůstane)
```

### 10.2 Image optimalizace

```astro
// Přidat width/height pro CLS prevenci
<img
  src="/images/..."
  alt="..."
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
/>
```

---

## Pořadí implementace

### Sprint 1 (Kritické - 2-3 hodiny)
1. [ ] Smazat animované bloby
2. [ ] Opravit touch targets (button, input, menu)
3. [ ] USP sekce viditelná na mobilu
4. [ ] Zjednodušit Hero na 1 CTA (mobil)

### Sprint 2 (Vysoká priorita - 3-4 hodiny)
5. [ ] ETF tabulka - card layout na mobilu
6. [ ] Mobilní menu s animací
7. [ ] Zjednodušit barevnou paletu
8. [ ] Search input type + keyboard nav

### Sprint 3 (Střední priorita - 2-3 hodiny)
9. [ ] Comparison tabulka - stack na mobilu
10. [ ] Spacing systém aplikovat
11. [ ] Typography audit a opravy
12. [ ] Homepage restrukturalizace

### Sprint 4 (Polish - 1-2 hodiny)
13. [ ] Focus states
14. [ ] ARIA labels audit
15. [ ] Performance audit
16. [ ] Testování na reálných zařízeních

---

## Testování

### Zařízení k otestování
- iPhone SE (malý, 375px)
- iPhone 14 (standard, 390px)
- iPhone 14 Pro Max (velký, 428px)
- iPad Mini (tablet, 768px)
- iPad Pro (tablet, 1024px)
- Desktop (1280px+)

### Checklist pro každou stránku
- [ ] Touch targets >= 44px
- [ ] Text čitelný bez zoomování (min 16px)
- [ ] Žádný horizontální scroll
- [ ] Navigace funguje
- [ ] CTA viditelné bez scrollování
- [ ] Loading stavy funkční
- [ ] Error stavy srozumitelné

---

## Soubory k úpravě (souhrn)

### Kritické
- `src/styles/global.css`
- `src/layouts/Layout.astro`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/home/USPSection.tsx`
- `src/components/home/HeroSection.tsx`

### Vysoká priorita
- `src/components/ETFTable.tsx`
- `src/components/GlobalETFSearch.tsx`
- `src/components/comparison/ETFComparisonTable.tsx`
- `src/pages/index.astro`

### Střední priorita
- `src/pages/co-jsou-etf.astro`
- `src/pages/srovnani-etf.astro`
- Všechny stránky v `src/pages/nejlepsi-etf/`

---

*Plán vytvořen: 31. prosince 2025*
*Verze: 1.0*
