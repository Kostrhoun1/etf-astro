/**
 * Normalizace názvů indexů (index_name).
 *
 * Zdrojová data z justETF mají do pole `index_name` přilepenou metadatu třídy
 * akcií (měna / akumulace–distribuce / měnové zajištění / kód třídy), a to
 * typicky až za DVĚMA mezerami, např.:
 *   "MSCI World  USD Acc"              -> "MSCI World"
 *   "MSCI All Country World  EUR Hedged" -> "MSCI All Country World"
 *   "FTSE 100  GBP"                    -> "FTSE 100"
 *
 * To způsobuje, že jeden a tentýž index je v rozbalovacím filtru rozsekaný na
 * desítky položek. Z 764 různých hodnot tak vznikne ~150–200 reálných indexů.
 *
 * Legitimní názvy indexů používají JEDNODUCHÉ mezery ("EURO STOXX 50",
 * "MSCI Switzerland 20"), takže split na dvojité mezeře je bezpečný a nic
 * nerozbije. Měnu, akumulaci/distribuci i zajištění uživatel filtruje
 * samostatnými filtry, proto je v názvu indexu nepotřebujeme.
 */

// Sjednocení známých variant (rozdílná velikost písmen / interpunkce) na jeden
// kanonický tvar. Klíč je vždy v lowercase normalizovaného názvu.
const CANONICAL_LABELS: Record<string, string> = {
  'nasdaq-100': 'Nasdaq 100',
  'nasdaq 100': 'Nasdaq 100',
  'stoxx europe 600': 'STOXX Europe 600',
  's&p500': 'S&P 500',
  's&p 500': 'S&P 500',
  'msci all country world': 'MSCI ACWI',
  'msci ac world': 'MSCI ACWI',
  'msci acwi': 'MSCI ACWI',
  'msci em': 'MSCI Emerging Markets',
  'msci emerging markets': 'MSCI Emerging Markets',
};

/**
 * Vrátí „čistý" základ názvu indexu bez metadat třídy akcií.
 */
export function normalizeIndexName(raw?: string | null): string {
  if (!raw) return '';
  // 1) odřízni vše za dvojitou (a více) mezerou = třída akcií
  let s = raw.split(/\s{2,}/)[0];
  // 2) odřízni i variantu s pomlčkou: "MSCI ACWI - EUR Hedged"
  s = s.replace(/\s+[-–]\s+(USD|EUR|GBP|CHF|JPY|hedged|unhedged|acc|dist).*$/i, '');
  // 3) sjednoť bílé znaky
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Kanonický klíč pro porovnávání (case-insensitive, sjednocené aliasy).
 */
export function canonicalIndexKey(raw?: string | null): string {
  const norm = normalizeIndexName(raw).toLowerCase();
  return (CANONICAL_LABELS[norm] ?? norm).toLowerCase();
}

/**
 * Zobrazovaný (kanonický) název indexu.
 */
export function canonicalIndexLabel(raw?: string | null): string {
  const norm = normalizeIndexName(raw);
  return CANONICAL_LABELS[norm.toLowerCase()] ?? norm;
}

/**
 * Zařazení indexu pod poskytovatele (pro seskupení v rozbalovacím seznamu).
 */
export function getIndexProvider(label: string): string {
  const n = label.toLowerCase();
  if (n.startsWith('msci')) return 'MSCI';
  if (n.startsWith('ftse')) return 'FTSE';
  if (n.includes('s&p') || n.startsWith('sp ')) return 'S&P';
  if (n.includes('stoxx')) return 'STOXX';
  if (n.startsWith('nasdaq')) return 'Nasdaq';
  if (n.startsWith('bloomberg')) return 'Bloomberg';
  if (n.startsWith('solactive')) return 'Solactive';
  if (n.includes('iboxx') || n.includes('markit')) return 'iBoxx';
  if (n.startsWith('dax') || n.startsWith('tecdax') || n.startsWith('mdax')) return 'DAX';
  return 'Ostatní indexy';
}

// Nejhledanější indexy – pokud jsou v datech přítomné, zobrazí se v sekci
// „Populární" nahoře. Hodnoty odpovídají kanonickým labelům.
export const POPULAR_INDEXES: string[] = [
  'MSCI World',
  'S&P 500',
  'MSCI ACWI',
  'FTSE All-World',
  'MSCI Emerging Markets',
  'Nasdaq 100',
  'MSCI Europe',
  'STOXX Europe 600',
  'EURO STOXX 50',
  'MSCI USA',
];

export interface IndexOptionGroup {
  heading: string;
  options: string[];
}

/**
 * Z pole ETF sestaví seskupené možnosti pro filtr indexu:
 *   - sekce „Populární" (nejčastější indexy, pokud existují)
 *   - sekce po poskytovatelích (MSCI, FTSE, S&P, …), seřazené dle četnosti
 *
 * Vrací i plochý seznam `flat` (kanonické labely) pro případné jiné použití.
 */
export function buildIndexOptions(etfs: { index_name?: string | null }[]): {
  groups: IndexOptionGroup[];
  flat: string[];
} {
  // kanonický klíč -> { label, count }
  const byKey = new Map<string, { label: string; count: number }>();
  for (const etf of etfs) {
    const key = canonicalIndexKey(etf.index_name);
    if (!key) continue;
    const label = canonicalIndexLabel(etf.index_name);
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      byKey.set(key, { label, count: 1 });
    }
  }

  const all = Array.from(byKey.values());
  const flat = all.map(o => o.label).sort((a, b) => a.localeCompare(b));

  // Populární – jen ty, které jsou reálně v datech
  const present = new Set(all.map(o => o.label));
  const popular = POPULAR_INDEXES.filter(p => present.has(p));
  const popularSet = new Set(popular);

  // Zbytek seskupit dle poskytovatele
  const providerMap = new Map<string, { label: string; count: number }[]>();
  for (const o of all) {
    if (popularSet.has(o.label)) continue;
    const provider = getIndexProvider(o.label);
    const arr = providerMap.get(provider) ?? [];
    arr.push(o);
    providerMap.set(provider, arr);
  }

  // Poskytovatele seřadit dle celkové četnosti (nejčetnější první),
  // „Ostatní indexy" vždy na konec.
  const providerGroups: IndexOptionGroup[] = Array.from(providerMap.entries())
    .map(([heading, items]) => ({
      heading,
      options: items.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).map(i => i.label),
      _total: items.reduce((s, i) => s + i.count, 0),
    }))
    .sort((a, b) => {
      if (a.heading === 'Ostatní indexy') return 1;
      if (b.heading === 'Ostatní indexy') return -1;
      return b._total - a._total;
    })
    .map(({ heading, options }) => ({ heading, options }));

  const groups: IndexOptionGroup[] = [];
  if (popular.length > 0) {
    groups.push({ heading: 'Populární indexy', options: popular });
  }
  groups.push(...providerGroups);

  return { groups, flat };
}
