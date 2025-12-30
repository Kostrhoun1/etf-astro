# CLAUDE.md - Instrukce pro AI asistenta

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
