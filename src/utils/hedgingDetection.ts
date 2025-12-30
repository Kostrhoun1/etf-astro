export interface HedgingInfo {
  isHedged: boolean;
  hedgedCurrency: string | null;
  hedgingType: 'unhedged' | 'eur_hedged' | 'usd_hedged' | 'gbp_hedged' | 'chf_hedged' | 'other_hedged';
}

/**
 * Detekuje měnové zajištění ETF ze jména fondu nebo currency risk pole
 * VYLEPŠENO: Prioritně používá currency_risk pole z databáze pro 100% přesnost
 */
export function detectHedging(etfName: string, currencyRisk?: string): HedgingInfo {
  if (!etfName) {
    return {
      isHedged: false,
      hedgedCurrency: null,
      hedgingType: 'unhedged'
    };
  }

  // Pokud máme přímé currency risk info z JustETF, použijeme to
  if (currencyRisk) {
    const risk = currencyRisk.toLowerCase();
    
    if (risk.includes('unhedged') || risk.includes('not hedged')) {
      return {
        isHedged: false,
        hedgedCurrency: null,
        hedgingType: 'unhedged'
      };
    }

    if (risk.includes('eur') && risk.includes('hedged')) {
      return {
        isHedged: true,
        hedgedCurrency: 'EUR',
        hedgingType: 'eur_hedged'
      };
    }

    if (risk.includes('usd') && risk.includes('hedged')) {
      return {
        isHedged: true,
        hedgedCurrency: 'USD',
        hedgingType: 'usd_hedged'
      };
    }

    if (risk.includes('hedged')) {
      return {
        isHedged: true,
        hedgedCurrency: null,
        hedgingType: 'other_hedged'
      };
    }
  }

  // Fallback na detekci ze jména
  const name = etfName.toLowerCase();

  // Detekce specifických měnových zajištění
  if (name.includes('eur hedged')) {
    return {
      isHedged: true,
      hedgedCurrency: 'EUR',
      hedgingType: 'eur_hedged'
    };
  }

  if (name.includes('usd hedged')) {
    return {
      isHedged: true,
      hedgedCurrency: 'USD',
      hedgingType: 'usd_hedged'
    };
  }

  if (name.includes('gbp hedged')) {
    return {
      isHedged: true,
      hedgedCurrency: 'GBP',
      hedgingType: 'gbp_hedged'
    };
  }

  if (name.includes('chf hedged')) {
    return {
      isHedged: true,
      hedgedCurrency: 'CHF',
      hedgingType: 'chf_hedged'
    };
  }

  // Obecné hedging patterny
  if (name.includes('hedged') || name.includes('hedge')) {
    return {
      isHedged: true,
      hedgedCurrency: null,
      hedgingType: 'other_hedged'
    };
  }

  // Default: nezajištěný
  return {
    isHedged: false,
    hedgedCurrency: null,
    hedgingType: 'unhedged'
  };
}

/**
 * Filtruje ETF podle hedging kritérií
 */
export function filterByHedging(etfs: any[], hedgingFilter: string): any[] {
  if (!hedgingFilter || hedgingFilter === 'all') {
    return etfs;
  }

  return etfs.filter(etf => {
    const hedgingInfo = detectHedging(etf.name);
    
    switch (hedgingFilter) {
      case 'unhedged':
        return !hedgingInfo.isHedged;
      case 'hedged':
        return hedgingInfo.isHedged;
      case 'eur_hedged':
        return hedgingInfo.hedgingType === 'eur_hedged';
      case 'usd_hedged':
        return hedgingInfo.hedgingType === 'usd_hedged';
      case 'gbp_hedged':
        return hedgingInfo.hedgingType === 'gbp_hedged';
      case 'chf_hedged':
        return hedgingInfo.hedgingType === 'chf_hedged';
      default:
        return true;
    }
  });
}

/**
 * Získá lidsky čitelný popis hedgingu
 */
export function getHedgingDescription(hedgingInfo: HedgingInfo): string {
  if (!hedgingInfo.isHedged) {
    return 'Nezajištěno';
  }

  if (hedgingInfo.hedgedCurrency) {
    return `${hedgingInfo.hedgedCurrency} zajištěno`;
  }

  return 'Zajištěno';
}

/**
 * Získá hedging badge variantu pro UI
 */
export function getHedgingBadgeVariant(hedgingInfo: HedgingInfo): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!hedgingInfo.isHedged) {
    return 'outline';
  }

  switch (hedgingInfo.hedgingType) {
    case 'eur_hedged':
      return 'default';
    case 'usd_hedged':
      return 'secondary';
    default:
      return 'outline';
  }
}