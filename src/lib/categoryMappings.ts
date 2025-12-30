// Server-side category data (no React components)
export interface CategoryDataServer {
  id: string;
  name: string;
  iconName: string; // Just the icon name, not the component
  description: string;
}

export const categoryMappings: CategoryDataServer[] = [
  {
    id: 'Akcie',
    name: 'Akciové ETF',
    iconName: 'TrendingUp',
    description: 'ETF fondy investující do akcií různých trhů a regionů'
  },
  {
    id: 'Dluhopisy',
    name: 'Dluhopisové ETF',
    iconName: 'Landmark',
    description: 'ETF fondy investující do státních a korporátních dluhopisů'
  },
  {
    id: 'Nemovitosti',
    name: 'Nemovitostní ETF',
    iconName: 'Building',
    description: 'ETF fondy investující do nemovitostních společností (REITs)'
  },
  {
    id: 'Komodity',
    name: 'Komoditní ETF',
    iconName: 'DollarSign',
    description: 'ETF fondy sledující ceny komodit, zlata a ropy'
  },
  {
    id: 'Krypto',
    name: 'Krypto ETF',
    iconName: 'Bitcoin',
    description: 'ETF fondy s expozicí vůči kryptoměnám a blockchain'
  }
];

export const getCategoryByETF = (category: string): string => {
  // Použij přímo kategorie z databáze
  const dbCategories = ['Akcie', 'Dluhopisy', 'Nemovitosti', 'Komodity', 'Krypto'];
  
  if (dbCategories.includes(category)) {
    return category;
  }
  
  // Default fallback
  return 'Akcie';
};