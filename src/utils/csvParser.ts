export const formatCurrency = (amount: number, currency: string): string => {
  if (!amount) return 'N/A';
  
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};

export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
};

export const formatTER = (value: number): string => {
  if (value === null || value === undefined || isNaN(value) || value === 0) return 'N/A';
  return `${value.toFixed(2)}%`;
};