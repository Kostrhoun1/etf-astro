/**
 * Centralizované formátovací utility pro ETF data
 *
 * Tento soubor obsahuje všechny formátovací funkce používané napříč aplikací.
 * Importujte odtud místo definování lokálních verzí.
 */

/**
 * Formátuje číslo jako procenta
 */
export function formatPercentage(
  value: number | null | undefined,
  options?: {
    showSign?: boolean;
    decimals?: number;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const { showSign = false, decimals = 2 } = options ?? {};
  const prefix = showSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(decimals)}%`;
}

/**
 * Formátuje číslo s tisícovými oddělovači
 */
export function formatNumber(
  value: number | null | undefined,
  options?: {
    decimals?: number;
    suffix?: string;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const { decimals = 0, suffix = '' } = options ?? {};
  return value.toLocaleString('cs-CZ', { maximumFractionDigits: decimals }) + suffix;
}

/**
 * Formátuje hodnotu jako měnu
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'EUR'
): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formátuje velikost fondu (v miliardách/milionech)
 */
export function formatFundSize(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} mld €`;
  }
  return `${value.toFixed(0)} mil €`;
}

/**
 * Formátuje TER (Total Expense Ratio)
 */
export function formatTER(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Vrací CSS třídu pro barvu výnosu
 */
export function getReturnColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return '';
}

/**
 * Vrací ikonu pro směr výnosu
 */
export function getReturnIcon(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '';
}

/**
 * Formátuje výnos s barvou a ikonou
 */
export function formatReturn(value: number | null | undefined): {
  text: string;
  color: string;
  icon: string;
} {
  if (value === null || value === undefined || isNaN(value)) {
    return { text: 'N/A', color: '', icon: '' };
  }

  return {
    text: formatPercentage(value, { showSign: true }),
    color: getReturnColor(value),
    icon: getReturnIcon(value)
  };
}

/**
 * Formátuje datum do českého formátu
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'N/A';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';

  return d.toLocaleDateString('cs-CZ', options ?? {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formátuje relativní datum (např. "před 2 dny")
 */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'dnes';
  if (diffDays === 1) return 'včera';
  if (diffDays < 7) return `před ${diffDays} dny`;
  if (diffDays < 30) return `před ${Math.floor(diffDays / 7)} týdny`;
  if (diffDays < 365) return `před ${Math.floor(diffDays / 30)} měsíci`;
  return `před ${Math.floor(diffDays / 365)} lety`;
}
