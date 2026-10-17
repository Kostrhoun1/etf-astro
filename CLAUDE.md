# CLAUDE.md - Instrukce pro AI asistenta

## ⛔ PRAVIDLO Č. 1 CELÉHO PROJEKTU: DATA MUSÍ BÝT SPRÁVNĚ

Rozhodnutí majitele (17. 10. 2026), platí pro scraper, noční joby i web. Má přednost před vším
ostatním. Plné znění: `/Users/tomaskostrhoun/Documents/etf-nextjs-ssr/CLAUDE.md`. Pro scraper hlavně:

- Raději prázdná hodnota než špatná; prázdný výsledek parsování NIKDY nepřepíše dobrou starou hodnotu.
- `scraping_date` = kdy byla data opravdu stažena; nikdy nenahrávej stará data jako nová
  (incident 17. 10. 2026: checkpointy z dubnové cache → 640 fondů s půl roku starými čísly).
- Každý přepočet (měny, období) ověř nezávisle: kurzy ČNB/ECB, hodnoty na justETF, benchmark indexu.
- Každá opravená chyba v datech dostane automatickou kontrolu (`etf-nextjs-ssr/scripts/check-fund-data.mjs`).


## 🎯 HLAVNÍ CÍL PROJEKTU

**KRITICKÝ POŽADAVEK**: Nové Astro stránky MUSÍ být z pohledu:
- ✅ **Designu** - 100% stejný vzhled jako původní Next.js verze
- ✅ **Funkčností** - všechny interaktivní prvky musí fungovat stejně
- ✅ **Textů** - identické texty včetně české diakritiky
- ✅ **UX/UI** - stejná uživatelská zkušenost

**Referenční projekt**: `/Users/tomaskostrhoun/Documents/etf-nextjs-ssr/`
**Cílový projekt**: `/Users/tomaskostrhoun/Documents/etf-astro/`

## 📋 POSTUP PRÁCE

Při práci na jakékoli stránce VŽDY:
1. Nejprve přečti původní Next.js verzi
2. Porovnej s Astro verzí
3. Zajisti 100% shodu obsahu a funkcí
4. Otestuj build

## 🔧 TECHNICKÉ DETAILY

- **Framework**: Astro s React islands (client:load)
- **Styling**: Tailwind CSS
- **Databáze**: Supabase
- **Komponenty**: Radix UI

### Import pravidla pro Astro:
- Nepoužívat `next/link` → použít `<a href>`
- Nepoužívat `next/navigation` → použít window.location nebo Astro redirect
- React komponenty s interaktivitou potřebují `client:load`

## 📊 STAV MIGRACE

Viz `MIGRATION_STATUS.md` pro aktuální stav práce.

## ⚠️ DŮLEŽITÉ

- NIKDY nepřeskakuj sekce nebo obsah
- VŽDY porovnej s originálem před dokončením
- Při nejistotě se ZEPTEJ uživatele
