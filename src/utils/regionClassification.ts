/**
 * Jemnější klasifikace regionu / zaměření ETF.
 *
 * Sloupec `region` v databázi má jen 6 hrubých hodnot a 57 % fondů spadá do
 * jediné („Celosvětově"), takže se podle něj prakticky nedá filtrovat na úroveň
 * USA / Japonsko / Čína / Indie atd.
 *
 * Naopak pole `investment_focus` je strukturované a geograficky bohaté, např.:
 *   "Equity, United States"            -> USA
 *   "Equity, Japan, Social/Environmental" -> Japonsko
 *   "Equity, Emerging Markets"         -> Rozvíjející se trhy
 *   "Equity, World"                    -> Celosvětově
 *
 * Tahle funkce z `investment_focus` (a jako záloha z `index_name` / `name` /
 * `region`) odvodí konkrétnější region. Používá ji jak filtr (porovnání), tak
 * sestavení možností v rozbalovacím seznamu – musí být deterministická.
 */

export interface RegionClassifiable {
  investment_focus?: string | null;
  index_name?: string | null;
  name?: string | null;
  region?: string | null;
}

// Pořadí kbelíků určuje i pořadí v rozbalovacím seznamu.
export const REGION_ORDER: string[] = [
  'Celosvětově',
  'USA',
  'Severní Amerika',
  'Evropa',
  'Eurozóna',
  'Velká Británie',
  'Německo',
  'Švýcarsko',
  'Japonsko',
  'Čína',
  'Indie',
  'Asie a Pacifik',
  'Rozvíjející se trhy',
];

// Pravidla v PRIORITNÍM pořadí – první shoda vyhrává. Konkrétní země mají
// přednost před kontinenty, rozvíjející se trhy před „světem".
const RULES: [string, RegExp][] = [
  ['Čína', /china|chinese|\bcsi\b|hang ?seng|hong ?kong|a-shares|kweb/i],
  ['Indie', /\bindia\b|indian|\bnifty\b|sensex/i],
  ['Japonsko', /japan|\btopix\b|nikkei/i],
  ['Velká Británie', /united kingdom|\buk\b|ftse ?100|ftse ?250|britain|british/i],
  ['Německo', /germany|german|\bdax\b|\bmdax\b/i],
  ['Švýcarsko', /switzerland|swiss|\bsmi\b/i],
  ['USA', /united states|\busa\b|u\.s\.|s&p ?500|nasdaq|dow ?jones|\bus equity\b/i],
  ['Rozvíjející se trhy', /emerging|\bem\b|frontier|rozvíjej/i],
  ['Eurozóna', /eurozone|\bemu\b|euro ?stoxx/i],
  ['Evropa', /europe|european|stoxx europe|evrop/i],
  ['Severní Amerika', /north america|canada|canadian|severní amerik/i],
  ['Asie a Pacifik', /\basia\b|asian|pacific|\bapac\b|asean|asie/i],
  ['Celosvětově', /\bworld\b|global|all ?country|\bacwi\b|developed markets|all-world|celosvět/i],
];

// Mapování hrubého sloupce `region` (záloha) na kbelíky výše.
const COARSE_REGION_MAP: Record<string, string> = {
  Celosvětově: 'Celosvětově',
  'Severní Amerika': 'Severní Amerika',
  Evropa: 'Evropa',
  'Rozvíjející se trhy': 'Rozvíjející se trhy',
  'Asie a Pacifik': 'Asie a Pacifik',
};

/**
 * Vrátí region/zaměření ETF, nebo `null` pokud nelze určit.
 */
export function classifyRegion(etf: RegionClassifiable): string | null {
  const focus = (etf.investment_focus ?? '').toLowerCase();

  // 1) Primárně z investment_focus (nejspolehlivější geografický signál)
  if (focus) {
    for (const [label, re] of RULES) {
      if (re.test(focus)) return label;
    }
  }

  // 2) Záloha z názvu indexu a fondu
  const hay = `${etf.index_name ?? ''} ${etf.name ?? ''}`.toLowerCase();
  if (hay.trim()) {
    for (const [label, re] of RULES) {
      if (re.test(hay)) return label;
    }
  }

  // 3) Poslední záloha – hrubý sloupec region
  if (etf.region && COARSE_REGION_MAP[etf.region]) {
    return COARSE_REGION_MAP[etf.region];
  }

  return null;
}

/**
 * Z pole ETF sestaví seřazené možnosti pro filtr regionu (jen ty, které se
 * v datech reálně vyskytují), v pořadí dle REGION_ORDER.
 */
export function buildRegionOptions(etfs: RegionClassifiable[]): string[] {
  const present = new Set<string>();
  for (const etf of etfs) {
    const r = classifyRegion(etf);
    if (r) present.add(r);
  }
  const ordered = REGION_ORDER.filter(r => present.has(r));
  // případné neznámé (pro jistotu) přidat na konec
  const extra = Array.from(present).filter(r => !REGION_ORDER.includes(r)).sort();
  return [...ordered, ...extra];
}
