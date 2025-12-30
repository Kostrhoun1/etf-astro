// Mapování ETF tickerů na jejich SPRÁVNÉ ISIN kódy pro investiční portfolia
// Ověřeno přímo z naší Supabase databáze (3618 ETF fondů)
// Database: https://nbhwnatadyubiuadfakx.supabase.co
export const ETF_TICKER_TO_ISIN = {
  // ✅ ZÁKLADNÍ ETF Z NAŠÍ DATABÁZE
  'VWCE': 'IE00BK5BQT80', // Vanguard FTSE All-World UCITS ETF (USD) Accumulating
  'SGLN': 'IE00B4ND3602', // iShares Physical Gold ETC
  'EIMI': 'IE00BKM4GZ66', // iShares Core MSCI Emerging Markets IMI UCITS ETF (Acc)
  'IPRP': 'IE00B0M63284', // iShares European Property Yield UCITS ETF
  'IUSN': 'IE00BF4RFH31', // iShares MSCI World Small Cap UCITS ETF
  'IWDA': 'IE00B4L5Y983', // iShares Core MSCI World UCITS ETF
  'CSPX': 'IE00B5BMR087', // iShares Core S&P 500 UCITS ETF
  
  // ✅ DLUHOPISOVÉ ETF (AKUMULAČNÍ)
  'SXRC': 'IE00BFM6TC58', // iShares USD Treasury Bond 20+yr UCITS ETF USD (Acc) - Ray Dalio dlouhé
  'EGOV7': 'IE00B3VWN518', // iShares USD Treasury Bond 7-10yr UCITS ETF (Acc) - Ray Dalio střední
  'AGGH': 'IE00BDBRDM35', // iShares Core Global Aggregate Bond UCITS ETF EUR Hedged (Acc)
  
  // ✅ KOMODITNÍ ETF
  'COMM': 'IE00BD6FTQ80', // Invesco Bloomberg Commodity UCITS ETF Acc
  
  // ✅ DIVIDENDOVÉ ETF
  'ZPRG': 'IE00B9CQXS71', // SPDR S&P Global Dividend Aristocrats UCITS ETF
  'IWDP': 'IE00B1FZS350', // iShares Developed Markets Property Yield UCITS ETF
  
  // ✅ NÁHRADNÍ ETF (původně neexistující tickery)
  'IGLT': 'IE00B4ND3602', // NÁHRADA: iShares Physical Gold ETC (zlato)
  'IEAG': 'IE00BDBRDM35', // NÁHRADA: iShares Core Global Aggregate Bond (dluhopisy)
  'EXXY': 'IE00BD6FTQ80', // NÁHRADA: Invesco Bloomberg Commodity (komodity)
} as const;

export type ETFTicker = keyof typeof ETF_TICKER_TO_ISIN;

// Helper funkce pro získání ISIN z tickeru
export function getISINFromTicker(ticker: string): string | null {
  return ETF_TICKER_TO_ISIN[ticker as ETFTicker] || null;
}

// Helper funkce pro vytvoření ETF odkazu
export function getETFLink(ticker: string): string {
  const isin = getISINFromTicker(ticker);
  if (isin) {
    return `/etf/${isin}`;
  }
  // Pokud není v mapování, zkusíme použít ticker přímo jako ISIN
  // (pro případ, že někdo předá přímo ISIN místo tickeru)
  return `/etf/${ticker.toUpperCase()}`;
}