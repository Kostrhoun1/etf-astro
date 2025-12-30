export const formatCurrency = (value: number, currency: string = 'EUR') => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number) => {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('cs-CZ').format(value);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('cs-CZ');
  } catch {
    return dateStr;
  }
};

export const getReturnColor = (value: number) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return '';
};

export const getDistributionPolicyLabel = (policy: string) => {
  if (policy === 'Accumulating') return 'Akumulační';
  if (policy === 'Distributing') return 'Distribuční';
  return policy || '-';
};

export const getDistributionFrequencyLabel = (frequency: string) => {
  if (frequency === 'Quarterly') return 'Čtvrtletní';
  if (frequency === 'Annual') return 'Roční';
  if (frequency === 'Semi-Annual') return 'Půlroční';
  if (frequency === 'Monthly') return 'Měsíční';
  return frequency || '-';
};

export const getReplicationLabel = (replication: string) => {
  if (replication === 'Physical') return 'Fyzická';
  if (replication === 'Synthetic') return 'Syntetická';
  if (replication === 'Optimized') return 'Optimalizovaná';
  return replication || '-';
};